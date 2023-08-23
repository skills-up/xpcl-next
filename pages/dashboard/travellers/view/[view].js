import Seo from '../../../../components/common/Seo';
import Footer from '../../../../components/footer/dashboard-footer';
import Header from '../../../../components/header/dashboard-header';
import Sidebar from '../../../../components/sidebars/dashboard-sidebars';
import ConfirmationModal from '../../../../components/confirm-modal';
import { useSelector } from 'react-redux';
import { useRouter } from 'next/router';
import { sendToast } from '../../../../utils/toastify';
import { useEffect, useState } from 'react';
import { deleteItem, getItem } from '../../../../api/xplorzApi';
import ViewTable from '../../../../components/view-table';
import TravelMemberships from './TravelMembership';
import CreditCards from './CreditCard';
import TravelInsurances from './TravelInsurance';
import TravelVisas from './TravelVisas';
import ClientTravellers from './ClientTravellers';

const ViewTravellers = () => {
  const [travellers, setTravellers] = useState([]);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [idToDelete, setIdToDelete] = useState(-1);

  const token = useSelector((state) => state.auth.value.token);
  const router = useRouter();
  useEffect(() => {
    // Getting particular travellers
    getTravellers();
  }, [router.isReady]);

  const getTravellers = async () => {
    if (router.query.view) {
      const response = await getItem('travellers', router.query.view);
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
        if (data?.passport_scans) {
          data.passport_scans = (
            <ul className='list-disc'>
              {Object.values(data?.passport_scans).map((element, index) => (
                <li key={index}>
                  <a href={element} target='_blank'>
                    {element.split('/').at(-1)}
                  </a>
                </li>
              ))}
            </ul>
          );
        }
        if (data?.vaccination_certificate) {
          data.vaccination_certificate = (
            <a href={data.vaccination_certificate} target='_blank'>
              {data.vaccination_certificate.split('/').at(-1)}
            </a>
          );
        }
        if (data?.aadhaar_card_scan) {
          data.aadhaar_card_scan = (
            <a href={data.aadhaar_card_scan} target='_blank'>
              {data.aadhaar_card_scan.split('/').at(-1)}
            </a>
          );
        }
        if (data?.pan_card_scan) {
          data.pan_card_scan = (
            <a href={data.pan_card_scan} target='_blank'>
              {data.pan_card_scan.split('/').at(-1)}
            </a>
          );
        }
        if (data.passport_dob) {
          data.passport_dob = new Date(data.passport_dob).toLocaleString('en-IN', {
            dateStyle: 'medium',
          });
        }
        if (data.prefix) {
          data.prefix =
            data.prefix.charAt(0).toUpperCase() + data.prefix.slice(1).toLowerCase();
        }
        if (data.passport_issue_date) {
          data.passport_issue_date = new Date(data.passport_issue_date).toLocaleString(
            'en-IN',
            {
              dateStyle: 'medium',
            }
          );
        }
        if (data.passport_expiry_date) {
          data.passport_expiry_date = new Date(data.passport_expiry_date).toLocaleString(
            'en-IN',
            {
              dateStyle: 'medium',
            }
          );
        }
        if (data.vaccination_dates) {
          data.vaccination_dates = (
            <ul className='ml-20'>
              {Object.values(data.vaccination_dates).map((date, index) => (
                <li style={{ listStyleType: 'disc' }} key={index}>
                  {new Date(date).toLocaleString('en-IN', { dateStyle: 'medium' })}
                </li>
              ))}
            </ul>
          );
        }
        if (data.aliases) {
          data.aliases = (
            <ul className='ml-20'>
              {Object.values(data.aliases).map((alias, index) => (
                <li style={{ listStyleType: 'disc' }} key={index}>
                  {alias}
                </li>
              ))}
            </ul>
          );
        }
        if (data.domestic_airline_preference) {
          data.domestic_airline_preference = (
            <ul className='ml-20'>
              {data.domestic_airline_preference.map((opt, index) => (
                <li style={{ listStyleType: 'disc' }} key={index}>
                  {opt}
                </li>
              ))}
            </ul>
          );
        }
        if (data.international_airline_preference) {
          data.international_airline_preference = (
            <ul className='ml-20'>
              {data.international_airline_preference.map((opt, index) => (
                <li style={{ listStyleType: 'disc' }} key={index}>
                  {opt}
                </li>
              ))}
            </ul>
          );
        }
        if (data.client_travellers) {
          delete data['client_travellers'];
        }
        // if (data.aadhaar_card_scan) {
        //   data.aadhaar_card_scan = (
        //     <a className='ml20 text-15' href={data.aadhaar_card_scan} target='_blank'>
        //       {data.aadhaar_card_scan.split('/').at(-1)}
        //     </a>
        //   );
        // }
        setTravellers(data);
      } else {
        sendToast(
          'error',
          response.data?.message ||
            response.data?.error ||
            'Could Not Fetch The Requested Traveller.'
        );
        router.push('/dashboard/travellers');
      }
    }
  };

  const onCancel = async () => {
    setConfirmDelete(false);
    setIdToDelete(-1);
  };
  const onSubmit = async () => {
    const response = await deleteItem('travellers', idToDelete);
    if (response?.success) {
      sendToast('success', 'Deleted successfully', 4000);
      router.push('/dashboard/travellers');
    } else {
      sendToast(
        'error',
        response.data?.message ||
          response.data?.error ||
          'Unexpected Error Occurred While Trying to Delete this Traveller',
        4000
      );
    }
    onCancel();
  };

  return (
    <>
      <Seo pageTitle='Traveller' />
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
                  <h1 className='text-30 lh-14 fw-600'>Traveller</h1>
                  <div className='text-15 text-light-1'>
                    Get extended details of a traveller.
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
                    title='Do you really want to delete this traveller?'
                    content='This will permanently delete the traveller. Press OK to confirm.'
                  />
                )}
                <ViewTable
                  data={travellers}
                  onEdit={() =>
                    router.push('/dashboard/travellers/edit/' + router.query.view)
                  }
                  onDelete={() => {
                    setIdToDelete(router.query.view);
                    setConfirmDelete(true);
                  }}
                />
                <hr className='my-4' />
                <div>
                  <h2 className='mb-3'>Linked Clients</h2>
                  <ClientTravellers />
                </div>
                <hr className='my-4' />
                <div>
                  <h2 className='mb-3'>Travel Visas</h2>
                  <TravelVisas />
                </div>
                <hr className='my-4' />
                <div>
                  <h2 className='mb-3'>Travel Insurances</h2>
                  <TravelInsurances />
                </div>
                <hr className='my-4' />
                <div>
                  <h2 className='mb-3'>Travel Memberships</h2>
                  <TravelMemberships />
                </div>
                <hr className='my-4' />
                <div>
                  <h2 className='mb-3'>Credit Cards</h2>
                  <CreditCards />
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

export default ViewTravellers;
