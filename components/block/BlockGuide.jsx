const BlockGuide = () => {
  const blockContent = [
    {
      id: 1,
      icon: '/img/featureIcons/1/1.svg',
      title: 'Clear, Transparent, Seamless GST Invoicing and Reporting',
      text: ``,
      delayAnim: '100',
    },
    {
      id: 2,
      icon: '/img/featureIcons/1/2.svg',
      title: 'Super efficient Web and Mobile App Booking Tool',
      text: ``,
      delayAnim: '200',
    },
    {
      id: 3,
      icon: '/img/featureIcons/1/4.svg',
      title: 'Automated Web Boarding Passes',
      text: ``,
      delayAnim: '300',
    },
    {
      id: 4,
      icon: '/img/featureIcons/1/3.svg',
      title: 'Dedicated Account Manager per Corporate account',
      text: ``,
      delayAnim: '400',
    },
  ];
  return (
    <>
      {blockContent.map((item) => (
        <div
          className='col-lg-3 col-sm-6'
          data-aos='fade'
          data-aos-delay={item.delayAnim}
          key={item.id}
        >
          <div className='featureIcon -type-1 '>
            <div className='d-flex justify-center'>
              <img src={item.icon} alt='image' className='js-lazy' />
            </div>
            <div className='text-center mt-30'>
              <h4 className='text-18 fw-500'>{item.title}</h4>
              <p className='text-15 mt-10'>{item.text}</p>
            </div>
          </div>
        </div>
      ))}
    </>
  );
};

export default BlockGuide;
