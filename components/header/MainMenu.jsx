import Link from 'next/link';

import { useRouter } from 'next/router';
import { useSelector } from 'react-redux';

const MainMenu = ({ style = '' }) => {
  const router = useRouter();
  const token = useSelector((state) => state.auth.value.token);

  return (
    <nav className='menu js-navList'>
      <ul className={`menu__nav ${style} -is-active`}>
        {/* <li
          className={`${
            isActiveParentChaild(homeItems, router.asPath) ? 'current' : ''
          } menu-item-has-children`}
        >
          <a href='#'>
            <span className='mr-10'>Home</span>
            <i className='icon icon-chevron-sm-down' />
          </a>
          <ul className='subnav'>
            {homeItems.map((menu, i) => (
              <li
                key={i}
                className={isActiveLink(menu.routePath, router.asPath) ? 'current' : ''}
              >
                <Link href={menu.routePath}>{menu.name}</Link>
              </li>
            ))}
          </ul>
        </li> */}

        <li className={router.pathname === '/' ? 'current' : ''}>
          <Link href='/'>Home</Link>
        </li>
        {/* End home page menu */}

        {/* <li className='menu-item-has-children -has-mega-menu'>
          <a href='#'>
            <span className='mr-10'>Categories</span>
            <i className='icon icon-chevron-sm-down' />
          </a>
          <div className='mega'>
            <CategoriesMegaMenu />
          </div>
        </li> */}
        {/* End categories menu items */}

        {/* <li className={router.pathname === '/destinations' ? 'current' : ''}>
          <Link href='/destinations'>Destinations</Link>
        </li> */}

        <li className={router.pathname === '/flight/flight-list-v1' ? 'current' : ''}>
          <Link href='/flight/flight-list-v1'>Flights</Link>
        </li>

        <li className={router.pathname === '/hotel/hotel-list-v1' ? 'current' : ''}>
          <Link href='/hotel/hotel-list-v1'>Hotels</Link>
        </li>

        {/* <li
          className={`${
            isActiveParentChaild(blogItems, router.asPath) ? 'current' : ''
          } menu-item-has-children`}
        >
          <a href='#'>
            <span className='mr-10'>Blog</span>
            <i className='icon icon-chevron-sm-down' />
          </a>
          <ul className='subnav'>
            {blogItems.map((menu, i) => (
              <li
                key={i}
                className={isActiveLink(menu.routePath, router.asPath) ? 'current' : ''}
              >
                <Link href={menu.routePath}>{menu.name}</Link>
              </li>
            ))}
          </ul>
        </li> */}
        {/* End blogIems */}

        {/* <li
          className={`${
            isActiveParentChaild(pageItems, router.asPath) ? 'current' : ''
          } menu-item-has-children`}
        >
          <a href='#'>
            <span className='mr-10'>Pages</span>
            <i className='icon icon-chevron-sm-down' />
          </a>
          <ul className='subnav'>
            {pageItems.map((menu, i) => (
              <li
                key={i}
                className={isActiveLink(menu.routePath, router.asPath) ? 'current' : ''}
              >
                <Link href={menu.routePath}>{menu.name}</Link>
              </li>
            ))}
          </ul>
        </li> */}
        {/* End pages items */}

        {/* <li
          className={`${
            isActiveParentChaild(dashboardItems, router.asPath) ? 'current' : ''
          } menu-item-has-children`}
        >
          <a href='#'>
            <span className='mr-10'>Dashboard</span>
            <i className='icon icon-chevron-sm-down' />
          </a>
          <ul className='subnav '>
            {dashboardItems.map((menu, i) => (
              <li
                key={i}
                className={isActiveLink(menu.routePath, router.asPath) ? 'current' : ''}
              >
                <Link href={menu.routePath}>{menu.name}</Link>
              </li>
            ))}
          </ul>
        </li> */}

        {/* <li className={router.pathname === '/about' ? 'current' : ''}>
          <Link href='/about'>About</Link>
        </li> */}
        {token !== '' && (
          <li
            className={
              router.pathname === '/dashboard/visa-applications' ? 'current' : ''
            }
          >
            <Link href='/dashboard/visa-applications'>Apply for Visa</Link>
          </li>
        )}
      </ul>
    </nav>
  );
};

export default MainMenu;
