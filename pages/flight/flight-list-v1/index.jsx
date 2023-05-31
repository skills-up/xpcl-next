import CallToActions from '../../../components/common/CallToActions';
import Seo from '../../../components/common/Seo';
import MainFilterSearchBox from '../../../components/flight-list/flight-list-v1/MainFilterSearchBox';
import Table from '../../../components/flight-list/flight-list-v1/Table';
import DefaultFooter from '../../../components/footer/default';
import Header1 from '../../../components/header/header-1';

const index = () => {
  return (
    <>
      <Seo pageTitle='Flight List v1' />
      {/* End Page Title */}

      <div className='header-margin'></div>
      {/* header top margin */}

      <Header1 />
      {/* End Header 1 */}

      <section className='pt-40 pb-40'>
        <div className='container'>
          <MainFilterSearchBox />
        </div>
      </section>
      {/* Top SearchBanner */}

      <Table />
      {/* End layout for listing sidebar and content */}

      <CallToActions />
      {/* End Call To Actions Section */}

      <DefaultFooter />
    </>
  );
};

export default index;
