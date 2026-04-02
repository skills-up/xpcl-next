import {
  ArcElement,
  Chart as ChartJS,
  Legend,
  Tooltip,
} from 'chart.js';
import { useRouter } from 'next/router';
import { useEffect, useRef, useState } from 'react';
import { Doughnut } from 'react-chartjs-2';
import DatePicker, { DateObject } from 'react-multi-date-picker';
import Select from 'react-select';
import { getList } from '../../../../api/xplorzApi';
import { downloadCSV as CSVDownloader } from '../../../../utils/fileDownloader';
import { sendToast } from '../../../../utils/toastify';
import { FiDownload } from 'react-icons/fi';
import { jsonToCSV } from 'react-papaparse';

ChartJS.register(ArcElement, Tooltip, Legend);

const SpendAnalysisReport = () => {
  const date = new DateObject();
  const [dates, setDates] = useState([
    new DateObject()
      .setYear(date.year - (date.month.number < 4 ? 1 : 0))
      .setMonth(date.year < 2024 || (date.year == 2024 && date.month.number < 4) ? 4 : 4)
      .setDay('1'),
    new DateObject(),
  ]);

  const [organizations, setOrganizations] = useState([]);
  const [selectedOrganizations, setSelectedOrganizations] = useState([]);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  // Hover states for synchronization
  const [hoveredFlightIndex, setHoveredFlightIndex] = useState(null);
  const [hoveredMiscIndex, setHoveredMiscIndex] = useState(null);

  const flightChartRef = useRef(null);
  const miscChartRef = useRef(null);

  const router = useRouter();

  useEffect(() => {
    getOrganizations();
  }, []);

  const getOrganizations = async () => {
    const response = await getList('organizations', { is_client: 1 });
    if (response?.success) {
      setOrganizations(
        response.data.map((element) => ({
          value: element.id,
          label: element.name,
        }))
      );
    }
  };

  const getReport = async () => {
    if (!dates || dates.length < 2) {
      sendToast('error', 'Please select a date range', 4000);
      return;
    }
    if (selectedOrganizations.length === 0) {
      sendToast('error', 'Please select at least one organization', 4000);
      return;
    }

    setLoading(true);
    const response = await getList('reports/client-booking-analysis', {
      client_ids: selectedOrganizations.map((org) => org.value),
      start_date: dates[0].format('YYYY-MM-DD'),
      end_date: dates[1].format('YYYY-MM-DD'),
    });

    if (response?.success) {
      const sortedFlights = [...response.data.flights].sort(
        (a, b) => Number(b.total) - Number(a.total)
      );
      const sortedMisc = [...response.data.miscellaneous].sort(
        (a, b) => Number(b.total) - Number(a.total)
      );
      setData({
        flights: sortedFlights,
        miscellaneous: sortedMisc,
      });
    } else {
      sendToast(
        'error',
        response?.data?.message || response?.data?.error || 'Error getting report',
        4000
      );
    }
    setLoading(false);
  };

  const formatAsCurrency = (num) =>
    Number(num).toLocaleString('en-IN', {
      maximumFractionDigits: 2,
      style: 'currency',
      currency: 'INR',
    });

  const downloadFlightsCSV = () => {
    if (!data?.flights?.length) return;
    const csvData = data.flights.map((f) => ({
      Sector: f.sector || 'Unknown',
      'Total Spend': f.total,
    }));
    const total = data.flights.reduce((sum, f) => sum + Number(f.total), 0);
    csvData.push({ Sector: 'Total', 'Total Spend': total });
    CSVDownloader(
      jsonToCSV(csvData),
      `Flights-Spend-${dates[0].format('DD-MMM-YYYY')}-to-${dates[1].format(
        'DD-MMM-YYYY'
      )}.csv`
    );
  };

  const downloadMiscCSV = () => {
    if (!data?.miscellaneous?.length) return;
    const csvData = data.miscellaneous.map((m) => ({
      Type: m.miscellaneous_type || 'Unknown',
      'Total Spend': m.total,
    }));
    const total = data.miscellaneous.reduce((sum, m) => sum + Number(m.total), 0);
    csvData.push({ Type: 'Total', 'Total Spend': total });
    CSVDownloader(
      jsonToCSV(csvData),
      `Misc-Spend-${dates[0].format('DD-MMM-YYYY')}-to-${dates[1].format(
        'DD-MMM-YYYY'
      )}.csv`
    );
  };

  // Chart data generators
  const getChartData = (items, labelField, valueField, hoveredIndex) => {
    // Group small segments into "Others" for charts (Keep top 9)
    const MAX_SEGMENTS = 9;
    // Items are already sorted by total descending
    let chartItems = items;
    if (items.length > MAX_SEGMENTS) {
      const topItems = items.slice(0, MAX_SEGMENTS);
      const othersItems = items.slice(MAX_SEGMENTS);
      const othersTotal = othersItems.reduce(
        (sum, item) => sum + Number(item[valueField]),
        0
      );
      chartItems = [
        ...topItems,
        { [labelField]: 'Others', [valueField]: othersTotal, isOthers: true },
      ];
    }

    const labels = chartItems.map((item) => item[labelField]);
    const values = chartItems.map((item) => Number(item[valueField]));

    // Generate colors
    const backgroundColors = chartItems.map((_, index) => {
      const hue = (index * 137.5) % 360; // Use golden angle for distinct colors
      return `hsla(${hue}, 70%, 60%, ${
        hoveredIndex !== null && hoveredIndex !== index ? 0.3 : 1
      })`;
    });

    const borderColors = chartItems.map((_, index) => {
      const hue = (index * 137.5) % 360;
      return `hsla(${hue}, 70%, 50%, 1)`;
    });

    const borderWidths = chartItems.map((_, index) => (hoveredIndex === index ? 4 : 1));

    return {
      labels,
      datasets: [
        {
          data: values,
          backgroundColor: backgroundColors,
          borderColor: borderColors,
          borderWidth: borderWidths,
          hoverOffset: 10,
        },
      ],
    };
  };

  const chartOptions = (setHoverIndex) => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          boxWidth: 12,
          padding: 15,
        },
      },
      layout: {
        padding: 20,
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const label = context.label || '';
            const value = context.parsed || 0;
            const total = context.dataset.data.reduce((a, b) => a + Number(b), 0);
            const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : '0.0';
            return `${label}: ${formatAsCurrency(value)} (${percentage}%)`;
          },
        },
      },
    },
    onHover: (event, chartElement) => {
      if (chartElement.length > 0) {
        setHoverIndex(chartElement[0].index);
      } else {
        setHoverIndex(null);
      }
    },
  });

  return (
    <div className='col-12'>
      <div className='row mb-4 items-end d-print-none' id='report-filters-container'>
        <div className='col-lg-5 col-12 form-input-select'>
          <label>Select Organizations</label>
          <Select
            isMulti
            options={organizations}
            value={selectedOrganizations}
            onChange={setSelectedOrganizations}
            placeholder='All Organizations'
            className='basic-multi-select'
            classNamePrefix='select'
            styles={{
              control: (base) => ({
                ...base,
                minHeight: '52px',
                borderRadius: '8px',
                border: '1px solid #ced4da',
              }),
            }}
          />
        </div>
        <div className='col-lg-4 col-12 form-datepicker'>
          <label>Select Date Range</label>
          <DatePicker
            style={{ marginLeft: '0.5rem', fontSize: '1rem' }}
            inputClass='custom_input-picker'
            containerClassName='custom_container-picker w-100'
            value={dates}
            onChange={setDates}
            numberOfMonths={2}
            offsetY={10}
            range
            rangeHover
            format='DD MMMM YYYY'
          />
        </div>
        <div className='col-lg-3 col-12 lg:mt-20'>
          <button
            className='btn btn-primary w-100'
            style={{ height: '52px', borderRadius: '8px', fontWeight: '600' }}
            onClick={getReport}
            disabled={loading}
          >
            {loading ? 'Processing...' : 'Fetch Spend Data'}
          </button>
        </div>
      </div>

      <div className='print-only mt-20 mb-20 text-center d-none'>
        <h3>
          From {dates[0]?.format('DD MMM YYYY')} To {dates[1]?.format('DD MMM YYYY')}
        </h3>
      </div>

      {data ? (
        <div className='mt-40' id='printable-report'>
          {/* Flights Section */}
          <div className='row y-gap-40 items-center'>
            <div className='col-lg-7 col-12'>
              <div className='d-flex justify-between items-center mb-20'>
                <h5 className='text-18 fw-600 text-blue-1'>Flights Spend</h5>
                <button
                  className='btn btn-outline-primary btn-sm d-flex items-center gap-2 d-print-none'
                  onClick={downloadFlightsCSV}
                >
                  <FiDownload /> Download CSV
                </button>
              </div>
              <div className='overflow-scroll border-light rounded-4 printable-overflow'>
                <table className='table-3 -border-bottom col-12' style={{minHeight: 'unset'}}>
                  <thead className='bg-light-2'>
                    <tr>
                      <th>Sector</th>
                      <th className='text-right'>Total Spend</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.flights.length > 0 ? (
                      data.flights.map((flight, index) => {
                        // For the table, we show all, but we only highlight if index is within chart's top N or "Others"
                        const isOthersRow = index >= 9;
                        const displayIndex = index >= 9 ? 9 : index;
                        const isHovered = hoveredFlightIndex !== null && hoveredFlightIndex === displayIndex;

                        return (
                          <tr
                            key={index}
                            onMouseEnter={() => setHoveredFlightIndex(displayIndex)}
                            onMouseLeave={() => setHoveredFlightIndex(null)}
                            style={{
                              backgroundColor: isHovered ? '#f5f5f5' : 'transparent',
                              cursor: 'default',
                            }}
                          >
                            <td>{flight.sector || 'Unknown'}</td>
                            <td className='text-right'>
                              {formatAsCurrency(flight.total)}
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={2} className='text-center'>
                          No flight data found
                        </td>
                      </tr>
                    )}
                    {data.flights.length > 0 && (
                      <tr className='bg-light-2'>
                        <th className='fw-700'>Total</th>
                        <th className='text-right fw-700'>
                          {formatAsCurrency(
                            data.flights.reduce((sum, f) => sum + Number(f.total), 0)
                          )}
                        </th>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            <div className='col-lg-5 col-12'>
              <div className='h-400 printable-overflow'>
                {data.flights.length > 0 && (
                  <Doughnut
                    ref={flightChartRef}
                    data={getChartData(
                      data.flights,
                      'sector',
                      'total',
                      hoveredFlightIndex
                    )}
                    options={chartOptions(setHoveredFlightIndex)}
                  />
                )}
              </div>
            </div>
          </div>

          <hr className='my-60 no-print' />

          {/* Miscellaneous Section */}
          <div className='row y-gap-40 mb-40 items-center section-break'>
            <div className='col-lg-7 col-12'>
              <div className='d-flex justify-between items-center mb-20'>
                <h5 className='text-18 fw-600 text-blue-1'>Miscellaneous Spend</h5>
                <button
                  className='btn btn-outline-primary btn-sm d-flex items-center gap-2 d-print-none'
                  onClick={downloadMiscCSV}
                >
                  <FiDownload /> Download CSV
                </button>
              </div>
              <div className='overflow-scroll border-light rounded-4 printable-overflow'>
                <table className='table-3 -border-bottom col-12' style={{minHeight: 'unset'}}>
                  <thead className='bg-light-2'>
                    <tr>
                      <th>Type</th>
                      <th className='text-right'>Total Spend</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.miscellaneous.length > 0 ? (
                      data.miscellaneous.map((misc, index) => {
                        const isOthersRow = index >= 9;
                        const displayIndex = index >= 9 ? 9 : index;
                        const isHovered = hoveredMiscIndex !== null && hoveredMiscIndex === displayIndex;

                        return (
                          <tr
                            key={index}
                            onMouseEnter={() => setHoveredMiscIndex(displayIndex)}
                            onMouseLeave={() => setHoveredMiscIndex(null)}
                            style={{
                              backgroundColor: isHovered ? '#f5f5f5' : 'transparent',
                              cursor: 'default',
                            }}
                          >
                            <td>{misc.miscellaneous_type || 'Unknown'}</td>
                            <td className='text-right'>
                              {formatAsCurrency(misc.total)}
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={2} className='text-center'>
                          No miscellaneous data found
                        </td>
                      </tr>
                    )}
                    {data.miscellaneous.length > 0 && (
                      <tr className='bg-light-2'>
                        <th className='fw-700'>Total</th>
                        <th className='text-right fw-700'>
                          {formatAsCurrency(
                            data.miscellaneous.reduce((sum, m) => sum + Number(m.total), 0)
                          )}
                        </th>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            <div className='col-lg-5 col-12'>
              <div className='h-400 printable-overflow'>
                {data.miscellaneous.length > 0 && (
                  <Doughnut
                    ref={miscChartRef}
                    data={getChartData(
                      data.miscellaneous,
                      'miscellaneous_type',
                      'total',
                      hoveredMiscIndex
                    )}
                    options={chartOptions(setHoveredMiscIndex)}
                  />
                )}
              </div>
            </div>
          </div>

          <div className='row justify-center d-print-none mt-40' id='print-button-footer'>
            <div className='col-auto'>
              <button
                className='btn btn-success px-5'
                style={{ height: '52px', borderRadius: '8px', fontWeight: '600' }}
                onClick={() => window.print()}
              >
                Print Report
              </button>
            </div>
          </div>
        </div>
      ) : (
        !loading && (
          <div className='mt-60 text-center d-print-none'>
            <div className='text-20 fw-500'>No data to display.</div>
            <div className='text-15 text-light-1'>
              Select organizations and dates to generate the report.
            </div>
          </div>
        )
      )}

      <style jsx global>{`
        @media print {
          /* Hide EVERYTHING that isn't the report */
          header, 
          footer, 
          .header, 
          .sidebar, 
          .dashboard__sidebar, 
          .dashboard__main_header,
          .header-margin,
          .d-print-none,
          #report-filters-container,
          #print-button-footer,
          .accordion__button {
            display: none !important;
          }

          /* Reset layout containers */
          .dashboard__main,
          .dashboard__content,
          .dashboard,
          main,
          body {
            margin: 0 !important;
            padding: 0 !important;
            background: white !important;
          }

          /* Show print heading */
          .print-only {
            display: block !important;
          }

          /* Fix layout for print */
          .row {
            display: flex !important;
            flex-direction: row !important;
            flex-wrap: nowrap !important;
            width: 100% !important;
          }

          .col-lg-7 {
            width: 60% !important;
            padding-right: 20px !important;
          }

          .col-lg-5 {
            width: 40% !important;
          }

          /* Prevent table clipping */
          .printable-overflow {
            overflow: visible !important;
            border: none !important;
          }

          /* Prevent chart clipping */
          .h-400 {
            height: 400px !important;
            min-height: 400px !important;
            width: 100% !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
          }

          canvas {
            max-width: 100% !important;
            max-height: 100% !important;
            width: auto !important;
            height: auto !important;
          }

          /* Ensure page breaks don't cut charts */
          .section-break {
            page-break-inside: avoid !important;
            margin-bottom: 50px !important;
          }

          /* General spacing */
          .mt-40 {
            margin-top: 20px !important;
          }
        }
      `}</style>
    </div>
  );
};

export default SpendAnalysisReport;
