import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { AiOutlineEye } from 'react-icons/ai';
import { BsDashSquare, BsPlusSquare, BsTrash3 } from 'react-icons/bs';
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
  const [orgs, setOrgs] = useState([]);
  const [pageSize, setPageSize] = useState(10);
  const [formOpen, setFormOpen] = useState(false);
  const [params, setParams] = useState([]);
  const [queries, setQueries] = useState([]);
  const [searchableColumns, setSearchableColumns] = useState({
    refund_date: 'Refund Date (YYYY-MM-DD)',
    number: 'Number',
  });

  const router = useRouter();
  useEffect(() => {
    if (router.isReady) {
      getOrganizations();
      getSearchableColumns();
    }
  }, []);

  useEffect(() => {
    getPartialRefunds();
  }, [pageSize, params]);

  useEffect(() => {
    const searchableColumnNames = Object.keys(searchableColumns);
    const queries = Array(searchableColumnNames.length).fill('');
    params.forEach(({ col, value }) => {
      const idx = searchableColumnNames.indexOf(col);
      queries[idx] = value;
    });
    setQueries(queries);
  }, [searchableColumns]);

  const getSearchableColumns = async () => {
    const response = await getList('searchable-columns/partial-refunds');
    if (response?.success) {
      setSearchableColumns(response.data);
    } else {
      sendToast(
        'error',
        response?.data?.message ||
          response?.data?.error ||
          'Error getting searchable columns list',
        4000
      );
    }
  };

  const getOrganizations = async () => {
    const response = await getList('organizations');
    if (response?.success) {
      setOrgs(response.data);
    } else {
      sendToast(
        'error',
        response?.data?.message ||
          response?.data?.error ||
          'Error getting organiztions list',
        4000
      );
    }
  };

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
      Header: 'Comment',
      accessor: 'reason',
    },
    {
      Header: 'Sector',
      accessor: 'booking.sector',
    },
    {
      Header: 'Client Name',
      Cell: (data) => {
        return (
          <span>
            {orgs
              ?.filter((el) => el.id === data.row.original.booking.client_id)
              ?.map((el) => `${el.name}`)}
          </span>
        );
      },
    },
    {
      Header: 'Refund Amount',
      Cell: (data) => {
        return (
          <span>
            {(+data.row.original.refund_amount)?.toLocaleString('en-IN', {
              maximumFractionDigits: 2,
              style: 'currency',
              currency: 'INR',
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
            {(+data.row.original.client_total)?.toLocaleString('en-IN', {
              maximumFractionDigits: 2,
              style: 'currency',
              currency: 'INR',
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
      {/* Search Bar + Add New */}
      <div className='my-3 col-12 pr-0'>
        <h6 className='mb-3 d-flex justify-between items-center'>
          <span>Search Columns</span>
          {formOpen ? (
            <BsDashSquare
              className='cursor-pointer text-blue-1'
              onClick={() => {
                setFormOpen((prev) => !prev);
              }}
            />
          ) : (
            <BsPlusSquare
              className='cursor-pointer text-blue-1'
              onClick={() => {
                setFormOpen((prev) => !prev);
              }}
            />
          )}
        </h6>
        {formOpen && (
          <SearchParams
            queriesState={[queries, setQueries]}
            columns={searchableColumns}
            setParams={setParams}
          />
        )}
      </div>
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
