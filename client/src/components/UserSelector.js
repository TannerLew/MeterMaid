// components/ReservationForm/UserSelector.js
import React from "react";

const UserSelector = ({ users, userID, onChange }) => (
  <label>
    User:
    <select name="userID" value={userID} onChange={onChange} required>
      <option value="">Select User</option>
      {users.map((user) => (
        <option key={user.userID} value={user.userID}>
          {user.firstName} {user.lastName}
        </option>
      ))}
    </select>
  </label>
);

export default UserSelector;
