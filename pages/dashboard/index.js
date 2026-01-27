import Seo from '../../components/common/Seo';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import { hasPermission } from '../../utils/permission-checker';
import TravelList from './components/TravelList';
import CountCard from './visa-applications/components/CountCard';

const index = () => {
  return (
    <>
      <Seo pageTitle='Dashboard' />
      {/* End Page Title */}

      <div className='row y-gap-20 justify-between items-end pb-20'>
        <div className='col-12'>
          <h1 className='text-30 lh-14 fw-600'>Dashboard</h1>
          <div className='text-15 text-light-1'>
            A quick look at critical information
          </div>
        </div>
        {/* End .col-12 */}
      </div>
      {/* End .row */}
      <div className='row y-gap-30'>
        <CountCard />
      </div>
      {hasPermission('travel-list.index') && (
        <div className='row y-gap-30 pt-20 chart_responsive'>
          <div className=''>
            <div className='py-30 px-30 rounded-4 bg-white shadow-3'>
              <h2 className='text-18 lh-1 fw-500'>Travel List</h2>
              <TravelList />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

index.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default index;
