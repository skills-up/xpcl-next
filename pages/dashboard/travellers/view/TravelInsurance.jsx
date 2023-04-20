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

const TravelInsurances = () => {
  const [travelInsurances, setTravelInsurances] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [idToDelete, setIdToDelete] = useState(-1);

  const router = useRouter();
  useEffect(() => {
    if (router.isReady) getTravelInsurances();
  }, [router.isReady]);

  const getTravelInsurances = async () => {
    if (router.query.view) {
      const response = await getList('travel-insurances', {
        traveller_id: router.query.view,
      });
      if (response?.success) {
        setTravelInsurances(response.data);
      } else {
        sendToast(
          'error',
          response?.data?.message ||
            response?.data?.error ||
            'Error getting travel insurances',
          4000
        );
      }
    }
  };

  const columns = [
    {
      Header: 'Insurance Type',
      accessor: 'insurance_type',
    },
    {
      Header: 'Policy Number',
      accessor: 'policy_number',
    },
    {
      Header: 'Issue Date',
      accessor: 'issue_date',
      Cell: (data) => new Date(data.row.original.issue_date).toLocaleString('en-IN', {
        dateStyle: 'medium',
     }),
   },
    {
      Header: 'Expiry Date',
      accessor: 'expiry_date',
      Cell: (data) => new Date(data.row.original.expiry_date).toLocaleString('en-IN', {
        dateStyle: 'medium',
     }),
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
                    router.push({
                      pathname: '/dashboard/travellers/travel-insurances/view/',
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
                      pathname: '/dashboard/travellers/travel-insurances/edit/',
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
                      pathname: '/dashboard/travellers/travel-insurances/clone/',
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
    const response = await deleteItem('travel-insurances', idToDelete);
    if (response?.success) {
      sendToast('success', 'Deleted successfully', 4000);
      getTravelInsurances();
    } else {
      sendToast(
        'error',
        response.data?.message ||
          response.data?.error ||
          'Unexpected Error Occurred While Trying to Delete this Travel Insurance',
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
          title='Do you really want to delete this travel insurance?'
          content='This will permanently delete the travel insurance. Press OK to confirm.'
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
              pathname: '/dashboard/travellers/travel-insurances/add-new',
              query: { traveller_id: router.query.view },
            })
          }
        >
          Add New
        </button>
      </div>
      {/* Data Table */}
      <Datatable
        downloadCSV
        CSVName='TravelInsurances.csv'
        columns={columns}
        data={travelInsurances.filter((perm) =>
          perm?.policy_number?.toLowerCase().includes(searchQuery.toLowerCase())
        )}
      />
    </div>
  );
};

export default TravelInsurances;
