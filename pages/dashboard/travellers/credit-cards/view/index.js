import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { BsEye } from 'react-icons/bs';
import { DateObject } from 'react-multi-date-picker';
import { useSelector } from 'react-redux';
import { deleteItem, getItem } from '../../../../../api/xplorzApi';
import Seo from '../../../../../components/common/Seo';
import ConfirmationModal from '../../../../../components/confirm-modal';
import Footer from '../../../../../components/footer/dashboard-footer';
import Header from '../../../../../components/header/dashboard-header';
import Sidebar from '../../../../../components/sidebars/dashboard-sidebars';
import ViewTable from '../../../../../components/view-table';
import { sendToast } from '../../../../../utils/toastify';

const ViewCreditCards = () => {
  const [creditCard, setCreditCard] = useState([]);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [idToDelete, setIdToDelete] = useState(-1);
  const [isMasked, setIsMasked] = useState(true);
  const [originalCCNumber, setOriginalCCNumber] = useState('');
  const permissions = useSelector((state) => state.auth.value.permissions);
  const token = useSelector((state) => state.auth.value.token);
  const router = useRouter();

  useEffect(() => {
    // Getting particular organization
    getCreditCard();
    getOriginalCCNumber();
  }, [router.isReady]);

  useEffect(() => {
    getCreditCard();
  }, [isMasked]);

  const getOriginalCCNumber = async () => {
    const originalCC = await getItem('credit-cards', router.query.view + '/show-number');
    if (originalCC?.success) setOriginalCCNumber(parseInt(atob(originalCC.data?.number)));
  };

  const getCreditCard = async () => {
    if (router.query.view) {
      const response = await getItem('credit-cards', router.query.view);
      if (response?.success) {
        let data = response.data;
        // Converting time columns
        delete data['id'];
        if (data.masked_number) {
          data.masked_number = (
            <span className='d-flex items-center gap-2'>
              {isMasked ? data.masked_number : originalCCNumber}{' '}
              {permissions.includes('credit-cards.show-number') && (
                <BsEye
                  className='text-danger cursor-pointer'
                  style={{ fontSize: '1.2rem' }}
                  onClick={() => setIsMasked((prev) => !prev)}
                />
              )}
            </span>
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
        if (data?.traveller_name && data?.traveller_id) {
          data.traveller_name = (
            <a href={'/dashboard/travellers/view/' + data.traveller_id}>
              {data.traveller_name}
            </a>
          );
        }
        delete data['traveller_id'];
        if (data.expiry_date) {
          data.expiry_date = new DateObject({
            date: data.expiry_date,
            format: 'YYYY-MM-DD',
          }).format('MMMM YYYY');
        }
        setCreditCard(data);
      } else {
        sendToast(
          'error',
          response.data?.message ||
            response.data?.error ||
            'Could Not Fetch The Requested Credit Card.'
        );
        router.push('/dashboard/travellers/view/' + router.query.traveller_id);
      }
    }
  };

  const onCancel = async () => {
    setConfirmDelete(false);
    setIdToDelete(-1);
  };
  const onSubmit = async () => {
    const response = await deleteItem('credit-cards', idToDelete);
    if (response?.success) {
      sendToast('success', 'Deleted successfully', 4000);
      router.push('/dashboard/travellers/view/' + router.query.traveller_id);
    } else {
      sendToast(
        'error',
        response.data?.message ||
          response.data?.error ||
          'Unexpected Error Occurred While Trying to Delete this Credit Card',
        4000
      );
    }
    onCancel();
  };

  return (
    <>
      <Seo pageTitle='View Credit Card' />
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
                  <h1 className='text-30 lh-14 fw-600'>View Credit Card</h1>
                  <div className='text-15 text-light-1'>
                    Get extended details of a credit card.
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
                    title='Do you really want to delete this credit card?'
                    content='This will permanently delete the credit card. Press OK to confirm.'
                  />
                )}
                <ViewTable
                  data={creditCard}
                  onEdit={() =>
                    router.push({
                      pathname: '/dashboard/travellers/credit-cards/edit',
                      query: {
                        traveller_id: router.query.traveller_id,
                        edit: router.query.view,
                      },
                    })
                  }
                  onDelete={() => {
                    setIdToDelete(router.query.view);
                    setConfirmDelete(true);
                  }}
                  entitySlug={'credit-cards'}
                />
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

export default ViewCreditCards;
