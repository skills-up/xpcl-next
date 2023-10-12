import { useEffect, useState } from 'react';
import { AiOutlineEye } from 'react-icons/ai';
import DatePicker, { DateObject } from 'react-multi-date-picker';
import Select from 'react-select';
import { getList } from '../../../../api/xplorzApi';
import ActionsButton from '../../../../components/actions-button/ActionsButton';
import CustomDataModal from '../../../../components/customDataModal';
import Datatable from '../../../../components/datatable/Datatable';
import { sendToast } from '../../../../utils/toastify';
import LedgerTable from '../../../../components/ledger-table';
import { useRouter } from 'next/router';

const Ledger = () => {
  const [ledger, setLedger] = useState(null);
  const date = new DateObject();

  const [dates, setDates] = useState([
    new DateObject().setMonth(date.year < 2024 ? 10 : 4).setDay('1'),
    new DateObject(),
  ]);
  const [modalOpen, setModalOpen] = useState(false);
  const [accounts, setAccounts] = useState([]);
  const [accountID, setAccountID] = useState(null);

  const router = useRouter();

  useEffect(() => {
    if (router.isReady) getData();
  }, [router.isReady]);

  const getData = async () => {
    // Getting accounts
    const response = await getList('accounts');
    if (response?.success) {
      setAccounts(
        response.data.map((element) => ({ value: element.id, label: element.name }))
      );
      // Checking for query param
      if (router.query?.account_id) {
        for (let acc of response.data)
          if (acc.id === +router.query.account_id)
            setAccountID({ value: acc.id, label: acc.name });
      }
    } else {
      sendToast(
        'error',
        response?.data?.message || response?.data?.error || 'Error getting accounts',
        4000
      );
    }
  };

  const getLedger = async () => {
    const response = await getList('journals/ledger', {
      account_id: accountID.value,
      from_date: dates[0].format('YYYY-MM-DD'),
      to_date: dates[1].format('YYYY-MM-DD'),
    });
    if (response?.success) {
      setLedger(response.data);
    } else {
      sendToast(
        'error',
        response?.data?.message || response?.data?.error || 'Error getting ledger',
        4000
      );
    }
  };

  useEffect(() => {
    if (accountID?.value && dates && dates?.length === 2) getLedger();
  }, [accountID, dates]);

  const columns = [
    {
      Header: 'Opening Balance',
      accessor: 'opening_balance',
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
                    setModalOpen(true);
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
      {/* Custom Data Modal */}
      {modalOpen && (
        <CustomDataModal
          title={`Ledger Entries`}
          onClose={() => {
            setModalOpen(false);
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
                  Cell: (data) => <span>{(+data.row.original.amount).toFixed(2)}</span>,
                },
              ]}
              data={ledger?.entries?.filter((element) => +element?.amount !== 0) || []}
            />
          </div>
        </CustomDataModal>
      )}
      {/* Search Bar + Add New */}
      <div className='row mb-3 pr-0 items-center justify-between mr-4'>
        <div className='col-lg-5 col-12 d-block ml-3 form-datepicker'>
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
            minDate='2023-10-01'
          />
        </div>
        <div className='col-lg-6 col-12 pr-0 form-input-select'>
          <label>Select Account</label>
          <Select
            options={accounts}
            value={accountID}
            placeholder='Search & Select Account'
            onChange={(id) => setAccountID(id)}
          />
        </div>
      </div>
      {/* Data Table */}
      {/* <Datatable downloadCSV CSVName='Ledger.csv' columns={columns} data={ledger} /> */}
      <LedgerTable
        data={ledger}
        accountID={accountID?.value}
        accountName={accountID?.label}
        dates={dates}
      />
    </div>
  );
};

export default Ledger;
