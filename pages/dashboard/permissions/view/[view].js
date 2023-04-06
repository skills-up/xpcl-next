import Seo from '../../../../components/common/Seo';
import Footer from '../../../../components/footer/dashboard-footer';
import Header from '../../../../components/header/dashboard-header';
import Sidebar from '../../../../components/sidebars/dashboard-sidebars';
import { useSelector } from 'react-redux';
import { useRouter } from 'next/router';
import { sendToast } from '../../../../utils/toastify';
import { useEffect, useState } from 'react';
import { getItem } from '../../../../api/xplorzApi';
import Datatable from '../../../../components/datatable/Datatable';

const ViewPermission = () => {
  const [permission, setPermission] = useState([]);
  const token = useSelector((state) => state.auth.value.token);
  const router = useRouter();
  useEffect(() => {
    if (token === '') {
      sendToast('error', 'You need to login first in order to view the dashboard.', 4000);
      router.push('/login');
    }
    // Getting particular permission
    getPermission();
  }, [router.isReady]);

  const getPermission = async () => {
    if (router.query.view) {
      const response = await getItem('permissions', router.query.view);
      if (response?.success) {
        setPermission([response.data]);
      } else {
        sendToast(
          'error',
          response.data?.message ||
            response.data?.error ||
            'Could Not Fetch The Requested Permission.'
        );
        router.push('/dashboard/permissions');
      }
    }
  };

  const columns = [
    {
      Header: 'Slug',
      accessor: 'slug',
      disableSortBy: true,
    },
    {
      Header: 'Description',
      accessor: 'description',
      disableSortBy: true,
    },
    {
      Header: 'Created At',
      accessor: 'created_at',
      Cell: (data) => {
        return (
          <div>
            {data.row.original.created_at
              ? new Date(data.row.original.created_at).toLocaleString('en-IN', {
                  dateStyle: 'medium',
                  timeStyle: 'short',
                })
              : ''}
          </div>
        );
      },
    },
    {
      Header: 'Created By',
      accessor: 'created_by',
    },
    {
      Header: 'Last Updated At',
      accessor: 'updated_at',
      Cell: (data) => {
        return (
          <div>
            {data.row.original.updated_at
              ? new Date(data.row.original.updated_at).toLocaleString('en-IN', {
                  dateStyle: 'medium',
                  timeStyle: 'short',
                })
              : ''}
          </div>
        );
      },
    },
    {
      Header: 'Last Updated By',
      accessor: 'updated_by',
    },
  ];

  return (
    <>
      <Seo pageTitle='View Permission' />
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
                  <h1 className='text-30 lh-14 fw-600'>View Permission</h1>
                  <div className='text-15 text-light-1'>
                    Get extended details of a permission.
                  </div>
                </div>
                {/* End .col-12 */}
              </div>
              {/* End .row */}

              <div className='py-30 px-30 rounded-4 bg-white shadow-3'>
                <Datatable data={permission} columns={columns} />
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

export default ViewPermission;
