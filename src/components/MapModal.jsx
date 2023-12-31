import React from 'react';
import { Modal } from 'react-bootstrap';
import Map from './Map';

function MapModal({ show, handleClose, handleAddLocation, itemType }) {
  return (
    <Modal size='lg' show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>Choose a location</Modal.Title>
      </Modal.Header>
      <Map handleAddLocation={handleAddLocation} handleClose={handleClose} itemType={itemType} />
    </Modal>
  );
}

export default MapModal;
