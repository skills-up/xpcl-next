import WindowedSelect from 'react-windowed-select';

const LocationSearch = ({
  value,
  setValue,
  options,
  locations,
  className = '',
  styles = {},
  placeholder = '',
}) => {
  const [locationOptions, setLocationOptions] = locations;

  return (
    <WindowedSelect
      onInputChange={(e) => {
        setLocationOptions((prev) => {
          if (e) {
            prev.sort((a, b) => {
              e = e.toLowerCase();
              let tempA =
                +(a[1].toLowerCase() === e) +
                (a[1].toLowerCase()?.startsWith(e) ? 0.85 : 0) +
                ((a[2].toLowerCase()?.split(e).length || 1) - 1) * 0.05;
              let tempB =
                +(b[1].toLowerCase() === e) +
                (b[1].toLowerCase()?.startsWith(e) ? 0.85 : 0) +
                ((b[2].toLowerCase()?.split(e).length || 1) - 1) * 0.05;
              return tempB - tempA;
            });
          } else prev = options;
          return [...prev];
        });
      }}
      filterOption={(candidate, input) =>
        !input || candidate.label.toLowerCase().includes(input.toLowerCase())
      }
      options={locationOptions.map((location) => ({
        value: location[0],
        cityName: location[1],
        label: location[2],
      }))}
      formatOptionLabel={(opt, { context }) => {
        return (
          <div key={opt.value}>
            <b>{opt.cityName}</b>
            {context === 'value' ? (
              ''
            ) : (
              <div
                style={{
                  fontSize: 'small',
                }}
              >
                {opt.label}
              </div>
            )}
          </div>
        );
      }}
      value={value}
      onChange={(id) => setValue(id)}
      placeholder={placeholder}
      className={className}
      styles={styles}
    />
  );
};

export default LocationSearch;
