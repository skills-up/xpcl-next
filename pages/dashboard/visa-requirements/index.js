import Seo from '../../../components/common/Seo';
import DashboardLayout from '../../../components/layouts/DashboardLayout';
import { useSelector } from 'react-redux';
import { useRouter } from 'next/router';
import { sendToast } from '../../../utils/toastify';
import { useEffect } from 'react';
import VisaRequirements from './components/VisaRequirements';

const index = () => {
  const token = useSelector((state) => state.auth.value.token);
  const router = useRouter();

  return (
    <>
      <Seo pageTitle='Visa Requirements' />
      {/* End Page Title */}

      <div className='row y-gap-20 justify-between items-end pb-60 lg:pb-40 md:pb-32'>
                <div className='col-12'>
                  <h1 className='text-30 lh-14 fw-600'>Visa Requirements</h1>
                  <div className='text-15 text-light-1'>Manage Visa Requirements.</div>
                </div>
                {/* End .col-12 */}
              </div>
              {/* End .row */}

              <div className='py-30 px-30 rounded-4 bg-white shadow-3'>
                <VisaRequirements />
              </div>
    </>
  );
};

index.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default index;
