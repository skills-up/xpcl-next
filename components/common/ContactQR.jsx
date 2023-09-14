function ContactQR() {
  return (
    <div id='contact-qr'>
      <div className='section-bg pb-50 bg-light'>
        <div className='container'>
          <div className='row items-center'>
            <div className='col-lg-5 text-right'>
              <img className='left-img' src='/img/backgrounds/13.png' />
            </div>
            <div className='col-lg-7'>
              <h1>Seamless Access from Everywhere</h1>
              <h5 className='mt-20 fw-200 text-light-4'>
                With our super intuitive and connected web application & mobile app, myBiz
                is always available to address all your business travel needs.
              </h5>
              <h5 style={{ fontWeight: '700' }} className='mt-30 text-light-4 mb-15'>
                Scan QR code to download myBiz app
              </h5>
              <div className='row items-end'>
                <div className='col-lg-4'>
                  <img className='qr' src='/img/backgrounds/qr.png' />
                </div>
                <div className='col-lg-8 d-flex gap-3 mb-20 justify-center items-center'>
                  <img
                    className='playstore cursor-pointer'
                    src='/img/backgrounds/playstore.png'
                  />
                  <img
                    className='appstore cursor-pointer'
                    src='/img/backgrounds/appstore.png'
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ContactQR;
