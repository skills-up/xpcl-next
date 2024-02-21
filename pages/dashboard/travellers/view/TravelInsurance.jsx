import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { AiOutlineEye } from 'react-icons/ai';
import { BsTrash3 } from 'react-icons/bs';
import { HiOutlinePencilAlt } from 'react-icons/hi';
import { IoCopyOutline } from 'react-icons/io5';
import { deleteItem, getList } from '../../../../api/xplorzApi';
import ActionsButton from '../../../../components/actions-button/ActionsButton';
import ConfirmationModal from '../../../../components/confirm-modal';
import Datatable from '../../../../components/datatable/Datatable';
import { filterAllowed, hasPermission } from '../../../../utils/permission-checker';
import { sendToast } from '../../../../utils/toastify';

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
      Cell: (data) =>
        new Date(data.row.original.issue_date).toLocaleString('en-IN', {
          dateStyle: 'medium',
        }),
    },
    {
      Header: 'Expiry Date',
      accessor: 'expiry_date',
      Cell: (data) =>
        new Date(data.row.original.expiry_date).toLocaleString('en-IN', {
          dateStyle: 'medium',
        }),
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
              options={filterAllowed([
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
                  permissions: ['travel-insurances.show'],
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
                  permissions: ['travel-insurances.update'],
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
                  permissions: ['travel-insurances.store'],
                },
                {
                  label: 'Delete',
                  onClick: () => {
                    setIdToDelete(data.row.original.id);
                    setConfirmDelete(true);
                  },
                  icon: <BsTrash3 />,
                  permissions: ['travel-insurances.destroy'],
                },
              ])}
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
        {hasPermission('travel-insurances.store') && (
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
        )}
      </div>
      {/* Data Table */}
      <Datatable
        dataFiltering
        downloadCSV
        CSVName='TravelInsurances.csv'
        columns={columns}
        data={travelInsurances.filter((perm) =>
          Object.values(perm).join(',').toLowerCase().includes(searchQuery.toLowerCase())
        )}
      />
    </div>
  );
};

export default TravelInsurances;
