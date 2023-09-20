import Image from 'next/image';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { customAPICall, getList } from '../../../api/xplorzApi';
import { store } from '../../../app/store';
import Select from 'react-select';
import {
  setCurrentOrganization,
  setInitialUserState,
} from '../../../features/auth/authSlice';
import { sendToast } from '../../../utils/toastify';
import { useRouter } from 'next/router';
import { setClientOrganizations } from '../../../features/apis/apisSlice';
import { AiOutlinePlus } from 'react-icons/ai';

const Sidebar = () => {
  const [organizationID, setOrganizationsID] = useState(null);

  const organizations = useSelector((state) => state.apis.value.clientOrganizations);
  const token = useSelector((state) => state.auth.value.token);
  const dispatch = useDispatch();
  const router = useRouter();
  const permissions = useSelector((state) => state.auth.value.permissions);
  const userOrganization = useSelector((state) => state.auth.value.organization);
  const currentOrganization = useSelector(
    (state) => state.auth.value.currentOrganization
  );

  useEffect(() => {
    getOrganizations();
  }, []);

  const getOrganizations = async () => {
    // If no session storage -> session not checked so checking session
    // If session storage -> client organization would exist so fetching that
    if (!sessionStorage.getItem('client-organizations-checked')) {
      const response = await getList('organizations', { is_client: 1 });
      if (response?.success) {
        // Setting organization ID
        await setOrg(response.data);
        dispatch(
          setClientOrganizations({
            clientOrganizations: await response.data.map((element) => ({
              value: element.id,
              label: element.name,
            })),
          })
        );
        sessionStorage.setItem('client-organizations-checked', Date.now());
      } else {
        sendToast(
          'error',
          response.data?.message ||
            response.data?.error ||
            'Unable to fetch organizations',
          4000
        );
      }
    } else {
      // Converting {label, value} -> {id,  name}
      await setOrg(
        organizations.map((element) => ({ id: element.value, name: element.label }))
      );
    }
  };

  const setOrg = async (data) => {
    for (let org of data) {
      if (org.id === currentOrganization) {
        setOrganizationsID({ value: org.id, label: org.name });
      }
    }
  };

  const sidebarData = [
    {
      icon: '/img/dashboard/sidebar/booking.svg',
      title: 'Travel',
      permissions: [],
      links: [
        { title: 'Travellers', href: '/dashboard/client-travellers' },
        {
          title: 'Booking History',
          href: '/dashboard/bookings/history',
        },
      ],
    },
    {
      icon: '/img/dashboard/sidebar/booking.svg',
      title: 'Accounting',
      permissions: [],
      links: [
        {
          title: 'Invoicing',
          href: '/dashboard/bookings',
          submenus: [
            {
              title: 'Add Domestic',
              href: '/dashboard/bookings/add-new?type=domestic',
              icon: <AiOutlinePlus />,
            },
            {
              title: 'Add International',
              href: '/dashboard/bookings/add-new?type=international',
              icon: <AiOutlinePlus />,
            },
            {
              title: 'Add Miscellaneous',
              href: '/dashboard/bookings/add-new?type=misc',
              icon: <AiOutlinePlus />,
            },
          ],
        },
        { title: 'Refunds', href: '/dashboard/refunds' },
        { title: 'Partial Refunds', href: '/dashboard/partial-refunds' },
        {
          title: 'Transactions',
          href: '/dashboard/payment-receipts',
          submenus: [
            {
              title: 'Add Payment',
              href: '/dashboard/payment-receipts/add-new?type=Payment',
              icon: <AiOutlinePlus />,
            },
            {
              title: 'Add Receipt',
              href: '/dashboard/payment-receipts/add-new?type=Receipt',
              icon: <AiOutlinePlus />,
            },
            {
              title: 'Add Voucher',
              href: '/dashboard/payment-receipts/add-new?type=Voucher',
              icon: <AiOutlinePlus />,
            },
          ],
        },
      ],
    },
    {
      icon: '/img/dashboard/sidebar/booking.svg',
      title: 'MIS / Reports / Admin',
      permissions: [],
      links: [
        {
          title: 'Account Categories',
          href: '/dashboard/account-categories',
        },
        {
          title: 'Accounts',
          href: '/dashboard/accounts',
        },
        {
          title: 'Journals',
          href: '/dashboard/journals',
        },
        {
          title: 'Ledgers',
          href: '/dashboard/journals/ledger',
          submenus: [
            {
              title: 'Mail Client Ledgers',
              href: '/dashboard/journals/mail-ledger',
              icon: <AiOutlinePlus />,
            }
          ]
        },
        {
          title: 'Balance Sheet',
          href: '/dashboard/reports/balance-sheet',
        },
        {
          title: 'Income Statement',
          href: '/dashboard/reports/income-statement',
        },
        {
          title: 'Working Capital Statement',
          href: '/dashboard/reports/working-capital-statement',
        },
        {
          title: 'Close Accounts',
          href: '/dashboard/reports/close-books',
        },
      ],
    },
    {
      icon: '/img/dashboard/sidebar/booking.svg',
      title: 'Organizations',
      permissions: [],
      links: [
        {
          title: 'Organizations',
          href: '/dashboard/organizations',
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
    {
      icon: '/img/dashboard/sidebar/booking.svg',
      title: 'Miscellaneous',
      permissions: [],
      links: [
        {
          title: 'Airports',
          href: '/dashboard/airports',
        },
        {
          title: 'Commission Rules',
          href: '/dashboard/commission-rules',
        },
      ],
    },
    // {
    //   icon: '/img/dashboard/sidebar/sneakers.svg',
    //   title: 'Manage Activity',
    //   permissions: [],
    //   links: [
    //     { title: 'All Activity', href: '#' },
    //     { title: 'Add Activity', href: '#' },
    //     { title: 'Recovery', href: '#' },
    //   ],
    // },
    // {
    //   icon: '/img/dashboard/sidebar/house.svg',
    //   title: 'Manage Holiday Rental',
    //   permissions: [],
    //   links: [
    //     {
    //       title: 'All Holiday Rental',
    //       href: '#',
    //     },
    //     {
    //       title: 'Add Holiday Rental',
    //       href: '#',
    //     },
    //     {
    //       title: 'Recovery',
    //       href: '#',
    //     },
    //   ],
    // },
    // {
    //   icon: '/img/dashboard/sidebar/taxi.svg',
    //   title: 'Manage Car',
    //   permissions: [],
    //   links: [
    //     {
    //       title: 'All Car',
    //       href: '#',
    //     },
    //     {
    //       title: 'Add Car',
    //       href: '#',
    //     },
    //     {
    //       title: 'Recovery',
    //       href: '#',
    //     },
    //   ],
    // },
    // {
    //   icon: '/img/dashboard/sidebar/canoe.svg',
    //   title: 'Manage Cruise',
    //   permissions: [],
    //   links: [
    //     {
    //       title: 'All Cruise',
    //       href: '#',
    //     },
    //     {
    //       title: 'Add Cruise',
    //       href: '#',
    //     },
    //     {
    //       title: 'Recovery',
    //       href: '#',
    //     },
    //   ],
    // },
    // {
    //   icon: '/img/dashboard/sidebar/airplane.svg',
    //   title: 'Manage Flights',
    //   permissions: [],
    //   links: [
    //     {
    //       title: 'All Flights',
    //       href: '#',
    //     },
    //     {
    //       title: 'Add Flights',
    //       href: '#',
    //     },
    //     {
    //       title: 'Recovery',
    //       href: '#',
    //     },
    //   ],
    // },
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
                  // Giving redux persist time to update
                  setTimeout(() => router.reload(), 1000);
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

        {sidebarData.map((item, index) => {
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
                          {link?.submenus && (
                            <ul className='ml-10'>
                              {link.submenus.map((sub, subIndex) => (
                                <li key={subIndex} style={{ listStyleType: 'unset' }}>
                                  <a
                                    href={sub.href}
                                    className='text-14 d-flex gap-1 items-center'
                                  >
                                    <span className='pb-1'>{sub?.icon}</span>
                                    <span>{sub.title}</span>
                                  </a>
                                </li>
                              ))}
                            </ul>
                          )}
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
          <a
            onClick={async () => {
              if (token === '') {
                window.location = '/';
              } else {
                const response = await customAPICall('auth/logout', 'post');
                if (response?.success) {
                  dispatch(setInitialUserState());
                  sendToast('success', 'Logged Out Successfully', 4000);
                  sessionStorage.removeItem('checking-user');
                  router.push('/');
                } else {
                  sendToast('error', 'Error Logging Out', 4000);
                }
              }
            }}
            className='cursor-pointer sidebar__button d-flex items-center text-15 lh-1 fw-500'
          >
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
