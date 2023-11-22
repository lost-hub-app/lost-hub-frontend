'use strict';
import { createAsyncThunk, createSlice, createAction } from '@reduxjs/toolkit';
import axios from 'axios';

const SERVER_URL = import.meta.env.SERVER_URL || 'http://localhost:3001';

export const fetchData = createAsyncThunk('item/fetchData', async () => {
  try {
    const response = await axios.get(`${SERVER_URL}/items`);
    return response.data;
  } catch (error) {
    console.error('Error fetching data:', error);
    throw error;
  }
});

export const editItem = createAsyncThunk(
  'item/editItem',
  async (updatedItem, { dispatch, getState }) => {
    try {
      // Check if a new image is uploaded
      if (updatedItem.selectedFile) {
        // Dispatch the uploadFile action to upload the new image
        const imageUrl = await dispatch(
          uploadFile(updatedItem.selectedFile)
        ).unwrap();
        updatedItem.image = imageUrl; // Update the image URL in the item data
      }

      const response = await axios.put(
        `${SERVER_URL}/items/${updatedItem.id}`,
        updatedItem
      );

      return response.data;
    } catch (error) {
      console.error('Error updating item:', error);
      throw error;
    }
  }
);

export const deleteItem = createAsyncThunk(
  'item/deleteItem',
  async (itemId) => {
    try {
      await axios.delete(`${SERVER_URL}/items/${itemId}`);
      return itemId;
    } catch (error) {
      console.error('Error deleting item:', error);
      throw error;
    }
  }
);

// Thunk for uploading an image
export const uploadFile = createAsyncThunk('item/uploadFile', async (file, { getState }) => {
  const formData = new FormData();
  formData.append('file', file);
  try {
    const response = await axios.post(`${SERVER_URL}/upload`, formData);
    if (response.status === 200) {
      return response.data.imageUrl;
    } else {
      throw new Error('Failed to upload file');
    }
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
});

// Thunk for adding an item, with or without an image upload
export const addItem = createAsyncThunk('item/addItem', async (_, { dispatch, getState }) => {
  const state = getState().item;

  try {
    let imageUrl = state.formData.image; // Use existing image URL or placeholder

    if (state.selectedFile) {
      imageUrl = await dispatch(uploadFile(state.selectedFile)).unwrap();
    }

    const newItemData = {
      ...state.formData,
      image: imageUrl, 
    };

    // Posts the new item data to the server
    const response = await axios.post(`${SERVER_URL}/items`, newItemData);
    console.log('Item added successfully:', response.data);
    dispatch(fetchData());
  } catch (error) {
    console.error('Error adding item:', error);
  }
});

export const setEditItemData = createAction('item/setEditItemData');

const itemSlice = createSlice({
  name: 'item',
  initialState: {
    showModal: false,
    selectedFile: null,
    items: [],
    formData: {
      type: '',
      itemName: '',
      image: 'https://placehold.co/200x200',
      location: '',
      description: '',
    },
  },
  reducers: {
    showModal: (state) => {
      state.showModal = true;
    },
    hideModal: (state) => {
      state.showModal = false;
    },
    fileChange: (state, action) => {
      state.selectedFile = action.payload;
    },
    formInputChange: (state, action) => {
      const { field, value } = action.payload;
      if (field === 'itemName') {
        state.formData.itemName = value;
      } else if (field === 'description') {
        state.formData.description = value;
      } else if (field === 'location') {
        state.formData.location = value;
      } else if (field === 'image') {
        state.formData.image = value;
      } else if (field === 'type') {
        state.formData.type = value;
      }
    },
    setEditItemData: (state, action) => {
      // Set the item data in the state for pre-populating the form
      const { id, itemName, description, location, image } = action.payload;
      state.formData = {
        type: '', // Add type if needed
        itemName,
        image,
        location,
        description,
      };
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchData.fulfilled, (state, action) => {
        state.items = action.payload;
      })
      .addCase(fetchData.pending, (state) => {
        // Handle pending state if needed
      })
      .addCase(fetchData.rejected, (state) => {
        // Handle rejected state if needed
      })
      .addCase(editItem.fulfilled, (state, action) => {
        const updatedItem = action.payload;
        console.log("HERES THE UPDATE ITEM", updatedItem)
        // Use map to update or add the item
        state.items = state.items.map((item) =>
          item._id === updatedItem._id ? updatedItem : item
        );
      })

      .addCase(deleteItem.fulfilled, (state, action) => {
        const itemIdToDelete = action.payload;
        state.items = state.items.filter((item) => item.id !== itemIdToDelete);
      });
  },
});

export const {
  showModal,
  hideModal,
  fileChange,
  formInputChange,
} = itemSlice.actions;

export default itemSlice.reducer;