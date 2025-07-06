import axios from "axios";
import { Children, createContext, useEffect, useState } from "react";

export const UserContext = createContext({});
function UserContextProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    // if (user) {
    //   axios.get("/profile").then(({ data }) => {
    //     setUser(data);
    //     console.log(data);
    //     setReady(true);
    //   });
    // }
  });

  return (
    <>
      <UserContext.Provider value={{ user, setUser, setReady, ready }}>
        {children}
      </UserContext.Provider>
    </>
  );
}

export default UserContextProvider;
