import { BsTrash3 } from 'react-icons/bs';

const PreviousUploadPictures = ({ onDeleteClick, data }) => {
  return (
    <div className='row mx-1'>
      {data.map((element, index) => {
        const
          imageName = element.split('/').at(-1),
          imageExtn = element.split('.').at(-1);
        return (
          <div className='px-3 py-10 my-2 col-12 justify-between d-flex gap-2 align-items-center border border-2'>
            <div>
              <img src={imageExtn.toLowerCase() === 'pdf' ? 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/PDF_file_icon.svg/267px-PDF_file_icon.svg.png' : element } className="col-3 col-sm-2 col-md-1 img-responsive me-1" alt={imageName}/>
              <small className='text-break'>{imageName}</small>
            </div>
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
        )}
      )}
    </div>
  );
};

export default PreviousUploadPictures;
