import Image from 'next/image';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { AiOutlinePlus } from 'react-icons/ai';
import { useDispatch, useSelector } from 'react-redux';
import Select from 'react-select';
import { customAPICall, getList } from '../../../api/xplorzApi';
import { setClientOrganizations } from '../../../features/apis/apisSlice';
import {
  setCurrentOrganization,
  setInitialUserState,
} from '../../../features/auth/authSlice';
import { filterAllowed } from '../../../utils/permission-checker';
import { sendToast } from '../../../utils/toastify';

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

  const sidebarData = filterAllowed([
    {
      icon: '/img/dashboard/sidebar/booking.svg',
      title: 'Travel',
      links: filterAllowed([
        {
          title: 'Book Hotels',
          href: '/hotel/hotel-list-v1',
        },
        {
          title: 'Book Flights',
          href: '/flight/flight-list-v1',
          permissions: ['flights.search', 'flights.book'],
        },
        {
          title: 'Traveller Profiles',
          href: '/dashboard/travellers',
          permissions: ['travellers.index'],
        },
        {
          title: 'Visa Requirements',
          href: '/dashboard/visa-requirements',
          permissions: ['visa-requirements.index'],
        },
        {
          title: 'Visa Applications',
          href: '/dashboard/visa-applications',
          permissions: ['visa-applications.index'],
        },
        {
          title: 'Travel List',
          href: '/dashboard/travel-list',
          permissions: ['travel-list.index'],
        },
        {
          title: 'Booking History',
          href: '/dashboard/bookings/history',
          permissions: ['bookings.index'],
        },
        {
          title: 'Files List',
          href: '/dashboard/files-list',
          permissions: ['utilities.files-list'],
        },
      ]),
    },
    {
      icon: '/img/dashboard/sidebar/booking.svg',
      title: 'Accounting',
      links: filterAllowed([
        {
          title: 'Invoicing',
          href: '/dashboard/bookings',
          permissions: ['bookings.index'],
          submenus: filterAllowed([
            {
              title: 'Add Domestic',
              href: '/dashboard/bookings/add-new?type=domestic',
              icon: <AiOutlinePlus />,
              permissions: ['bookings.store'],
            },
            {
              title: 'Add International',
              href: '/dashboard/bookings/add-new?type=international',
              icon: <AiOutlinePlus />,
              permissions: ['bookings.store'],
            },
            {
              title: 'Add Miscellaneous',
              href: '/dashboard/bookings/add-new?type=misc',
              icon: <AiOutlinePlus />,
              permissions: ['bookings.store'],
            },
          ]),
        },
        {
          title: 'Refunds',
          href: '/dashboard/refunds',
          permissions: ['refunds.index'],
        },
        {
          title: 'Partial Refunds',
          href: '/dashboard/partial-refunds',
          permissions: ['partial-refunds.index'],
        },
        {
          title: 'Transactions',
          href: '/dashboard/payment-receipts',
          permissions: ['payment-receipts.index'],
          submenus: filterAllowed([
            {
              title: 'Add Payment',
              href: '/dashboard/payment-receipts/add-new?type=Payment',
              icon: <AiOutlinePlus />,
              permissions: ['payment-receipts.store'],
            },
            {
              title: 'Add Receipt',
              href: '/dashboard/payment-receipts/add-new?type=Receipt',
              icon: <AiOutlinePlus />,
              permissions: ['payment-receipts.store'],
            },
            {
              title: 'Add Voucher',
              href: '/dashboard/payment-receipts/add-new?type=Voucher',
              icon: <AiOutlinePlus />,
              permissions: ['payment-receipts.store'],
            },
          ]),
        },
        {
          title: 'Vendor Invoicing',
          href: '/dashboard/vendor-commission-invoices',
          permissions: ['vendor-commission-invoices.index'],
        },
      ]),
    },
    {
      icon: '/img/dashboard/sidebar/booking.svg',
      title: 'MIS / Reports / Admin',
      links: filterAllowed([
        {
          title: 'Account Categories',
          href: '/dashboard/account-categories',
          permissions: ['account-categories.index'],
        },
        {
          title: 'Accounts',
          href: '/dashboard/accounts',
          permissions: ['accounts.index'],
        },
        {
          title: 'Journals',
          href: '/dashboard/journals',
          permissions: ['journals.index'],
        },
        {
          title: 'Ledgers',
          href: '/dashboard/journals/ledger',
          permissions: ['journals.ledger'],
          submenus: filterAllowed([
            {
              title: 'Mail Client Ledgers',
              href: '/dashboard/journals/mail-ledger',
              icon: <AiOutlinePlus />,
              permissions: ['journals.mail-ledger'],
            },
          ]),
        },
        {
          title: 'Balance Sheet',
          href: '/dashboard/reports/balance-sheet',
          permissions: ['reports.balance-sheet'],
        },
        {
          title: 'Income Statement',
          href: '/dashboard/reports/income-statement',
          permissions: ['reports.income-statement'],
        },
        {
          title: 'Working Capital Statement',
          href: '/dashboard/reports/working-capital-statement',
          permissions: ['reports.working-capital-statement'],
        },
        {
          title: 'GST MIS',
          href: '/dashboard/reports/gst-mis',
          permissions: ['reports.gst-mis'],
        },
        {
          title: 'GST ITC Report',
          href: '/dashboard/gst-itcs',
          permissions: ['payment-itcs.index'],
        },
        {
          title: 'Bill-Wise Profit',
          href: '/dashboard/reports/bill-wise-profit',
          permissions: ['reports.booking-pnl'],
        },
        {
          title: 'Sales Analysis',
          href: '/dashboard/reports/sales-analysis',
          permissions: ['reports.sales-analysis'],
        },
        {
          title: 'Close Accounts',
          href: '/dashboard/reports/close-books',
          permissions: ['reports.close-books'],
        },
      ]),
    },
    {
      icon: '/img/dashboard/sidebar/booking.svg',
      title: 'Organizations',
      links: filterAllowed([
        {
          title: 'Organizations',
          href: '/dashboard/organizations',
          permissions: ['organizations.index'],
        },
        {
          title: 'Airline Organization Markup',
          href: '/dashboard/airline-organization-markup',
          permissions: ['airline-organization-markup.index'],
        },
      ]),
    },
    {
      icon: '/img/dashboard/sidebar/gear.svg',
      title: 'User Management',
      links: filterAllowed([
        {
          title: 'Users',
          href: '/dashboard/users',
          permissions: ['users.index'],
        },
        {
          title: 'Roles',
          href: '/dashboard/roles',
          permissions: ['roles.index'],
        },
        {
          title: 'Permissions',
          href: '/dashboard/permissions',
          permissions: ['permissions.index'],
        },
      ]),
    },
    {
      icon: '/img/dashboard/sidebar/booking.svg',
      title: 'Miscellaneous',
      links: filterAllowed([
        {
          title: 'Countries',
          href: '/dashboard/countries',
          permissions: ['countries.index'],
        },
        {
          title: 'Airports',
          href: '/dashboard/airports',
          permissions: ['airports.index'],
        },
        {
          title: 'Commission Rules',
          href: '/dashboard/commission-rules',
          permissions: ['commission-rules.index'],
        },
        {
          title: 'Calendar Templates',
          href: '/dashboard/calendar-templates',
          permissions: ['calendar-templates.index'],
        },
        {
          title: 'Travel Membership Programs',
          href: '/dashboard/travel-membership-programs',
          permissions: ['travel-membership-programs.index'],
        },
        {
          title: 'Visa Requirement Docs',
          href: '/dashboard/visa-requirement-documents',
          permissions: ['visa-requirement-documents.index'],
        },
      ]),
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
  ]);

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

        {sidebarData.map((item, index) => (
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
        ))}

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
