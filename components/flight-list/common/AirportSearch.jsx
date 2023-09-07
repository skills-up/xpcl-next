import { useState } from "react";
import WindowedSelect from "react-windowed-select";

const AirportSearch = ({ value, setValue, options, className = '', placeholder = '' }) => {
  const [airportOptions, setAirportOptions] = useState([]);

  return (
    <WindowedSelect
      onInputChange={(e) => {
        setAirportOptions((prev) => {
          if (e) {
            prev.sort((a, b) => {
              e = e.toLowerCase();
              return (
                (a?.iata_code?.toLowerCase()?.startsWith(e) ? 0.6 : 0) +
                (a?.city?.toLowerCase()?.includes(e) ? 0.3 : 0) +
                (a?.country_name?.toLowerCase()?.includes(e) ? 0.1 : 0)
              ) - (
                  (b?.iata_code?.toLowerCase()?.startsWith(e) ? 0.6 : 0) +
                  (b?.city?.toLowerCase()?.includes(e) ? 0.3 : 0) +
                  (b?.country_name?.toLowerCase()?.includes(e) ? 0.1 : 0)
                );
            });
          } else prev = options.map((e) => e);
          return [...prev];
        });
      }}
      filterOption={(candidate, input) => {
        if (input) {
          return (
            candidate.data.iata.toLowerCase() === input.toLowerCase() ||
            candidate.label.toLowerCase().includes(input.toLowerCase())
          );
        }
        return true;
      }}
      options={airportOptions.map((airport) => ({
        value: airport.id,
        label: `${airport.iata_code}|${airport.city}|${airport.name}|${airport.country_name}`,
        iata: airport.iata_code,
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
                <strong>{iata_code}</strong>
                {' '}
                <small>
                  ({city})
                </small>
              </span>
              {context === 'value' ? '' :
                <div
                  style={{
                    fontSize: 'small',
                    fontStyle: 'italic',
                  }}
                  className='text-right'
                >
                  {country_name}
                </div>
              }
            </div>
            {context === 'value' ? '' :
              <small>{name}</small>
            }
          </div>
        );
      }}
      value={value}
      onChange={(id) => setValue(id)}
      placeholder={placeholder}
      className={className}
    />
  )
}

export default AirportSearch;