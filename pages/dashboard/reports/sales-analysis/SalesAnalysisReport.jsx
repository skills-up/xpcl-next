import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import DatePicker, { DateObject } from 'react-multi-date-picker';
import { getList } from '../../../../api/xplorzApi';
import { sendToast } from '../../../../utils/toastify';

const SalesAnalysisReport = () => {
  const date = new DateObject();
  const [data, setData] = useState(null);

  const [dates, setDates] = useState([
    new DateObject()
      .setYear(date.year - (date.month.number < 4 ? 1 : 0))
      .setMonth(date.year < 2024 || (date.year == 2024 && date.month.number < 4) ? 10 : 4)
      .setDay('1'),
    new DateObject(),
  ]);

  const router = useRouter();

  const objSum = (obj) =>
    Object.values(obj).reduce((a, b) => a + (typeof b === 'object' ? objSum(b) : +b), 0);

  const [reg_client_data, setRegClientData] = useState(null);
  const [unreg_client_data, setUnregClientData] = useState(null);
  const [misc_data, setMiscData] = useState(null);
  const [service_charges, setServiceCharges] = useState(0);
  const [commission, setCommission] = useState(0);
  const [cancellation, setCancellation] = useState(0);
  const [canc_serv, setCancServ] = useState(0);

  const [expandedRegClientDom, setExpandedRegClientDom] = useState(false);
  const [expandedRegClientInt, setExpandedRegClientInt] = useState(false);
  const [expandedRegClientTax, setExpandedRegClientTax] = useState(false);
  const [expandedUnregClientDom, setExpandedUnregClientDom] = useState(false);
  const [expandedUnregClientInt, setExpandedUnregClientInt] = useState(false);
  const [expandedUnregClientTax, setExpandedUnregClientTax] = useState(false);
  const [expandedMiscBasic, setExpandedMiscBasic] = useState(false);
  const [expandedMiscTaxes, setExpandedMiscTaxes] = useState(false);
  const [expandedService, setExpandedService] = useState(false);
  const [expandedCancellationDomRD, setExpandedCancellationDomRD] = useState(false);
  const [expandedCancellationDomURD, setExpandedCancellationDomURD] = useState(false);
  const [expandedCancellationIntRD, setExpandedCancellationIntRD] = useState(false);
  const [expandedCancellationIntURD, setExpandedCancellationIntURD] = useState(false);
  const [expandedCancellationMisc, setExpandedCancellationMisc] = useState(false);
  const [expandedCommission, setExpandedCommission] = useState(false);

  const toggleState = (setState) => {
    setState((prev) => !prev);
  };

  const formatAsCurrency = (num) =>
    Number(num).toLocaleString('en-IN', {
      maximumFractionDigits: 2,
      style: 'currency',
      currency: 'INR',
    });

  const getReport = async () => {
    const response = await getList('reports/sales-analysis', {
      from_date: dates[0].format('YYYY-MM-DD'),
      to_date: dates[1].format('YYYY-MM-DD'),
    });
    if (response?.success) {
      const data = response.data;
      const reg_client_data = {
        dom: {
          basic: 0,
          taxable: 0,
        },
        int: {
          basic: 0,
          taxable: 0,
        },
        taxes: objSum(data.reg_client_data.taxes),
      };
      Object.values(data.reg_client_data.dom).forEach((obj) => {
        reg_client_data.dom.basic += obj.basic;
        reg_client_data.dom.taxable += obj.taxable;
      });
      Object.values(data.reg_client_data.int).forEach((obj) => {
        reg_client_data.int.basic += obj.basic;
        reg_client_data.int.taxable += obj.taxable;
      });
      setRegClientData(reg_client_data);
      const unreg_client_data = {
        dom: {
          basic: 0,
          taxable: 0,
        },
        int: {
          basic: 0,
          taxable: 0,
        },
        taxes: objSum(data.unreg_client_data.taxes),
      };
      Object.values(data.unreg_client_data.dom).forEach((obj) => {
        unreg_client_data.dom.basic += obj.basic;
        unreg_client_data.dom.taxable += obj.taxable;
      });
      Object.values(data.unreg_client_data.int).forEach((obj) => {
        unreg_client_data.int.basic += obj.basic;
        unreg_client_data.int.taxable += obj.taxable;
      });
      setUnregClientData(unreg_client_data);
      const misc_data = {
        basic: objSum(data.misc_data.basic),
        taxes: objSum(data.misc_data.taxes),
      };
      setMiscData(misc_data);
      const service_charges = objSum(data.service_charges);
      setServiceCharges(service_charges);
      const commission = objSum(data.commission);
      setCommission(commission);
      const cancellation = {
        dom: {
          rd: objSum(data.cancellation.dom.rd),
          urd: objSum(data.cancellation.dom.urd),
        },
        int: {
          rd: objSum(data.cancellation.int.rd),
          urd: objSum(data.cancellation.int.urd),
        },
        misc: objSum(data.cancellation.misc),
      };
      setCancellation(cancellation);
      data.cancellation_total = objSum(cancellation);
      const canc_serv = {
        dom: {
          rd: objSum(data.canc_serv.dom.rd),
          urd: objSum(data.canc_serv.dom.urd),
        },
        int: {
          rd: objSum(data.canc_serv.int.rd),
          urd: objSum(data.canc_serv.int.urd),
        },
        misc: objSum(data.canc_serv.misc),
      };
      setCancServ(canc_serv);
      data.canc_serv_total = objSum(canc_serv);
      data.sales =
        reg_client_data.dom.basic +
        reg_client_data.int.basic +
        reg_client_data.taxes +
        unreg_client_data.dom.basic +
        unreg_client_data.int.basic +
        unreg_client_data.taxes +
        misc_data.basic +
        misc_data.taxes +
        service_charges +
        data.cancellation_total;
      data.sales_turnover =
        (reg_client_data.dom.basic + unreg_client_data.dom.basic) * 0.05 +
        (reg_client_data.int.basic + unreg_client_data.int.basic) * 0.1 +
        service_charges +
        data.canc_serv_total;
      data.taxable =
        reg_client_data.dom.taxable +
        reg_client_data.int.taxable +
        unreg_client_data.dom.taxable +
        unreg_client_data.int.taxable +
        service_charges +
        data.canc_serv_total;
      data.total_turnover = data.sales_turnover + commission + +data.transaction_fees;
      data.taxable_turnover = data.taxable + commission + +data.transaction_fees;
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
                <th className='text-right -w-20'>Actual Value</th>
                <th className='text-right -w-20'>Value of Service</th>
                <th className='text-right -w-20'>Taxable Value</th>
              </tr>
            </thead>
            <tbody>
              <tr onClick={() => toggleState(setExpandedRegClientDom)}>
                <th>Registered Client - Domestic</th>
                <td className='text-right'>
                  {formatAsCurrency(reg_client_data?.dom.basic)}
                </td>
                <td className='text-right'>
                  {formatAsCurrency(reg_client_data?.dom.basic * 0.05)}
                </td>
                <td className='text-right'>
                  {formatAsCurrency(reg_client_data?.dom.taxable)}
                </td>
              </tr>
              {expandedRegClientDom && (
                <tr>
                  <td colSpan={4}>
                    <table className='table-3'>
                      <tbody>
                        {Object.entries(data.reg_client_data.dom).map(([number, obj]) => (
                          <tr key={number}>
                            <td>{number}</td>
                            <td className='text-right -w-20'>
                              {formatAsCurrency(obj.basic)}
                            </td>
                            <td className='text-right -w-20'>
                              {formatAsCurrency(obj.basic * 0.05)}
                            </td>
                            <td className='text-right -w-20'>
                              {formatAsCurrency(obj.taxable)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </td>
                </tr>
              )}
              <tr onClick={() => toggleState(setExpandedRegClientInt)}>
                <th>Registered Client - International</th>
                <td className='text-right'>
                  {formatAsCurrency(reg_client_data?.int.basic)}
                </td>
                <td className='text-right'>
                  {formatAsCurrency(reg_client_data?.int.basic * 0.1)}
                </td>
                <td className='text-right'>
                  {formatAsCurrency(reg_client_data?.int.taxable)}
                </td>
              </tr>
              {expandedRegClientInt && (
                <tr>
                  <td colSpan={4}>
                    <table className='table-3'>
                      <tbody>
                        {Object.entries(data.reg_client_data.int).map(([number, obj]) => (
                          <tr key={number}>
                            <td>{number}</td>
                            <td className='text-right -w-20'>
                              {formatAsCurrency(obj.basic)}
                            </td>
                            <td className='text-right -w-20'>
                              {formatAsCurrency(obj.basic * 0.05)}
                            </td>
                            <td className='text-right -w-20'>
                              {formatAsCurrency(obj.taxable)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </td>
                </tr>
              )}
              <tr onClick={() => toggleState(setExpandedRegClientTax)}>
                <th>Registered Client - Total Tax</th>
                <td className='text-right'>{formatAsCurrency(reg_client_data?.taxes)}</td>
                <td className='text-right'> &nbsp; </td>
                <td className='text-right'> &nbsp; </td>
              </tr>
              {expandedRegClientTax && (
                <tr>
                  <td colSpan={4}>
                    <table className='table-3'>
                      <tbody>
                        {Object.entries(data.reg_client_data.taxes)
                          .filter(([_, value]) => !!+value)
                          .map(([number, value]) => (
                            <tr key={number}>
                              <td>{number}</td>
                              <td className='text-right -w-20'>
                                {formatAsCurrency(value)}
                              </td>
                              <td className='text-right -w-20'></td>
                              <td className='text-right -w-20'></td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </td>
                </tr>
              )}
              <tr onClick={() => toggleState(setExpandedUnregClientDom)}>
                <th>Unregistered Client - Domestic</th>
                <td className='text-right'>
                  {formatAsCurrency(unreg_client_data?.dom.basic)}
                </td>
                <td className='text-right'>
                  {formatAsCurrency(unreg_client_data?.dom.basic * 0.05)}
                </td>
                <td className='text-right'>
                  {formatAsCurrency(unreg_client_data?.dom.taxable)}
                </td>
              </tr>
              {expandedUnregClientDom && (
                <tr>
                  <td colSpan={4}>
                    <table className='table-3'>
                      <tbody>
                        {Object.entries(data.unreg_client_data.dom).map(
                          ([number, obj]) => (
                            <tr key={number}>
                              <td>{number}</td>
                              <td className='text-right -w-20'>
                                {formatAsCurrency(obj.basic)}
                              </td>
                              <td className='text-right -w-20'>
                                {formatAsCurrency(obj.basic * 0.05)}
                              </td>
                              <td className='text-right -w-20'>
                                {formatAsCurrency(obj.taxable)}
                              </td>
                            </tr>
                          )
                        )}
                      </tbody>
                    </table>
                  </td>
                </tr>
              )}
              <tr onClick={() => toggleState(setExpandedUnregClientInt)}>
                <th>Unregistered Client - International</th>
                <td className='text-right'>
                  {formatAsCurrency(unreg_client_data?.int.basic)}
                </td>
                <td className='text-right'>
                  {formatAsCurrency(unreg_client_data?.int.basic * 0.1)}
                </td>
                <td className='text-right'>
                  {formatAsCurrency(unreg_client_data?.int.taxable)}
                </td>
              </tr>
              {expandedUnregClientInt && (
                <tr>
                  <td colSpan={4}>
                    <table className='table-3'>
                      <tbody>
                        {Object.entries(data.unreg_client_data.int).map(
                          ([number, obj]) => (
                            <tr key={number}>
                              <td>{number}</td>
                              <td className='text-right -w-20'>
                                {formatAsCurrency(obj.basic)}
                              </td>
                              <td className='text-right -w-20'>
                                {formatAsCurrency(obj.basic * 0.05)}
                              </td>
                              <td className='text-right -w-20'>
                                {formatAsCurrency(obj.taxable)}
                              </td>
                            </tr>
                          )
                        )}
                      </tbody>
                    </table>
                  </td>
                </tr>
              )}
              <tr onClick={() => toggleState(setExpandedUnregClientTax)}>
                <th>Unregistered Client - Total Tax</th>
                <td className='text-right'>
                  {formatAsCurrency(unreg_client_data?.taxes)}
                </td>
                <td className='text-right'> &nbsp; </td>
                <td className='text-right'> &nbsp; </td>
              </tr>
              {expandedUnregClientTax && (
                <tr>
                  <td colSpan={4}>
                    <table className='table-3'>
                      <tbody>
                        {Object.entries(data.unreg_client_data.taxes)
                          .filter(([_, value]) => !!+value)
                          .map(([number, value]) => (
                            <tr key={number}>
                              <td>{number}</td>
                              <td className='text-right -w-20'>
                                {formatAsCurrency(value)}
                              </td>
                              <td className='text-right -w-20'></td>
                              <td className='text-right -w-20'></td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </td>
                </tr>
              )}
              <tr onClick={() => toggleState(setExpandedMiscBasic)}>
                <th>Miscellaneous Basic Amount</th>
                <td className='text-right'>{formatAsCurrency(misc_data?.basic)}</td>
                <td className='text-right'> &nbsp; </td>
                <td className='text-right'> &nbsp; </td>
              </tr>
              {expandedMiscBasic && (
                <tr>
                  <td colSpan={4}>
                    <table className='table-3'>
                      <tbody>
                        {Object.entries(data.misc_data.basic)
                          .filter(([_, value]) => !!+value)
                          .map(([number, value]) => (
                            <tr key={number}>
                              <td>{number}</td>
                              <td className='text-right -w-20'>
                                {formatAsCurrency(value)}
                              </td>
                              <td className='text-right -w-20'></td>
                              <td className='text-right -w-20'></td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </td>
                </tr>
              )}
              <tr onClick={() => toggleState(setExpandedMiscTaxes)}>
                <th>Miscellaneous Tax Amount</th>
                <td className='text-right'>{formatAsCurrency(misc_data?.taxes)}</td>
                <td className='text-right'> &nbsp; </td>
                <td className='text-right'> &nbsp; </td>
              </tr>
              {expandedMiscTaxes && (
                <tr>
                  <td colSpan={4}>
                    <table className='table-3'>
                      <tbody>
                        {Object.entries(data.misc_data.taxes)
                          .filter(([_, value]) => !!+value)
                          .map(([number, value]) => (
                            <tr key={number}>
                              <td>{number}</td>
                              <td className='text-right -w-20'>
                                {formatAsCurrency(value)}
                              </td>
                              <td className='text-right -w-20'></td>
                              <td className='text-right -w-20'></td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </td>
                </tr>
              )}
              <tr onClick={() => toggleState(setExpandedService)}>
                <th>Miscellaneous Service Charges</th>
                <td className='text-right'>{formatAsCurrency(service_charges)}</td>
                <td className='text-right'>{formatAsCurrency(service_charges)}</td>
                <td className='text-right'>{formatAsCurrency(service_charges)}</td>
              </tr>
              {expandedService && (
                <tr>
                  <td colSpan={4}>
                    <table className='table-3'>
                      <tbody>
                        {Object.entries(data.service_charges)
                          .filter(([_, value]) => !!+value)
                          .map(([number, value]) => (
                            <tr key={number}>
                              <td>{number}</td>
                              <td className='text-right -w-20'>
                                {formatAsCurrency(value)}
                              </td>
                              <td className='text-right -w-20'></td>
                              <td className='text-right -w-20'></td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </td>
                </tr>
              )}
            </tbody>
            <tfoot>
              <tr>
                <th>Sales Turnover (incl. Cancellation Charges)</th>
                <td className='text-right'>{formatAsCurrency(data.sales)}</td>
                <td className='text-right'>{formatAsCurrency(data.sales_turnover)}</td>
                <td className='text-right'>{formatAsCurrency(data.taxable)}</td>
              </tr>
            </tfoot>
          </table>
          <h5 className='mt-20'>Cancellation Charges</h5>
          <table className='table-3' style={{ minHeight: 'auto' }}>
            <thead>
              <tr>
                <th>Particulars</th>
                <th className='text-right -w-20'>Actual Value</th>
                <th className='text-right -w-20'>Value of Service</th>
                <th className='text-right -w-20'>Taxable Value</th>
              </tr>
            </thead>
            <tbody>
              <tr onClick={() => toggleState(setExpandedCancellationDomRD)}>
                <th>Registered Client - Domestic</th>
                <td className='text-right'>{formatAsCurrency(cancellation.dom.rd)}</td>
                <td className='text-right'>{formatAsCurrency(canc_serv.dom.rd)}</td>
                <td className='text-right'>{formatAsCurrency(canc_serv.dom.rd)}</td>
              </tr>
              {expandedCancellationDomRD && (
                <tr>
                  <td colSpan={4}>
                    <table className='table-3'>
                      <tbody>
                        {Object.entries(data.cancellation.dom.rd)
                          .filter(([_, value]) => !!+value)
                          .map(([number, value]) => (
                            <tr key={number}>
                              <td>{number}</td>
                              <td className='text-right -w-20'>
                                {formatAsCurrency(value)}
                              </td>
                              <td className='text-right -w-20'>
                                {formatAsCurrency(data.canc_serv.dom.rd[number])}
                              </td>
                              <td className='text-right -w-20'>
                                {formatAsCurrency(data.canc_serv.dom.rd[number])}
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </td>
                </tr>
              )}
              <tr onClick={() => toggleState(setExpandedCancellationIntRD)}>
                <th>Registered Client - International</th>
                <td className='text-right'>{formatAsCurrency(cancellation.int.rd)}</td>
                <td className='text-right'>{formatAsCurrency(canc_serv.int.rd)}</td>
                <td className='text-right'>{formatAsCurrency(canc_serv.int.rd)}</td>
              </tr>
              {expandedCancellationIntRD && (
                <tr>
                  <td colSpan={4}>
                    <table className='table-3'>
                      <tbody>
                        {Object.entries(data.cancellation.int.rd)
                          .filter(([_, value]) => !!+value)
                          .map(([number, value]) => (
                            <tr key={number}>
                              <td>{number}</td>
                              <td className='text-right -w-20'>
                                {formatAsCurrency(value)}
                              </td>
                              <td className='text-right -w-20'>
                                {formatAsCurrency(data.canc_serv.int.rd[number])}
                              </td>
                              <td className='text-right -w-20'>
                                {formatAsCurrency(data.canc_serv.int.rd[number])}
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </td>
                </tr>
              )}
              <tr onClick={() => toggleState(setExpandedCancellationDomURD)}>
                <th>Unregistered Client - Domestic</th>
                <td className='text-right'>{formatAsCurrency(cancellation.dom.urd)}</td>
                <td className='text-right'>{formatAsCurrency(canc_serv.dom.urd)}</td>
                <td className='text-right'>{formatAsCurrency(canc_serv.dom.urd)}</td>
              </tr>
              {expandedCancellationDomURD && (
                <tr>
                  <td colSpan={4}>
                    <table className='table-3'>
                      <tbody>
                        {Object.entries(data.cancellation.dom.urd)
                          .filter(([_, value]) => !!+value)
                          .map(([number, value]) => (
                            <tr key={number}>
                              <td>{number}</td>
                              <td className='text-right -w-20'>
                                {formatAsCurrency(value)}
                              </td>
                              <td className='text-right -w-20'>
                                {formatAsCurrency(data.canc_serv.dom.urd[number])}
                              </td>
                              <td className='text-right -w-20'>
                                {formatAsCurrency(data.canc_serv.dom.urd[number])}
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </td>
                </tr>
              )}
              <tr onClick={() => toggleState(setExpandedCancellationIntURD)}>
                <th>Unregistered Client - International</th>
                <td className='text-right'>{formatAsCurrency(cancellation.int.urd)}</td>
                <td className='text-right'>{formatAsCurrency(canc_serv.int.urd)}</td>
                <td className='text-right'>{formatAsCurrency(canc_serv.int.urd)}</td>
              </tr>
              {expandedCancellationIntURD && (
                <tr>
                  <td colSpan={4}>
                    <table className='table-3'>
                      <tbody>
                        {Object.entries(data.cancellation.int.urd)
                          .filter(([_, value]) => !!+value)
                          .map(([number, value]) => (
                            <tr key={number}>
                              <td>{number}</td>
                              <td className='text-right -w-20'>
                                {formatAsCurrency(value)}
                              </td>
                              <td className='text-right -w-20'>
                                {formatAsCurrency(data.canc_serv.int.urd[number])}
                              </td>
                              <td className='text-right -w-20'>
                                {formatAsCurrency(data.canc_serv.int.urd[number])}
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </td>
                </tr>
              )}
              <tr onClick={() => toggleState(setExpandedCancellationMisc)}>
                <th>Miscellaneous</th>
                <td className='text-right'>{formatAsCurrency(cancellation.misc)}</td>
                <td className='text-right'>{formatAsCurrency(canc_serv.misc)}</td>
                <td className='text-right'>{formatAsCurrency(canc_serv.misc)}</td>
              </tr>
              {expandedCancellationMisc && (
                <tr>
                  <td colSpan={4}>
                    <table className='table-3'>
                      <tbody>
                        {Object.entries(data.cancellation.misc)
                          .filter(([_, value]) => !!+value)
                          .map(([number, value]) => (
                            <tr key={number}>
                              <td>{number}</td>
                              <td className='text-right -w-20'>
                                {formatAsCurrency(value)}
                              </td>
                              <td className='text-right -w-20'>
                                {formatAsCurrency(data.canc_serv.misc[number])}
                              </td>
                              <td className='text-right -w-20'>
                                {formatAsCurrency(data.canc_serv.misc[number])}
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </td>
                </tr>
              )}
            </tbody>
            <tfoot>
              <tr>
                <th>Total</th>
                <td className='text-right'>
                  {formatAsCurrency(data.cancellation_total)}
                </td>
                <td className='text-right'>{formatAsCurrency(data.canc_serv_total)}</td>
                <td className='text-right'>{formatAsCurrency(data.canc_serv_total)}</td>
              </tr>
            </tfoot>
          </table>
          <h5 className='mt-20'>Commission Turnover</h5>
          <table className='table-3' style={{ minHeight: 'auto' }}>
            <thead>
              <tr>
                <th>Particulars</th>
                <th className='text-right -w-20'>Actual Value</th>
                <th className='text-right -w-20'>Value of Service</th>
                <th className='text-right -w-20'>Taxable Value</th>
              </tr>
            </thead>
            <tbody>
              <tr onClick={() => toggleState(setExpandedCommission)}>
                <th>Vendor Commission</th>
                <td className='text-right'>{formatAsCurrency(commission)}</td>
                <td className='text-right'>{formatAsCurrency(commission)}</td>
                <td className='text-right'>{formatAsCurrency(commission)}</td>
              </tr>
              {expandedCommission && (
                <tr>
                  <td colSpan={4}>
                    <table className='table-3'>
                      <tbody>
                        {Object.entries(data.commission)
                          .filter(([_, value]) => !!+value)
                          .map(([number, value]) => (
                            <tr key={number}>
                              <td>{number}</td>
                              <td className='text-right -w-20'>
                                {formatAsCurrency(value)}
                              </td>
                              <td className='text-right -w-20'></td>
                              <td className='text-right -w-20'></td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </td>
                </tr>
              )}
              <tr>
                <th>Transaction Fees</th>
                <td className='text-right'>{formatAsCurrency(+data.transaction_fees)}</td>
                <td className='text-right'>{formatAsCurrency(+data.transaction_fees)}</td>
                <td className='text-right'>{formatAsCurrency(+data.transaction_fees)}</td>
              </tr>
            </tbody>
          </table>
          <table className='table-3 mt-20' style={{ minHeight: 'auto' }}>
            <thead>
              <tr>
                <th colSpan={2}>Turnover Report</th>
                <td className='text-right -w-20'>
                  {formatAsCurrency(data.total_turnover)}
                </td>
                <td className='text-right -w-20'>
                  {formatAsCurrency(data.taxable_turnover)}
                </td>
              </tr>
              <tr>
                <th colSpan={2}>Approx GST Output (@18% of Value of Services)</th>
                <td className='text-right'>
                  {formatAsCurrency(data.total_turnover * 0.18)}
                </td>
                <td className='text-right'>
                  {formatAsCurrency(data.taxable_turnover * 0.18)}
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
