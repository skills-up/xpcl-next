const ContactInfo = () => {
  const contactContent = [
    {
      id: 1,
      title: 'Phone',
      action: 'tel:+912266121000',
      text: '+91 22 66121000',
    },
    {
      id: 2,
      title: 'Need live support?',
      action: 'mailto:support@tripcentral.in',
      text: 'support[at]trippcentral.in',
    },
  ];
  return (
    <>
      {contactContent.map((item) => (
        <div className='mb-20' key={item.id}>
          <div className={'text-14'}>{item.title}</div>
          <a href={item.action} className='text-18 fw-500 text-dark-1 mt-5'>
            {item.text}
          </a>
        </div>
      ))}
    </>
  );
};

export default ContactInfo;
