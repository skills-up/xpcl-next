import Footer from '../footer/dashboard-footer';
import Header from '../header/dashboard-header';
import Sidebar from '../sidebars/dashboard-sidebars';

const DashboardLayout = ({ children }) => {
  return (
    <>
      <div className='header-margin' />
      <Header />
      <div className='dashboard'>
        <div className='dashboard__sidebar bg-white scroll-bar-1'>
          <Sidebar />
        </div>
        <div className='dashboard__main'>
          <div className='dashboard__content bg-light-2'>
            {children}
            <Footer />
          </div>
        </div>
      </div>
    </>
  );
};

export default DashboardLayout;
