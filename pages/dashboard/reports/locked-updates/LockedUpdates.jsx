import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { getList } from '../../../../api/xplorzApi';
import Datatable from '../../../../components/datatable/Datatable';
import { sendToast } from '../../../../utils/toastify';

const LockedUpdates = () => {
  const [data, setData] = useState([]);

  const router = useRouter();

  const getEntries = async () => {
    const response = await getList('reports/locked-updated');
    if (response?.success) {
      setData(response.data);
    } else {
      sendToast(
        'error',
        response?.data?.message || response?.data?.error || 'Error getting entries',
        4000
      );
    }
  };

  useEffect(() => {
    getEntries();
  }, [router.isReady]);

  const columns = [
    {
      Header: 'Date',
      accessor: 'date',
      Cell: (data) => {
        return (
          <span>
            {new Date(data.row.original.date).toLocaleString('en-IN', {
              dateStyle: 'medium',
            })}
          </span>
        );
      },
    },
    {
      Header: 'Number',
      accessor: 'reference',
    },
    {
      Header: 'Particulars',
      accessor: 'narration',
    },
  ];

  return (
    <div className='col-12'>
      <Datatable columns={columns} data={data} />
    </div>
  );
};

export default LockedUpdates;
