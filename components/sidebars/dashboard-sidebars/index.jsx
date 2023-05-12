import Image from 'next/image';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getList } from '../../../api/xplorzApi';
import { store } from '../../../app/store';
import Select from 'react-select';

const Sidebar = () => {
  const [organizations, setOrganizations] = useState([]);
  const [organizationID, setOrganizationsID] = useState(null);

  const dispatch = useDispatch();
  const userOrganization = useSelector((state) => state.auth.value.organization);
  const currentOrganization = useSelector(
    (state) => state.auth.value.currentOrganization
  );

  useEffect(() => {
    getOrganizations();
  });

  const getOrganizations = async () => {
    const response = await getList('organizations', { is_client: 1 });
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

  const sidebarData = [
    {
      icon: '/img/dashboard/sidebar/booking.svg',
      title: 'Manage Hotel',
      permissions: [],
      links: [
        { title: 'All Hotel', href: '#' },
        { title: 'Add Hotel', href: '#' },
        { title: 'Recovery', href: '#' },
      ],
    },
    {
      icon: '/img/dashboard/sidebar/booking.svg',
      title: 'Journal',
      permissions: [],
      links: [
        { title: 'Journals', href: '/dashboard/journals' },
        { title: 'Ledger', href: '/dashboard/journals/ledger' },
      ],
    },
    {
      icon: '/img/dashboard/sidebar/map.svg',
      title: 'Manage Tour',
      permissions: [],
      links: [
        { title: 'All Tour', href: '#' },
        { title: 'Add Tour', href: '#' },
        { title: 'Recovery', href: '#' },
      ],
    },
    {
      icon: '/img/dashboard/sidebar/sneakers.svg',
      title: 'Manage Activity',
      permissions: [],
      links: [
        { title: 'All Activity', href: '#' },
        { title: 'Add Activity', href: '#' },
        { title: 'Recovery', href: '#' },
      ],
    },
    {
      icon: '/img/dashboard/sidebar/house.svg',
      title: 'Manage Holiday Rental',
      permissions: [],
      links: [
        {
          title: 'All Holiday Rental',
          href: '#',
        },
        {
          title: 'Add Holiday Rental',
          href: '#',
        },
        {
          title: 'Recovery',
          href: '#',
        },
      ],
    },
    {
      icon: '/img/dashboard/sidebar/taxi.svg',
      title: 'Manage Car',
      permissions: [],
      links: [
        {
          title: 'All Car',
          href: '#',
        },
        {
          title: 'Add Car',
          href: '#',
        },
        {
          title: 'Recovery',
          href: '#',
        },
      ],
    },
    {
      icon: '/img/dashboard/sidebar/canoe.svg',
      title: 'Manage Cruise',
      permissions: [],
      links: [
        {
          title: 'All Cruise',
          href: '#',
        },
        {
          title: 'Add Cruise',
          href: '#',
        },
        {
          title: 'Recovery',
          href: '#',
        },
      ],
    },
    {
      icon: '/img/dashboard/sidebar/airplane.svg',
      title: 'Manage Flights',
      permissions: [],
      links: [
        {
          title: 'All Flights',
          href: '#',
        },
        {
          title: 'Add Flights',
          href: '#',
        },
        {
          title: 'Recovery',
          href: '#',
        },
      ],
    },
    {
      icon: '/img/dashboard/sidebar/gear.svg',
      title: 'User Management',
      permissions: ['users.index'],
      links: [
        {
          title: 'Users',
          href: '/dashboard/users',
        },
        {
          title: 'Roles',
          href: '/dashboard/roles',
        },
        {
          title: 'Permissions',
          href: '/dashboard/permissions',
        },
      ],
    },
  ];

  return (
    <>
      <div className='sidebar -dashboard' id='vendorSidebarMenu'>
        {userOrganization === 1 && (
          <div className='row items-center mb-20'>
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
                  dispatch(setCurrentOrganization({ currentOrganization: id.value }));
                  window.location.reload();
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
        <div className='sidebar__item '>
          <a
            href='/dashboard'
            className='sidebar__button d-flex items-center text-15 lh-1 fw-500'
          >
            <Image
              width={20}
              height={20}
              src='/img/dashboard/sidebar/compass.svg'
              alt='image'
              className='mr-15'
            />
            Dashboard
          </a>
        </div>
        {/* End accordion__item */}

        <div className='sidebar__item '>
          <a
            href='/dashboard/organizations'
            className='sidebar__button d-flex items-center text-15 lh-1 fw-500'
          >
            <Image
              width={20}
              height={20}
              src='/img/dashboard/sidebar/booking.svg'
              alt='image'
              className='mr-15'
            />
            Organizations
          </a>
        </div>
        {/* End accordion__item */}

        {sidebarData.map((item, index) => {
          const permissions = store.getState().auth.value.permissions;
          const render = (
            <div className='sidebar__item' key={index}>
              <div className='accordion -db-sidebar js-accordion'>
                <div className='accordion__item'>
                  <div
                    className='accordion__button'
                    data-bs-toggle='collapse'
                    data-bs-target={`#sidebarItem${index}`}
                  >
                    <div className='sidebar__button col-12 d-flex items-center justify-between'>
                      <div className='d-flex items-center text-15 lh-1 fw-500'>
                        <Image
                          width={20}
                          height={20}
                          src={item.icon}
                          alt='image'
                          className='mr-10'
                        />
                        {item.title}
                      </div>
                      <div className='icon-chevron-sm-down text-7' />
                    </div>
                  </div>
                  <div
                    id={`sidebarItem${index}`}
                    className='collapse'
                    data-bs-parent='#vendorSidebarMenu'
                  >
                    <ul className='list-disc pt-15 pb-5 pl-40'>
                      {item.links.map((link, linkIndex) => (
                        <li key={linkIndex}>
                          <a href={link.href} className='text-15'>
                            {link.title}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          );
          if (item.permissions.length > 0) {
            let hasAllElements = true;
            for (let perm of item.permissions) {
              if (!permissions.includes(perm)) {
                hasAllElements = false;
                break;
              }
            }
            if (hasAllElements) return render;
            else return;
          } else {
            return render;
          }
        })}

        <div className='sidebar__item '>
          <a href='#' className='sidebar__button d-flex items-center text-15 lh-1 fw-500'>
            <Image
              width={20}
              height={20}
              src='/img/dashboard/sidebar/log-out.svg'
              alt='image'
              className='mr-15'
            />
            Logout
          </a>
        </div>
        {/* End accordion__item */}
      </div>
    </>
  );
};

export default Sidebar;
