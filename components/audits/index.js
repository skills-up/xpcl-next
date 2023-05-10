import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { deleteItem, getList } from '../../api/xplorzApi';
import ConfirmationModal from '../confirm-modal';
import Datatable from '../datatable/Datatable';
import { sendToast } from '../../utils/toastify';

const Audit = ({ data = undefined, url }) => {
  const [audits, setAudits] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [idToDelete, setIdToDelete] = useState(-1);

  const router = useRouter();

  useEffect(() => {
    if (router.isReady) getAudits();
  }, [router.isReady]);

  useEffect(() => {
    if (data) setAudits(data);
  }, [data]);

  const getAudits = async () => {
    if (!data) {
      const response = await getList(url);
      if (response?.success) {
        setAudits(response.data);
      } else {
        sendToast(
          'error',
          response?.data?.message || response?.data?.error || 'Error getting audits',
          4000
        );
      }
    }
  };

  const onCancel = async () => {
    setConfirmDelete(false);
    setIdToDelete(-1);
  };
  const onSubmit = async () => {
    const response = await deleteItem('audits', idToDelete);
    if (response?.success) {
      sendToast('success', 'Deleted successfully', 4000);
      getAudits();
    } else {
      sendToast(
        'error',
        response.data?.message ||
          response.data?.error ||
          'Unexpected Error Occurred While Trying to Delete this Audit',
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
          title='Do you really want to delete this audit?'
          content='This will permanently delete the audit. Press OK to confirm.'
        />
      )}
      {/* Data Table */}
      {audits.map((element, index) => {
        return (
          <div className='mb-20'>
            <div className='d-flex justify-between mr-10'>
              <h5 className='mb-20'>
                {
                  <span>
                    [
                    {new Date(element?.date).toLocaleString('en-IN', {
                      dateStyle: 'medium',
                    })}
                    ]
                  </span>
                }{' '}
                - {element?.narration}
              </h5>
              <span>
                <em>
                  {new Date(element?.created_at).toLocaleString('en-IN', {
                    dateStyle: 'medium',
                    timeStyle: 'short',
                  })}
                </em>
              </span>
            </div>
            <Datatable
              dataFiltering
              columns={[
                // {
                //   Header: 'Date',
                //   accessor: 'date',
                //   Cell: (data) => {
                //     return (
                //       <span>
                //         {new Date(data.row.original.date).toLocaleString('en-IN', {
                //           dateStyle: 'medium',
                //         })}
                //       </span>
                //     );
                //   },
                // },
                {
                  Header: 'Narration',
                  accessor: 'narration',
                },
                {
                  Header: 'Debit From',
                  accessor: 'dr_account_name',
                },
                {
                  Header: 'Credit To',
                  accessor: 'cr_account_name',
                },
                {
                  Header: 'Amount',
                  accessor: 'amount',
                  alignRight: true,
                  Cell: (data) => {
                    return (
                      <div className='text-right'>
                        {(+data.row.original.amount).toLocaleString('en-IN', {
                          maximumFractionDigits: 2,
                          style: 'currency',
                          currency: 'INR',
                        })}
                      </div>
                    );
                  },
                },
                {
                  Header: 'Status',
                  accessor: 'deleted_at',
                  Cell: (data) => {
                    if (element?.deleted_at)
                      return (
                        <span className='rounded-100 d-inline-block mt-1 py-4 px-10 text-center text-14 fw-500 bg-red-3 text-red-2'>
                          Deleted
                        </span>
                      );
                    else
                      return (
                        <span className='rounded-100 d-inline-block mt-1 py-4 px-10 text-center text-14 fw-500 bg-blue-1-05 text-blue-1'>
                          Current
                        </span>
                      );
                  },
                },
              ]}
              data={element?.entries}
            />
          </div>
        );
      })}
    </div>
  );
};

export default Audit;
