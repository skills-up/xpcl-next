import Link from "next/link";

const Copyright = () => {
  return (
    <div className='row justify-between items-center y-gap-10'>
      <div className='col-auto'>
        <div className='row x-gap-30 y-gap-10'>
          <div className='col-auto'>
            <div className='d-flex items-center'>
              © {new Date().getFullYear()} TripCentral Corporate Travel Services LLP. All Rights
              Reserved.
            </div>
          </div>
          {/* End .col */}

          {/* End .col */}
        </div>
        {/* End .row */}
      </div>
      {/* End .col */}

      <div className='col-auto'>
        <div className='d-flex x-gap-50'>
          <Link href='/terms' className='text-14 fw-500'>Terms & Conditions</Link>
          <Link href='/privacy-policy' className='text-14 fw-500'>Privacy Policy</Link>
        </div>
      </div>

      {/* <div className='col-auto'>
        <div className='row y-gap-10 items-center'>
          <div className='col-auto'>
            <div className='d-flex items-center'>
              <button className='d-flex items-center text-14 fw-500 text-white mr-10'>
                <i className='icon-globe text-16 mr-10' />
                <span className='underline'>English (US)</span>
              </button>
              <button className='d-flex items-center text-14 fw-500 text-white'>
                <i className='icon-usd text-16 mr-10' />
                <span className='underline'>USD</span>
              </button>
            </div>
          </div>

          <div className='col-auto'>
            <div className='d-flex x-gap-20 items-center'>
              <Social />
            </div>
          </div>
        </div>
      </div> */}
      {/* End .col */}
    </div>
  );
};

export default Copyright;
