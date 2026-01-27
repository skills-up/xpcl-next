import Seo from '../../../components/common/Seo';
import DashboardLayout from '../../../components/layouts/DashboardLayout';
import FilesList from './components/FilesList';

const index = () => {

  return (
    <>
      <Seo pageTitle='Files List' />
      {/* End Page Title */}

      <div className='row y-gap-20 justify-between items-end pb-60 lg:pb-40 md:pb-32'>
                <div className='col-12'>
                  <h1 className='text-30 lh-14 fw-600'>Files List</h1>
                  <div className='text-15 text-light-1'>Listing files uploaded to XCPL</div>
                </div>
                {/* End .col-12 */}
              </div>
              {/* End .row */}

              <div className='py-30 px-30 rounded-4 bg-white shadow-3'>
                <FilesList />
              </div>
    </>
  );
};

index.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default index;
