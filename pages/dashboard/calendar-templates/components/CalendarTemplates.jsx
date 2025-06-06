import { useEffect, useState } from 'react';
import { AiOutlineEye } from 'react-icons/ai';
import { BsTrash3 } from 'react-icons/bs';
import { HiOutlinePencilAlt } from 'react-icons/hi';
import { IoCopyOutline } from 'react-icons/io5';
import { deleteItem, getList } from '../../../../api/xplorzApi';
import ActionsButton from '../../../../components/actions-button/ActionsButton';
import ConfirmationModal from '../../../../components/confirm-modal';
import Datatable from '../../../../components/datatable/Datatable';
import { filterAllowed, hasPermission } from '../../../../utils/permission-checker';
import { sendToast } from '../../../../utils/toastify';

const CalendarTemplates = () => {
  const [calendarTemplates, setCalendarTemplates] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [idToDelete, setIdToDelete] = useState(-1);

  useEffect(() => {
    getCalendarTemplates();
  }, []);

  const getCalendarTemplates = async () => {
    const response = await getList('calendar-templates');
    if (response?.success) {
      setCalendarTemplates(response.data);
    } else {
      sendToast(
        'error',
        response?.data?.message ||
          response?.data?.error ||
          'Error getting calendar templates',
        4000
      );
    }
  };

  const columns = [
    {
      Header: 'Name',
      accessor: 'name',
    },
    {
      Header: 'Location',
      accessor: 'location',
    },
    {
      Header: 'Summary',
      accessor: 'summary',
    },
    {
      Header: 'Last Updated At',
      accessor: 'updated_at',
      Cell: (data) => {
        return (
          <div>
            {data.row.original.updated_at
              ? new Date(data.row.original.updated_at).toLocaleString('en-IN', {
                  dateStyle: 'medium',
                  timeStyle: 'short',
                })
              : ''}
          </div>
        );
      },
    },
    {
      Header: 'Actions',
      disableSortBy: true,
      alignRight: true,
      // cell: () => <Button variant="danger" data-tag="allowRowEvents" data-action="delete"><FontAwesomeIcon icon={faTrash} /></Button>,
      Cell: (data) => {
        return (
          <div className='d-flex justify-end'>
            <ActionsButton
              options={filterAllowed([
                {
                  label: 'View',
                  onClick: () =>
                    window.location.assign(
                      '/dashboard/calendar-templates/view/' + data.row.original.id
                    ),
                  icon: <AiOutlineEye />,
                  permissions: ['calendar-templates.show'],
                },
                {
                  label: 'Edit',
                  onClick: () =>
                    window.location.assign(
                      '/dashboard/calendar-templates/edit/' + data.row.original.id
                    ),
                  icon: <HiOutlinePencilAlt />,
                  permissions: ['calendar-templates.update'],
                },
                {
                  label: 'Clone',
                  onClick: () =>
                    window.location.assign(
                      '/dashboard/calendar-templates/clone/' + data.row.original.id
                    ),
                  icon: <IoCopyOutline />,
                  permissions: ['calendar-templates.store'],
                },
                {
                  label: 'Delete',
                  onClick: () => {
                    setIdToDelete(data.row.original.id);
                    setConfirmDelete(true);
                  },
                  icon: <BsTrash3 />,
                  permissions: ['calendar-templates.destroy'],
                },
              ])}
            />
          </div>
        );
      },
    },
  ];

  const onCancel = async () => {
    setConfirmDelete(false);
    setIdToDelete(-1);
  };
  const onSubmit = async () => {
    const response = await deleteItem('calendar-templates', idToDelete);
    if (response?.success) {
      sendToast('success', 'Deleted successfully', 4000);
      getCalendarTemplates();
    } else {
      sendToast(
        'error',
        response.data?.message ||
          response.data?.error ||
          'Unexpected Error Occurred While Trying to Delete this Calendar Template',
        4000
      );
    }
    onCancel();
  };

  return (
    <div className='col-12'>
      {confirmDelete && (
        <ConfirmationModal
          onCancel={onCancel}
          onSubmit={onSubmit}
          title='Do you really want to delete this Calendar Template?'
          content='This will permanently delete the calendar template. Press OK to confirm.'
        />
      )}
      {/* Search Bar + Add New */}
      <div className='row mb-3 items-center justify-between mr-4'>
        <div className='col-lg-10 col-7'>
          <input
            type='text'
            className='d-block form-control'
            placeholder='Search'
            onChange={(e) => setSearchQuery(e.target.value)}
            value={searchQuery}
          />
        </div>
        {hasPermission('calendar-templates.store') && (
          <button
            className='btn btn-primary col-lg-2 col-5'
            onClick={() =>
              window.location.assign('/dashboard/calendar-templates/add-new')
            }
          >
            Add New
          </button>
        )}
      </div>
      {/* Data Table */}
      <Datatable
        viewLink={'/dashboard/calendar-templates'}
        downloadCSV
        CSVName='CalendarTemplates.csv'
        columns={columns}
        data={calendarTemplates.filter((perm) =>
          Object.values(perm).join(',').toLowerCase().includes(searchQuery.toLowerCase())
        )}
      />
    </div>
  );
};

export default CalendarTemplates;
