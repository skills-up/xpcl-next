import Seo from '../../../../components/common/Seo';
import DashboardLayout from '../../../../components/layouts/DashboardLayout';
import { useState } from 'react';
import { sendToast } from '../../../../utils/toastify';
import { customAPICall } from '../../../../api/xplorzApi';

const CancelAchPnr = () => {
  const [pnr, setPnr] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!pnr) {
      sendToast('error', 'PNR is required.', 4000);
      return;
    }

    setLoading(true);
    const response = await customAPICall('flights-ach/cancel', 'post', {
      pnr: pnr,
      version: 1,
    });
    setLoading(false);

    if (response?.success) {
      sendToast('success', response.data?.message || 'PNR Cancelled Successfully.', 4000);
      setPnr('');
    } else {
      sendToast(
        'error',
        response.data?.message ||
        response.data?.error ||
        'Failed to Cancel PNR.',
        4000
      );
    }
  };

  return (
    <>
      <Seo pageTitle='Cancel ACH PNR' />
      {/* End Page Title */}

      <div className='row y-gap-20 justify-between items-end pb-60 lg:pb-40 md:pb-32'>
        <div className='col-12'>
          <h1 className='text-30 lh-14 fw-600'>Cancel ACH PNR</h1>
          <div className='text-15 text-light-1'>
            Enter the PNR to cancel the ACH booking.
          </div>
        </div>
        {/* End .col-12 */}
      </div>
      {/* End .row */}

      <div className='py-30 px-30 rounded-4 bg-white shadow-3'>
        <div>
          <form onSubmit={onSubmit} className='row col-12 y-gap-20'>
            <div className='col-12'>
              <div className='form-input'>
                <input
                  onChange={(e) => setPnr(e.target.value)}
                  value={pnr}
                  placeholder=' '
                  type='text'
                  required
                />
                <label className='lh-1 text-16 text-light-1'>
                  PNR<span className='text-danger'>*</span>
                </label>
              </div>
            </div>

            <div className='col-12 d-inline-block'>
              <button
                type='submit'
                disabled={loading}
                className='button h-50 px-24 -dark-1 bg-blue-1 text-white'
              >
                {loading ? 'Cancelling...' : 'Cancel PNR'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

CancelAchPnr.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default CancelAchPnr;
