import { useEffect, useState } from 'react';
import DatePicker, { DateObject } from 'react-multi-date-picker';
import { getList } from '../../../../api/xplorzApi';
import { sendToast } from '../../../../utils/toastify';

const Journals = () => {
  const [workingCapitalStatement, setWorkingCapitalStatement] = useState(null);
  const [dates, setDates] = useState(new DateObject());
  const [netCash, setNetCash] = useState(0);

  const getWorkingCapitalStatement = async () => {
    const response = await getList('reports/working-capital-statement', {
      date: dates.format('YYYY-MM-DD'),
    });
    if (response?.success) {
      let data = response.data;
      // Calculating Totals
      let net = 0;
      for (let obj of Object.keys(data)) {
        if (Array.isArray(data[obj])) {
          let total = 0;
          for (let el of data[obj]) {
            total += +el?.balance;
          }
          data[obj] = { total, members: data[obj] };
          net += total;
        }
      }
      setNetCash(net);
      setWorkingCapitalStatement(data);
    } else {
      sendToast(
        'error',
        response?.data?.message ||
          response?.data?.error ||
          'Error getting working capital statement',
        4000
      );
    }
  };

  useEffect(() => {
    if (dates) getWorkingCapitalStatement();
  }, [dates]);

  const WorkingCapitalStatement = ({ data }) => {
    const [expand, setExpand] = useState([]);
    if (data) {
      return (
        <div className='working-capital-statement'>
          <table>
            <tbody>
              {Object.keys(data).map((element, index) => {
                if (+data[element]?.total)
                  return (
                    <>
                      <tr
                        key={index}
                        className='top'
                        onClick={() =>
                          setExpand((prev) => {
                            if (prev.includes(element)) {
                              prev = prev.filter((e) => e !== element);
                            } else {
                              prev.push(element);
                            }
                            return [...prev];
                          })
                        }
                      >
                        <td className='one'>{element}</td>
                        <td className='two'>
                          {(+data[element]?.total).toLocaleString('en-AE', {
                            maximumFractionDigits: 2,
                            style: 'currency',
                            currency: 'AED',
                          })}
                        </td>
                      </tr>
                      {!expand.includes(element) &&
                        data[element]?.members?.map((el, ind) => {
                          if (el.balance)
                            return (
                              <tr key={ind} className='member'>
                                <td className='one'>{el.name}</td>
                                <td className='two'>
                                  {el.balance.toLocaleString('en-AE', {
                                    maximumFractionDigits: 2,
                                    style: 'currency',
                                    currency: 'AED',
                                  })}
                                </td>
                              </tr>
                            );
                        })}
                    </>
                  );
              })}
              <tr className='net-cash'>
                <td className='one'>Net Cash Position</td>
                <td className='two'>
                  {netCash.toLocaleString('en-AE', {
                    maximumFractionDigits: 2,
                    style: 'currency',
                    currency: 'AED',
                  })}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      );
    }
  };

  return (
    <div className='col-12'>
      {/* Date Picker */}
      <div className='row mb-3 items-center justify-between mr-4'>
        <div className='col-lg-4 col-12 d-block ml-3 form-datepicker'>
          <label>Select Date</label>
          <DatePicker
            style={{ marginLeft: '0.5rem', fontSize: '1rem' }}
            inputClass='custom_input-picker'
            containerClassName='custom_container-picker'
            value={dates}
            onChange={setDates}
            numberOfMonths={1}
            offsetY={10}
            format='DD MMMM YYYY'
          />
        </div>
      </div>
      {/* Generated Balance Sheet */}
      <WorkingCapitalStatement data={workingCapitalStatement} />
    </div>
  );
};

export default Journals;
