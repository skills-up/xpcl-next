import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import DatePicker, { DateObject } from 'react-multi-date-picker';
import { getList } from '../../../../api/xplorzApi';
import { sendToast } from '../../../../utils/toastify';

const SalesAnalysisReport = () => {
  const [data, setData] = useState(null);

  const [dates, setDates] = useState([
    new DateObject().setMonth('4').setDay('1'),
    new DateObject(),
  ]);

  const router = useRouter();

  const getReport = async () => {
    const response = await getList('reports/sales-analysis', {
      from_date: dates[0].format('YYYY-MM-DD'),
      to_date: dates[1].format('YYYY-MM-DD'),
    });
    if (response?.success) {
      const data = response.data;
      data.sales =
        +data.reg_client_data.dom +
        +data.reg_client_data.int +
        +data.reg_client_data.taxes +
        +data.unreg_client_data.dom +
        +data.unreg_client_data.int +
        +data.unreg_client_data.taxes +
        +data.misc_data.basic +
        +data.misc_data.taxes +
        +data.service_charges +
        +data.cancellation;
      data.sales_turnover =
        (+data.reg_client_data.dom + +data.unreg_client_data.dom) * 0.05 +
        (+data.reg_client_data.int + +data.unreg_client_data.int) * 0.1 +
        +data.service_charges +
        +data.canc_serv;
      data.total_turnover =
        +data.sales_turnover + +data.commission + +data.transaction_fees;
      setData(data);
    } else {
      sendToast(
        'error',
        response?.data?.message || response?.data?.error || 'Error getting report',
        4000
      );
    }
  };

  useEffect(() => {
    if (dates && dates?.length === 2) getReport();
  }, [router.isReady, dates]);

  return (
    <div className='col-12'>
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
        />
      </div>
      {data ? (
        <div>
          <h5 className='mt-20'>Sales Turnover</h5>
          <table className='table-3'>
            <thead>
              <tr>
                <th>Particulars</th>
                <th className='text-right'>Actual Value</th>
                <th className='text-right'>Value of Service</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <th>Registered Client - Domestic</th>
                <td className='text-right'>
                  {data.reg_client_data.dom.toLocaleString('en-IN', {
                    maximumFractionDigits: 2,
                    style: 'currency',
                    currency: 'INR',
                  })}
                </td>
                <td className='text-right'>
                  {(data.reg_client_data.dom * 0.05).toLocaleString('en-IN', {
                    maximumFractionDigits: 2,
                    style: 'currency',
                    currency: 'INR',
                  })}
                </td>
              </tr>
              <tr>
                <th>Registered Client - International</th>
                <td className='text-right'>
                  {data.reg_client_data.int.toLocaleString('en-IN', {
                    maximumFractionDigits: 2,
                    style: 'currency',
                    currency: 'INR',
                  })}
                </td>
                <td className='text-right'>
                  {(data.reg_client_data.int * 0.1).toLocaleString('en-IN', {
                    maximumFractionDigits: 2,
                    style: 'currency',
                    currency: 'INR',
                  })}
                </td>
              </tr>
              <tr>
                <th>Registered Client - Total Tax</th>
                <td className='text-right'>
                  {data.reg_client_data.taxes.toLocaleString('en-IN', {
                    maximumFractionDigits: 2,
                    style: 'currency',
                    currency: 'INR',
                  })}
                </td>
                <td className='text-right'> &nbsp; </td>
              </tr>
              <tr>
                <th>Unregistered Client - Domestic</th>
                <td className='text-right'>
                  {data.unreg_client_data.dom.toLocaleString('en-IN', {
                    maximumFractionDigits: 2,
                    style: 'currency',
                    currency: 'INR',
                  })}
                </td>
                <td className='text-right'>
                  {(data.unreg_client_data.dom * 0.05).toLocaleString('en-IN', {
                    maximumFractionDigits: 2,
                    style: 'currency',
                    currency: 'INR',
                  })}
                </td>
              </tr>
              <tr>
                <th>Unregistered Client - International</th>
                <td className='text-right'>
                  {data.unreg_client_data.int.toLocaleString('en-IN', {
                    maximumFractionDigits: 2,
                    style: 'currency',
                    currency: 'INR',
                  })}
                </td>
                <td className='text-right'>
                  {(data.unreg_client_data.int * 0.1).toLocaleString('en-IN', {
                    maximumFractionDigits: 2,
                    style: 'currency',
                    currency: 'INR',
                  })}
                </td>
              </tr>
              <tr>
                <th>Unregistered Client - Total Tax</th>
                <td className='text-right'>
                  {data.unreg_client_data.taxes.toLocaleString('en-IN', {
                    maximumFractionDigits: 2,
                    style: 'currency',
                    currency: 'INR',
                  })}
                </td>
                <td className='text-right'> &nbsp; </td>
              </tr>
              <tr>
                <th>Miscellaneous Basic Amount</th>
                <td className='text-right'>
                  {data.misc_data.basic.toLocaleString('en-IN', {
                    maximumFractionDigits: 2,
                    style: 'currency',
                    currency: 'INR',
                  })}
                </td>
                <td className='text-right'> &nbsp; </td>
              </tr>
              <tr>
                <th>Miscellaneous Tax Amount</th>
                <td className='text-right'>
                  {data.misc_data.taxes.toLocaleString('en-IN', {
                    maximumFractionDigits: 2,
                    style: 'currency',
                    currency: 'INR',
                  })}
                </td>
                <td className='text-right'> &nbsp; </td>
              </tr>
              <tr>
                <th>Miscellaneous Service Charges</th>
                <td className='text-right'>
                  {data.service_charges.toLocaleString('en-IN', {
                    maximumFractionDigits: 2,
                    style: 'currency',
                    currency: 'INR',
                  })}
                </td>
                <td className='text-right'>
                  {data.service_charges.toLocaleString('en-IN', {
                    maximumFractionDigits: 2,
                    style: 'currency',
                    currency: 'INR',
                  })}
                </td>
              </tr>
              <tr>
                <th>Cancellation Charges</th>
                <td className='text-right'>
                  {data.cancellation.toLocaleString('en-IN', {
                    maximumFractionDigits: 2,
                    style: 'currency',
                    currency: 'INR',
                  })}
                </td>
                <td className='text-right'>
                  {data.canc_serv.toLocaleString('en-IN', {
                    maximumFractionDigits: 2,
                    style: 'currency',
                    currency: 'INR',
                  })}
                </td>
              </tr>
            </tbody>
            <tfoot>
              <tr>
                <th>Sales Turnover</th>
                <td className='text-right'>
                  {data.sales.toLocaleString('en-IN', {
                    maximumFractionDigits: 2,
                    style: 'currency',
                    currency: 'INR',
                  })}
                </td>
                <td className='text-right'>
                  {data.sales_turnover.toLocaleString('en-IN', {
                    maximumFractionDigits: 2,
                    style: 'currency',
                    currency: 'INR',
                  })}
                </td>
              </tr>
            </tfoot>
          </table>
          <h5 className='mt-20'>Commission Turnover</h5>
          <table className='table-3' style={{minHeight: 'auto'}}>
            <thead>
              <tr>
                <th>Particulars</th>
                <th className='text-right'>Actual Value</th>
                <th className='text-right'>Value of Service</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <th>Vendor Commission</th>
                <td className='text-right'>
                  {data.commission.toLocaleString('en-IN', {
                    maximumFractionDigits: 2,
                    style: 'currency',
                    currency: 'INR',
                  })}
                </td>
                <td className='text-right'>
                  {data.commission.toLocaleString('en-IN', {
                    maximumFractionDigits: 2,
                    style: 'currency',
                    currency: 'INR',
                  })}
                </td>
              </tr>
              <tr>
                <th>Transaction Fees</th>
                <td className='text-right'>
                  {(+data.transaction_fees).toLocaleString('en-IN', {
                    maximumFractionDigits: 2,
                    style: 'currency',
                    currency: 'INR',
                  })}
                </td>
                <td className='text-right'>
                  {(+data.transaction_fees).toLocaleString('en-IN', {
                    maximumFractionDigits: 2,
                    style: 'currency',
                    currency: 'INR',
                  })}
                </td>
              </tr>
            </tbody>
          </table>
          <table className='table-3 mt-20' style={{minHeight: 'auto'}}>
            <thead>
              <tr>
                <th colSpan={2}>Turnover Report</th>
                <td className='text-right'>
                  {data.total_turnover.toLocaleString('en-IN', {
                    maximumFractionDigits: 2,
                    style: 'currency',
                    currency: 'INR',
                  })}
                </td>
              </tr>
              <tr>
                <th colSpan={2}>Approx GST Output (@18% of Value of Services)</th>
                <td className='text-right'>
                  {(data.total_turnover * 0.18).toLocaleString('en-IN', {
                    maximumFractionDigits: 2,
                    style: 'currency',
                    currency: 'INR',
                  })}
                </td>
              </tr>
            </thead>
          </table>
        </div>
      ) : (
        <p className='text-center'>Loading...</p>
      )}
    </div>
  );
};

export default SalesAnalysisReport;
