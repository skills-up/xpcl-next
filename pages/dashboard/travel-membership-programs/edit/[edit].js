import Seo from '../../../../components/common/Seo';
import Footer from '../../../../components/footer/dashboard-footer';
import Header from '../../../../components/header/dashboard-header';
import Sidebar from '../../../../components/sidebars/dashboard-sidebars';
import { useSelector } from 'react-redux';
import { useRouter } from 'next/router';
import { sendToast } from '../../../../utils/toastify';
import { useEffect, useState } from 'react';
import { createItem, getItem, getList, updateItem } from '../../../../api/xplorzApi';
import ReactSwitch from 'react-switch';
import Select from 'react-select';

const UpdateFrequentFlierProgram = () => {
  const [code, setCode] = useState('');
  const [program, setProgram] = useState('');

  const options = ['Airline', 'Hotel', 'Car Rental', 'Global Entry'];
  const [type, setType] = useState(null);
  const token = useSelector((state) => state.auth.value.token);
  const router = useRouter();

  useEffect(() => {
    getData();
  }, [router.isReady]);

  const getData = async () => {
    if (router.query.edit) {
      const response = await getItem('travel-membership-programs', router.query.edit);
      if (response?.success) {
        for (let opt of options) {
          if (response.data?.type === opt) setType({ label: opt, value: opt });
        }
        setCode(response.data?.code);
        setProgram(response.data?.program);
      } else {
        sendToast(
          'error',
          response.data?.message ||
            response.data?.error ||
            'Failed to Fetch Request Travel Membership Program.',
          4000
        );
        router.push('/dashboard/travel-membership-programs');
      }
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!type?.value) {
      sendToast('error', 'Type is mandatory.', 4000);
      return;
    }
    const response = await updateItem('travel-membership-programs', router.query.edit, {
      type: type.value,
      code,
      program,
    });
    if (response?.success) {
      sendToast('success', 'Updated Travel Membership Program Successfully.', 4000);
      router.push('/dashboard/travel-membership-programs');
    } else {
      sendToast(
        'error',
        response.data?.message ||
          response.data?.error ||
          'Failed to Update Travel Membership Program.',
        4000
      );
    }
  };

  return (
    <>
      <Seo pageTitle='Update Travel Membership Program' />
      {/* End Page Title */}

      <div className='header-margin'></div>

      <Header />
      {/* End dashboard-header */}

      <div className='dashboard'>
        <div className='dashboard__sidebar bg-white scroll-bar-1'>
          <Sidebar />
          {/* End sidebar */}
        </div>
        {/* End dashboard__sidebar */}

        <div className='dashboard__main'>
          <div className='dashboard__content d-flex flex-column justify-between bg-light-2'>
            <div>
              <div className='row y-gap-20 justify-between items-end pb-60 lg:pb-40 md:pb-32'>
                <div className='col-12'>
                  <h1 className='text-30 lh-14 fw-600'>
                    Update Travel Membership Program
                  </h1>
                  <div className='text-15 text-light-1'>
                    Update an existing travel membership program.
                  </div>
                </div>
                {/* End .col-12 */}
              </div>
              {/* End .row */}

              <div className='py-30 px-30 rounded-4 bg-white shadow-3'>
                <div>
                  <form onSubmit={onSubmit} className='row col-12 y-gap-20'>
                    <div className='form-input-select col-12'>
                      <label>
                        Membership Type<span className='text-danger'>*</span>
                      </label>
                      <Select
                        options={options.map((el) => ({ label: el, value: el }))}
                        value={type}
                        onChange={(id) => setType(id)}
                      />
                    </div>
                    <div className='col-12'>
                      <div className='form-input'>
                        <input
                          onChange={(e) => setCode(e.target.value)}
                          value={code}
                          placeholder=' '
                          type='text'
                          maxLength={2}
                          required
                        />
                        <label className='lh-1 text-16 text-light-1'>
                          Code<span className='text-danger'>*</span>
                        </label>
                      </div>
                    </div>
                    <div className='col-12'>
                      <div className='form-input'>
                        <input
                          onChange={(e) => setProgram(e.target.value)}
                          value={program}
                          placeholder=' '
                          type='text'
                          required
                        />
                        <label className='lh-1 text-16 text-light-1'>
                          Program<span className='text-danger'>*</span>
                        </label>
                      </div>
                    </div>
                    <div className='d-inline-block'>
                      <button
                        type='submit'
                        className='button h-50 px-24 -dark-1 bg-blue-1 text-white'
                      >
                        Update Travel Membership Program
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>

            <Footer />
          </div>
          {/* End .dashboard__content */}
        </div>
        {/* End dashbaord content */}
      </div>
      {/* End dashbaord content */}
    </>
  );
};

export default UpdateFrequentFlierProgram;
