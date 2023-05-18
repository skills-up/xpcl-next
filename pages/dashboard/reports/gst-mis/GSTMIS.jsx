import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import DatePicker, { DateObject } from 'react-multi-date-picker';
import { createItem, getList } from '../../../../api/xplorzApi';
import { sendToast } from '../../../../utils/toastify';

const Journals = () => {
  const [gSTMIS, setGSTMIS] = useState(null);
  const [dates, setDates] = useState(new DateObject());
  const [removeZeros, setRemoveZeros] = useState(false);
  const [tempZeroObj, setTempZeroObj] = useState(null);

  const router = useRouter();

  const getGSTMIS = async () => {
    const response = await getList('reports/gst-mis', {
      end_date: dates.format('YYYY-MM-DD'),
    });
    if (response?.success) {
      await manipulateData(response.data);
    } else {
      sendToast(
        'error',
        response?.data?.message || response?.data?.error || 'Error getting GST MIS',
        4000
      );
    }
  };

  const manipulateData = async (data, checkZero = false) => {
    // Data total
    let commissionArr = Object.values(data.commissions).map((el) => el);
    if (data?.gst_invoices?.length > 0)
      commissionArr = [...data.gst_invoices, ...commissionArr];
    if (checkZero) {
      setTempZeroObj(structuredClone(gSTMIS));
      // commissionArr
      commissionArr = commissionArr.filter((prev) => {
        if (prev?.pdf_path) {
          if (+prev.commission !== 0 && +prev.cgst !== 0 && +prev.sgst !== 0) {
            return prev;
          }
        } else {
          if (+prev.amount !== 0 && +prev.cgst !== 0 && +prev.sgst !== 0) {
            return prev;
          }
        }
      });
      // itc
      data.itc = data.itc.filter((prev) => {
        if (
          +prev.base_amount !== 0 &&
          +prev.cgst !== 0 &&
          +prev.sgst !== 0 &&
          +prev.igst !== 0
        ) {
          return prev;
        }
      });
      // transaction fees
      data.transaction_fees = data.transaction_fees.filter((prev) => {
        if (
          +prev.commission !== 0 &&
          +prev.cgst !== 0 &&
          +prev.sgst !== 0 &&
          +prev.igst !== 0
        ) {
          return prev;
        }
      });
      // services
      for (let service of Object.keys(data.services)) {
        if (
          +data.services[service].D_amount === 0 &&
          +data.services[service].D_cancellation === 0 &&
          +data.services[service].I_amount === 0 &&
          +data.services[service].I_cancellation === 0 &&
          +data.services[service].M_amount === 0 &&
          +data.services[service].M_cancellation === 0 &&
          +data.services[service].cgst === 0 &&
          +data.services[service].sgst === 0 &&
          +data.services[service].igst === 0
        ) {
          delete data.services[service];
        }
      }
    }
    let commissionTotal = { commission: 0, cgst: 0, sgst: 0 };
    let transactionFeeTotal = { commission: 0, cgst: 0, sgst: 0, igst: 0 };
    let itcTotal = { base_amount: 0, cgst: 0, sgst: 0, igst: 0 };
    let servicesTotal = {
      d_amount: 0,
      i_amount: 0,
      m_amount: 0,
      d_cancellation: 0,
      i_cancellation: 0,
      m_cancellation: 0,
      cgst: 0,
      sgst: 0,
      igst: 0,
    };
    for (let comm of commissionArr) {
      if (comm?.pdf_path) commissionTotal.commission += +comm.commission;
      else commissionTotal.commission += +comm.amount;
      commissionTotal.cgst += +comm.cgst;
      commissionTotal.sgst += +comm.sgst;
    }
    for (let tf of data.transaction_fees) {
      transactionFeeTotal.commission += +tf.commission;
      transactionFeeTotal.cgst += +tf.cgst;
      transactionFeeTotal.sgst += +tf.sgst;
      transactionFeeTotal.igst += +tf.igst;
    }
    for (let service of Object.values(data.services)) {
      servicesTotal.d_amount += +service.D_amount;
      servicesTotal.i_amount += +service.I_amount;
      servicesTotal.m_amount += +service.M_amount;
      servicesTotal.d_cancellation += +service.D_cancellation;
      servicesTotal.i_cancellation += +service.I_cancellation;
      servicesTotal.m_cancellation += +service.M_cancellation;
      servicesTotal.cgst += +service.cgst;
      servicesTotal.sgst += +service.sgst;
      servicesTotal.igst += +service.igst;
    }
    for (let itc of data.itc) {
      itcTotal.base_amount += +itc.base_amount;
      itcTotal.cgst += +itc.cgst;
      itcTotal.sgst += +itc.sgst;
      itcTotal.igst += +itc.igst;
    }
    data['new_commission_arr'] = commissionArr;
    data['commission_total'] = commissionTotal;
    data['transaction_fees_total'] = transactionFeeTotal;
    data['itc_total'] = itcTotal;
    data['services_total'] = servicesTotal;
    console.log(data);
    setGSTMIS({ ...data });
  };

  useEffect(() => {
    if (dates) getGSTMIS();
  }, [dates]);

  return (
    <div className='col-12'>
      {/* Date Picker */}
      <div className='row mb-3 items-center justify-between mr-4'>
        <div className='col-lg-9 col-12 d-block ml-3 form-datepicker'>
          <label>Select End Date</label>
          <DatePicker
            onlyMonthPicker
            style={{ marginLeft: '0.5rem', fontSize: '1rem' }}
            inputClass='custom_input-picker'
            containerClassName='custom_container-picker'
            value={dates}
            onChange={setDates}
            numberOfMonths={1}
            offsetY={10}
            format='MMMM YYYY'
          />
        </div>
        <div className='col-lg-3 col-12 lg:mt-20'>
          <button
            className='btn btn-success w-100'
            onClick={async () => {
              if (removeZeros) await manipulateData(tempZeroObj, false);
              else await manipulateData(gSTMIS, true);
              setRemoveZeros((prev) => !prev);
            }}
          >
            {removeZeros ? 'Return Zero Rows' : 'Remove Zero Rows'}
          </button>
        </div>
      </div>
      {/* GST MIS */}
      {gSTMIS?.warnings && gSTMIS?.warnings?.length > 0 && (
        <div className='bg-warning pl-20'>
          <ul className='list-disc'>
            {gSTMIS.warnings.map((element, index) => {
              return <li key={index}>{element}</li>;
            })}
          </ul>
        </div>
      )}
      <div className='gst-mis'>
        {/* GST COMMISSION */}
        <div className='gst-services mt-30'>
          <h1>
            From{' '}
            {new DateObject({
              date: gSTMIS?.start_date,
              format: 'YYYY-MM-DD',
            }).format('DD-MMMM-YYYY')}{' '}
            To{' '}
            {new DateObject({
              date: gSTMIS?.end_date,
              format: 'YYYY-MM-DD',
            }).format('DD-MMMM-YYYY')}
          </h1>
          <h2>GST on Commissions</h2>
          <div className='overflow-scroll scroll-bar-1'>
            <table className='table-3 no-min-height mt-5'>
              <thead>
                <tr>
                  <th>Vendor Name</th>
                  <th>GSTN</th>
                  <th>Invoice Dt</th>
                  <th>Invoice #</th>
                  <th className='text-right'>Commission</th>
                  <th className='text-right'>CGST</th>
                  <th className='text-right'>SGST</th>
                  <th>PDF</th>
                </tr>
              </thead>
              <tbody>
                {gSTMIS?.new_commission_arr &&
                  Object.values(gSTMIS?.new_commission_arr)?.map((element, index) => {
                    return (
                      <tr key={index}>
                        <td>{element?.name || element?.organization_name}</td>
                        <td>{element?.gstn}</td>
                        <td>
                          {new DateObject({
                            date: element?.invoice_date,
                            format: 'YYYY-MM-DD',
                          }).format('DD-MMMM-YYYY')}
                        </td>
                        <td>{element?.invoice_id}</td>
                        <td className='text-right'>
                          {(element?.pdf_path
                            ? +element.commission
                            : +element.amount
                          ).toLocaleString('en-IN', {
                            maximumFractionDigits: 2,
                            style: 'currency',
                            currency: 'INR',
                          })}
                        </td>
                        <td className='text-right'>
                          {(+element.cgst).toLocaleString('en-IN', {
                            maximumFractionDigits: 2,
                            style: 'currency',
                            currency: 'INR',
                          })}
                        </td>
                        <td className='text-right'>
                          {(+element.sgst).toLocaleString('en-IN', {
                            maximumFractionDigits: 2,
                            style: 'currency',
                            currency: 'INR',
                          })}
                        </td>
                        <td>
                          {element?.pdf_path ? (
                            <a
                              className='text-primary'
                              href={element.pdf_path}
                              target='_blank'
                            >
                              Open
                            </a>
                          ) : (
                            <span
                              className='text-primary cursor-pointer'
                              onClick={async () => {
                                const response = await createItem(
                                  '/reports/gst-invoice',
                                  {
                                    organization_id: element.id,
                                    invoice_date: gSTMIS?.end_date,
                                    commission: element.amount,
                                    cgst: element.cgst,
                                    sgst: element.sgst,
                                  }
                                );
                                if (response?.success) {
                                  let prev = gSTMIS;
                                  // Removing Commission
                                  for (let comm of Object.keys(prev.commissions)) {
                                    if (prev.commissions[comm].id === element.id) {
                                      delete prev.commissions[comm];
                                      break;
                                    }
                                  }
                                  // Setting GST
                                  await prev.gst_invoices.push(response.data);
                                  // Setting State
                                  manipulateData(prev);
                                } else {
                                  sendToast(
                                    'error',
                                    'Error generating GST Invoice',
                                    4000
                                  );
                                }
                              }}
                            >
                              Create
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                <tr>
                  <td style={{ fontWeight: '700' }}>Total</td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td style={{ fontWeight: '700' }} className='text-right'>
                    {gSTMIS?.commission_total?.commission.toLocaleString('en-IN', {
                      maximumFractionDigits: 2,
                      style: 'currency',
                      currency: 'INR',
                    })}
                  </td>
                  <td style={{ fontWeight: '700' }} className='text-right'>
                    {gSTMIS?.commission_total?.cgst.toLocaleString('en-IN', {
                      maximumFractionDigits: 2,
                      style: 'currency',
                      currency: 'INR',
                    })}
                  </td>
                  <td className='text-right' style={{ fontWeight: '700' }}>
                    {gSTMIS?.commission_total?.sgst.toLocaleString('en-IN', {
                      maximumFractionDigits: 2,
                      style: 'currency',
                      currency: 'INR',
                    })}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        {/* GST SERVICES */}
        <div className='gst-services mt-30'>
          <h2>GST Services</h2>
          <div className='overflow-scroll scroll-bar-1'>
            <table className='table-3 no-min-height mt-5'>
              <thead>
                <tr>
                  <th rowSpan={2}>Client Name</th>
                  <th rowSpan={2}>GSTN</th>
                  <th rowSpan={2} className='text-right'>
                    Domestic
                  </th>
                  <th rowSpan={2} className='text-right'>
                    International
                  </th>
                  <th rowSpan={2} className='text-right'>
                    Miscellaneous
                  </th>
                  <th colSpan={3} className='text-center'>
                    Cancellation Charges
                  </th>
                  <th rowSpan={2} className='text-right'>
                    CGST
                  </th>
                  <th rowSpan={2} className='text-right'>
                    SGST
                  </th>
                  <th rowSpan={2} className='text-right'>
                    IGST
                  </th>
                </tr>
                <tr>
                  <th className='text-right'>Domestic</th>
                  <th className='text-right'>International</th>
                  <th className='text-right'>Miscellaneous</th>
                </tr>
              </thead>
              <tbody>
                {gSTMIS?.services &&
                  Object.values(gSTMIS?.services)?.map((element, index) => {
                    return (
                      <tr key={index}>
                        <td>{element.name}</td>
                        <td>{element.gstn}</td>
                        <td className='text-right'>
                          {element.D_amount.toLocaleString('en-IN', {
                            maximumFractionDigits: 2,
                            style: 'currency',
                            currency: 'INR',
                          })}
                        </td>
                        <td className='text-right'>
                          {element.I_amount.toLocaleString('en-IN', {
                            maximumFractionDigits: 2,
                            style: 'currency',
                            currency: 'INR',
                          })}
                        </td>
                        <td className='text-right'>
                          {element.M_amount.toLocaleString('en-IN', {
                            maximumFractionDigits: 2,
                            style: 'currency',
                            currency: 'INR',
                          })}
                        </td>
                        <td className='text-right'>
                          {element.D_cancellation.toLocaleString('en-IN', {
                            maximumFractionDigits: 2,
                            style: 'currency',
                            currency: 'INR',
                          })}
                        </td>
                        <td className='text-right'>
                          {element.I_cancellation.toLocaleString('en-IN', {
                            maximumFractionDigits: 2,
                            style: 'currency',
                            currency: 'INR',
                          })}
                        </td>
                        <td className='text-right'>
                          {element.M_cancellation.toLocaleString('en-IN', {
                            maximumFractionDigits: 2,
                            style: 'currency',
                            currency: 'INR',
                          })}
                        </td>
                        <td className='text-right'>
                          {(+element.cgst).toLocaleString('en-IN', {
                            maximumFractionDigits: 2,
                            style: 'currency',
                            currency: 'INR',
                          })}
                        </td>
                        <td className='text-right'>
                          {(+element.sgst).toLocaleString('en-IN', {
                            maximumFractionDigits: 2,
                            style: 'currency',
                            currency: 'INR',
                          })}
                        </td>
                        <td className='text-right'>
                          {(+element.igst).toLocaleString('en-IN', {
                            maximumFractionDigits: 2,
                            style: 'currency',
                            currency: 'INR',
                          })}
                        </td>
                      </tr>
                    );
                  })}
                <tr>
                  <td style={{ fontWeight: '700' }}>Total</td>
                  <td></td>
                  <td style={{ fontWeight: '700' }} className='text-right'>
                    {gSTMIS?.services_total?.d_amount.toLocaleString('en-IN', {
                      maximumFractionDigits: 2,
                      style: 'currency',
                      currency: 'INR',
                    })}
                  </td>
                  <td style={{ fontWeight: '700' }} className='text-right'>
                    {gSTMIS?.services_total?.i_amount.toLocaleString('en-IN', {
                      maximumFractionDigits: 2,
                      style: 'currency',
                      currency: 'INR',
                    })}
                  </td>
                  <td style={{ fontWeight: '700' }} className='text-right'>
                    {gSTMIS?.services_total?.m_amount.toLocaleString('en-IN', {
                      maximumFractionDigits: 2,
                      style: 'currency',
                      currency: 'INR',
                    })}
                  </td>
                  <td style={{ fontWeight: '700' }} className='text-right'>
                    {gSTMIS?.services_total?.d_cancellation.toLocaleString('en-IN', {
                      maximumFractionDigits: 2,
                      style: 'currency',
                      currency: 'INR',
                    })}
                  </td>
                  <td style={{ fontWeight: '700' }} className='text-right'>
                    {gSTMIS?.services_total?.i_cancellation.toLocaleString('en-IN', {
                      maximumFractionDigits: 2,
                      style: 'currency',
                      currency: 'INR',
                    })}
                  </td>
                  <td style={{ fontWeight: '700' }} className='text-right'>
                    {gSTMIS?.services_total?.m_cancellation.toLocaleString('en-IN', {
                      maximumFractionDigits: 2,
                      style: 'currency',
                      currency: 'INR',
                    })}
                  </td>
                  <td style={{ fontWeight: '700' }} className='text-right'>
                    {gSTMIS?.services_total?.cgst.toLocaleString('en-IN', {
                      maximumFractionDigits: 2,
                      style: 'currency',
                      currency: 'INR',
                    })}
                  </td>
                  <td style={{ fontWeight: '700' }} className='text-right'>
                    {gSTMIS?.services_total?.sgst.toLocaleString('en-IN', {
                      maximumFractionDigits: 2,
                      style: 'currency',
                      currency: 'INR',
                    })}
                  </td>
                  <td style={{ fontWeight: '700' }} className='text-right'>
                    {gSTMIS?.services_total?.igst.toLocaleString('en-IN', {
                      maximumFractionDigits: 2,
                      style: 'currency',
                      currency: 'INR',
                    })}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        {/* GST TRANSACTION FEES */}
        <div className='gst-transaction-fees mt-30'>
          <h2>GST on Transaction Fees</h2>
          <div className='overflow-scroll scroll-bar-1'>
            <table className='table-3 no-min-height mt-5'>
              <thead>
                <tr>
                  <th>Airline</th>
                  <th>GSTN</th>
                  <th>HSN Code</th>
                  <th>Invoice Dt</th>
                  <th>Invoice #</th>
                  <th className='text-right'>Commission</th>
                  <th className='text-right'>CGST</th>
                  <th className='text-right'>SGST</th>
                  <th className='text-right'>IGST</th>
                  <th>PDF</th>
                </tr>
              </thead>
              <tbody>
                {gSTMIS?.transaction_fees?.map((element, index) => {
                  return (
                    <tr key={index}>
                      <td>{element.vendor_name}</td>
                      <td>{element.gstn}</td>
                      <td>{element.hsn_code}</td>
                      <td>
                        {new DateObject({
                          date: element?.date,
                          format: 'YYYY-MM-DD',
                        }).format('DD-MMMM-YYYY')}
                      </td>
                      <td>{element.number}</td>
                      <td className='text-right'>
                        {(+element.commission).toLocaleString('en-IN', {
                          maximumFractionDigits: 2,
                          style: 'currency',
                          currency: 'INR',
                        })}
                      </td>
                      <td className='text-right'>
                        {(+element.cgst).toLocaleString('en-IN', {
                          maximumFractionDigits: 2,
                          style: 'currency',
                          currency: 'INR',
                        })}
                      </td>
                      <td className='text-right'>
                        {(+element.sgst).toLocaleString('en-IN', {
                          maximumFractionDigits: 2,
                          style: 'currency',
                          currency: 'INR',
                        })}
                      </td>
                      <td className='text-right'>
                        {(+element.igst).toLocaleString('en-IN', {
                          maximumFractionDigits: 2,
                          style: 'currency',
                          currency: 'INR',
                        })}
                      </td>
                      <td>
                        <a
                          className='text-primary'
                          target={'_blank'}
                          href={element.pdf_path}
                        >
                          Open
                        </a>
                      </td>
                    </tr>
                  );
                })}
                <tr>
                  <td style={{ fontWeight: '700' }}>Total</td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td style={{ fontWeight: '700' }} className='text-right'>
                    {gSTMIS?.transaction_fees_total?.commission.toLocaleString('en-IN', {
                      maximumFractionDigits: 2,
                      style: 'currency',
                      currency: 'INR',
                    })}
                  </td>
                  <td style={{ fontWeight: '700' }} className='text-right'>
                    {gSTMIS?.transaction_fees_total?.cgst.toLocaleString('en-IN', {
                      maximumFractionDigits: 2,
                      style: 'currency',
                      currency: 'INR',
                    })}
                  </td>
                  <td style={{ fontWeight: '700' }} className='text-right'>
                    {gSTMIS?.transaction_fees_total?.sgst.toLocaleString('en-IN', {
                      maximumFractionDigits: 2,
                      style: 'currency',
                      currency: 'INR',
                    })}
                  </td>
                  <td style={{ fontWeight: '700' }} className='text-right'>
                    {gSTMIS?.transaction_fees_total?.igst.toLocaleString('en-IN', {
                      maximumFractionDigits: 2,
                      style: 'currency',
                      currency: 'INR',
                    })}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        {/* GST INPUT TAX CREDIT */}
        <div className='gst-input-tax-credit mt-30'>
          <h2>GST Input Tax Credit</h2>
          <div className='overflow-scroll scroll-bar-1'>
            <table className='table-3 no-min-height mt-5'>
              <thead>
                <tr>
                  <th>Paid To</th>
                  <th>GSTN</th>
                  <th className='text-right'>Basic Amount</th>
                  <th className='text-right'>CGST</th>
                  <th className='text-right'>SGST</th>
                  <th className='text-right'>IGST</th>
                </tr>
              </thead>
              <tbody>
                {gSTMIS?.itc?.map((element, index) => {
                  return (
                    <tr key={index}>
                      <td>{element.name}</td>
                      <td>{element.gstn}</td>
                      <td className='text-right'>
                        {element.base_amount.toLocaleString('en-IN', {
                          maximumFractionDigits: 2,
                          style: 'currency',
                          currency: 'INR',
                        })}
                      </td>
                      <td className='text-right'>
                        {(+element.cgst).toLocaleString('en-IN', {
                          maximumFractionDigits: 2,
                          style: 'currency',
                          currency: 'INR',
                        })}
                      </td>
                      <td className='text-right'>
                        {(+element.sgst).toLocaleString('en-IN', {
                          maximumFractionDigits: 2,
                          style: 'currency',
                          currency: 'INR',
                        })}
                      </td>
                      <td className='text-right'>
                        {(+element.igst).toLocaleString('en-IN', {
                          maximumFractionDigits: 2,
                          style: 'currency',
                          currency: 'INR',
                        })}
                      </td>
                    </tr>
                  );
                })}
                <tr>
                  <td style={{ fontWeight: '700' }}>Total</td>
                  <td></td>
                  <td style={{ fontWeight: '700' }} className='text-right'>
                    {gSTMIS?.itc_total?.base_amount.toLocaleString('en-IN', {
                      maximumFractionDigits: 2,
                      style: 'currency',
                      currency: 'INR',
                    })}
                  </td>
                  <td style={{ fontWeight: '700' }} className='text-right'>
                    {gSTMIS?.itc_total?.cgst.toLocaleString('en-IN', {
                      maximumFractionDigits: 2,
                      style: 'currency',
                      currency: 'INR',
                    })}
                  </td>
                  <td style={{ fontWeight: '700' }} className='text-right'>
                    {gSTMIS?.itc_total?.sgst.toLocaleString('en-IN', {
                      maximumFractionDigits: 2,
                      style: 'currency',
                      currency: 'INR',
                    })}
                  </td>
                  <td style={{ fontWeight: '700' }} className='text-right'>
                    {gSTMIS?.itc_total?.igst.toLocaleString('en-IN', {
                      maximumFractionDigits: 2,
                      style: 'currency',
                      currency: 'INR',
                    })}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Journals;
