// hooks/useFetchUsers.js
import { useState, useEffect } from "react";

const useFetchUsers = () => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetch("http://localhost:5000/users")
      .then((response) => response.json())
      .then(setUsers)
      .catch((error) => console.error("Error fetching users:", error));
  }, []);

  return users;
};

export default useFetchUsers;
