import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import DatePicker, { DateObject } from 'react-multi-date-picker';
import { useSelector } from 'react-redux';
import Select from 'react-select';
import ReactSwitch from 'react-switch';
import { createItem, getList } from '../../../../api/xplorzApi';
import Seo from '../../../../components/common/Seo';
import Footer from '../../../../components/footer/dashboard-footer';
import Header from '../../../../components/header/dashboard-header';
import Sidebar from '../../../../components/sidebars/dashboard-sidebars';
import { sendToast } from '../../../../utils/toastify';

const AddNewVendorCommissionInvoice = () => {
  const [date, setDate] = useState(new DateObject());
  const [previousFinancialYear, setPreviousFinancialYear] = useState(false);
  const [vendors, setVendors] = useState([]);
  const [vendorID, setVendorID] = useState(null);
  const [gstn, setGstn] = useState('');
  const [hsnCode, setHsnCode] = useState('');
  const [description, setDescription] = useState('');
  const [commission, setCommission] = useState('');
  const [igst, setIgst] = useState('');
  const [cgst, setCgst] = useState('');
  const [sgst, setSgst] = useState('');
  const [tds, setTds] = useState('');
  const [disabled, setDisabled] = useState(false);

  const token = useSelector((state) => state.auth.value.token);
  const router = useRouter();

  useEffect(() => {
    getData();
  }, []);

  const getData = async () => {
    const vendors = await getList('organizations', { is_vendor: 1 });
    if (vendors?.success) {
      setVendors(
        vendors.data.map((element) => ({
          value: element.id,
          gstn: element.gstn,
          label: element.name,
        }))
      );
    } else {
      sendToast('error', 'Unable to fetch required data', 4000);
      router.push('/dashboard/vendor-commission-invoices');
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!vendorID?.value) {
      sendToast('error', 'You must select a Vendor', 4000);
      return;
    }

    setDisabled(true);
    const response = await createItem('vendor-commission-invoices', {
      date: date.format('YYYY-MM-DD'),
      previous_financial_year: previousFinancialYear,
      vendor_id: vendorID.value,
      gstn,
      hsn_code: hsnCode,
      description,
      commission,
      igst,
      cgst,
      sgst,
      tds: tds || 0,
    });
    setDisabled(false);
    if (response?.success) {
      sendToast('success', 'Created Vendor Commission Invoice Successfully.', 4000);
      router.push('/dashboard/vendor-commission-invoices');
    } else {
      sendToast(
        'error',
        response.data?.message ||
          response.data?.error ||
          'Failed to Create Vendor Commission Invoice.',
        4000
      );
    }
  };

  useEffect(() => {
    if (commission) {
      setTds((+commission * 0.05).toFixed(2));
      setSgst((+commission * (gstn.startsWith('27') ? 0.09 : 0)).toFixed(2));
      setCgst((+commission * (gstn.startsWith('27') ? 0.09 : 0)).toFixed(2));
      setIgst((+commission * (gstn.startsWith('27') ? 0 : 0.18)).toFixed(2));
    }
  }, [commission, gstn]);

  return (
    <>
      <Seo pageTitle='Add New Vendor Commission Invoice' />
      {/* End Page Title */}

      <div className='header-margin'></div>

      <Header />
      {/* End dashboard-header */}

      <div className='dashboard'>
        <div className='dashboard__sidebar bg-white scroll-bar-1'>
          <Sidebar />
          {/* End sidebar */}
        </div>
        {/* End dashboard__sidebar */}

        <div className='dashboard__main'>
          <div className='dashboard__content d-flex flex-column justify-between bg-light-2'>
            <div>
              <div className='row y-gap-20 justify-between items-end pb-60 lg:pb-40 md:pb-32'>
                <div className='col-12'>
                  <h1 className='text-30 lh-14 fw-600'>
                    Add New Vendor Commission Invoice
                  </h1>
                  <div className='text-15 text-light-1'>
                    Create a new vendor commission invoice.
                  </div>
                </div>
                {/* End .col-12 */}
              </div>
              {/* End .row */}

              <div className='py-30 px-30 rounded-4 bg-white shadow-3'>
                <div>
                  <form onSubmit={onSubmit} className='row col-12 y-gap-20'>
                    <div className='d-block ml-3 form-datepicker'>
                      <label>
                        Date<span className='text-danger'>*</span>
                      </label>
                      <DatePicker
                        style={{ marginLeft: '0.5rem', fontSize: '1rem' }}
                        inputClass='custom_input-picker'
                        containerClassName='custom_container-picker'
                        value={date}
                        onChange={setDate}
                        numberOfMonths={1}
                        offsetY={10}
                        format='DD MMMM YYYY'
                      />
                    </div>
                    <div className='d-flex items-center gap-3'>
                      <ReactSwitch
                        onChange={() => setPreviousFinancialYear((prev) => !prev)}
                        checked={previousFinancialYear}
                      />
                      <label>Previous Financial Year</label>
                    </div>
                    <div className='form-input-select'>
                      <label>
                        Vendor<span className='text-danger'>*</span>
                      </label>
                      <Select
                        options={vendors}
                        value={vendorID}
                        placeholder='Search & Select Vendor (required)'
                        onChange={(id) => {
                          setVendorID(id);
                          if (id?.gstn) {
                            setGstn(id?.gstn);
                          } else {
                            setGstn('');
                          }
                        }}
                      />
                    </div>
                    <div className='col-12'>
                      <div className='form-input'>
                        <input
                          onChange={(e) => setGstn(e.target.value)}
                          value={gstn}
                          placeholder=' '
                          type='string'
                          required
                          pattern='^\d{2}[A-Za-z]{5}\d{4}[A-Za-z]\wZ\w$'
                        />
                        <label className='lh-1 text-16 text-light-1'>
                          GSTN<span className='text-danger'>*</span>
                        </label>
                      </div>
                    </div>
                    <div className='col-12'>
                      <div className='form-input'>
                        <input
                          onChange={(e) => setHsnCode(e.target.value)}
                          value={hsnCode}
                          placeholder=' '
                          type='string'
                          required
                        />
                        <label className='lh-1 text-16 text-light-1'>
                          HSN Code<span className='text-danger'>*</span>
                        </label>
                      </div>
                    </div>
                    <div className='col-12'>
                      <div className='form-input'>
                        <input
                          onChange={(e) => setDescription(e.target.value)}
                          value={description}
                          placeholder=' '
                          type='string'
                        />
                        <label className='lh-1 text-16 text-light-1'>Description</label>
                      </div>
                    </div>
                    <div className='col-12'>
                      <div className='form-input'>
                        <input
                          onChange={(e) => setCommission(e.target.value)}
                          value={commission}
                          placeholder=' '
                          type='number'
                          onWheel={(e) => e.target.blur()}
                          required
                        />
                        <label className='lh-1 text-16 text-light-1'>
                          Commission Amount<span className='text-danger'>*</span>
                        </label>
                      </div>
                    </div>
                    <div className='col-12'>
                      <div className='form-input'>
                        <input
                          onChange={(e) => setIgst(e.target.value)}
                          value={igst}
                          placeholder=' '
                          type='number'
                          onWheel={(e) => e.target.blur()}
                        />
                        <label className='lh-1 text-16 text-light-1'>IGST</label>
                      </div>
                    </div>
                    <div className='col-12'>
                      <div className='form-input'>
                        <input
                          onChange={(e) => setCgst(e.target.value)}
                          value={cgst}
                          placeholder=' '
                          type='number'
                          onWheel={(e) => e.target.blur()}
                        />
                        <label className='lh-1 text-16 text-light-1'>CGST</label>
                      </div>
                    </div>
                    <div className='col-12'>
                      <div className='form-input'>
                        <input
                          onChange={(e) => setSgst(e.target.value)}
                          value={sgst}
                          placeholder=' '
                          type='number'
                          onWheel={(e) => e.target.blur()}
                        />
                        <label className='lh-1 text-16 text-light-1'>SGST</label>
                      </div>
                    </div>
                    <div className='col-12'>
                      <div className='form-input'>
                        <input
                          onChange={(e) => setTds(e.target.value)}
                          value={tds}
                          placeholder=' '
                          type='number'
                          onWheel={(e) => e.target.blur()}
                        />
                        <label className='lh-1 text-16 text-light-1'>TDS</label>
                      </div>
                    </div>
                    <div className='d-inline-block'>
                      <button
                        type='submit'
                        className='button h-50 px-24 -dark-1 bg-blue-1 text-white'
                        disabled={disabled}
                      >
                        Add Vendor Commission Invoice
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>

            <Footer />
          </div>
          {/* End .dashboard__content */}
        </div>
        {/* End dashbaord content */}
      </div>
      {/* End dashbaord content */}
    </>
  );
};

export default AddNewVendorCommissionInvoice;
