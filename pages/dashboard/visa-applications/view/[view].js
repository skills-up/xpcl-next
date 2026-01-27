import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { BsTrash3 } from 'react-icons/bs';
import { useSelector } from 'react-redux';
import Select from 'react-select';
import { createItem, deleteItem, getItem } from '../../../../api/xplorzApi';
import Seo from '../../../../components/common/Seo';
import DashboardLayout from '../../../../components/layouts/DashboardLayout';
import ConfirmationModal from '../../../../components/confirm-modal';
import NewFileUploads from '../../../../components/new-file-uploads';
import ViewTable from '../../../../components/view-table';
import { sendToast } from '../../../../utils/toastify';

const ViewVisaApplications = () => {
  const [visaApplications, setVisaApplications] = useState([]);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [confirmDeleteNote, setConfirmDeleteNote] = useState(false);
  const [idToDelete, setIdToDelete] = useState(-1);
  const [status, setStatus] = useState(null);
  const [noteImage, setNoteImage] = useState([]);
  const [note, setNote] = useState('');

  const token = useSelector((state) => state.auth.value.token);
  const router = useRouter();
  useEffect(() => {
    // Getting particular visa applications
    getVisaApplications();
  }, [router.isReady]);
  const client_id = useSelector((state) => state.auth.value.currentOrganization);

  const getVisaApplications = async () => {
    if (router.query.view) {
      const response = await getItem('visa-applications', router.query.view);
      if (response?.success) {
        let data = response.data;
        setStatus({ label: response.data.status, value: response.data.status });
        // Converting time columns
        delete data['id'];
        if (data.created_by) {
          data.created_by = (
            <a
              className='text-15 cursor-pointer'
              href={'/dashboard/users/view/' + data.created_by}
            >
              <strong>User #{data.created_by} </strong>[
              {new Date(data.created_at).toLocaleString('en-IN', {
                dateStyle: 'medium',
                timeStyle: 'short',
              })}
              ]
            </a>
          );
        }
        if (data.updated_by) {
          data.updated_by = (
            <a
              className='text-15 cursor-pointer'
              href={'/dashboard/users/view/' + data.updated_by}
            >
              <strong>User #{data.updated_by} </strong>[
              {new Date(data.updated_at).toLocaleString('en-IN', {
                dateStyle: 'medium',
                timeStyle: 'short',
              })}
              ]
            </a>
          );
        }
        if (data['personal_docs_scans']) {
          try {
            data['personal_docs_scans'] = JSON.parse(data['personal_docs_scans']);
          } catch (err) {
            if (
              !(
                typeof data['personal_docs_scans'] === 'object' &&
                !Array.isArray(data['personal_docs_scans'])
              )
            )
              data['personal_docs_scans'] = null;
          }
          if (data['personal_docs_scans'])
            for (let [key, value] of Object.entries(data['personal_docs_scans'])) {
              data['personal_docs_scans'][key] = (
                <a href={value} target='_blank'>
                  Download
                </a>
              );
            }
        }
        if (data['financial_docs_scans']) {
          try {
            data['financial_docs_scans'] = JSON.parse(data['financial_docs_scans']);
          } catch (err) {
            if (
              !(
                typeof data['financial_docs_scans'] === 'object' &&
                !Array.isArray(data['financial_docs_scans'])
              )
            )
              data['financial_docs_scans'] = null;
          }
          if (data['financial_docs_scans'])
            for (let [key, value] of Object.entries(data['financial_docs_scans'])) {
              data['financial_docs_scans'][key] = (
                <a href={value} target='_blank'>
                  Download
                </a>
              );
            }
        }
        if (data['supporting_docs_scans']) {
          try {
            data['supporting_docs_scans'] = JSON.parse(data['supporting_docs_scans']);
          } catch (err) {
            if (
              !(
                typeof data['supporting_docs_scans'] === 'object' &&
                !Array.isArray(data['supporting_docs_scans'])
              )
            )
              data['supporting_docs_scans'] = null;
          }
          if (data['supporting_docs_scans'])
            for (let [key, value] of Object.entries(data['supporting_docs_scans'])) {
              data['supporting_docs_scans'][key] = (
                <a href={value} target='_blank'>
                  Download
                </a>
              );
            }
        }
        if (data['visa_requirement']['visa_forms']) {
          data['visa_requirement']['visa_forms'] = {
            visa_forms: (
              <>
                {data['visa_requirement']['visa_forms'].map((element) => (
                  <a className='mr-10' href={element} target='_blank'>
                    Download
                  </a>
                ))}
              </>
            ),
          };
        }
        delete data['created_at'];
        delete data['updated_at'];
        setVisaApplications(data);
      } else {
        sendToast(
          'error',
          response.data?.message ||
          response.data?.error ||
          'Could Not Fetch The Requested Visa Application.'
        );
        router.push('/dashboard/visa-applications');
      }
    }
  };

  const onCancel = async () => {
    setConfirmDelete(false);
    setIdToDelete(-1);
  };
  const onNoteCancel = async () => {
    setConfirmDeleteNote(false);
    setIdToDelete(-1);
  };
  const onSubmit = async () => {
    const response = await deleteItem('visa-applications', idToDelete);
    if (response?.success) {
      sendToast('success', 'Deleted successfully', 4000);
      router.push('/dashboard/visa-applications');
    } else {
      sendToast(
        'error',
        response.data?.message ||
        response.data?.error ||
        'Unexpected Error Occurred While Trying to Delete this Visa Application',
        4000
      );
    }
    onCancel();
  };
  const onNoteSubmit = async () => {
    const response = await deleteItem('visa-application-notes', idToDelete);
    if (response?.success) {
      sendToast('success', 'Deleted successfully', 4000);
      router.reload();
    } else {
      sendToast(
        'error',
        response.data?.message ||
        response.data?.error ||
        'Unexpected Error Occurred While Trying to Delete this Note',
        4000
      );
    }
    onNoteCancel();
  };

  const submitNote = async () => {
    if (note.trim().length < 1) {
      sendToast('error', 'You need to add a note body', 4000);
      return;
    }
    let visaFormData = new FormData();
    if (noteImage) {
      for (let image of noteImage) visaFormData.append(`attachment_files[]`, image);
    }
    visaFormData.append('body', note);
    visaFormData.append('visa_application_id', router.query.view);
    const response = await createItem('visa-application-notes', visaFormData);
    if (response?.success) {
      sendToast('success', 'Added note successfully', 4000);
      getVisaApplications();
    } else {
      sendToast('error', 'Error adding note', 4000);
    }
  };

  return (
    <>
      <Seo pageTitle='Visa Application' />
      {/* End Page Title */}

      <div className='row y-gap-20 justify-between items-end pb-60 lg:pb-40 md:pb-32'>
        <div className='col-12'>
          <h1 className='text-30 lh-14 fw-600'>Visa Application</h1>
          <div className='text-15 text-light-1'>
            Get extended details of a visa application.
          </div>
        </div>
        {/* End .col-12 */}
      </div>
      {/* End .row */}

      <div className='py-30 px-30 rounded-4 bg-white shadow-3'>
        {confirmDelete && (
          <ConfirmationModal
            onCancel={onCancel}
            onSubmit={onSubmit}
            title='Do you really want to delete this visa application?'
            content='This will permanently delete the visa application. Press OK to confirm.'
          />
        )}
        <h4>Visa Application</h4>
        <ViewTable
          showButtons={false}
          data={{
            country: visaApplications?.visa_requirement?.country_name,
            purpose: visaApplications?.visa_requirement?.business_travel
              ? 'Business Travel'
              : 'Tourism',
            traveller: visaApplications?.traveller?.passport_name,
            status: visaApplications?.status,
          }}
          onEdit={() =>
            router.push('/dashboard/visa-applications/edit/' + router.query.view)
          }
          onDelete={() => {
            setIdToDelete(router.query.view);
            setConfirmDelete(true);
          }}
          entitySlug={'visa-applications'}
        />
        <h4 className='mt-10'>Traveller's Passport Details</h4>
        <ViewTable
          showButtons={false}
          data={{
            name: visaApplications?.traveller?.passport_name,
            date_of_birth: new Date(
              visaApplications?.traveller?.passport_dob
            ).toLocaleString('en-IN', {
              dateStyle: 'medium',
            }),
            number: visaApplications?.traveller?.passport_number,
            issue_date: new Date(
              visaApplications?.traveller?.passport_issue_date
            ).toLocaleString('en-IN', {
              dateStyle: 'medium',
            }),
            expiry_date: new Date(
              visaApplications?.traveller?.passport_expiry_date
            ).toLocaleString('en-IN', {
              dateStyle: 'medium',
            }),
            issue_place: visaApplications?.traveller?.passport_issue_place,
          }}
          onEdit={() =>
            router.push('/dashboard/visa-applications/edit/' + router.query.view)
          }
          onDelete={() => {
            setIdToDelete(router.query.view);
            setConfirmDelete(true);
          }}
          entitySlug={'visa-applications'}
        />
        {visaApplications?.personal_docs_scans && (
          <>
            <h4 className='mt-10'>Personal Documents</h4>
            <ViewTable
              showButtons={false}
              data={visaApplications?.personal_docs_scans}
              onEdit={() =>
                router.push(
                  '/dashboard/visa-applications/edit/' + router.query.view
                )
              }
              onDelete={() => {
                setIdToDelete(router.query.view);
                setConfirmDelete(true);
              }}
              entitySlug={'visa-applications'}
            />
          </>
        )}
        {visaApplications?.financial_docs_scans && (
          <>
            <h4 className='mt-10'>Financial Documents</h4>
            <ViewTable
              showButtons={false}
              data={visaApplications?.financial_docs_scans}
              onEdit={() =>
                router.push(
                  '/dashboard/visa-applications/edit/' + router.query.view
                )
              }
              onDelete={() => {
                setIdToDelete(router.query.view);
                setConfirmDelete(true);
              }}
              entitySlug={'visa-applications'}
            />
          </>
        )}
        {visaApplications?.supporting_docs_scans && (
          <>
            <h4 className='mt-10'>Supporting Documents</h4>
            <ViewTable
              data={visaApplications?.supporting_docs_scans}
              onEdit={() =>
                router.push(
                  '/dashboard/visa-applications/edit/' + router.query.view
                )
              }
              onDelete={() => {
                setIdToDelete(router.query.view);
                setConfirmDelete(true);
              }}
              entitySlug={'visa-applications'}
            />
          </>
        )}
        {visaApplications?.visa_requirement?.visa_forms && (
          <>
            <h4 className='mt-10'>Visa Forms</h4>
            <ViewTable
              data={visaApplications?.visa_requirement?.visa_forms}
              onEdit={() =>
                router.push(
                  '/dashboard/visa-applications/edit/' + router.query.view
                )
              }
              onDelete={() => {
                setIdToDelete(router.query.view);
                setConfirmDelete(true);
              }}
              entitySlug={'visa-applications'}
            />
          </>
        )}
        <h4 className='mt-10'>Notes</h4>
        <>
          {confirmDeleteNote && (
            <ConfirmationModal
              onCancel={onNoteCancel}
              onSubmit={onNoteSubmit}
              title='Do you really want to delete this note?'
              content='This will permanently delete the visa application note. Press OK to confirm.'
            />
          )}
          {visaApplications?.notes?.map((note) => (
            <div className='mt-20'>
              <div className='d-flex justify-between'>
                <a
                  className='text-12 cursor-pointer'
                  href={'/dashboard/users/view/' + note.created_by}
                >
                  <strong>User #{note.created_by} </strong> @
                  {new Date(note.created_at).toLocaleString('en-IN', {
                    dateStyle: 'medium',
                    timeStyle: 'short',
                  })}
                </a>
                <a
                  className='gap-1 col-auto'
                  onClick={() => {
                    setIdToDelete(note.id);
                    setConfirmDeleteNote(true);
                  }}
                >
                  <BsTrash3 />
                </a>
              </div>
              <div className='d-flex flex-column bg-light-2 border-light rounded_4 p-2'>
                <div className='col-12'>{note.body}</div>
                {note.attachments?.length ? (
                  <div className='text-12 mt-10'>
                    <b>Attachments:</b>
                    {note.attachments?.map((url) => (
                      <a
                        className='btn-link ml-10'
                        href={url}
                        target='_blank'
                        download
                      >
                        Download
                      </a>
                    ))}
                  </div>
                ) : (
                  ''
                )}
              </div>
            </div>
          ))}
        </>
        <h6 className='mt-20'>Add New</h6>
        <div className='form-input my-2'>
          <textarea
            rows={4}
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
          <label className='lh-1 text-16 text-light-1'>Note Content</label>
        </div>
        <div className='col-12 mb-10'>
          {/* <label className='lh-1 text-16 text-light-1'>{key}</label>
                  {previousSupportingDocReqs && (
                    <PreviousUploadPictures
                      data={[previousSupportingDocReqs[key]]}
                      onDeleteClick={() => {
                        setPreviousSupportingDocReqs((prev) => {
                          delete prev[key];
                          return { ...prev };
                        });
                      }}
                    />
                  )} */}
          <NewFileUploads multiple={true} setUploads={setNoteImage} />
        </div>
        <button
          onClick={submitNote}
          className='button h-40 px-24 -dark-1 bg-blue-1 text-white'
        >
          Add Note
        </button>
        {/* Add Note */}
        {client_id === 1 && (
          <>
            <h4 className='mt-10'>Update Status</h4>
            <div className='form-input-select mt-10'>
              <label>Status</label>
              <Select
                defaultValue={status}
                options={[
                  'Pending',
                  'Query',
                  'Replied',
                  'Processing',
                  'Processed',
                ].map((el) => ({ label: el, value: el }))}
                value={status}
                onChange={(id) => setStatus(id)}
              />
            </div>
            <button
              onClick={async () => {
                if (status?.value) {
                  const response = await createItem(
                    'visa-applications/' + router.query.view + '/status',
                    { status: status.value }
                  );
                  if (response?.success)
                    sendToast('success', 'Status updated successfully', 4000);
                }
              }}
              className='button h-40 mt-10 px-24 -dark-1 bg-blue-1 text-white'
            >
              Update Status
            </button>
          </>
        )}
      </div>
    </>
  );
};

ViewVisaApplications.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default ViewVisaApplications;
