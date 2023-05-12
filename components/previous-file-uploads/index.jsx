import { BsTrash3 } from 'react-icons/bs';
const PreviousUploadPictures = ({ onDeleteClick, data, readonly = false }) => {
  return (
    <div className='row mx-1'>
      {data
        .filter((element) => element !== null && element !== undefined)
        .map((element, index) => {
          const imageName = element.split('/').at(-1);
          const imageExt = imageName.split('.').pop().toLowerCase();
          return (
            <div
              key={`img-${index}`}
              className='px-3 py-10 my-2 col-12 justify-between d-flex gap-2 align-items-center border border-2'
            >
              <div>
                <img
                  src={imageExt === 'pdf' ? '' : element}
                  className='col-3 col-sm-2 col-md-1 img-responsive me-1'
                  alt=''
                />
                <small className='text-break'>{imageName}</small>
              </div>
              {readonly || <span
                style={{ cursor: 'pointer' }}
                onClick={() => onDeleteClick(element, index)}
              >
                <BsTrash3
                  style={{ fontSize: '1.3rem', marginBottom: '0.3rem' }}
                  className='text-danger'
                />
              </span>}
            </div>
          );
        })}
    </div>
  );
};

export default PreviousUploadPictures;
