import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { AiOutlineEye } from 'react-icons/ai';
import { BsTrash3 } from 'react-icons/bs';
import { HiOutlinePencilAlt } from 'react-icons/hi';
import { createItem, deleteItem, getList } from '../../../../api/xplorzApi';
import ActionsButton from '../../../../components/actions-button/ActionsButton';
import SearchParams from '../../../../components/common/SearchParams';
import ConfirmationModal from '../../../../components/confirm-modal';
import Datatable from '../../../../components/datatable/ServerDatatable';
import { sendToast } from '../../../../utils/toastify';

const PartialRefunds = () => {
  const [partialRefunds, setPartialRefunds] = useState([]);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [idToDelete, setIdToDelete] = useState(-1);
  const [pageSize, setPageSize] = useState(10);
  const [params, setParams] = useState([]);

  const router = useRouter();
  useEffect(() => {
    if (router.isReady) getPartialRefunds();
  }, [pageSize, params]);

  const getPartialRefunds = async (paginate = false, pageNumber) => {
    const data = {
      paginate: pageSize,
    };
    if (paginate) {
      data.page = pageNumber;
    }
    let response = null;
    if (params.length) {
      data.search = params.filter((x) => x.value);
      response = await createItem('search/partial-refunds', data);
    } else {
      response = await getList('partial-refunds', data);
    }
    if (response?.success) {
      setPartialRefunds(response.data);
    } else {
      sendToast(
        'error',
        response?.data?.message ||
          response?.data?.error ||
          'Error getting partial refunds',
        4000
      );
    }
  };

  const columns = [
    {
      Header: 'Refund Date',
      accessor: 'refund_date',
    },
    {
      Header: 'Number',
      accessor: 'number',
    },

    {
      Header: 'Sector',
      accessor: 'booking.sector',
    },
    {
      Header: 'Client Name',
      accessor: 'booking.client_name',
    },
    {
      Header: 'Traveller Name',
      accessor: 'booking.client_traveller_name',
    },
    {
      Header: 'Refund Amount',
      Cell: (data) => {
        return (
          <span>
            {(+data.row.original.refund_amount)?.toLocaleString('en-AE', {
              maximumFractionDigits: 2,
              style: 'currency',
              currency: 'AED',
            })}
          </span>
        );
      },
    },
    {
      Header: 'Client Total',
      Cell: (data) => {
        return (
          <span>
            {(+data.row.original.client_total)?.toLocaleString('en-AE', {
              maximumFractionDigits: 2,
              style: 'currency',
              currency: 'AED',
            })}
          </span>
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
                    router.push(
                      '/dashboard/partial-refunds/view/' + data.row.original.id
                    ),
                  icon: <AiOutlineEye />,
                },
                {
                  label: 'Edit',
                  onClick: () =>
                    router.push(
                      '/dashboard/partial-refunds/edit/' + data.row.original.id
                    ),
                  icon: <HiOutlinePencilAlt />,
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
    const response = await deleteItem('partial-refunds', idToDelete);
    if (response?.success) {
      sendToast('success', 'Deleted successfully', 4000);
      getPartialRefunds();
    } else {
      sendToast(
        'error',
        response.data?.message ||
          response.data?.error ||
          'Unexpected Error Occurred While Trying to Delete this Partial Refund',
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
          title='Do you really want to delete this partial refund?'
          content='This will permanently delete the partial refund. Press OK to confirm.'
        />
      )}
      {/* Search Box */}
      <SearchParams paramsState={[params, setParams]} entity={'partial-refunds'} />
      {/* Data Table */}
      <Datatable
        onPageSizeChange={(size) => setPageSize(size)}
        viewLink={'/dashboard/partial-refunds'}
        downloadCSV
        CSVName='PartialRefunds.csv'
        columns={columns}
        onPaginate={getPartialRefunds}
        fullData={partialRefunds}
        data={partialRefunds?.data || []}
      />
    </div>
  );
};

export default PartialRefunds;
