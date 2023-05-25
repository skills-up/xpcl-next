import { customAPICall } from '../api/xplorzApi';

export const downloadCSV = (file, name) => {
  var hiddenElement = document.createElement('a');
  hiddenElement.href = 'data:text/csv;charset=utf-8,' + encodeURI(file);
  hiddenElement.target = '_blank';

  //provide the name for the CSV file to be downloaded
  hiddenElement.download = name;
  hiddenElement.click();
};

export const downloadTextFile = (text, name) => {
  var element = document.createElement('a');
  element.setAttribute(
    'href',
    'data:text/plain;charset=utf-8,' + encodeURIComponent(text)
  );
  element.setAttribute('download', name);

  element.style.display = 'none';
  document.body.appendChild(element);

  element.click();

  document.body.removeChild(element);
};

export const downloadApiPDF = async (url, name) => {
  const response = await customAPICall(
    url,
    'get',
    {},
    {
      responseType: 'arraybuffer',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/pdf',
      },
    }
  );
  var blob = new Blob([response.data], { type: 'application/pdf' });
  var link = document.createElement('a');
  link.target = '_blank';
  link.href = window.URL.createObjectURL(blob);
  link.download = name;
  link.click();
};
