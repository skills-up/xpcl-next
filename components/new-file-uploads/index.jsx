import { useState, useEffect } from 'react';
import { FileUploader } from 'react-drag-drop-files';
import PreviousUploadPictures from '../previous-file-uploads';

const NewFileUploads = ({
  multiple = false,
  setUploads,
  obj = null,
  fileTypes = ['JPG', 'PNG', 'PDF', 'JPEG'],
}) => {
  const [newUrls, setNewUrls] = useState([]);

  const handleUpload = (file) => {
    const uploads = [];
    if (multiple) {
      for (let f of file) {
        uploads.push(f);
      }
    } else {
      uploads.push(file);
    }
    setNewUrls((prev) => {
      const urls = uploads.map((file) => URL.createObjectURL(file));
      return multiple ? [...prev, ...urls] : urls;
    });
    setUploads((prev) => {
      if (!obj) {
        return multiple ? [...prev, ...uploads] : file;
      } else {
        prev[obj] = multiple ? [...prev[obj], ...uploads] : file;
        return { ...prev };
      }
    });
  };

  useEffect(() => {
    newUrls.forEach((url) => URL.revokeObjectURL(url));
  }, [newUrls]);

  return (
    <div>
      <PreviousUploadPictures
        data={newUrls}
        onDeleteClick={(element, index) => {
          setNewUrls((prev) => {
            prev.splice(index, 1);
            return [...prev];
          });
          setUploads((prev) => {
            if (!obj) {
              if (multiple) {
                prev.splice(index, 1);
                return [...prev];
              }
              return null;
            } else {
              if (multiple) {
                prev[obj].splice(index, 1);
              } else {
                prev[obj] = null;
              }
              return { ...prev };
            }
          });
        }}
      />
      <FileUploader multiple={multiple} types={fileTypes} handleChange={handleUpload} />
    </div>
  );
};

export default NewFileUploads;
