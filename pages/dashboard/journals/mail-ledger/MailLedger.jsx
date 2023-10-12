import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import DatePicker, { DateObject } from 'react-multi-date-picker';
import Select from 'react-select';
import ReactSwitch from 'react-switch';
import { createItem, getList } from '../../../../api/xplorzApi';
import NewFileUploads from '../../../../components/new-file-uploads';
import { sendToast } from '../../../../utils/toastify';

const MailLedger = () => {
  const [ledgerData, setLedgerData] = useState(null);
  const date = new DateObject();

  const [dates, setDates] = useState([
    new DateObject().setMonth(date.year < 2024 ? 8 : 4).setDay('1'),
    new DateObject(),
  ]);
  const [clients, setClients] = useState([]);
  const [clientID, setClientID] = useState(null);
  const [email, setEmail] = useState(null);
  const [subject, setSubject] = useState(null);
  const [body, setBody] = useState(null);
  const [references, setReferences] = useState([]);
  const [ledgerPDFUrl, setLedgerPDFUrl] = useState(null);
  const [ledgerCSVUrl, setLedgerCSVUrl] = useState(null);
  const [files, setFiles] = useState([]);

  const router = useRouter();

  useEffect(() => {
    if (router.isReady) getData();
  }, [router.isReady]);

  const getData = async () => {
    // Getting clients
    const response = await getList('organizations', { is_client: 1 });
    if (response?.success) {
      setClients(
        response.data.map((element) => ({ value: element.id, label: element.name }))
      );
      // Checking for query param
      if (router.query?.client_id) {
        for (let acc of response.data)
          if (acc.id === +router.query.client_id)
            setClientID({ value: acc.id, label: acc.name });
      }
    } else {
      sendToast(
        'error',
        response?.data?.message || response?.data?.error || 'Error in fetching clients list',
        4000
      );
    }
  };

  const getLedgerData = async (e) => {
    setLedgerData(null);
    const response = await getList('journals/references', {
      client_id: clientID.value,
      start_date: dates[0].format('YYYY-MM-DD'),
      end_date: dates[1].format('YYYY-MM-DD'),
    });
    if (response?.success) {
      const start_date = dates[0].format('DD-MMM-YYYY');
      const end_date = dates[1].format('DD-MMM-YYYY');
      setLedgerData(response.data);
      setEmail(response.data?.client?.contact_email);
      setSubject(`Ledger statement from ${start_date} to ${end_date}`);
      setBody(
        `Dear ${
          response.data?.client?.contact_name?.split(' ')[0]
        },\n\nPlease find attached the Ledger Statement and Invoices for ${
          response.data?.client?.name
        } from ${start_date} to ${end_date}.\n\nTotal Amount Due is: AED ${+(response.data?.balance).toFixed(
          2
        )}\n\nKindly process the statement at the earliest and oblige.\n\nThank You\n\nRegards\nNarayan.`
      );
      setReferences(response.data?.references.map((e) => ({ value: e, include: true })));
      setLedgerPDFUrl(response.data?.ledger_pdf_url);
      setLedgerCSVUrl(response.data?.ledger_csv_url);
      setFiles([]);
    } else {
      sendToast(
        'error',
        response?.data?.message || response?.data?.error || 'Error getting ledger data',
        4000
      );
    }
  };

  useEffect(() => {
    if (clientID?.value && dates && dates?.length === 2) getLedgerData();
  }, [clientID, dates]);

  const sendClientMail = async (e) => {
    let formData = new FormData();
    for (let e of email.split(',')) {
      const mail = e.trim();
      if (mail.length) {
        formData.append('email[]', mail);
      }
    }
    formData.append('subject', subject);
    formData.append('body', body.replaceAll('\n', '<br/>'));
    if (ledgerPDFUrl?.length) {
      formData.append('ledger_pdf_url', encodeURI(ledgerPDFUrl));
    }
    if (ledgerCSVUrl?.length) {
      formData.append('ledger_csv_url', encodeURI(ledgerCSVUrl));
    }
    for (let ref of references) {
      if (ref.include) {
        formData.append('references[]', ref.value);
      }
    }
    for (let file of files) {
      formData.append('files[]', file);
    }
    const response = await createItem('journals/mail-client-ledger', formData);
    if (response?.success) {
      sendToast('success', 'Mail Sent Successfully.', 4000);
      setLedgerData(null);
      setClientID(null);
    } else {
      sendToast(
        'error',
        response.data?.message || response.data?.error || 'Failed to send the mail.',
        4000
      );
    }
  };

  return (
    <div className='col-12'>
      {/* Search Form */}
      <h5>Select Client and Ledger Period</h5>
      <div className='row'>
        <div className='col-lg-6 col-12 form-input-select'>
          <label>Select Client</label>
          <Select
            options={clients}
            value={clientID}
            placeholder='Search & Select Client'
            onChange={(id) => setClientID(id)}
          />
        </div>
        <div className='col-lg-6 col-12 form-datepicker'>
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
            minDate='2023-08-01'
          />
        </div>
      </div>
      {/* Mail Form */}
      {ledgerData && (
        <div className='row mt-20'>
          <h5>Compose Email</h5>
          <div className='col-12 col-lg-6 form-input mt-10'>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder='Enter email'
              required
            />
            <label className='lh-1 text-16 text-light-1'>
              Recipient Email<span className='text-danger'>*</span>
            </label>
          </div>
          <div className='col-12 col-lg-6 form-input mt-10'>
            <input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              type='text'
              placeholder='Enter subject'
              required
            />
            <label className='lh-1 text-16 text-light-1'>
              Mail Subject<span className='text-danger'>*</span>
            </label>
          </div>
          <div className='col-12 form-input mt-10'>
            <textarea
              rows={12}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              type='text'
              placeholder='Enter body'
              required
            />
            <label className='lh-1 text-16 text-light-1'>
              Mail Body<span className='text-danger'>*</span>
            </label>
          </div>
          <h6 className='mt-20'>Ledger Attachments</h6>
          <div className='d-flex col-lg-4 items-center gap-3 mt-10'>
            <ReactSwitch
              onChange={() => setLedgerPDFUrl((prev) => (prev ? '' : ledgerData.ledger_pdf_url))}
              checked={!!ledgerPDFUrl}
            />
            <label>
              <a href={ledgerData.ledger_pdf_url} className='btn-link' target='_blank'>
                Ledger Statement - PDF
              </a>
            </label>
          </div>
          <div className='d-flex col-lg-4 items-center gap-3 mt-10'>
            <ReactSwitch
              onChange={() => setLedgerCSVUrl((prev) => (prev ? '' : ledgerData.ledger_csv_url))}
              checked={!!ledgerCSVUrl}
            />
            <label>
              <a href={ledgerData.ledger_csv_url} className='btn-link' target='_blank'>
                Ledger Statement - CSV
              </a>
            </label>
          </div>
          {references.map((ref, idx) => (
            <div className='col-lg-4 d-flex items-center gap-3 mt-10' key={ref}>
              <ReactSwitch
                onChange={(checked) =>
                  setReferences((prev) => {
                    const refs = [...prev];
                    refs[idx].include = checked;
                    return refs;
                  })
                }
                checked={ref.include}
              />
              <label>{ref.value}</label>
            </div>
          ))}
          <div className='col-12 mt-10'>
            <h6>Additional Files</h6>
            <NewFileUploads
              multiple
              setUploads={setFiles}
              fileTypes={['PDF', 'CSV', 'XLS', 'XLSX']}
            />
          </div>
          <div className='col-12 col-md-6 col-lg-4 mt-10 d-flex items-center gap-3'>
            <button className='button btn btn-primary' onClick={() => sendClientMail()}>
              <i className='icon-email-2 p-1'></i>
              Send Mail
            </button>
            <button className='button btn btn-danger' onClick={() => window.history.back(-1)}>
              <i className='icon-close p-1'></i>
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MailLedger;