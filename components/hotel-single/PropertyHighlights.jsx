const PropertyHighlights2 = ({ facilities }) => {
  const iconList = [
    {
      icon: 'icon-city',
      text: `Business Center`,
    },
    {
      icon: 'icon-airplane',
      text: `Fitness Center`,
    },
    {
      icon: 'icon-bell-ring',
      text: `Swimming Pool`,
    },
    {
      icon: 'icon-tv',
      text: `Spa`,
    },
    {
      icon: 'icon-food',
      text: `Restaurant`,
    },
    {
      icon: 'icon-tv',
      text: `Laundry`,
    },
    {
      icon: 'icon-car',
      text: `Parking`,
    },
    {
      icon: 'icon-bell-ring',
      text: `Room Service`,
    },
    {
      icon: 'icon-tv',
      text: `Bar/Lounge`,
    },
    {
      icon: 'icon-tv',
      text: `Newspaper`,
    },
    {
      icon: 'icon-tv',
      text: `Meeting room`,
    },
    {
      icon: 'icon-tv',
      text: `Luggage Storage Service`,
    },
  ];
  return (
    <div className='row y-gap-20 pt-30'>
      {facilities.map((item, index) => {
        //  Icon Selection
        let icon = 'icon-award';
        for (let ic of iconList)
          if (ic.text.toLowerCase() === item.toLowerCase()) icon = ic.icon;

        return (
          <div className='col-lg-3 col-6' key={index}>
            <div className='text-center'>
              <i className={`${icon} text-24 text-blue-1`} />
              <div className='text-15 lh-1 mt-10'>{item}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default PropertyHighlights2;
