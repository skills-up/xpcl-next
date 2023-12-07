import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Select from 'react-select';
import { getList } from '../../../../api/xplorzApi';
import Datatable from '../../../../components/datatable/ServerDatatable';
import { sendToast } from '../../../../utils/toastify';

const GSTITC = () => {
  const [organizations, setOrganizations] = useState([]);
  const [paymentITCs, setPaymentITCs] = useState([]);
  const [vendorID, setVendorID] = useState(null);
  const [pageSize, setPageSize] = useState(10);

  const router = useRouter();

  useEffect(() => {
    if (router.isReady) {
      getOrganizations();
    }
  }, []);

  const getOrganizations = async () => {
    const miscOrgs = await getList('organizations', { is_misc: 1 });
    if (miscOrgs?.success) {
      setOrganizations(miscOrgs.data.map((element) => ({
        value: element.id,
        label: `${element.name}${element.gstn ? ` (${element.gstn})` : ''}`,
      })));
    } else {
      sendToast(
        'error',
        miscOrgs?.data?.message ||
          miscOrgs?.data?.error ||
          'Error getting organizations',
        4000
      );
    }
  }

  useEffect(() => {
    if (router.isReady && vendorID) {
      getPaymentITCs();
    }
  }, [pageSize, vendorID]);

  const getPaymentITCs = async (paginate = false, pageNumber) => {
    const data = {
      paginate: pageSize,
      org_id: vendorID.value,
    };
    if (paginate) {
      data.page = pageNumber;
    }
    let response = await getList('payment-itcs', data);
    if (response?.success) {
      setPaymentITCs(response.data);
    } else {
      sendToast(
        'error',
        response?.data?.message ||
          response?.data?.error ||
          'Error getting payment itcs',
        4000
      );
    }
  };

  const columns = [
    {
      Header: 'Date',
      accessor: 'date',
      Cell: (data) => {
        return (
          <span>
            {new Date(data.row.original.date).toLocaleString('en-IN', {
              dateStyle: 'medium',
            })}
          </span>
        );
      },
    },
    {
      Header: 'Payment Number',
      accessor: 'payment.number',
    },
    {
      Header: 'Payment Account',
      accessor: 'payment.dr_account_name',
    },
    {
      Header: 'Payment Amount',
      Cell: (data) => {
        return (
          <span>
            {(+data.row.original.payment.amount).toLocaleString('en-IN', {
              maximumFractionDigits: 2,
              style: 'currency',
              currency: 'INR',
            })}
          </span>
        );
      },
    },
    {
      Header: 'CGST',
      Cell: (data) => {
        return (
          <span>
            {(+data.row.original.cgst).toLocaleString('en-IN', {
              maximumFractionDigits: 2,
              style: 'currency',
              currency: 'INR',
            })}
          </span>
        );
      },
    },
    {
      Header: 'SGST',
      Cell: (data) => {
        return (
          <span>
            {(+data.row.original.sgst).toLocaleString('en-IN', {
              maximumFractionDigits: 2,
              style: 'currency',
              currency: 'INR',
            })}
          </span>
        );
      },
    },
    {
      Header: 'IGST',
      Cell: (data) => {
        return (
          <span>
            {(+data.row.original.igst).toLocaleString('en-IN', {
              maximumFractionDigits: 2,
              style: 'currency',
              currency: 'INR',
            })}
          </span>
        );
      },
    },
    {
      Header: 'Narration',
      accessor: 'payment.narration',
    },
  ];

  return (
    <div className='col-12'>
      <div className='my-3 col-12 pr-0'>
        <div className='form-input-select'>
          <label>Select Vendor</label>
          <Select
            options={organizations}
            value={vendorID}
            placeholder='Search..'
            onChange={(id) => setVendorID(id)}
          />
        </div>
      </div>
      {/* Data Table */}
      <Datatable
        onPageSizeChange={(size) => setPageSize(size)}
        viewLink={'/dashboard/payment-itcs'}
        downloadCSV
        CSVName='GST-ITC.csv'
        columns={columns}
        onPaginate={getPaymentITCs}
        fullData={paymentITCs}
        data={paymentITCs?.data || []}
      />
    </div>
  );
};

export default GSTITC;
