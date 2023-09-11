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

const CreditCards = () => {
  const [creditCards, setCreditCards] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [idToDelete, setIdToDelete] = useState(-1);

  const router = useRouter();
  useEffect(() => {
    if (router.isReady) getCreditCards();
  }, [router.isReady]);

  const getCreditCards = async () => {
    if (router.query.view) {
      const response = await getList('credit-cards', {
        traveller_id: router.query.view,
      });
      if (response?.success) {
        setCreditCards(response.data);
      } else {
        sendToast(
          'error',
          response?.data?.message ||
            response?.data?.error ||
            'Error getting credit cards',
          4000
        );
      }
    }
  };

  const columns = [
    {
      Header: 'Name On Card',
      accessor: 'name_on_card',
    },
    {
      Header: 'Card Number',
      accessor: 'masked_number',
    },
    {
      Header: 'Expiry Date',
      accessor: 'expiry_date',
      Cell: (data) =>
        new Date(data.row.original.expiry_date).toLocaleString('en-IN', {
          month: '2-digit',
          year: '2-digit',
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
              options={[
                {
                  label: 'View',
                  onClick: () =>
                    router.push({
                      pathname: '/dashboard/travellers/credit-cards/view/',
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
                      pathname: '/dashboard/travellers/credit-cards/edit/',
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
                      pathname: '/dashboard/travellers/credit-cards/clone/',
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
    const response = await deleteItem('credit-cards', idToDelete);
    if (response?.success) {
      sendToast('success', 'Deleted successfully', 4000);
      getCreditCards();
    } else {
      sendToast(
        'error',
        response.data?.message ||
          response.data?.error ||
          'Unexpected Error Occurred While Trying to Delete this Credit Card',
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
          title='Do you really want to delete this credit card?'
          content='This will permanently delete the credit card. Press OK to confirm.'
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
              pathname: '/dashboard/travellers/credit-cards/add-new',
              query: { traveller_id: router.query.view },
            })
          }
        >
          Add New
        </button>
      </div>
      {/* Data Table */}
      <Datatable
        dataFiltering
        downloadCSV
        CSVName='CreditCards.csv'
        columns={columns}
        data={creditCards.filter((perm) =>
          perm?.name_on_card?.toLowerCase().includes(searchQuery.toLowerCase())
        )}
      />
    </div>
  );
};

export default CreditCards;
