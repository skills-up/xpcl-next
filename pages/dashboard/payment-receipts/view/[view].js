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

const ViewPaymentReceipts = () => {
  const [paymentReceipt, setPaymentReceipt] = useState([]);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [idToDelete, setIdToDelete] = useState(-1);
  const [auditExpanded, setAuditExpanded] = useState(false);

  const token = useSelector((state) => state.auth.value.token);
  const router = useRouter();
  useEffect(() => {
    // Getting particular organization
    getPaymentReceipt();
  }, [router.isReady]);

  const getPaymentReceipt = async () => {
    if (router.query.view) {
      const response = await getItem('payment-receipts', router.query.view);
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
        delete data['payment_itc'];
        delete data['payment_tds'];
        if (data?.organization_name && data?.organization_id) {
          data.organization_name = (
            <a href={'/dashboard/organizations/view/' + data.organization_id}>
              {data.organization_name}
            </a>
          );
        }
        delete data['organization_id'];
        if (data?.dr_account_name && data?.dr_account_id) {
          data.dr_account_name = (
            <a href={'/dashboard/accounts/view/' + data.dr_account_id}>
              {data.dr_account_name}
            </a>
          );
        }
        delete data['dr_account_id'];
        if (data?.cr_account_name && data?.cr_account_id) {
          data.cr_account_name = (
            <a href={'/dashboard/accounts/view/' + data.cr_account_id}>
              {data.cr_account_name}
            </a>
          );
        }
        delete data['cr_account_id'];
        if (data?.file_url) {
          data.file_url = (
            <a href={data.file_url} target='_blank' download={true}>
              Download
            </a>
          );
        }
        setPaymentReceipt(data);
      } else {
        sendToast(
          'error',
          response.data?.message ||
            response.data?.error ||
            'Could Not Fetch The Requested Payment Receipt.'
        );
        router.push('/dashboard/payment-receipts');
      }
    }
  };

  const onCancel = async () => {
    setConfirmDelete(false);
    setIdToDelete(-1);
  };
  const onSubmit = async () => {
    const response = await deleteItem('payment-receipts', idToDelete);
    if (response?.success) {
      sendToast('success', 'Deleted successfully', 4000);
      router.push('/dashboard/payment-receipts');
    } else {
      sendToast(
        'error',
        response.data?.message ||
          response.data?.error ||
          'Unexpected Error Occurred While Trying to Delete this ' + paymentReceipt?.type,
        4000
      );
    }
    onCancel();
  };

  return (
    <>
      <Seo pageTitle={'View ' + (paymentReceipt?.type || '')} />
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
                    View {paymentReceipt?.type} - {paymentReceipt?.number}
                  </h1>
                  <div className='text-15 text-light-1'>
                    Get extended details of a {paymentReceipt?.type?.toLowerCase()}.
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
                    title={
                      'Do you really want to delete this ' + paymentReceipt?.type + '?'
                    }
                    content={
                      'This will permanently delete the ' +
                      paymentReceipt?.type?.toLowerCase() +
                      '. Press OK to confirm.'
                    }
                  />
                )}
                <ViewTable
                  data={paymentReceipt}
                  onEdit={() =>
                    router.push('/dashboard/payment-receipts/edit/' + router.query.view)
                  }
                  onDelete={() => {
                    setIdToDelete(router.query.view);
                    setConfirmDelete(true);
                  }}
                  entitySlug={'payment-receipts'}
                  extraButtons={filterAllowed([
                    {
                      icon: <AiOutlinePrinter />,
                      text: 'Print',
                      onClick: async () => {
                        downloadApiPDF(
                          'payment-receipts/' + router.query.view + '/pdf',
                          `${paymentReceipt?.number ?? 'Unkown'}.pdf`
                        );
                      },
                      classNames: 'btn-info text-white',
                      permissions: ['payment-receipts.pdf'],
                    },
                  ])}
                />
                <hr className='my-4' />
                {hasPermission('payment-receipts.audit-trail') && (
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
                        url={'payment-receipts/' + router.query.view + '/audit-trail'}
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

export default ViewPaymentReceipts;
