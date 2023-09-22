import { useState, useEffect } from 'react';
import { deleteItem, getList } from '../../../../api/xplorzApi';
import ActionsButton from '../../../../components/actions-button/ActionsButton';
import Datatable from '../../../../components/datatable/Datatable';
import { sendToast } from '../../../../utils/toastify';
import ConfirmationModal from '../../../../components/confirm-modal';
import { AiOutlineEye } from 'react-icons/ai';
import { HiOutlinePencilAlt } from 'react-icons/hi';
import { BsTrash3 } from 'react-icons/bs';
import { IoCopyOutline } from 'react-icons/io5';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/router';
import { setInitialAirportsState } from '../../../../features/apis/apisSlice';

const Airports = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [idToDelete, setIdToDelete] = useState(-1);

  const dispatch = useDispatch();
  const airports = useSelector((state) => state.apis.value.airports);
  const router = useRouter();

  const columns = [
    {
      Header: 'IATA Code',
      accessor: 'iata_code',
    },
    {
      Header: 'Country',
      accessor: 'country_name',
    },
    {
      Header: 'City',
      accessor: 'city',
    },
    {
      Header: 'Name',
      accessor: 'name',
    },
    {
      Header: 'Timezone',
      accessor: 'timezone',
    },
    {
      Header: 'Last Updated At',
      accessor: 'updated_at',
      Cell: (data) => {
        return (
          <div>
            {data.row.original.updated_at
              ? new Date(data.row.original.updated_at).toLocaleString('en-AE', {
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
      alignRight: true,
      // cell: () => <Button variant="danger" data-tag="allowRowEvents" data-action="delete"><FontAwesomeIcon icon={faTrash} /></Button>,
      Cell: (data) => {
        return (
          <div className='d-flex justify-end'>
            <ActionsButton
              options={[
                {
                  label: 'View',
                  onClick: () =>
                    window.location.assign(
                      '/dashboard/airports/view/' + data.row.original.id
                    ),
                  icon: <AiOutlineEye />,
                },
                {
                  label: 'Edit',
                  onClick: () =>
                    window.location.assign(
                      '/dashboard/airports/edit/' + data.row.original.id
                    ),
                  icon: <HiOutlinePencilAlt />,
                },
                {
                  label: 'Clone',
                  onClick: () =>
                    window.location.assign(
                      '/dashboard/airports/clone/' + data.row.original.id
                    ),
                  icon: <IoCopyOutline />,
                },
                {
                  label: 'Delete',
                  onClick: () => {
                    setIdToDelete(data.row.original.id);
                    setConfirmDelete(true);
                  },
                  icon: <BsTrash3 />,
                },
              ]}
            />
          </div>
        );
      },
    },
  ];

  const onCancel = async () => {
    setConfirmDelete(false);
    setIdToDelete(-1);
  };
  const onSubmit = async () => {
    const response = await deleteItem('airports', idToDelete);
    if (response?.success) {
      sendToast('success', 'Deleted successfully', 4000);
      sessionStorage.removeItem('airports-checked');
      dispatch(setInitialAirportsState());
      router.reload();
    } else {
      sendToast(
        'error',
        response.data?.message ||
          response.data?.error ||
          'Unexpected Error Occurred While Trying to Delete this Airport',
        4000
      );
    }
    onCancel();
  };

  return (
    <div className='col-12'>
      {confirmDelete && (
        <ConfirmationModal
          onCancel={onCancel}
          onSubmit={onSubmit}
          title='Do you really want to delete this airport?'
          content='This will permanently delete the airport. Press OK to confirm.'
        />
      )}
      {/* Search Bar + Add New */}
      <div className='row mb-3 items-center justify-between mr-4'>
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
          className='btn btn-primary col-lg-2 col-5'
          onClick={() => window.location.assign('/dashboard/airports/add-new')}
        >
          Add New
        </button>
      </div>
      {/* Data Table */}
      <Datatable
        viewLink={'/dashboard/airports'}
        downloadCSV
        CSVName='Airports.csv'
        columns={columns}
        data={airports.filter(
          (perm) =>
            perm?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            perm?.iata_code?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            perm?.timezone?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            perm?.country_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            perm?.city?.toLowerCase().includes(searchQuery.toLowerCase())
        )}
      />
    </div>
  );
};

export default Airports;
