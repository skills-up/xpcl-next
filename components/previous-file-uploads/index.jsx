import { BsTrash3 } from 'react-icons/bs';

const PreviousUploadPictures = ({ onDeleteClick, data }) => {
  return (
    <div className='row mx-1'>
      {data.map((element, index) => (
        <div className='px-3 py-10 my-2 col-12 justify-between d-flex gap-2 align-items-center border border-2'>
          <a href={element} target='_blank'>
            <u>
              <strong>{element.split('/').at(-1)}</strong>
            </u>
          </a>
          <span
            style={{ cursor: 'pointer' }}
            onClick={() => onDeleteClick(element, index)}
          >
            <BsTrash3
              style={{ fontSize: '1.3rem', marginBottom: '0.3rem' }}
              className='text-danger'
            />
          </span>
        </div>
      ))}
    </div>
  );
};

export default PreviousUploadPictures;
