import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { deleteItem, getItem } from '../../../../../api/xplorzApi';
import Seo from '../../../../../components/common/Seo';
import DashboardLayout from '../../../../../components/layouts/DashboardLayout';
import ConfirmationModal from '../../../../../components/confirm-modal';
import ViewTable from '../../../../../components/view-table';
import { sendToast } from '../../../../../utils/toastify';

const ViewTravelVisas = () => {
  const [travelVisa, setTravelVisa] = useState([]);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [idToDelete, setIdToDelete] = useState(-1);

  const token = useSelector((state) => state.auth.value.token);
  const router = useRouter();
  useEffect(() => {
    // Getting particular organization
    getTravelVisa();
  }, [router.isReady]);

  const getTravelVisa = async () => {
    if (router.query.view) {
      const response = await getItem('travel-visas', router.query.view);
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
        if (data?.traveller_name && data?.traveller_id) {
          data.traveller_name = (
            <a href={'/dashboard/travellers/view/' + data.traveller_id}>
              {data.traveller_name}
            </a>
          );
        }
        delete data['traveller_id'];
        if (data?.country_name && data?.country_id) {
          data.country_name = (
            <a href={'/dashboard/countries/view/' + data.country_id}>
              {data.country_name}
            </a>
          );
        }
        delete data['country_id'];
        if (data?.visa_scans) {
          data.visa_scans = (
            <ul className='list-disc'>
              {Object.values(data?.visa_scans).map((element, index) => (
                <li key={index}>
                  <a href={element} target='_blank'>
                    Download
                  </a>
                </li>
              ))}
            </ul>
          );
        }
        setTravelVisa(data);
      } else {
        sendToast(
          'error',
          response.data?.message ||
            response.data?.error ||
            'Could Not Fetch The Requested Travel Visa.'
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
    const response = await deleteItem('travel-visas', idToDelete);
    if (response?.success) {
      sendToast('success', 'Deleted successfully', 4000);
      router.push('/dashboard/travellers/view/' + router.query.traveller_id);
    } else {
      sendToast(
        'error',
        response.data?.message ||
          response.data?.error ||
          'Unexpected Error Occurred While Trying to Delete this Travel Visa',
        4000
      );
    }
    onCancel();
  };

  return (
    <>
      <Seo pageTitle='View Travel Visa' />
      {/* End Page Title */}

      <div className='row y-gap-20 justify-between items-end pb-60 lg:pb-40 md:pb-32'>
                <div className='col-12'>
                  <h1 className='text-30 lh-14 fw-600'>View Travel Visa</h1>
                  <div className='text-15 text-light-1'>
                    Get extended details of a travel visa.
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
                    title='Do you really want to delete this travel visa?'
                    content='This will permanently delete the travel visa. Press OK to confirm.'
                  />
                )}
                <ViewTable
                  data={travelVisa}
                  onEdit={() =>
                    router.push({
                      pathname: '/dashboard/travellers/travel-visas/edit',
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
                  entitySlug={'travel-visas'}
                />
              </div>
              </>
  );
};

ViewTravelVisas.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default ViewTravelVisas;
