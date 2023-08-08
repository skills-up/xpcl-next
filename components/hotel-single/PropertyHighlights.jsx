import { useState } from 'react';
import { BiBeer } from 'react-icons/bi';
import { BsBriefcase, BsCupHot } from 'react-icons/bs';
import { CgGym } from 'react-icons/cg';
import { FaCcVisa, FaLuggageCart } from 'react-icons/fa';
import {
  GiGrassMushroom,
  GiLotus,
  GiNewspaper,
  GiPublicSpeaker,
  GiWashingMachine,
} from 'react-icons/gi';
import { IoBeer } from 'react-icons/io';
import { MdOutlineFreeBreakfast } from 'react-icons/md';
import { SiAmericanexpress } from 'react-icons/si';
import { TbHeartbeat, TbSwimming } from 'react-icons/tb';

const PropertyHighlights2 = ({ facilities }) => {
  const [isLoadMore, setIsLoadMore] = useState(false);
  const showInOne = 6;
  const iconList = [
    {
      icon: <BsBriefcase className={`mb-5 text-24 text-blue-1`} />,
      text: `Business Center`,
    },
    {
      icon: <TbHeartbeat className={`mb-5 text-24 text-blue-1`} />,
      text: `Fitness Center`,
    },
    {
      icon: <TbSwimming className={`text-30 text-blue-1`} />,
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
      icon: <GiWashingMachine className={`mb-5 text-24 text-blue-1`} />,
      text: `Laundry Services`,
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
      icon: <BiBeer className={`mb-5 text-24 text-blue-1`} />,
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
      icon: <i className={`icon-parking text-24 text-blue-1`} />,
      text: `Free valet parking`,
    },
    {
      icon: <i className={`icon-parking text-24 text-blue-1`} />,
      text: `Free self parking`,
    },
    {
      icon: <i className={`icon-tv text-24 text-blue-1`} />,
      text: `Television`,
    },
    {
      icon: <i className={`icon-tv text-24 text-blue-1`} />,
      text: `Television in lobby`,
    },
    {
      icon: <MdOutlineFreeBreakfast className={`mb-5 text-24 text-blue-1`} />,
      text: `Breakfast Service`,
    },
    {
      icon: <i className={`icon-beach-umbrella text-24 text-blue-1`} />,
      text: `Beach/pool umbrellas`,
    },
    {
      icon: <BsCupHot className={`mb-5 text-24 text-blue-1`} />,
      text: `Coffee/tea in lobby`,
    },
    {
      icon: <SiAmericanexpress className={`mb-5 text-24 text-blue-1`} />,
      text: `American Express`,
    },
    {
      icon: <FaCcVisa className={`mb-5 text-24 text-blue-1`} />,
      text: `Visa`,
    },
  ];
  return (
    <>
      <div className='row y-gap-20 pt-30'>
        {facilities.map((item, index) => {
          //  Icon Selection
          let icon = <i className={`icon-award text-24 text-blue-1`} />;
          for (let ic of iconList)
            if (ic.text.toLowerCase() === item.toLowerCase()) icon = ic.icon;
          if (isLoadMore || (!isLoadMore && index < showInOne))
            return (
              <div className='col-xl-2 col-lg-3 col-6' key={index}>
                <div className='text-center'>
                  {icon}
                  <div className='text-15 lh-1 mt-10'>{item}</div>
                </div>
              </div>
            );
        })}
      </div>
      <div className='d-flex justify-end mt-20'>
        <a
          className='px-24 text-primary cursor-pointer'
          onClick={() => setIsLoadMore((prev) => !prev)}
        >
          {isLoadMore ? 'Show Less' : 'Show More...'}
        </a>
      </div>
    </>
  );
};

export default PropertyHighlights2;
