import DatePicker, { DateObject } from 'react-multi-date-picker';
import Select from 'react-select';

export const OTHER_PRE_EXISTING_DISEASE = 'Others';

export const createEmptyPreExistingDisease = () => ({
  name: null,
  since: null,
  desc: '',
});

const getDiseaseOption = (options, value) => {
  if (!value) return null;
  return options.find((option) => option.value === value) || {
    label: value,
    value,
  };
};

export const normalizePreExistingDiseases = (diseases, options) => {
  if (!Array.isArray(diseases)) return [];

  return diseases.map((disease) => ({
    name: getDiseaseOption(options, disease?.name),
    since: disease?.since
      ? new DateObject({ date: disease.since, format: 'YYYY-MM-DD' })
      : null,
    desc: disease?.desc ?? '',
  }));
};

export const appendPreExistingDiseases = (formData, diseases) => {
  if (!Array.isArray(diseases) || diseases.length === 0) return null;

  for (let index = 0; index < diseases.length; index += 1) {
    const disease = diseases[index];

    if (!disease?.name?.value) {
      return `Select a disease name for entry ${index + 1}.`;
    }

    if (!disease?.since) {
      return `Select the since date for ${disease.name.value}.`;
    }

    const desc = disease?.desc?.trim() ?? '';
    if (disease.name.value === OTHER_PRE_EXISTING_DISEASE && !desc) {
      return `Enter the disease name for the "${OTHER_PRE_EXISTING_DISEASE}" entry.`;
    }

    formData.append(
      `pre_existing_diseases[${index}][name]`,
      disease.name.value
    );
    formData.append(
      `pre_existing_diseases[${index}][since]`,
      disease.since.format('YYYY-MM-DD')
    );
    if (desc) {
      formData.append(`pre_existing_diseases[${index}][desc]`, desc);
    }
  }

  return null;
};

const updateDiseaseAtIndex = (setPreExistingDiseases, index, updater) => {
  setPreExistingDiseases((prev) =>
    prev.map((disease, currentIndex) =>
      currentIndex === index ? updater(disease) : disease
    )
  );
};

const PreExistingDiseasesFields = ({
  preExistingDiseases,
  setPreExistingDiseases,
  preExistingDiseasesOptions,
}) => (
  <div className='col-12'>
    <label className='text-15 d-block mb-10'>Pre-Existing Diseases</label>
    <div className='form-input-select mb-15'>
      <Select
        isClearable
        isMulti
        options={preExistingDiseasesOptions}
        value={preExistingDiseases.map((disease) => disease.name).filter(Boolean)}
        onChange={(selectedOptions) => {
          const nextSelections = selectedOptions ?? [];
          setPreExistingDiseases((prev) =>
            nextSelections.map(
              (selection) =>
                prev.find((disease) => disease.name?.value === selection.value) || {
                  ...createEmptyPreExistingDisease(),
                  name: selection,
                }
            )
          );
        }}
      />
    </div>
    <div className='d-flex flex-column gap-1'>
      {preExistingDiseases.map((disease, index) => (
        <div
          key={disease.name?.value ?? index}
          className='row mx-10 items-end'
        >
          <div className='col-lg-4'>
            <div className='form-input'>
              <input value={disease.name?.label ?? ''} type='text' placeholder=' ' disabled />
              <label className='lh-1 text-16 text-light-1'>Disease</label>
            </div>
          </div>
          <div className='col-lg-3 d-block ml-3 form-datepicker'>
            <label>Since</label>
            <DatePicker
              style={{ marginLeft: '0.5rem', fontSize: '1rem' }}
              inputClass='custom_input-picker'
              containerClassName='custom_container-picker'
              value={disease.since}
              onChange={(value) =>
                updateDiseaseAtIndex(setPreExistingDiseases, index, (current) => ({
                  ...current,
                  since: value,
                }))
              }
              numberOfMonths={1}
              offsetY={10}
              format='DD MMMM YYYY'
              required
            />
          </div>
          {disease.name?.value === OTHER_PRE_EXISTING_DISEASE && (
            <div className='col-lg-5'>
              <div className='form-input'>
                <input
                  type='text'
                  placeholder=' '
                  value={disease.desc}
                  onChange={(event) =>
                    updateDiseaseAtIndex(
                      setPreExistingDiseases,
                      index,
                      (current) => ({
                        ...current,
                        desc: event.target.value,
                      })
                    )
                  }
                />
                <label className='lh-1 text-16 text-light-1'>Disease Name</label>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  </div>
);

export default PreExistingDiseasesFields;
