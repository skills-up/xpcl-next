import { useEffect, useState } from 'react';
import { AiOutlineEye } from 'react-icons/ai';
import DatePicker, { DateObject } from 'react-multi-date-picker';
import { getItem, getList } from '../../../../api/xplorzApi';
import ActionsButton from '../../../../components/actions-button/ActionsButton';
import { sendToast } from '../../../../utils/toastify';

const Journals = () => {
  const [balanceSheet, setBalanceSheet] = useState(null);

  const [dates, setDates] = useState(new DateObject());

  const getBalanceSheet = async () => {
    const response = await getList('reports/balance-sheet', {
      date: dates.format('YYYY-MM-DD'),
    });
    if (response?.success) {
    } else {
      sendToast(
        'error',
        response?.data?.message || response?.data?.error || 'Error getting journals',
        4000
      );
    }
  };

  useEffect(() => {
    if (dates && dates?.length === 2) getJournals();
  }, [dates]);

  const columns = [
    {
      Header: 'Reference',
      accessor: 'reference',
    },
    {
      Header: 'Narration',
      accessor: 'narration',
    },
    {
      Header: 'Date',
      accessor: 'date',
      Cell: (data) => {
        return (
          <div>
            {data.row.original.updated_at
              ? new Date(data.row.original.updated_at).toLocaleString('en-IN', {
                  dateStyle: 'medium',
                  timeStyle: 'short',
                })
              : ''}
          </div>
        );
      },
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

  return (
    <div className='col-12'>
      {/* Date Picker */}
      <div className='row mb-3 items-center justify-between mr-4'>
        <div className='col-lg-4 col-12 d-block ml-4'>
          <label style={{ fontWeight: '700' }}>Select Start & End Dates</label>
          <DatePicker
            style={{ marginLeft: '0.5rem', fontSize: '1rem' }}
            inputClass='custom_input-picker'
            containerClassName='custom_container-picker'
            value={dates}
            onChange={setDates}
            numberOfMonths={1}
            offsetY={10}
            format='DD MMMM YYYY'
          />
        </div>
      </div>
      {/* Generated Balance Sheet */}
      <div></div>
    </div>
  );
};

export default Journals;
