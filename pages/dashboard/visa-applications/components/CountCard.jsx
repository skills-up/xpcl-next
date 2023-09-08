import { useState, useEffect } from "react";
import { getItem } from "../../../../api/xplorzApi";
import { sendToast } from '../../../../utils/toastify';

const CountCard = ({status = 'Pending'}) => {
  const [count, setCount] = useState(0);

  const getStatusCount = async () => {
    const response = await getItem('visa-applications', 'status/count?status='+status);
    if (response?.success) {
      setCount(response.data.count);
    } else {
      sendToast(
        'error',
        response?.data?.message ||
          response?.data?.error ||
          'Error getting visa applications count for '+status+' status',
        4000
      );
    }
  }

  useEffect(() => {
    getStatusCount();
  }, []);

  return (
    <div className="col-xl-3 col-md-6">
      <div className="py-30 px-30 rounded-4 bg-white shadow-3">
        <a className="row y-gap-20 justify-between items-center" href={`/dashboard/visa-applications?status=${status}`}>
          <div className="col-auto">
            <div className="fw-500 lh-14">{status}</div>
            <div className="text-26 lh-16 fw-600 mt-5">{count}</div>
            <div className="text-15 lh-14 text-light-1 mt-5">
              Visa Applications
            </div>
          </div>
          <div className="col-auto">
            <img src="/img/dashboard/icons/3.svg" alt="icon" />
          </div>
        </a>
      </div>
    </div>
  );
};

export default CountCard;
