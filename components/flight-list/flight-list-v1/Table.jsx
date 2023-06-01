import Pagination from '../common/Pagination';
import FlightProperties from './FlightProperties';
import Sidebar from './Sidebar';
import TopHeaderFilter from './TopHeaderFilter';

function Table() {
  return (
    <section className='layout-pt-md layout-pb-md bg-light-2'>
      <div className='container'>
        <div className='row y-gap-30'>
          <div className='col-xl-3'>
            <aside className='sidebar py-20 px-20 xl:d-none bg-white'>
              <div className='row y-gap-40'>
                <Sidebar />
              </div>
            </aside>
            {/* End sidebar for desktop */}

            <div className='offcanvas offcanvas-start' tabIndex='-1' id='listingSidebar'>
              <div className='offcanvas-header'>
                <h5 className='offcanvas-title' id='offcanvasLabel'>
                  Filter Tours
                </h5>
                <button
                  type='button'
                  className='btn-close'
                  data-bs-dismiss='offcanvas'
                  aria-label='Close'
                ></button>
              </div>
              {/* End offcanvas header */}

              <div className='offcanvas-body'>
                <aside className='sidebar y-gap-40  xl:d-block'>
                  <Sidebar />
                </aside>
              </div>
              {/* End offcanvas body */}
            </div>
            {/* End mobile menu sidebar */}
          </div>
          {/* End col */}

          <div className='col-xl-9 '>
            <TopHeaderFilter />

            <div className='row'>
              <FlightProperties />
            </div>
            {/* End .row */}
            <Pagination />
          </div>
          {/* End .col for right content */}
        </div>
        {/* End .row */}
      </div>
      {/* End .container */}
    </section>
  );
}

export default Table;
