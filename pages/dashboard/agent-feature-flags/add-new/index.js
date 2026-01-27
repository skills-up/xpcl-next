import { useRouter } from 'next/router';
import { useState } from 'react';
import ReactSwitch from 'react-switch';
import { createItem } from '../../../../api/xplorzApi';
import Seo from '../../../../components/common/Seo';
import DashboardLayout from '../../../../components/layouts/DashboardLayout';
import { sendToast } from '../../../../utils/toastify';

// Convert camelCase to Title Case for display
const toTitleCase = (str) => {
  if (!str) return '';
  return str
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (char) => char.toUpperCase())
    .trim();
};

const AddNewAgentFeatureFlag = () => {
  const [name, setName] = useState('');
  const [enabled, setEnabled] = useState(false);

  const router = useRouter();

  const onSubmit = async (e) => {
    e.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName) {
      sendToast('error', 'Name is required', 4000);
      return;
    }
    // Validate camelCase format (starts with lowercase, no spaces)
    if (!/^[a-z][a-zA-Z0-9]*$/.test(trimmedName)) {
      sendToast('error', 'Name must be in camelCase format (e.g., enableFlightSearch)', 4000);
      return;
    }
    const response = await createItem('agent-feature-flags', {
      name: trimmedName,
      enabled,
    });
    if (response?.success) {
      sendToast('success', 'Created feature flag successfully.', 4000);
      router.push('/dashboard/agent-feature-flags');
    } else {
      sendToast(
        'error',
        response?.data?.message ||
        response?.data?.error ||
        'Failed to create feature flag.',
        4000
      );
    }
  };

  return (
    <>
      <Seo pageTitle='Add New Agent Feature Flag' />
      {/* End Page Title */}

      <div className='row y-gap-20 justify-between items-end pb-60 lg:pb-40 md:pb-32'>
                <div className='col-12'>
                  <h1 className='text-30 lh-14 fw-600'>Add New Agent Feature Flag</h1>
                  <div className='text-15 text-light-1'>
                    Create a new feature flag for the agent.
                  </div>
                </div>
                {/* End .col-12 */}
              </div>
              {/* End .row */}

              <div className='py-30 px-30 rounded-4 bg-white shadow-3'>
                <div>
                  <form onSubmit={onSubmit} className='row col-12 y-gap-20'>
                    <div className='col-12 col-lg-6'>
                      <div className='form-input'>
                        <input
                          onChange={(e) => setName(e.target.value)}
                          value={name}
                          placeholder=' '
                          type='text'
                          required
                        />
                        <label className='lh-1 text-16 text-light-1'>
                          Name (camelCase)<span className='text-danger'>*</span>
                        </label>
                      </div>
                      {name && (
                        <div className='text-14 text-light-1 mt-1'>
                          Display Label: <strong>{toTitleCase(name)}</strong>
                        </div>
                      )}
                    </div>
                    <div className='col-12'>
                      <div className='d-flex items-center gap-3'>
                        <ReactSwitch
                          onChange={() => setEnabled((prev) => !prev)}
                          checked={enabled}
                        />
                        <label>Enabled</label>
                      </div>
                    </div>
                    <div className='d-inline-block'>
                      <button
                        type='submit'
                        className='button h-50 px-24 -dark-1 bg-blue-1 text-white'
                      >
                        Add Feature Flag
                      </button>
                    </div>
                  </form>
                </div>
                </div>
                </>
  );
};

AddNewAgentFeatureFlag.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default AddNewAgentFeatureFlag;
