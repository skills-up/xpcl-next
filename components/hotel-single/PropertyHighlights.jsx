import { FaLuggageCart } from 'react-icons/fa';
import { GiGrassMushroom } from 'react-icons/gi';
import { MdOutlineFreeBreakfast } from 'react-icons/md';

const PropertyHighlights2 = ({ facilities }) => {
  const iconList = [
    {
      icon: <i className={`icon-city text-24 text-blue-1`} />,
      text: `Business Center`,
    },
    {
      icon: <i className={`icon-airplane text-24 text-blue-1`} />,
      text: `Fitness Center`,
    },
    {
      icon: <i className={`icon-bell-ring text-24 text-blue-1`} />,
      text: `Swimming Pool`,
    },
    {
      icon: <i className={`icon-tv text-24 text-blue-1`} />,
      text: `Spa`,
    },
    {
      icon: <i className={`icon-food text-24 text-blue-1`} />,
      text: `Restaurant`,
    },
    {
      icon: <i className={`icon-tv text-24 text-blue-1`} />,
      text: `Laundry`,
    },
    {
      icon: <i className={`icon-car text-24 text-blue-1`} />,
      text: `Parking`,
    },
    {
      icon: <i className={`icon-bell-ring text-24 text-blue-1`} />,
      text: `Room Service`,
    },
    {
      icon: <i className={`icon-tv text-24 text-blue-1`} />,
      text: `Bar/Lounge`,
    },
    {
      icon: <i className={`icon-tv text-24 text-blue-1`} />,
      text: `Newspaper`,
    },
    {
      icon: <i className={`icon-tv text-24 text-blue-1`} />,
      text: `Meeting room`,
    },
    {
      icon: <FaLuggageCart className={`mb-5 text-24 text-blue-1`} />,
      text: `Luggage Storage Service`,
    },
    {
      icon: <GiGrassMushroom className={`mb-5 text-24 text-blue-1`} />,
      text: `Garden`,
    },
    {
      icon: <MdOutlineFreeBreakfast className={`mb-5 text-24 text-blue-1`} />,
      text: `Breakfast Service`,
    },
  ];
  return (
    <div className='row y-gap-20 pt-30'>
      {facilities.map((item, index) => {
        //  Icon Selection
        let icon = <i className={`icon-award text-24 text-blue-1`} />;
        for (let ic of iconList)
          if (ic.text.toLowerCase() === item.toLowerCase()) icon = ic.icon;

        return (
          <div className='col-lg-3 col-6' key={index}>
            <div className='text-center'>
              {icon}
              <div className='text-15 lh-1 mt-10'>{item}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default PropertyHighlights2;
