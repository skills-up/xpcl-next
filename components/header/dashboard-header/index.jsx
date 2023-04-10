import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { checkUser } from '../../../utils/checkTokenValidity';
import MainMenu from '../MainMenu';
import MobileMenu from '../MobileMenu';
import Select from 'react-select';
import { sendToast } from '../../../utils/toastify';
import { setCurrentOrganization } from '../../../features/auth/authSlice';
import { customAPICall, getList } from '../../../api/xplorzApi';

const HeaderDashBoard = () => {
  const [navbar, setNavbar] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [organizations, setOrganizations] = useState([]);
  const [organizationID, setOrganizationsID] = useState(null);

  const dispatch = useDispatch();
  const userOrganization = useSelector((state) => state.auth.value.organization);
  const currentOrganization = useSelector(
    (state) => state.auth.value.currentOrganization
  );
  const router = useRouter();
  const token = useSelector((state) => state.auth.value.token);

  useEffect(() => {
    window.addEventListener('scroll', changeBackground);
    // Checking if user is still valid
    if (token !== '') {
      checkUser(router, dispatch);
    } else {
      // If not logged in redirect to login page
    }
    // Getting organization list
    getOrganizations();
  }, []);

  const getOrganizations = async () => {
    const response = await getList('organizations');
    if (response?.success) {
      setOrganizations(
        response.data.map((element) => ({ value: element.id, label: element.name }))
      );
      // Setting organization ID
      for (let org of response.data) {
        if (org.id === currentOrganization) {
          setOrganizationsID({ value: org.id, label: org.name });
        }
      }
    } else {
      sendToast(
        'error',
        response.data?.message || response.data?.error || 'Unable to fetch organizations',
        4000
      );
      router.push('/');
    }
  };

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  const changeBackground = () => {
    if (window.scrollY >= 10) {
      setNavbar(true);
    } else {
      setNavbar(false);
    }
  };

  useEffect(() => {
    window.addEventListener('scroll', changeBackground);
    const body = document.querySelector('body');
    if (isOpen) {
      body.classList.add('-is-sidebar-open');
    } else {
      body.classList.remove('-is-sidebar-open');
    }
  }, [isOpen]);

  return (
    <>
      <header className={`header -dashboard ${navbar ? 'is-sticky bg-white' : ''}`}>
        <div className='header__container px-30 sm:px-20'>
          <div className='-left-side'>
            <Link href='/' className='header-logo'>
              <img src='/img/general/logo-dark.svg' alt='logo icon' />
            </Link>
            {/* End logo */}
          </div>
          {/* End _left-side */}

          <div className='row justify-between items-center lg:pl-20'>
            <div className='col-auto'>
              <div className='d-flex items-center'>
                <button className='d-flex' onClick={handleToggle}>
                  <i className='icon-menu-2 text-20'></i>
                </button>

                {/* Search */}
                {/* <div className='single-field relative d-flex items-center md:d-none ml-30'>
                  <input
                    className='pl-50 border-light text-dark-1 h-50 rounded-8'
                    type='email'
                    placeholder='Search'
                  />
                  <button className='absolute d-flex items-center h-full'>
                    <i className='icon-search text-20 px-15 text-dark-1'></i>
                  </button>
                </div> */}
                {/* Organization Field */}
                {userOrganization === 1 && (
                  <div
                    className='row items-center md:d-none ml-30'
                    style={{ width: '20vw' }}
                  >
                    <Select
                      options={organizations}
                      defaultValue={organizationID}
                      value={organizationID}
                      placeholder='Select Organization'
                      onChange={async (id) => {
                        const response = await customAPICall('auth/switch', 'post', {
                          organization_id: id.value,
                        });
                        if (response?.success) {
                          setOrganizationsID(id);
                          dispatch(
                            setCurrentOrganization({ currentOrganization: id.value })
                          );
                        } else {
                          sendToast(
                            'error',
                            response.data?.message ||
                              response.data?.error ||
                              'Error occured while changing organization',
                            4000
                          );
                        }
                      }}
                    />
                  </div>
                )}
              </div>
            </div>
            {/* End .col-auto */}

            <div className='col-auto'>
              <div className='d-flex items-center'>
                <div className='header-menu'>
                  <div className='header-menu__content'>
                    <MainMenu style='text-dark-1' />
                  </div>
                </div>
                {/* End header-menu */}

                {/* Messages (Email) + Notification */}

                {/* <div className='row items-center x-gap-5 y-gap-20 pl-20 lg:d-none'>
                  <div className='col-auto'>
                    <button className='button -blue-1-05 size-50 rounded-22 flex-center'>
                      <i className='icon-email-2 text-20'></i>
                    </button>
                  </div> */}
                {/* End col-auto */}

                {/* <div className='col-auto'>
                    <button className='button -blue-1-05 size-50 rounded-22 flex-center'>
                      <i className='icon-notification text-20'></i>
                    </button>
                  </div> */}
                {/* End col-auto */}
                {/* </div> */}
                {/* End .row */}

                {/* <div className='pl-15'>
                  <Image
                    width={50}
                    height={50}
                    src='/img/avatars/3.png'
                    alt='image'
                    className='size-50 rounded-22 object-cover'
                  />
                </div> */}

                <div className='d-none xl:d-flex x-gap-20 items-center pl-20'>
                  <div>
                    <button
                      className='d-flex items-center icon-menu text-20'
                      data-bs-toggle='offcanvas'
                      aria-controls='mobile-sidebar_menu'
                      data-bs-target='#mobile-sidebar_menu'
                    ></button>
                  </div>

                  <div
                    className='offcanvas offcanvas-start  mobile_menu-contnet '
                    tabIndex='-1'
                    id='mobile-sidebar_menu'
                    aria-labelledby='offcanvasMenuLabel'
                    data-bs-scroll='true'
                  >
                    <MobileMenu />
                    {/* End MobileMenu */}
                  </div>
                </div>
              </div>
              {/* End -flex items-center */}
            </div>
            {/* End col-auto */}
          </div>
          {/* End .row */}
        </div>
        {/* End header_container */}
      </header>
      {/* End header */}
    </>
  );
};

export default HeaderDashBoard;
