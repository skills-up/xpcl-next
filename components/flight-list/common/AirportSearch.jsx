import WindowedSelect from 'react-windowed-select';

const AirportSearch = ({
  value,
  setValue,
  options,
  airports,
  className = '',
  placeholder = '',
  domestic = false,
  styles = {},
}) => {
  const [airportOptions, setAirportOptions] = airports;

  return (
    <WindowedSelect
      onInputChange={(e) => {
        setAirportOptions((prev) => {
          if (e) {
            prev.sort((a, b) => {
              e = e.toLowerCase();
              let tempA =
                (a?.iata_code?.toLowerCase()?.startsWith(e) ? 0.6 : 0) +
                (a?.city?.toLowerCase()?.includes(e) ? 0.3 : 0) +
                (a?.country_name?.toLowerCase()?.includes(e) ? 0.1 : 0);
              let tempB =
                (b?.iata_code?.toLowerCase()?.startsWith(e) ? 0.6 : 0) +
                (b?.city?.toLowerCase()?.includes(e) ? 0.3 : 0) +
                (b?.country_name?.toLowerCase()?.includes(e) ? 0.1 : 0);
              return tempB - tempA;
            });
          } else prev = options;
          return [...prev];
        });
      }}
      filterOption={(candidate, input) =>
        !input || candidate.label.toLowerCase().includes(input.toLowerCase())
      }
      options={(domestic
        ? airportOptions.filter((x) => x.country_name === 'India')
        : airportOptions
      ).map((airport) => ({
        value: airport.iata_code,
        label: `${airport.iata_code}|${airport.city}|${airport.name}|${airport.country_name}`,
      }))}
      formatOptionLabel={(opt, { context }) => {
        const [iata_code, city, name, country_name] = opt.label.split('|');
        return (
          <div key={iata_code}>
            <div
              className='d-flex justify-between align-items-center'
              style={{ fontSize: '1rem' }}
            >
              <span>
                <strong>{iata_code}</strong> <small>({city})</small>
              </span>
              {context === 'value' ? (
                ''
              ) : (
                <div
                  style={{
                    fontSize: 'small',
                    fontStyle: 'italic',
                  }}
                  className='text-right'
                >
                  {country_name}
                </div>
              )}
            </div>
            {context === 'value' ? '' : <small>{name}</small>}
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

export default AirportSearch;
