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
import { useRouter } from 'next/router';

const ClientTravellers = () => {
  const [clientTravellers, setClientTravellers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [idToDelete, setIdToDelete] = useState(-1);

  const router = useRouter();
  useEffect(() => {
    if (router.isReady) getClientTravellers();
  }, [router.isReady]);

  const getClientTravellers = async () => {
    if (router.query.view) {
      const response = await getList('client-travellers', {
        traveller_id: router.query.view,
      });
      if (response?.success) {
        setClientTravellers(response.data);
      } else {
        sendToast(
          'error',
          response?.data?.message ||
            response?.data?.error ||
            'Error getting client travellers',
          4000
        );
      }
    }
  };

  const columns = [
    {
      Header: 'Client Name',
      accessor: 'client_name',
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
                    router.push({
                      pathname: '/dashboard/travellers/client-travellers/view/',
                      query: {
                        traveller_id: router.query.view,
                        view: data.row.original.id,
                      },
                    }),
                  icon: <AiOutlineEye />,
                },
                {
                  label: 'Edit',
                  onClick: () =>
                    router.push({
                      pathname: '/dashboard/travellers/client-travellers/edit/',
                      query: {
                        traveller_id: router.query.view,
                        edit: data.row.original.id,
                      },
                    }),
                  icon: <HiOutlinePencilAlt />,
                },
                {
                  label: 'Clone',
                  onClick: () =>
                    router.push({
                      pathname: '/dashboard/travellers/client-travellers/clone/',
                      query: {
                        traveller_id: router.query.view,
                        clone: data.row.original.id,
                      },
                    }),
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
    const response = await deleteItem('client-travellers', idToDelete);
    if (response?.success) {
      sendToast('success', 'Deleted successfully', 4000);
      getClientTravellers();
    } else {
      sendToast(
        'error',
        response.data?.message ||
          response.data?.error ||
          'Unexpected Error Occurred While Trying to Delete this Client Traveller',
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
          title='Do you really want to delete this client traveller?'
          content='This will permanently delete the client traveller. Press OK to confirm.'
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
          onClick={() =>
            router.push({
              pathname: '/dashboard/travellers/client-travellers/add-new',
              query: { traveller_id: router.query.view },
            })
          }
        >
          Link New
        </button>
      </div>
      {/* Data Table */}
      <Datatable
        dataFiltering
        downloadCSV
        CSVName='ClientTravellers.csv'
        columns={columns}
        data={clientTravellers.filter((perm) =>
          Object.values(perm).join(',').toLowerCase().includes(searchQuery.toLowerCase())
        )}
      />
    </div>
  );
};

export default ClientTravellers;
