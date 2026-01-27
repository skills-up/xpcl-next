import Seo from '../../../components/common/Seo';
import DashboardLayout from '../../../components/layouts/DashboardLayout';
import TravelList from './../components/TravelList';

const index = () => {
  return (
    <>
      <Seo pageTitle='Travel List' />
      {/* End Page Title */}

      <div className='row y-gap-20 justify-between items-end pb-20'>
              <div className='col-12'>
                <h1 className='text-30 lh-14 fw-600'>Travel List</h1>
                <div className='text-15 text-light-1'>
                  List of flights scheduled for the selected period
                </div>
              </div>
              {/* End .col-12 */}
            </div>
            {/* End .row */}

            <div className='py-30 px-30 rounded-4 bg-white shadow-3'>
              <TravelList />
              </div>
    </>
  );
};

index.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default index;
