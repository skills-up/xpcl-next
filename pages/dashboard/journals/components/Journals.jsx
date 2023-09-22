import { useEffect, useState } from 'react';
import { AiOutlineEye } from 'react-icons/ai';
import DatePicker, { DateObject } from 'react-multi-date-picker';
import { getItem, getList } from '../../../../api/xplorzApi';
import ActionsButton from '../../../../components/actions-button/ActionsButton';
import CustomDataModal from '../../../../components/customDataModal';
import Datatable from '../../../../components/datatable/ServerDatatable';
import { sendToast } from '../../../../utils/toastify';

const Journals = () => {
  const [journals, setJournals] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [pageSize, setPageSize] = useState(10);

  const [dates, setDates] = useState([
    new DateObject().setMonth('4').setDay('1'),
    new DateObject(),
  ]);
  const [modalOpen, setModalOpen] = useState(false);
  const [journalView, setJournalView] = useState([]);

  const getJournals = async (paginate = false, pageNumber) => {
    let data = {
      from_date: dates[0].format('YYYY-MM-DD'),
      to_date: dates[1].format('YYYY-MM-DD'),
      paginate: pageSize,
    };
    if (paginate) {
      data['page'] = pageNumber;
    }
    let response = await getList('journals', data);
    if (response?.success) {
      setJournals(response.data);
    } else {
      sendToast(
        'error',
        response?.data?.message || response?.data?.error || 'Error getting journals',
        4000
      );
    }
  };
  useEffect(() => {
    if (dates && dates?.length === 2 && pageSize) getJournals();
  }, [dates, pageSize]);

  const columns = [
    {
      Header: 'Date',
      accessor: 'date',
      Cell: (data) => {
        return (
          <div>
            {data.row.original.date
              ? new Date(data.row.original.date).toLocaleString('en-AE', {
                  dateStyle: 'medium',
                })
              : ''}
          </div>
        );
      },
    },
    {
      Header: 'Reference',
      accessor: 'reference',
    },
    {
      Header: 'Narration',
      accessor: 'narration',
      removeMaxWidth: true,
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
                  onClick: async () => {
                    const response = await getItem('journals', data.row.original.id);
                    if (response?.success) {
                      setJournalView(response.data);
                      setModalOpen(true);
                    } else {
                      sendToast('error', 'Error fetching this Journal', 4000);
                    }
                  },
                  icon: <AiOutlineEye />,
                },
              ]}
            />
          </div>
        );
      },
    },
  ];

  // const colors = ['dark-1', 'dark-4', 'blue-1', 'green-2', 'yellow-3', 'brown-1', 'purple-1', 'red-2'];

  const colors = ['#00C', '#C00', '#0C0', '#0CC', '#CC0', '#C0C', '#000', '#009', '#900', '#090', '#099', '#990', '#909', '#999'];
  const allottedColors = {};
  const getColor = (text) => {
    let color = allottedColors[text];
    if (!color) {
      const index = Object.keys(allottedColors).length % colors.length;
      color = colors[index];
      allottedColors[text] = color;
    }
    return color;
  };

  return (
    <div className='col-12'>
      {/* Custom Data Modal */}
      {modalOpen && (
        <CustomDataModal
          title={`[
            ${new Date(journalView?.date).toLocaleString('en-AE', {
              dateStyle: 'medium',
            })}
            ] - ${journalView?.narration}`}
          onClose={() => {
            setModalOpen(false);
            setJournalView([]);
          }}
        >
          <div>
            <Datatable
              dataFiltering
              columns={[
                // {
                //   Header: 'Date',
                //   accessor: 'date',
                //   Cell: (data) => {
                //     return (
                //       <span>
                //         {new Date(data.row.original.date).toLocaleString('en-AE', {
                //           dateStyle: 'medium',
                //         })}
                //       </span>
                //     );
                //   },
                // },
                {
                  Header: 'Narration',
                  accessor: 'narration',
                  removeMaxWidth: true,
                },
                {
                  Header: 'Debit From',
                  accessor: 'dr_account_name',
                  Cell: (data) => {
                    return (
                      <span style={{color: getColor(data.row.original.dr_account_id)}}>{data.row.original.dr_account_name}</span>
                    )
                  }
                },
                {
                  Header: 'Credit To',
                  accessor: 'cr_account_name',
                  Cell: (data) => {
                    return (
                      <span style={{color: getColor(data.row.original.cr_account_id)}}>{data.row.original.cr_account_name}</span>
                    )
                  }
                },
                {
                  Header: 'Amount',
                  accessor: 'amount',
                  alignRight: true,
                  Cell: (data) => {
                    return (
                      <span className='text-right d-block'>
                        {(+data.row.original.amount).toLocaleString('en-AE', {
                          maximumFractionDigits: 2,
                          style: 'currency',
                          currency: 'AED',
                        })}
                      </span>
                    );
                  },
                },
              ]}
              data={
                journalView?.journal_entries?.filter(
                  (element) => +element?.amount !== 0
                ) || []
              }
            />
          </div>
        </CustomDataModal>
      )}
      {/* Search Bar + Add New */}
      <div className='row mb-3 items-center justify-between mr-4'>
        <div className='col-lg-7 col-12'>
          <input
            type='text'
            className='d-block form-control'
            placeholder='Search'
            onChange={(e) => setSearchQuery(e.target.value)}
            value={searchQuery}
          />
        </div>
        <div className='col-lg-4 col-12 d-block ml-3 form-datepicker pr-0'>
          <label>Select Start & End Dates</label>
          <DatePicker
            style={{ marginLeft: '0.5rem', fontSize: '1rem' }}
            inputClass='custom_input-picker'
            containerClassName='custom_container-picker'
            value={dates}
            onChange={setDates}
            numberOfMonths={2}
            offsetY={10}
            range
            rangeHover
            format='DD MMMM YYYY'
          />
        </div>
      </div>
      {/* Data Table */}
      <Datatable
        onPageSizeChange={(size) => setPageSize(size)}
        downloadCSV
        CSVName='Journals.csv'
        columns={columns}
        onPaginate={getJournals}
        fullData={journals}
        data={
          journals.data
            ? journals.data.filter(
                (perm) =>
                  perm?.reference?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  perm?.narration?.toLowerCase().includes(searchQuery.toLowerCase())
              )
            : []
        }
      />
    </div>
  );
};

export default Journals;
