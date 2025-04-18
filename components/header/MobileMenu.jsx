'use client';

import Link from 'next/link';
import { useRouter } from 'next/router';
import { Menu, MenuItem, ProSidebarProvider, Sidebar } from 'react-pro-sidebar';
import { useSelector } from 'react-redux';
import ContactInfo from './ContactInfo';

const MobileMenu = () => {
  const router = useRouter();
  const token = useSelector((state) => state.auth.value.token);

  return (
    <>
      <div className='pro-header d-flex align-items-center justify-between border-bottom-light'>
        <Link href='/'>
          <img
            src='/img/general/xplorz-logo.png'
            alt='brand'
            style={{ width: '250px' }}
          />
        </Link>
        {/* End logo */}

        <div className='fix-icon' data-bs-dismiss='offcanvas' aria-label='Close'>
          <i className='icon icon-close'></i>
        </div>
        {/* icon close */}
      </div>
      {/* End pro-header */}

      <ProSidebarProvider>
        <Sidebar width='400' backgroundColor='#fff'>
          <Menu>
            <MenuItem
              component={
                <Link
                  href='/'
                  className={router.pathname === '/' ? 'menu-active-link' : ''}
                />
              }
            >
              Home
            </MenuItem>

            <MenuItem
              component={
                <Link
                  href='/flight/flight-list-v1'
                  className={
                    router.pathname === '/flight/flight-list-v1' ? 'menu-active-link' : ''
                  }
                />
              }
            >
              Flights
            </MenuItem>
            <MenuItem
              component={
                <Link
                  href='/hotel/hotel-list-v1'
                  className={
                    router.pathname === '/hotel/hotel-list-v1' ? 'menu-active-link' : ''
                  }
                />
              }
            >
              Hotels
            </MenuItem>
            <MenuItem
              component={
                <Link
                  href='/about'
                  className={router.pathname === '/about' ? 'menu-active-link' : ''}
                />
              }
            >
              About
            </MenuItem>
            {token !== '' && (
              <MenuItem
                component={
                  <Link
                    href='/dashboard/visa-applications'
                    className={
                      router.pathname === '/dashboard/visa-applications'
                        ? 'menu-active-link'
                        : ''
                    }
                  />
                }
              >
                Apply for Visa
              </MenuItem>
            )}
            {/* End Contact  Menu */}
          </Menu>
        </Sidebar>
      </ProSidebarProvider>

      <div className='mobile-footer px-20 py-5 border-top-light'></div>

      <div className='pro-footer'>
        <ContactInfo />
      </div>
      {/* End pro-footer */}
    </>
  );
};

export default MobileMenu;
