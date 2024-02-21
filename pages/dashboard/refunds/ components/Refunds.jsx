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
import { filterAllowed } from '../../../../utils/permission-checker';
import { sendToast } from '../../../../utils/toastify';

const Refunds = () => {
  const [refunds, setRefunds] = useState([]);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [idToDelete, setIdToDelete] = useState(-1);
  const [pageSize, setPageSize] = useState(10);
  const [params, setParams] = useState([]);
  const router = useRouter();

  useEffect(() => {
    getRefunds();
  }, [pageSize, params]);

  const getRefunds = async (paginate = false, pageNumber) => {
    const data = {
      paginate: pageSize,
    };
    if (paginate) {
      data.page = pageNumber;
    }
    let response = null;
    if (params.length) {
      data.search = params.filter((x) => x.value);
      response = await createItem('search/refunds', data);
    } else {
      response = await getList('refunds', data);
    }
    if (response?.success) {
      setRefunds(response.data);
    } else {
      sendToast(
        'error',
        response?.data?.message || response?.data?.error || 'Error getting refunds',
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
      accessor: 'client.name',
    },
    {
      Header: 'Traveller Name',
      accessor: 'booking.client_traveller_name',
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
                    router.push('/dashboard/refunds/view/' + data.row.original.id),
                  icon: <AiOutlineEye />,
                  permissions: ['refunds.show'],
                },
                {
                  label: 'Edit',
                  onClick: () =>
                    router.push('/dashboard/refunds/edit/' + data.row.original.id),
                  icon: <HiOutlinePencilAlt />,
                  permissions: ['refunds.update'],
                },
                {
                  label: 'Delete',
                  onClick: () => {
                    setIdToDelete(data.row.original.id);
                    setConfirmDelete(true);
                  },
                  icon: <BsTrash3 />,
                  permissions: ['refunds.destroy'],
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
    const response = await deleteItem('refunds', idToDelete);
    if (response?.success) {
      sendToast('success', 'Deleted successfully', 4000);
      getRefunds();
    } else {
      sendToast(
        'error',
        response.data?.message ||
          response.data?.error ||
          'Unexpected Error Occurred While Trying to Delete this Refund',
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
          title='Do you really want to delete this refund?'
          content='This will permanently delete the refund. Press OK to confirm.'
        />
      )}
      {/* Search Box */}
      <SearchParams paramsState={[params, setParams]} entity={'refunds'} />
      {/* Data Table */}
      <Datatable
        onPageSizeChange={(size) => setPageSize(size)}
        viewLink={'/dashboard/refunds'}
        downloadCSV
        CSVName='Refunds.csv'
        columns={columns}
        onPaginate={getRefunds}
        fullData={refunds}
        data={refunds?.data || []}
      />
    </div>
  );
};

export default Refunds;
