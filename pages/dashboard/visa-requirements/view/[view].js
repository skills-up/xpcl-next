import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { AiOutlineMail } from 'react-icons/ai';
import { useSelector } from 'react-redux';
import { deleteItem, getItem } from '../../../../api/xplorzApi';
import Seo from '../../../../components/common/Seo';
import DashboardLayout from '../../../../components/layouts/DashboardLayout';
import ConfirmationModal from '../../../../components/confirm-modal';
import ViewTable from '../../../../components/view-table';
import { filterAllowed } from '../../../../utils/permission-checker';
import { sendToast } from '../../../../utils/toastify';

const ViewVisaRequirements = () => {
  const [visaRequirements, setVisaRequirements] = useState([]);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [idToDelete, setIdToDelete] = useState(-1);

  const token = useSelector((state) => state.auth.value.token);
  const router = useRouter();
  useEffect(() => {
    // Getting particular visa requirements
    getVisaRequirements();
  }, [router.isReady]);

  const getVisaRequirements = async () => {
    if (router.query.view) {
      const response = await getItem('visa-requirements', router.query.view);
      if (response?.success) {
        let data = response.data;
        // Converting time columns
        delete data['id'];
        delete data['personal_docs_reqs'];
        delete data['supporting_docs_reqs'];
        delete data['financial_docs_reqs'];
        if (data.visa_forms && data.visa_forms.length) {
          data.visa_forms = (
            <>
              {data.visa_forms.map((element) => (
                <a className='mr-10' href={element} target='_blank'>
                  Download
                </a>
              ))}
            </>
          );
        }
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
        delete data['created_at'];
        delete data['updated_at'];
        if (data?.country_name && data?.country_id) {
          data.country_name = (
            <a href={'/dashboard/countries/view/' + data.country_id}>
              {data.country_name}
            </a>
          );
        }
        delete data['country_id'];
        data.docs_requirements = (
          <>
            {Object.keys(data.docs_requirements).map((element, index) => (
              <>
                <span style={{ fontWeight: '700' }} className='d-block'>
                  {element.charAt(0).toUpperCase() + element.slice(1)}
                </span>
                <ul className='ml-20'>
                  {data.docs_requirements[element].map((el, ind) => (
                    <li style={{ listStyleType: 'disc' }}>{el}</li>
                  ))}
                </ul>
              </>
            ))}
          </>
        );
        setVisaRequirements(data);
      } else {
        sendToast(
          'error',
          response.data?.message ||
            response.data?.error ||
            'Could Not Fetch The Requested Visa Requirement.'
        );
        router.push('/dashboard/visa-requirements');
      }
    }
  };

  const onCancel = async () => {
    setConfirmDelete(false);
    setIdToDelete(-1);
  };
  const onSubmit = async () => {
    const response = await deleteItem('visa-requirements', idToDelete);
    if (response?.success) {
      sendToast('success', 'Deleted successfully', 4000);
      router.push('/dashboard/visa-requirements');
    } else {
      sendToast(
        'error',
        response.data?.message ||
          response.data?.error ||
          'Unexpected Error Occurred While Trying to Delete this Visa Requirement',
        4000
      );
    }
    onCancel();
  };

  return (
    <>
      <Seo pageTitle='Visa Requirement' />
      {/* End Page Title */}

      <div className='row y-gap-20 justify-between items-end pb-60 lg:pb-40 md:pb-32'>
                <div className='col-12'>
                  <h1 className='text-30 lh-14 fw-600'>Visa Requirement</h1>
                  <div className='text-15 text-light-1'>
                    Get extended details of a visa requirement.
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
                    title='Do you really want to delete this visa requirement?'
                    content='This will permanently delete the visa requirement. Press OK to confirm.'
                  />
                )}
                <ViewTable
                  data={visaRequirements}
                  onEdit={() =>
                    router.push('/dashboard/visa-requirements/edit/' + router.query.view)
                  }
                  onDelete={() => {
                    setIdToDelete(router.query.view);
                    setConfirmDelete(true);
                  }}
                  entitySlug={'visa-requirements'}
                  extraButtons={filterAllowed([
                    {
                      onClick: (e) =>
                        router.push(
                          '/dashboard/visa-requirements/mail/' + router.query.view
                        ),
                      text: 'Send as Email',
                      icon: <AiOutlineMail />,
                      classNames: 'btn btn-secondary d-flex items-center gap-1',
                      permissions: ['visa-requirements.email'],
                    },
                  ])}
                />
              </div>
              </>
  );
};

ViewVisaRequirements.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default ViewVisaRequirements;
