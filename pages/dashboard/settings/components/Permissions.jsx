import { useState, useEffect } from 'react';
import { getList } from '../../../../api/xplorzApi';
import ActionsButton from '../../../../components/actions-button/ActionsButton';
import Datatable from '../../../../components/datatable/Datatable';
import { sendToast } from '../../../../utils/toastify';

const Permissions = () => {
  const [permissions, setPermissions] = useState([]);

  useEffect(() => {
    getPermissions();
  }, []);

  const getPermissions = async () => {
    const response = await getList('permissions');
    if (response?.success) {
      console.log(response.data);
      setPermissions(response.data);
    } else {
      sendToast(
        'error',
        response?.data?.message || response?.data?.error || 'Error getting permissions',
        4000
      );
    }
  };

  const columns = [
    {
      Header: 'Slug',
      accessor: 'slug',
      disableSortBy: true,
    },
    {
      Header: 'Description',
      accessor: 'description',
      disableSortBy: true,
    },
    {
      Header: 'Last Updated At',
      accessor: 'updated_at',
      Cell: (data) => {
        return (
          <div>
            {data.row.original.updated_at
              ? new Date(data.row.original.updated_at).toLocaleString('en-IN', {
                  dateStyle: 'medium',
                  timeStyle: 'short',
                })
              : 'NA'}
          </div>
        );
      },
    },
    {
      Header: 'Actions',
      disableSortBy: true,
      // cell: () => <Button variant="danger" data-tag="allowRowEvents" data-action="delete"><FontAwesomeIcon icon={faTrash} /></Button>,
      Cell: (data) => {
        return (
          <div className='flex flex-start'>
            <ActionsButton
              options={[
                { label: 'Edit', onClick: () => console.log('edit') },
                { label: 'Delete', onClick: () => console.log('delete') },
              ]}
            />
          </div>
        );
      },
    },
  ];

  return (
    <div className='col-12'>
      <Datatable columns={columns} data={permissions} />
    </div>
  );
};

export default Permissions;
