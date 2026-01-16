import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { deleteItem, getItem } from '../../../../api/xplorzApi';
import Seo from '../../../../components/common/Seo';
import ConfirmationModal from '../../../../components/confirm-modal';
import Footer from '../../../../components/footer/dashboard-footer';
import Header from '../../../../components/header/dashboard-header';
import Sidebar from '../../../../components/sidebars/dashboard-sidebars';
import ViewTable from '../../../../components/view-table';
import { sendToast } from '../../../../utils/toastify';
import AirlineMarkups from './AirlineMarkups';

const ViewWhatsAppGroup = () => {
  const [whatsAppGroup, setWhatsAppGroup] = useState({});
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [idToDelete, setIdToDelete] = useState(-1);

  const token = useSelector((state) => state.auth.value.token);
  const router = useRouter();

  useEffect(() => {
    if (router.isReady) {
      getWhatsAppGroup();
    }
  }, [router.isReady]);

  const getWhatsAppGroup = async () => {
    if (router.query.view) {
      const response = await getItem('whats-app-groups', router.query.view);
      if (response?.success) {
        let data = response.data;
        delete data['id'];
        // Format phone numbers
        if (data.phone_numbers) {
          const numbers = Array.isArray(data.phone_numbers)
            ? data.phone_numbers
            : [];
          data.phone_numbers = numbers.join(', ');
        }
        // Format invite link
        if (data.invite_link) {
          data.invite_link = (
            <a href={data.invite_link} target='_blank' rel='noreferrer'>
              {data.invite_link}
            </a>
          );
        }
        // Format boolean fields
        data.is_personal = data.is_personal ? 'Yes' : 'No';
        // Format timestamps
        if (data.created_at) {
          data.created_at = new Date(data.created_at).toLocaleString('en-IN', {
            dateStyle: 'medium',
            timeStyle: 'short',
          });
        }
        if (data.updated_at) {
          data.updated_at = new Date(data.updated_at).toLocaleString('en-IN', {
            dateStyle: 'medium',
            timeStyle: 'short',
          });
        }
        setWhatsAppGroup(data);
      } else {
        sendToast(
          'error',
          response.data?.message ||
          response.data?.error ||
          'Could Not Fetch The Requested WhatsApp Group.'
        );
        router.push('/dashboard/whats-app-groups');
      }
    }
  };

  const onCancel = () => {
    setConfirmDelete(false);
    setIdToDelete(-1);
  };

  const onSubmit = async () => {
    const response = await deleteItem('whats-app-groups', idToDelete);
    if (response?.success) {
      sendToast('success', 'Deleted successfully', 4000);
      router.push('/dashboard/whats-app-groups');
    } else {
      sendToast(
        'error',
        response.data?.message ||
        response.data?.error ||
        'Unexpected Error Occurred While Trying to Delete this WhatsApp Group',
        4000
      );
    }
    onCancel();
  };

  return (
    <>
      <Seo pageTitle='View WhatsApp Group' />

      <div className='header-margin'></div>

      <Header />

      <div className='dashboard'>
        <div className='dashboard__sidebar bg-white scroll-bar-1'>
          <Sidebar />
        </div>

        <div className='dashboard__main'>
          <div className='dashboard__content d-flex flex-column justify-between bg-light-2'>
            <div>
              <div className='row y-gap-20 justify-between items-end pb-60 lg:pb-40 md:pb-32'>
                <div className='col-12'>
                  <h1 className='text-30 lh-14 fw-600'>View WhatsApp Group</h1>
                  <div className='text-15 text-light-1'>
                    Get extended details of a WhatsApp group.
                  </div>
                </div>
              </div>

              <div className='py-30 px-30 rounded-4 bg-white shadow-3'>
                {confirmDelete && (
                  <ConfirmationModal
                    onCancel={onCancel}
                    onSubmit={onSubmit}
                    title='Do you really want to delete this WhatsApp Group?'
                    content='This will permanently delete the WhatsApp group. Press OK to confirm.'
                  />
                )}
                <ViewTable
                  data={whatsAppGroup}
                  onEdit={() =>
                    router.push('/dashboard/whats-app-groups/edit/' + router.query.view)
                  }
                  onDelete={() => {
                    setIdToDelete(router.query.view);
                    setConfirmDelete(true);
                  }}
                  entitySlug={'whats-app-groups'}
                />
                <hr className='my-4' />
                <div>
                  <h2 className='mb-3'>Airline Markups</h2>
                  <AirlineMarkups />
                </div>
              </div>
            </div>

            <Footer />
          </div>
        </div>
      </div>
    </>
  );
};

export default ViewWhatsAppGroup;
