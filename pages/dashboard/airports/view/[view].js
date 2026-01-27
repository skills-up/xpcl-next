import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { deleteItem, getItem } from '../../../../api/xplorzApi';
import Seo from '../../../../components/common/Seo';
import DashboardLayout from '../../../../components/layouts/DashboardLayout';
import ConfirmationModal from '../../../../components/confirm-modal';
import ViewTable from '../../../../components/view-table';
import { setInitialAirportsState } from '../../../../features/apis/apisSlice';
import { sendToast } from '../../../../utils/toastify';

const ViewAirports = () => {
  const [airport, setAirport] = useState([]);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [idToDelete, setIdToDelete] = useState(-1);
  const dispatch = useDispatch();
  const token = useSelector((state) => state.auth.value.token);
  const router = useRouter();
  useEffect(() => {
    // Getting particular airport
    getAirport();
  }, [router.isReady]);

  const getAirport = async () => {
    if (router.query.view) {
      const response = await getItem('airports', router.query.view);
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
        if (data?.country_name && data?.country_id) {
          data.country_name = (
            <a href={'/dashboard/countries/view/' + data.country_id}>
              {data.country_name}
            </a>
          );
        }
        delete data['country_id'];
        setAirport(data);
      } else {
        sendToast(
          'error',
          response.data?.message ||
            response.data?.error ||
            'Could Not Fetch The Requested Airport.'
        );
        router.push('/dashboard/airports');
      }
    }
  };

  const onCancel = async () => {
    setConfirmDelete(false);
    setIdToDelete(-1);
  };
  const onSubmit = async () => {
    const response = await deleteItem('airports', idToDelete);
    if (response?.success) {
      sendToast('success', 'Deleted successfully', 4000);
      sessionStorage.removeItem('airports-checked');
      dispatch(setInitialAirportsState());
      router.push('/dashboard/airports');
    } else {
      sendToast(
        'error',
        response.data?.message ||
          response.data?.error ||
          'Unexpected Error Occurred While Trying to Delete this Airport',
        4000
      );
    }
    onCancel();
  };

  return (
    <>
      <Seo pageTitle='View Airport' />
      {/* End Page Title */}

      <div className='row y-gap-20 justify-between items-end pb-60 lg:pb-40 md:pb-32'>
                <div className='col-12'>
                  <h1 className='text-30 lh-14 fw-600'>View Airport</h1>
                  <div className='text-15 text-light-1'>
                    Get extended details of an airport.
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
                    title='Do you really want to delete this airport?'
                    content='This will permanently delete the airport. Press OK to confirm.'
                  />
                )}
                <ViewTable
                  data={airport}
                  onEdit={() =>
                    router.push('/dashboard/airports/edit/' + router.query.view)
                  }
                  onDelete={() => {
                    setIdToDelete(router.query.view);
                    setConfirmDelete(true);
                  }}
                  entitySlug={'airports'}
                />
              </div>
              </>
  );
};

ViewAirports.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default ViewAirports;
