const TypePlace = () => {
  return (
    <>
      <div className="row y-gap-10 items-center justify-between">
        <div className="col-auto">
          <div className="form-checkbox d-flex items-center">
            <input type="checkbox" />
            <div className="form-checkbox__mark">
              <div className="form-checkbox__icon icon-check" />
            </div>
            <div className="text-15 ml-10">Apartments</div>
          </div>
        </div>
        <div className="col-auto">
          <div className="text-15 text-light-1">92</div>
        </div>
      </div>
      {/* End .row */}
      <div className="row y-gap-10 items-center justify-between">
        <div className="col-auto">
          <div className="form-checkbox d-flex items-center">
            <input type="checkbox" />
            <div className="form-checkbox__mark">
              <div className="form-checkbox__icon icon-check" />
            </div>
            <div className="text-15 ml-10">Shared Room</div>
          </div>
        </div>
        <div className="col-auto">
          <div className="text-15 text-light-1">45</div>
        </div>
      </div>
      {/* End .row */}
      <div className="row y-gap-10 items-center justify-between">
        <div className="col-auto">
          <div className="form-checkbox d-flex items-center">
            <input type="checkbox" />
            <div className="form-checkbox__mark">
              <div className="form-checkbox__icon icon-check" />
            </div>
            <div className="text-15 ml-10">Villa</div>
          </div>
        </div>
        <div className="col-auto">
          <div className="text-15 text-light-1">21</div>
        </div>
      </div>
      {/* End .row */}
      <div className="row y-gap-10 items-center justify-between">
        <div className="col-auto">
          <div className="form-checkbox d-flex items-center">
            <input type="checkbox" />
            <div className="form-checkbox__mark">
              <div className="form-checkbox__icon icon-check" />
            </div>
            <div className="text-15 ml-10">Hotel</div>
          </div>
        </div>
        <div className="col-auto">
          <div className="text-15 text-light-1">78</div>
        </div>
      </div>
      {/* End .row */}
      <div className="row y-gap-10 items-center justify-between">
        <div className="col-auto">
          <div className="form-checkbox d-flex items-center">
            <input type="checkbox" />
            <div className="form-checkbox__mark">
              <div className="form-checkbox__icon icon-check" />
            </div>
            <div className="text-15 ml-10">Cabins</div>
          </div>
        </div>
        <div className="col-auto">
          <div className="text-15 text-light-1">679</div>
        </div>
      </div>
      {/* End .row */}
    </>
  );
};

export default TypePlace;
