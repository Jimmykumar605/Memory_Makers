import axios from "axios";

export const setSessionData = (session_key, session_data) => {
  try {
    sessionStorage.setItem(session_key, JSON.stringify(session_data));
  } catch (error) {
    console.log("error while set session data :>> ", error);
  }
};

export const getSessionData = (session_key) => {
  try {
    let session_data = JSON.parse(sessionStorage.getItem(session_key));
    return session_data;
  } catch (error) {
    console.log("error while getting session data :>> ", error);
  }
};

export const removeSessionData = (session_key) => {
  try {
    sessionStorage.removeItem(session_key);
  } catch (error) {
    console.log("error while removing session data :>> ", error);
  }
};

// API utility function
export const apiPost = async ({
  endpoint,
  data = null,
  baseURL = 'http://localhost:9000',
}) => {
  try {
    const res = await axios.post(`${baseURL}${endpoint}`, data, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return res;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};
