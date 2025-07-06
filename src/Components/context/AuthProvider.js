import { createContext, useState } from "react";

const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState({ currentUser: null });
  const [user,setUser] = useState();
  const setCurrentUser = (user) => {
    setAuth({ ...auth, currentUser: user });
  };
  return (
    <AuthContext.Provider value={{ auth, setAuth, setCurrentUser,user,setUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext, AuthProvider };
