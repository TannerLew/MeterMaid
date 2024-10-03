// components/ReservationForm/DateSelector.js
import React from "react";

const DateSelector = ({ date, onChange }) => (
  <label>
    Date:
    <input type="date" name="date" value={date} onChange={onChange} required />
  </label>
);

export default DateSelector;
