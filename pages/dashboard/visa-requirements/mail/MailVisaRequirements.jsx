import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { createItem, getItem } from '../../../../api/xplorzApi';
import { sendToast } from '../../../../utils/toastify';
import { IoDocumentAttachOutline } from 'react-icons/io5';

const MailVisaRequirements = () => {
  const [vid, setVid] = useState(null);
  const [email, setEmail] = useState(null);
  const [subject, setSubject] = useState(null);
  const [body, setBody] = useState(null);
  const [files, setFiles] = useState([]);

  const router = useRouter();

  useEffect(() => {
    const vid = router.query.view;
    if (vid) {
      setVid(vid)
      getData(vid);
    }
  }, [router.isReady]);

  const getData = async (vid) => {
    // Getting clients
    const response = await getItem('visa-requirements', vid);
    if (response?.success) {
      setSubject(`${response.data?.country_name} - ${response.data?.business_travel ? 'Business' : 'Tourist'} Visa Forms`);
      setBody(`Hi <name>,\n\nPlease find attached the Document Checklist and the Visa Forms for a ${response.data?.business_travel ? 'Business' : 'Tourist'} Visa for ${response.data?.country_name}.\n\nPlease let us know when the documents are ready for collection.\n\nThank You,\n\nAssuring you of our best services at all times.\nXCPL Support Team.`);
      const files = [];
      if (response.data?.pdf_url) {
        files.push(response.data.pdf_url);
      }
      if (response.data?.photo_sample) {
        files.push(response.data.photo_sample);
      }
      if (response.data?.visa_forms?.length) {
        response.data.visa_forms.forEach(url => files.push(url));
      }
      setFiles(files);
    } else {
      sendToast(
        'error',
        response?.data?.message || response?.data?.error || 'Error in fetching clients list',
        4000
      );
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const response = await createItem(`visa-requirements/${vid}/email`, {
      to: email.split(',').map(x => x.trim()),
      subject,
      body: body.replaceAll('\n', '<br/>'),
    });
    if (response?.success) {
      sendToast('success', 'Mail Sent Successfully.', 4000);
    } else {
      sendToast(
        'error',
        response.data?.message || response.data?.error || 'Failed to send the mail.',
        4000
      );
    }
  };

  return (
    <form className='row y-gap-20' onSubmit={onSubmit}>
      <div className='col-12 col-lg-6 form-input mt-10'>
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          type='email'
          placeholder=' '
          required
        />
        <label className='lh-1 text-16 text-light-1'>
          Recipient Email(s)<span className='text-danger'>*</span>
        </label>
      </div>
      <div className='col-12 col-lg-6 form-input mt-10'>
        <input
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          type='text'
          placeholder=' '
          required
        />
        <label className='lh-1 text-16 text-light-1'>
          Mail Subject<span className='text-danger'>*</span>
        </label>
      </div>
      <div className='col-12 form-input mt-10'>
        <textarea
          rows={10}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          type='text'
          placeholder=' '
          required
        />
        <label className='lh-1 text-16 text-light-1'>
          Mail Body<span className='text-danger'>*</span>
        </label>
      </div>
      <h6 className='mt-10'>Attachments</h6>
      <div className='row form-input'>
        {files.map(url => <div className='col-12 col-lg-6'>
          <IoDocumentAttachOutline/>
          <a href={url} target='_blank' className='btn btn-link'>{url.split('/').at(-1)}</a>
        </div>)}
      </div>
      <div className='col-12 col-md-6 col-lg-4 mt-10 d-flex items-center gap-3'>
        <button type='submit' className='button btn btn-primary'>
          <i className='icon-email-2 p-1'></i>
          Send Mail
        </button>
        <button type='reset' className='button btn btn-danger' onClick={() => window.history.back(-1)}>
          <i className='icon-close p-1'></i>
          Cancel
        </button>
      </div>
    </form>
  );
};

export default MailVisaRequirements;
