import Link from 'next/link';
import { AiOutlineMail } from 'react-icons/ai';
import { BsTelephone } from 'react-icons/bs';
import { HiOutlineMail } from 'react-icons/hi';
import { IoLocationOutline } from 'react-icons/io5';
import { MdOutlineEmail } from 'react-icons/md';

const Address = ({ lighterHeading = false }) => {
  const addressContent = [
    {
      id: 1,
      colClass: 'col-auto',
      title: (
        <Link href='/' className='header-logo mb-10'>
          <img src='/img/general/xplorz-logo.png' className='w-180' alt='logo icon' />
        </Link>
      ),
      content: (
        <>
          <div>Xplorz.Com Private Limited</div>
        </>
      ),
    },
    {
      id: 2,
      colClass: 'col-lg-3',
      title: <IoLocationOutline className='text-30 mb-10' />,
      content: (
        <div
          style={{
            textAlign: 'justify',
            textJustify: 'inter-word',
          }}
        >
          211-212 Jolly Bhavan No. 1, 10 New Marine Lines, Mumbai - 400020.
        </div>
      ),
    },
    {
      id: 3,
      colClass: 'col-auto',
      title: <BsTelephone className='text-30 mb-10' />,
      content: (
        <>
          <a href='tel:+912266121000 '>+91 22 66121000 </a>
        </>
      ),
    },
    {
      id: 4,
      colClass: 'col-auto',
      title: <AiOutlineMail className='text-30 mb-5' />,
      content: (
        <>
          <a href='mailto:support@xplorz.com'>support@xplorz.com</a>
        </>
      ),
    },
  ];
  return (
    <>
      {addressContent.map((item) => (
        <div className={`${item.colClass} text-center`} key={item.id}>
          <div className={`text-14 ${lighterHeading ? 'text-blue-1' : 'text-light-1'}`}>
            {item.title}
          </div>
          <div className='text-18 fw-500'>{item.content}</div>
        </div>
      ))}
    </>
  );
};

export default Address;
