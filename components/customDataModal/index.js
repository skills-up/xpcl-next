import { AiOutlineCloseCircle } from 'react-icons/ai';

function CustomDataModal({ children, title = '', onClose }) {
  return (
    <div className='custom-data-modal'>
      <div className='modal-background' />
      <div className='modal-container'>
        <div className='title'>
          <h2>{title}</h2>
          <span>
            <AiOutlineCloseCircle className='close-icon' onClick={onClose} />
          </span>
        </div>
        <div className='children scroll-bar-1'>{children}</div>
      </div>
    </div>
  );
}

export default CustomDataModal;
