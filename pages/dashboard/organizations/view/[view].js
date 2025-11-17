import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import Select from 'react-select';
import { deleteItem, getItem, getList, createItem } from '../../../../api/xplorzApi';
import Seo from '../../../../components/common/Seo';
import ConfirmationModal from '../../../../components/confirm-modal';
import Footer from '../../../../components/footer/dashboard-footer';
import Header from '../../../../components/header/dashboard-header';
import Sidebar from '../../../../components/sidebars/dashboard-sidebars';
import ViewTable from '../../../../components/view-table';
import { sendToast } from '../../../../utils/toastify';
import { IoClose } from 'react-icons/io5';

const ModalHeader = ({ onClick, title }) => (
  <div className='d-flex justify-between items-center'>
    <h3 className='text-xl font-semibold'>{title}</h3>
    <button className='modal-close btn btn-transparent' onClick={onClick}>
      <IoClose classes='text-secondary stroke-current inline-block h-5 w-5' />
    </button>
  </div>
);

const ModalFooter = ({ onClick, onSubmit, cancelButtonText, successButtonText }) => (
  <div className='d-flex justify-end gap-2'>
    <button className='btn btn-secondary' type='button' onClick={onClick}>
      {cancelButtonText}
    </button>
    <button className='btn btn-danger' type='button' onClick={onSubmit}>
      {successButtonText}
    </button>
  </div>
);

const ViewOrganization = () => {
  const [organization, setOrganization] = useState([]);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [idToDelete, setIdToDelete] = useState(-1);
  const [showWhatsAppModal, setShowWhatsAppModal] = useState(false);
  const [whatsAppGroupOptions, setWhatsAppGroupOptions] = useState([]);
  const [whatsAppGroupId, setWhatsAppGroupId] = useState(null);

  const token = useSelector((state) => state.auth.value.token);
  const router = useRouter();
  useEffect(() => {
    // Getting particular organization
    getOrganization();
  }, [router.isReady]);

  const getOrganization = async () => {
    if (router.query.view) {
      const response = await getItem('organizations', router.query.view);
      if (response?.success) {
        let data = response.data;
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
        delete data['created_at'];
        delete data['updated_at'];
        if (data?.account_id) {
          data.account_name = (
            <a href={'/dashboard/accounts/view/' + data.account_id}>{data.name}</a>
          );
        }
        delete data['account_id'];
        if (data?.calendar_template_name && data?.calendar_template_id) {
          data.calendar_template_name = (
            <a href={'/dashboard/calendar_templates/view/' + data.calendar_template_id}>
              {data.calendar_template_name}
            </a>
          );
        }
        delete data['calendar_template_id'];
        if (data?.type === 'Client' && !data?.whats_app_group_id) {
          data.whats_app_group_id = (
            <button className='btn btn-link' onClick={showWhatsAppForm}>Link</button>
          )
        }
        setOrganization(data);
      } else {
        sendToast(
          'error',
          response.data?.message ||
            response.data?.error ||
            'Could Not Fetch The Requested Organization.'
        );
        router.push('/dashboard/organizations');
      }
    }
  };

  const getWhatsAppGroups = async () => {
    const response = await getList('whats-app-groups', {group_for: 'organization'});
    if (response?.success) {
      setWhatsAppGroupOptions(
        response.data.filter(x => x.group_for === 'organization').map((wag) => ({
          value: wag.id,
          label: wag.name
        }))
      )
    } else {
        sendToast(
          'error',
          response.data?.message ||
            response.data?.error ||
            'Could Not Fetch WhatsApp Groups List.'
        );
    }
  }

  const showWhatsAppForm = async () => {
    if (!whatsAppGroupOptions.length) {
      await getWhatsAppGroups();
    }
    setShowWhatsAppModal(true);
  };

  const onCancel = async () => {
    setConfirmDelete(false);
    setIdToDelete(-1);
  };
  const onSubmit = async () => {
    const response = await deleteItem('organizations', idToDelete);
    if (response?.success) {
      sendToast('success', 'Deleted successfully', 4000);
      sessionStorage.removeItem('client-organizations-checked');
      router.push('/dashboard/organizations');
    } else {
      sendToast(
        'error',
        response.data?.message ||
          response.data?.error ||
          'Unexpected Error Occurred While Trying to Delete this Organization',
        4000
      );
    }
    onCancel();
  };

  const onCancelWA = async () => {
    setShowWhatsAppModal(false);
  }
  const onSubmitWA = async () => {
    if (! whatsAppGroupId) return;
    const response = await createItem(`organizations/${router.query.view}/link-whats-app-group`, {
      whats_app_group_id: whatsAppGroupId.value
    });
    if (response?.success) {
      sendToast('success', 'WhatsApp Group Linked Successfully', 4000);
    } else {
      sendToast(
        'error',
        response.data?.message ||
          response.data?.error ||
          'Unexpected Error Occurred',
        4000
      )
    }
  }

  return (
    <>
      <Seo pageTitle='View Organization' />
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
                  <h1 className='text-30 lh-14 fw-600'>View Organization</h1>
                  <div className='text-15 text-light-1'>
                    Get extended details of a organization.
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
                    title='Do you really want to delete this organization?'
                    content='This will permanently delete the organization. Press OK to confirm.'
                  />
                )}
                <ViewTable
                  data={organization}
                  onEdit={() =>
                    router.push('/dashboard/organizations/edit/' + router.query.view)
                  }
                  onDelete={() => {
                    setIdToDelete(router.query.view);
                    setConfirmDelete(true);
                  }}
                  entitySlug={'organizations'}
                />
                {showWhatsAppModal && (
                  <div className='whats-app-modal-container pt-2'>
                    <div className='backdrop fade-in fixed inset-0 z-40 bg-black'></div>
                    <div className='modal-content'>
                      <ModalHeader title='Link WhatsApp Group' onClick={() => onCancelWA()} />
                      <div className='form-input-select col-12 col-lg-6 py-2'>
                        <label>
                          Select WhatsApp Group<span className='text-danger'>*</span>
                        </label>
                        <Select
                          options={whatsAppGroupOptions}
                          value={whatsAppGroupId}
                          placeholder='Select WhatsApp Group to Link'
                          onChange={(value) => setWhatsAppGroupId(value)}
                        />
                      </div>
                      <ModalFooter
                        onClick={() => onCancelWA()}
                        onSubmit={() => onSubmitWA()}
                        cancelButtonText='Cancel'
                        successButtonText='Link'
                      />
                    </div>
                  </div>
                )}
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

export default ViewOrganization;
