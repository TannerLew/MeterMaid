// components/ReservationForm/TimeSelector.js
import React from "react";

const TimeSelector = ({
  label,
  hourName,
  minuteName,
  periodName,
  hourValue,
  minuteValue,
  periodValue,
  onChange,
}) => {
  // Generate options for hours and minutes
  const generateHourOptions = () => {
    let options = [];
    for (let i = 1; i <= 12; i++) {
      const hourStr = String(i).padStart(2, "0");
      options.push(
        <option key={hourStr} value={hourStr}>
          {hourStr}
        </option>
      );
    }
    return options;
  };

  const generateMinuteOptions = () => {
    const minutes = ["00", "15", "30", "45"];
    return minutes.map((minute) => (
      <option key={minute} value={minute}>
        {minute}
      </option>
    ));
  };

  const generatePeriodOptions = () => {
    return ["AM", "PM"].map((period) => (
      <option key={period} value={period}>
        {period}
      </option>
    ));
  };

  return (
    <label>
      {label}
      <select name={hourName} value={hourValue} onChange={onChange} required>
        <option value="">HH</option>
        {generateHourOptions()}
      </select>
      :
      <select
        name={minuteName}
        value={minuteValue}
        onChange={onChange}
        required
      >
        <option value="">MM</option>
        {generateMinuteOptions()}
      </select>
      <select
        name={periodName}
        value={periodValue}
        onChange={onChange}
        required
      >
        {generatePeriodOptions()}
      </select>
    </label>
  );
};

export default TimeSelector;
