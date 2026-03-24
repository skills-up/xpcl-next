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

const TravellerOtherDocuments = () => {
  const [travellerOtherDocuments, setTravellerOtherDocuments] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [idToDelete, setIdToDelete] = useState(-1);

  const router = useRouter();
  useEffect(() => {
    if (router.isReady) getTravellerOtherDocuments();
  }, [router.isReady]);

  const getTravellerOtherDocuments = async () => {
    if (router.query.view) {
      const response = await getList('traveller-other-documents', {
        traveller_id: router.query.view,
      });
      if (response?.success) {
        setTravellerOtherDocuments(response.data);
      } else {
        sendToast(
          'error',
          response?.data?.message ||
            response?.data?.error ||
            'Error getting documents',
          4000
        );
      }
    }
  };

  const columns = [
    {
      Header: 'Document Name',
      accessor: 'document_name',
    },
    {
      Header: 'Expiry Date',
      accessor: 'document_expiry_date',
      Cell: (data) =>
        data.row.original.document_expiry_date
          ? new Date(data.row.original.document_expiry_date).toLocaleString('en-IN', {
              dateStyle: 'medium',
            })
          : '-',
    },
    {
      Header: 'Actions',
      disableSortBy: true,
      alignRight: true,
      Cell: (data) => {
        return (
          <div className='d-flex justify-end'>
            <ActionsButton
              options={filterAllowed([
                {
                  label: 'View',
                  onClick: () =>
                    router.push({
                      pathname: '/dashboard/travellers/traveller-other-documents/view/',
                      query: {
                        traveller_id: router.query.view,
                        view: data.row.original.id,
                      },
                    }),
                  icon: <AiOutlineEye />,
                  permissions: ['traveller-other-documents.show'],
                },
                {
                  label: 'Edit',
                  onClick: () =>
                    router.push({
                      pathname: '/dashboard/travellers/traveller-other-documents/edit/',
                      query: {
                        traveller_id: router.query.view,
                        edit: data.row.original.id,
                      },
                    }),
                  icon: <HiOutlinePencilAlt />,
                  permissions: ['traveller-other-documents.update'],
                },
                {
                  label: 'Clone',
                  onClick: () =>
                    router.push({
                      pathname: '/dashboard/travellers/traveller-other-documents/clone/',
                      query: {
                        traveller_id: router.query.view,
                        clone: data.row.original.id,
                      },
                    }),
                  icon: <IoCopyOutline />,
                  permissions: ['traveller-other-documents.store'],
                },
                {
                  label: 'Delete',
                  onClick: () => {
                    setIdToDelete(data.row.original.id);
                    setConfirmDelete(true);
                  },
                  icon: <BsTrash3 />,
                  permissions: ['traveller-other-documents.destroy'],
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
    const response = await deleteItem('traveller-other-documents', idToDelete);
    if (response?.success) {
      sendToast('success', 'Deleted successfully', 4000);
      getTravellerOtherDocuments();
    } else {
      sendToast(
        'error',
        response.data?.message ||
          response.data?.error ||
          'Unexpected Error Occurred While Trying to Delete this Document',
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
          title='Do you really want to delete this document?'
          content='This will permanently delete the document. Press OK to confirm.'
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
        {hasPermission('traveller-other-documents.store') && (
          <button
            className='btn btn-primary col-lg-2 col-5'
            onClick={() =>
              router.push({
                pathname: '/dashboard/travellers/traveller-other-documents/add-new',
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
        CSVName='TravellerOtherDocuments.csv'
        columns={columns}
        data={travellerOtherDocuments.filter((perm) =>
          Object.values(perm).join(',').toLowerCase().includes(searchQuery.toLowerCase())
        )}
      />
    </div>
  );
};

export default TravellerOtherDocuments;
