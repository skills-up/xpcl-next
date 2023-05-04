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
import Audit from '../../../../components/audits';

const ViewVendorCommissionInvoices = () => {
  const [vendorCommissionInvoice, setVendorCommissionInvoice] = useState([]);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [idToDelete, setIdToDelete] = useState(-1);

  const token = useSelector((state) => state.auth.value.token);
  const router = useRouter();
  useEffect(() => {
    // Getting particular organization
    getVendorCommissionInvoice();
  }, [router.isReady]);

  const getVendorCommissionInvoice = async () => {
    if (router.query.view) {
      const response = await getItem('vendor-commission-invoices', router.query.view);
      if (response?.success) {
        let data = response.data;
        // Converting time columns
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
        if (data.audit_trail) {
          delete data['audit_trail'];
        }
        setVendorCommissionInvoice(data);
      } else {
        sendToast(
          'error',
          response.data?.message ||
            response.data?.error ||
            'Could Not Fetch The Requested Vendor Commission Invoice.'
        );
        router.push('/dashboard/vendor-commission-invoices');
      }
    }
  };

  const onCancel = async () => {
    setConfirmDelete(false);
    setIdToDelete(-1);
  };
  const onSubmit = async () => {
    const response = await deleteItem('vendor-commission-invoices', idToDelete);
    if (response?.success) {
      sendToast('success', 'Deleted successfully', 4000);
      router.push('/dashboard/vendor-commission-invoices');
    } else {
      sendToast(
        'error',
        response.data?.message ||
          response.data?.error ||
          'Unexpected Error Occurred While Trying to Delete this Vendor Commission Invoice',
        4000
      );
    }
    onCancel();
  };

  return (
    <>
      <Seo pageTitle='View Vendor Commission Invoice' />
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
                  <h1 className='text-30 lh-14 fw-600'>
                    View Vendor Commission Invoice - {vendorCommissionInvoice?.number}
                  </h1>
                  <div className='text-15 text-light-1'>
                    Get extended details of a vendor commission invoice.
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
                    title='Do you really want to delete this vendor commission invoice?'
                    content='This will permanently delete the vendor commission invoice. Press OK to confirm.'
                  />
                )}
                <ViewTable
                  data={vendorCommissionInvoice}
                  onEdit={() =>
                    router.push(
                      '/dashboard/vendor-commission-invoices/edit/' + router.query.view
                    )
                  }
                  onDelete={() => {
                    setIdToDelete(router.query.view);
                    setConfirmDelete(true);
                  }}
                />
                <hr className='my-4' />
                <div>
                  <h2 className='mb-3'>Audit Log</h2>
                  <Audit
                    url={
                      'vendor-commision-invoices/' + router.query.view + '/audit-trail'
                    }
                  />
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

export default ViewVendorCommissionInvoices;
