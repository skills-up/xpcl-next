import React, { useState } from 'react';
import { IoClose } from 'react-icons/io5';

const ModalHeader = ({ onClick, title }) => (
  <div className='d-flex justify-between items-center'>
    <h3 className='text-xl font-semibold'>{title}</h3>
    <button className='modal-close btn btn-transparent' onClick={onClick}>
      <IoClose classes='text-secondary stroke-current inline-block h-5 w-5' />
    </button>
  </div>
);

const ModalFooter = ({ onClick, onSubmit, cancelButtonText, successButtonText }) => (
  <div className='d-flex justify-end gap-2'>
    <button className='btn btn-secondary' type='button' onClick={onClick}>
      {cancelButtonText}
    </button>
    <button className='btn btn-danger' type='button' onClick={onSubmit}>
      {successButtonText}
    </button>
  </div>
);

const ConfirmationModal = ({
  onCancel,
  onSubmit,
  title = 'Do you really want to proceed?',
  content = 'Please confirm if you want to proceed. If you say proceed we proceed.',
  cancelButtonText = 'Cancel',
  successButtonText = 'OK',
}) => {
  return (
    <div className='confirm-modal-container'>
      <div className='backdrop fade-in fixed inset-0 z-40 bg-black'></div>
      <div className='modal-content'>
        <ModalHeader title={title} onClick={() => onCancel()} />
        <p className='mx-lg-3 my-lg-5 mx-md-2 my-3'>{content}</p>
        <ModalFooter
          onClick={() => onCancel()}
          onSubmit={() => onSubmit()}
          cancelButtonText={cancelButtonText}
          successButtonText={successButtonText}
        />
      </div>
    </div>
  );
};

export default ConfirmationModal;
