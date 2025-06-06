import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { AiOutlinePrinter } from 'react-icons/ai';
import { BsDashSquare, BsPlusSquare } from 'react-icons/bs';
import { useSelector } from 'react-redux';
import { deleteItem, getItem } from '../../../../api/xplorzApi';
import Audit from '../../../../components/audits';
import Seo from '../../../../components/common/Seo';
import ConfirmationModal from '../../../../components/confirm-modal';
import Footer from '../../../../components/footer/dashboard-footer';
import Header from '../../../../components/header/dashboard-header';
import Sidebar from '../../../../components/sidebars/dashboard-sidebars';
import ViewTable from '../../../../components/view-table';
import { downloadApiPDF } from '../../../../utils/fileDownloader';
import { filterAllowed, hasPermission } from '../../../../utils/permission-checker';
import { sendToast } from '../../../../utils/toastify';

const ViewRefunds = () => {
  const [refund, setRefund] = useState([]);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [idToDelete, setIdToDelete] = useState(-1);
  const [auditExpanded, setAuditExpanded] = useState(false);

  const token = useSelector((state) => state.auth.value.token);
  const router = useRouter();
  useEffect(() => {
    // Getting particular organization
    getRefund();
  }, [router.isReady]);

  const getRefund = async () => {
    if (router.query.view) {
      const response = await getItem('partial-refunds', router.query.view);
      let originalBooking;
      if (response?.success) {
        let temp = await getItem('bookings', response.data.booking_id);
        if (temp?.success) {
          originalBooking = temp.data;
        }
        let data = response.data;
        // Converting time columns
        if (originalBooking) data['sector'] = originalBooking.sector;
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
        if (data?.client_name && data?.client_id) {
          data.client_name = (
            <a href={'/dashboard/organizations/view/' + data.client_id}>
              {data.client_name}
            </a>
          );
        }
        delete data['client_id'];
        if (data?.account_name && data?.account_id) {
          data.account_name = (
            <a href={'/dashboard/accounts/view/' + data.account_id}>
              {data.account_name}
            </a>
          );
        }
        delete data['account_id'];
        if (data?.commission_rule_name && data?.commission_rule_id) {
          data.commission_rule_name = (
            <a href={'/dashboard/commission-rules/view/' + data.commission_rule_id}>
              {data.commission_rule_name}
            </a>
          );
        }
        delete data['commission_rule_id'];
        if (data?.client_referrer_name && data?.client_referrer_id) {
          data.client_referrer_name = (
            <a href={'/dashboard/accounts/view/' + data.client_referrer_id}>
              {data.client_referrer_name}
            </a>
          );
        }
        delete data['client_referrer_id'];
        if (data?.vendor_name && data?.vendor_id) {
          data.vendor_name = (
            <a href={'/dashboard/organizations/view/' + data.vendor_id}>
              {data.vendor_name}
            </a>
          );
        }
        delete data['vendor_id'];
        if (data?.number && data?.booking_id) {
          data['booking'] = (
            <a href={'/dashboard/bookings/view/' + data.booking_id}>
              {data.number.charAt(0) + 'S' + data.number.slice(2)}
            </a>
          );
        }
        delete data['booking_id'];
        setRefund(data);
      } else {
        sendToast(
          'error',
          response.data?.message ||
            response.data?.error ||
            'Could Not Fetch The Requested Refund.'
        );
        router.push('/dashboard/bookings/view/' + router.query.booking_id);
      }
    }
  };

  const onCancel = async () => {
    setConfirmDelete(false);
    setIdToDelete(-1);
  };
  const onSubmit = async () => {
    const response = await deleteItem('refunds', idToDelete);
    if (response?.success) {
      sendToast('success', 'Deleted successfully', 4000);
      router.push('/dashboard/bookings/view/' + router.query.booking_id);
    } else {
      sendToast(
        'error',
        response.data?.message ||
          response.data?.error ||
          'Unexpected Error Occurred While Trying to Delete this Refund',
        4000
      );
    }
    onCancel();
  };

  return (
    <>
      <Seo pageTitle='View Refund' />
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
                    View Partial Refund - {refund?.number}
                  </h1>
                  <div className='text-15 text-light-1'>
                    Get extended details of a partial refund.
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
                    title='Do you really want to delete this refund?'
                    content='This will permanently delete the refund. Press OK to confirm.'
                  />
                )}
                <ViewTable
                  data={refund}
                  onEdit={() =>
                    router.push({
                      pathname: '/dashboard/partial-refunds/edit/' + router.query.view,
                    })
                  }
                  onDelete={() => {
                    setIdToDelete(router.query.view);
                    setConfirmDelete(true);
                  }}
                  entitySlug={'partial-refunds'}
                  extraButtons={filterAllowed([
                    {
                      icon: <AiOutlinePrinter />,
                      text: 'Print',
                      onClick: async () => {
                        downloadApiPDF(
                          'partial-refunds/' + router.query.view + '/pdf',
                          `${refund?.number ?? 'Unkown'}.pdf`
                        );
                      },
                      classNames: 'btn-info text-white',
                      permisssions: ['partial-refunds.pdf'],
                    },
                  ])}
                />
                <hr className='my-4' />
                {hasPermission('partial-refunds.audit-trail') && (
                  <div>
                    <h2 className='mb-3 d-flex justify-between items-center'>
                      <span>Audit Log</span>
                      {auditExpanded ? (
                        <BsDashSquare
                          className='cursor-pointer text-blue-1'
                          onClick={() => setAuditExpanded((prev) => !prev)}
                        />
                      ) : (
                        <BsPlusSquare
                          className='cursor-pointer text-blue-1'
                          onClick={() => setAuditExpanded((prev) => !prev)}
                        />
                      )}
                    </h2>
                    {auditExpanded && (
                      <Audit
                        url={'partial-refunds/' + router.query.view + '/audit-trail'}
                      />
                    )}
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

export default ViewRefunds;
