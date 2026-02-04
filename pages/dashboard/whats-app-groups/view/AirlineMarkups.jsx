import { useRouter } from 'next/router';
import { useEffect, useMemo, useState } from 'react';
import { BsTrash3 } from 'react-icons/bs';
import { HiOutlinePencilAlt } from 'react-icons/hi';
import { IoClose } from 'react-icons/io5';
import Select from 'react-select';
import { createItem, deleteItem, getList, updateItem } from '../../../../api/xplorzApi';
import ActionsButton from '../../../../components/actions-button/ActionsButton';
import ConfirmationModal from '../../../../components/confirm-modal';
import Datatable from '../../../../components/datatable/Datatable';
import { filterAllowed, hasPermission } from '../../../../utils/permission-checker';
import { sendToast } from '../../../../utils/toastify';

const markupTypeOptions = [
  { value: 'percentage', label: 'Percentage' },
  { value: 'range', label: 'Range' },
];

const AirlineMarkups = () => {
  const [markups, setMarkups] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [idToDelete, setIdToDelete] = useState(-1);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [airlineCode, setAirlineCode] = useState('');
  const [markupType, setMarkupType] = useState(markupTypeOptions[0]);
  const [markupPercentage, setMarkupPercentage] = useState('');
  const [markupRangeMin, setMarkupRangeMin] = useState('');
  const [markupRangeMax, setMarkupRangeMax] = useState('');

  const router = useRouter();

  useEffect(() => {
    if (router.isReady) {
      getMarkups();
    }
  }, [router.isReady]);

  const getMarkups = async () => {
    if (router.query.view) {
      const response = await getList(`whats-app-groups/${router.query.view}/airline-markups`);
      if (response?.success) {
        setMarkups(response.data);
      } else {
        sendToast(
          'error',
          response?.data?.message || response?.data?.error || 'Error getting airline markups',
          4000
        );
      }
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setAirlineCode('');
    setMarkupType(markupTypeOptions[0]);
    setMarkupPercentage('');
    setMarkupRangeMin('');
    setMarkupRangeMax('');
  };

  const openAddModal = () => {
    resetForm();
    setShowModal(true);
  };

  const openEditModal = (markup) => {
    setEditingId(markup.airline_code);
    setAirlineCode(markup.airline_code || '');
    const foundType = markupTypeOptions.find((opt) => opt.value === markup.markup_type);
    setMarkupType(foundType || markupTypeOptions[0]);
    setMarkupPercentage(markup.markup_percentage ?? '');
    setMarkupRangeMin(markup.markup_range_min ?? '');
    setMarkupRangeMax(markup.markup_range_max ?? '');
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    resetForm();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const code = airlineCode.trim().toUpperCase();
    if (!code || code.length > 3) {
      sendToast('error', 'Airline code is required (max 3 characters)', 4000);
      return;
    }

    const payload = {
      airline_code: code,
      markup_type: markupType.value,
    };

    if (markupType.value === 'percentage') {
      if (markupPercentage === '' || markupPercentage === null) {
        sendToast('error', 'Markup percentage is required', 4000);
        return;
      }
      payload.markup_percentage = parseInt(markupPercentage, 10);
      payload.markup_range_min = null;
      payload.markup_range_max = null;
    } else {
      if (markupRangeMin === '' || markupRangeMax === '') {
        sendToast('error', 'Both range min and max are required', 4000);
        return;
      }
      payload.markup_range_min = parseInt(markupRangeMin, 10);
      payload.markup_range_max = parseInt(markupRangeMax, 10);
      payload.markup_percentage = null;
    }

    let response;
    if (editingId) {
      response = await updateItem(
        `whats-app-groups/${router.query.view}/airline-markups`,
        editingId,
        payload
      );
    } else {
      response = await createItem(
        `whats-app-groups/${router.query.view}/airline-markups`,
        payload
      );
    }

    if (response?.success) {
      sendToast('success', editingId ? 'Updated successfully' : 'Created successfully', 4000);
      closeModal();
      getMarkups();
    } else {
      sendToast(
        'error',
        response?.data?.message || response?.data?.error || 'Operation failed',
        4000
      );
    }
  };

  const onCancelDelete = () => {
    setConfirmDelete(false);
    setIdToDelete(-1);
  };

  const onConfirmDelete = async () => {
    const response = await deleteItem(
      `whats-app-groups/${router.query.view}/airline-markups`,
      idToDelete
    );
    if (response?.success) {
      sendToast('success', 'Deleted successfully', 4000);
      getMarkups();
    } else {
      sendToast(
        'error',
        response.data?.message ||
          response.data?.error ||
          'Unexpected Error Occurred While Trying to Delete this Airline Markup',
        4000
      );
    }
    onCancelDelete();
  };

  const columns = [
    {
      Header: 'Airline Code',
      accessor: 'airline_code',
    },
    {
      Header: 'Markup',
      accessor: 'markup_type',
      Cell: (data) => {
        const row = data.row.original;
        if (row.markup_type === 'percentage') {
          return <span>{row.markup_percentage}%</span>;
        } else {
          return (
            <span>
              ₹{row.markup_range_min} - ₹{row.markup_range_max}
            </span>
          );
        }
      },
    },
    {
      Header: 'Last Updated',
      accessor: 'updated_at',
      Cell: (data) =>
        data.row.original.updated_at
          ? new Date(data.row.original.updated_at).toLocaleString('en-IN', {
              dateStyle: 'medium',
              timeStyle: 'short',
            })
          : '',
    },
    {
      Header: 'Actions',
      disableSortBy: true,
      alignRight: true,
      Cell: (data) => (
        <div className='d-flex justify-end'>
          <ActionsButton
            options={filterAllowed([
              {
                label: 'Edit',
                onClick: () => openEditModal(data.row.original),
                icon: <HiOutlinePencilAlt />,
                permissions: ['whats-app-groups.update'],
              },
              {
                label: 'Delete',
                onClick: () => {
                  setIdToDelete(data.row.original.id);
                  setConfirmDelete(true);
                },
                icon: <BsTrash3 />,
                permissions: ['whats-app-groups.destroy'],
              },
            ])}
          />
        </div>
      ),
    },
  ];

  const filteredMarkups = useMemo(
    () =>
      markups.filter((markup) =>
        Object.values(markup).join(',').toLowerCase().includes(searchQuery.toLowerCase())
      ),
    [markups, searchQuery]
  );

  return (
    <div className='col-12'>
      {confirmDelete && (
        <ConfirmationModal
          onCancel={onCancelDelete}
          onSubmit={onConfirmDelete}
          title='Do you really want to delete this airline markup?'
          content='This will permanently delete the airline markup. Press OK to confirm.'
        />
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className='confirm-modal-container'>
          <div className='backdrop fade-in fixed inset-0 z-40 bg-black'></div>
          <div className='modal-content' style={{ maxWidth: '500px' }}>
            <div className='d-flex justify-between items-center'>
              <h3 className='text-xl font-semibold'>
                {editingId ? 'Edit Airline Markup' : 'Add New Airline Markup'}
              </h3>
              <button className='modal-close btn btn-transparent' onClick={closeModal}>
                <IoClose className='text-secondary stroke-current inline-block h-5 w-5' />
              </button>
            </div>
            <form onSubmit={handleSubmit} className='mt-4'>
              <div className='mb-3'>
                <label className='form-label'>
                  Airline Code<span className='text-danger'>*</span>
                </label>
                <input
                  type='text'
                  className='form-control'
                  value={airlineCode}
                  pattern='[A-Z0-9]{2}D?'
                  onChange={(e) => setAirlineCode(e.target.value.toUpperCase())}
                  maxLength={3}
                  placeholder='e.g. 6E, AI, UK, 6ED'
                  required
                />
              </div>
              <div className='mb-3'>
                <label className='form-label'>
                  Markup Type<span className='text-danger'>*</span>
                </label>
                <Select
                  options={markupTypeOptions}
                  value={markupType}
                  onChange={(val) => setMarkupType(val)}
                />
              </div>
              {markupType.value === 'percentage' ? (
                <div className='mb-3'>
                  <label className='form-label'>
                    Markup Percentage<span className='text-danger'>*</span>
                  </label>
                  <input
                    type='number'
                    className='form-control'
                    value={markupPercentage}
                    onChange={(e) => setMarkupPercentage(e.target.value)}
                    min={0}
                    max={100}
                    placeholder='e.g. 5'
                    required
                  />
                </div>
              ) : (
                <div className='row'>
                  <div className='col-6 mb-3'>
                    <label className='form-label'>
                      Range Min (₹)<span className='text-danger'>*</span>
                    </label>
                    <input
                      type='number'
                      className='form-control'
                      value={markupRangeMin}
                      onChange={(e) => setMarkupRangeMin(e.target.value)}
                      min={0}
                      placeholder='e.g. 100'
                      required
                    />
                  </div>
                  <div className='col-6 mb-3'>
                    <label className='form-label'>
                      Range Max (₹)<span className='text-danger'>*</span>
                    </label>
                    <input
                      type='number'
                      className='form-control'
                      value={markupRangeMax}
                      onChange={(e) => setMarkupRangeMax(e.target.value)}
                      min={0}
                      placeholder='e.g. 500'
                      required
                    />
                  </div>
                </div>
              )}
              <div className='d-flex justify-end gap-2 mt-4'>
                <button type='button' className='btn btn-secondary' onClick={closeModal}>
                  Cancel
                </button>
                <button type='submit' className='btn btn-primary'>
                  {editingId ? 'Update' : 'Add'}
                </button>
              </div>
            </form>
          </div>
        </div>
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
        {hasPermission('whats-app-groups.airline-markups.store') && (
          <button className='btn btn-primary col-lg-2 col-5' onClick={openAddModal}>
            Add New
          </button>
        )}
      </div>

      {/* Data Table */}
      <Datatable
        downloadCSV
        CSVName='AirlineMarkups.csv'
        columns={columns}
        data={filteredMarkups}
      />
    </div>
  );
};

export default AirlineMarkups;
