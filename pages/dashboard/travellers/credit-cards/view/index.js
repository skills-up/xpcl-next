import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { BsEye, BsShieldLock } from 'react-icons/bs';
import { DateObject } from 'react-multi-date-picker';
import { useSelector } from 'react-redux';
import { deleteItem, getItem, createItem } from '../../../../../api/xplorzApi';
import Seo from '../../../../../components/common/Seo';
import DashboardLayout from '../../../../../components/layouts/DashboardLayout';
import ConfirmationModal from '../../../../../components/confirm-modal';
import ViewTable from '../../../../../components/view-table';
import { sendToast } from '../../../../../utils/toastify';

const ViewCreditCards = () => {
  const [creditCard, setCreditCard] = useState([]);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [idToDelete, setIdToDelete] = useState(-1);
  const [isMasked, setIsMasked] = useState(true);
  const [originalCCNumber, setOriginalCCNumber] = useState('');
  const [originalCVV, setOriginalCVV] = useState('');
  const [isTokenizing, setIsTokenizing] = useState(false);
  // const [paymentId, setPaymentID] = useState('');
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
    if (originalCC?.success) {
      setOriginalCCNumber(parseInt(atob(originalCC.data?.number)));
      if (originalCC.data?.cvv) setOriginalCVV(atob(originalCC.data?.cvv));
    }
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
        // if (data.cvv !== undefined) {
          data.cvv = (
            <span className='d-flex items-center gap-2'>
              {isMasked ? '***' : originalCVV}{' '}
              {permissions.includes('credit-cards.show-number') && (
                <BsEye
                  className='text-danger cursor-pointer'
                  style={{ fontSize: '1.2rem' }}
                  onClick={() => setIsMasked((prev) => !prev)}
                />
              )}
            </span>
          );
        // }
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

  const handleTokenize = async () => {
    setIsTokenizing(true);
    const response = await createItem('credit-cards/' + router.query.view + '/tokenize', {});
    if (response?.success && response.data?.success) {
      const { next, payment_id } = response.data.data;
      // setPaymentID(payment_id);
      sendToast('success', 'Card Tokenization Initiated. Enter the OTP on Bank Payment Page', 4000);
      const auth_url = next.filter(url => url.action === 'redirect')?.[0];
      const otpWindow = window.open(auth_url.url, '_blank', 'popup,width=320,height=480');
      const timer = setInterval(() => {
        if (otpWindow.closed) {
          clearInterval(timer);
          window.location.reload();
        }
      }, 500);
    } else {
      sendToast(
        'error',
        response.data?.message ||
        response.data?.error ||
        'Unexpected Error Occurred While Trying to Tokenize this Credit Card',
        4000
      );
    }
    setIsTokenizing(false);
  };

  /* const handlePaymentCompletion = async () => {
    const response = await createItem('credit-cards/' + router.query.view + '/complete-tokenization', {payment_id: paymentId});
    if (response?.success && response.data?.success) {
      sendToast('success', 'Card has been tokenized succesfully', 4000);
    } else {
      sendToast(
        'error',
        response.data?.message ||
        response.data?.error ||
        'Failed to Tokenize this Credit Card',
        4000
      );
    }
  } */

  return (
    <>
      <Seo pageTitle='View Credit Card' />
      {/* End Page Title */}

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
          extraButtons={[
            {
              text: isTokenizing ? 'Processing...' : 'Tokenize',
              icon: <BsShieldLock />,
              onClick: handleTokenize,
              classNames: 'btn-info text-white',
            },
            // paymentId ? {
            //   text: 'Mark Payment Completed',
            //   onClick: handlePaymentCompletion,
            //   classNames: 'btn-info text-white',
            // } : {},
          ]}
        />
      </div>
    </>
  );
};

ViewCreditCards.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default ViewCreditCards;
