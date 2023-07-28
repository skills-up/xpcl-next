import { useEffect, useState } from 'react';

const Overview = ({ text }) => {
  const [final, setFinal] = useState(null);
  useEffect(() => {
    if (text) {
      try {
        const a = JSON.parse(text);
        setFinal(
          <ul>
            {Object.entries(a).map(([key, value], index) => (
              <li className='mb-10'>
                <h5>
                  {key.split('_').map((k) => (
                    <>{k.charAt(0).toUpperCase() + k.slice(1).toLowerCase() + ' '}</>
                  ))}
                </h5>
                <span className='text-secondary'>{value}</span>
              </li>
            ))}
          </ul>
        );
      } catch (err) {
        try {
          setFinal(<div dangerouslySetInnerHTML={{ __html: text }} />);
        } catch (err2) {
          setFinal(text);
        }
      }
    }
  }, []);
  return (
    <>
      <h3 className='text-22 fw-500 pt-40 border-top-light'>Overview</h3>
      <p className='text-dark-1  mt-20'>{final}</p>
      {/* <a href='#' className='d-block text-14 text-blue-1 fw-500 underline mt-10'>
        Show More
      </a> */}
    </>
  );
};

export default Overview;
