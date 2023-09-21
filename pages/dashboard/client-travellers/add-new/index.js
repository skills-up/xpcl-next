import { useRouter } from 'next/router';
import { useState } from 'react';
import { useSelector } from 'react-redux';
import { AiOutlinePlus } from 'react-icons/ai';
import { BsTrash3 } from 'react-icons/bs';
import { createItem } from '../../../../api/xplorzApi';
import Seo from '../../../../components/common/Seo';
import Footer from '../../../../components/footer/dashboard-footer';
import Header from '../../../../components/header/dashboard-header';
import Sidebar from '../../../../components/sidebars/dashboard-sidebars';
import { sendToast } from '../../../../utils/toastify';

const AddNewClientTraveller = () => {
  const [travellerName, setTravellerName] = useState('');
  const [aliases, setAliases] = useState([{ value: '' }]);

  const token = useSelector((state) => state.auth.value.token);
  const router = useRouter();
  const client_id = useSelector((state) => state.auth.value.currentOrganization);

  const onSubmit = async (e) => {
    e.preventDefault();
    const data = {
      traveller_name: travellerName,
      client_id,
    };
    if (aliases.length > 0) {
      data.aliases = aliases.map((x) => x.value.trim());
    }
    // Checking if client id is not null
    const response = await createItem('client-travellers', data);
    if (response?.success) {
      sendToast('success', 'Created Traveller Successfully.', 4000);
      router.push('/dashboard/client-travellers');
    } else {
      sendToast(
        'error',
        response.data?.message || response.data?.error || 'Failed to Create Traveller.',
        4000
      );
    }
  };

  return (
    <>
      <Seo pageTitle='Create Traveller' />
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
                  <h1 className='text-30 lh-14 fw-600'>Create Traveller</h1>
                  <div className='text-15 text-light-1'>Add a new traveller.</div>
                </div>
                {/* End .col-12 */}
              </div>
              {/* End .row */}

              <div className='py-30 px-30 rounded-4 bg-white shadow-3'>
                <div>
                  <form onSubmit={onSubmit} className='row col-12 y-gap-20'>
                    <div>
                      <div className='form-input'>
                        <input
                          onChange={(e) => setTravellerName(e.target.value)}
                          value={travellerName}
                          placeholder=' '
                          type='text'
                        />
                        <label className='lh-1 text-16 text-light-1'>
                          Traveller Name
                        </label>
                      </div>
                    </div>
                    {/* Aliases */}
                    <div>
                      <h3>Aliases</h3>
                      <div>
                        {aliases.map((element, index) => (
                          <div key={index} className='d-flex my-2'>
                            <div className='form-input'>
                              <input
                                value={element.value}
                                onChange={(e) => {
                                  setAliases((prev) => {
                                    prev[index].value = e.target.value;
                                    return [...prev];
                                  });
                                }}
                                type='text'
                                placeholder=' '
                              />
                              <label className='lh-1 text-16 text-light-1'>
                                Add Alias {index + 1}
                              </label>
                            </div>
                            {index !== 0 && (
                              <button
                                className='btn btn-outline-danger ml-10 px-20'
                                onClick={(e) => {
                                  e.preventDefault();
                                  setAliases((prev) => {
                                    prev.splice(index, 1);
                                    return [...prev];
                                  });
                                }}
                              >
                                <BsTrash3 />
                              </button>
                            )}
                            {index + 1 === aliases?.length && (
                              <button
                                className='btn btn-outline-success ml-10 px-20'
                                onClick={() => {
                                  setAliases((prev) => [...prev, { value: '' }]);
                                }}
                              >
                                <AiOutlinePlus />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className='d-inline-block'>
                      <button
                        type='submit'
                        className='button h-50 px-24 -dark-1 bg-blue-1 text-white'
                      >
                        Create Traveller
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

export default AddNewClientTraveller;
