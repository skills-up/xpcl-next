import { useState, useEffect } from 'react';
import { getList } from '../../../../api/xplorzApi';
import ActionsButton from '../../../../components/actions-button/ActionsButton';
import Datatable from '../../../../components/datatable/Datatable';
import { sendToast } from '../../../../utils/toastify';

const Permissions = () => {
  const [permissions, setPermissions] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    getPermissions();
  }, []);

  const getPermissions = async () => {
    const response = await getList('permissions');
    if (response?.success) {
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
              : ''}
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
                {
                  label: 'View',
                  onClick: () =>
                    window.location.assign(
                      '/dashboard/permissions/view/' + data.row.original.id
                    ),
                },
                {
                  label: 'Edit',
                  onClick: () =>
                    window.location.assign(
                      '/dashboard/permissions/edit/' + data.row.original.id
                    ),
                },
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
      {/* Search Bar + Add New */}
      <div className='row mb-3 justify-between'>
        <div className='col-lg-10 col-7'>
          <input
            type='text'
            className='d-block form-control'
            placeholder='Search'
            onChange={(e) => setSearchQuery(e.target.value)}
            value={searchQuery}
          />
        </div>
        <button
          className='btn btn-success col-lg-2 col-5'
          onClick={() => window.location.assign('/dashboard/permissions/add-new')}
        >
          Add New
        </button>
      </div>
      <Datatable
        columns={columns}
        data={permissions.filter((perm) =>
          perm.slug.toLowerCase().includes(searchQuery.toLowerCase())
        )}
      />
    </div>
  );
};

export default Permissions;
