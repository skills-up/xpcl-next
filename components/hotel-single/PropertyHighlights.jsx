import { FaLuggageCart } from 'react-icons/fa';
import {
  GiGrassMushroom,
  GiLotus,
  GiNewspaper,
  GiPublicSpeaker,
  GiWashingMachine,
} from 'react-icons/gi';
import { MdOutlineFreeBreakfast } from 'react-icons/md';
import { CgGym } from 'react-icons/cg';
import { BsBriefcase } from 'react-icons/bs';
import { TbTreadmill } from 'react-icons/tb';
import { FaPersonSwimming } from 'react-icons/fa';
import { IoBeer } from 'react-icons/io';
import { BiSolidKey } from 'react-icons/bi';

const PropertyHighlights2 = ({ facilities }) => {
  const iconList = [
    {
      icon: <BsBriefcase className={`mb-5 text-24 text-blue-1`} />,
      text: `Business Center`,
    },
    {
      icon: <TbTreadmill className={`mb-5 text-24 text-blue-1`} />,
      text: `Fitness Center`,
    },
    {
      icon: <FaPersonSwimming className={`mb-5 text-24 text-blue-1`} />,
      text: `Swimming Pool`,
    },
    {
      icon: <GiLotus className={`mb-5 text-24 text-blue-1`} />,
      text: `Spa`,
    },
    {
      icon: <i className={`icon-food text-24 text-blue-1`} />,
      text: `Restaurant`,
    },
    {
      icon: <GiWashingMachine className={`mb-5 text-24 text-blue-1`} />,
      text: `Laundry`,
    },
    {
      icon: <GiWashingMachine className={`mb-5 text-24 text-blue-1`} />,
      text: `Laundry Service`,
    },
    {
      icon: <i className={`icon-parking text-24 text-blue-1`} />,
      text: `Parking`,
    },
    {
      icon: <CgGym className={`mb-5 text-24 text-blue-1`} />,
      text: `Gym`,
    },
    {
      icon: <i className={`icon-bell-ring text-24 text-blue-1`} />,
      text: `Room Service`,
    },
    {
      icon: <IoBeer className={`mb-5 text-24 text-blue-1`} />,
      text: `Bar`,
    },
    {
      icon: <GiNewspaper className={`mb-5 text-24 text-blue-1`} />,
      text: `Newspaper`,
    },
    {
      icon: <GiPublicSpeaker className={`mb-5 text-24 text-blue-1`} />,
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
      icon: <i className={`icon-wifi text-24 text-blue-1`} />,
      text: `Wi-Fi`,
    },
    {
      icon: <i className={`icon-parking text-24 text-blue-1`} />,
      text: `Valet Parking`,
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
