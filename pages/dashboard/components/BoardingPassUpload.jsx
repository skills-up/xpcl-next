import { useEffect, useState } from 'react';
import { FileUploader } from 'react-drag-drop-files';
import { createItem } from '../../../api/xplorzApi';
import { sendToast } from '../../../utils/toastify';

const supportedFileTypes = ['JPG', 'PNG', 'PDF', 'JPEG'];

const BoardingPassUpload = ({ id }) => {
  const [boardingPassFile, setBoardingPassFile] = useState(null);

  const uploadBordingPassFile = async () => {
    if (!boardingPassFile) return;
    let boardPassData = new FormData();
    boardPassData.append('boarding_pass_file', boardingPassFile);
    const response = await createItem(
      `/travel-list/${id}/add-boarding-pass`,
      boardPassData
    );
    if (response?.success) {
      sendToast('success', 'Boarding Pass uploaded successfully', 4000);
    } else {
      sendToast(
        'error',
        response.data?.message ||
          response.data?.error ||
          'Failed to upload Boarding Pass',
        4000
      );
    }
  };

  useEffect(() => {
    uploadBordingPassFile();
  }, [boardingPassFile]);

  return (
    <FileUploader
      multiple={false}
      types={supportedFileTypes}
      handleChange={setBoardingPassFile}
    />
  );
};

export default BoardingPassUpload;
