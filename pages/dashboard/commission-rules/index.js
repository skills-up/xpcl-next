import Seo from '../../../components/common/Seo';
import DashboardLayout from '../../../components/layouts/DashboardLayout';
import CommissionRules from './components/CommissionRules';

const index = () => {
  return (
    <>
      <Seo pageTitle='Commission Rules' />
      {/* End Page Title */}

      <div className='row y-gap-20 justify-between items-end pb-60 lg:pb-40 md:pb-32'>
                <div className='col-12'>
                  <h1 className='text-30 lh-14 fw-600'>Commission Rules</h1>
                  <div className='text-15 text-light-1'>Manage Commission Rules.</div>
                </div>
                {/* End .col-12 */}
              </div>
              {/* End .row */}

              <div className='py-30 px-30 rounded-4 bg-white shadow-3'>
                <CommissionRules />
              </div>
    </>
  );
};

index.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default index;
