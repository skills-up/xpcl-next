import { useState, useEffect } from 'react';
import { getList } from '../../../../api/xplorzApi';
import { sendToast } from '../../../../utils/toastify';
import { AiFillFolder } from 'react-icons/ai';
import Image from 'next/image';

const FilesGrid = ({ prefixes, searches, filesList }) => {
  const [prefix, setPrefix] = prefixes;
  const [searchQuery, setSearchQuery] = searches;
  const searchActive = searchQuery.length > 0;
  let activeList = searchActive
    ? filesList
        .map((x) => x.replace(/\/\.empty$/, ''))
        .filter((x) => x.toLowerCase().includes(searchQuery))
    : [
        ...new Set(
          filesList
            .filter((x) => x.startsWith(prefix))
            .map((x) => x.split(prefix)[1]?.split('/')[1])
        ),
      ];
  activeList = activeList.filter((x) => x && x !== '.empty');

  return (
    <div className='row col-12'>
      {activeList.length ? (
        activeList.map((filepath, i) => {
          const pos = filepath.indexOf('.');
          const isDir = pos < 0 || filepath.length > pos + 4;
          let fullPath = searchActive ? filepath : prefix + '/' + filepath;
          if (!isDir) fullPath = '/storage/' + fullPath;
          return isDir ? (
            <div
              key={i}
              className='col-6 col-md-4 col-lg-3 border-light text-center p-1'
              onClick={() => {
                setPrefix(fullPath);
                setSearchQuery('');
              }}
            >
              <AiFillFolder size={200} style={{ maxHeight: '80%', maxWidth: '80%' }} />
              <p>{filepath}</p>
            </div>
          ) : (
            <a
              key={i}
              className='col-6 col-md-4 col-lg-3 border-light text-center p-1'
              href={fullPath}
              target='_blank'
            >
              <Image
                width={200}
                height={200}
                src={fullPath}
                alt={filepath}
                style={{ maxHeight: '80%', maxWidth: '80%' }}
              />
              <p>{filepath}</p>
            </a>
          );
        })
      ) : (
        <p className='text-center'>No file(s) found</p>
      )}
    </div>
  );
};

const FilesList = () => {
  const [filesList, setFilesList] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [prefix, setPrefix] = useState('XCPL');

  useEffect(() => {
    document.body.classList.add('-is-sidebar-open');
    getFilesList();
  }, []);

  const getFilesList = async () => {
    const response = await getList('utility/files-list');
    if (response?.success) {
      setFilesList(response.data);
    } else {
      sendToast(
        'error',
        response?.data?.message || response?.data?.error || 'Error getting files list',
        4000
      );
    }
  };

  return (
    <div className='col-12'>
      {/* Search Bar + Add New */}
      <div className='row mb-3 items-center justify-between mr-4'>
        <div className='col-lg-10 col-7'>
          <input
            type='text'
            className='d-block form-control'
            placeholder='Search'
            onChange={(e) => {
              const q = e.target.value.trim().toLowerCase();
              setSearchQuery(q);
              setPrefix(q.length ? '' : 'XCPL');
            }}
            value={searchQuery}
          />
        </div>
        <button
          className='btn btn-primary col-lg-2 col-5'
          onClick={() =>
            setPrefix((old_prefix) => old_prefix.split('/').slice(0, -1).join('/'))
          }
          disabled={(prefix.match(/\//g)?.length || 0) < 1}
        >
          Go Up
        </button>
      </div>
      <p className='my-1'>
        <b>Current Path:</b> {prefix}
      </p>
      {/* Files Grid */}
      <FilesGrid
        prefixes={[prefix, setPrefix]}
        searches={[searchQuery, setSearchQuery]}
        filesList={filesList}
      />
    </div>
  );
};

export default FilesList;
