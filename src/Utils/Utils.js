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
  baseURL = "http://localhost:9000",
}) => {
  try {
    const res = await axios.post(`${baseURL}${endpoint}`, data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res; // Full Axios response (res.data is your payload)
  } catch (error) {
    if (error.response) {
      const { status, data } = error.response;
      return {
        status,
        message: data.message || "Something went wrong",
        error: true,
        data,
      };
    } else if (error.request) {
      console.error("No response from server:", error.message);
      return {
        status: 0,
        message: "No response from server",
        error: true,
      };
      } else {
      return {
        status: 0,
        message: "Unexpected error occurred",
        error: true,
      };
    }
  }
};

// API utility function
export const apiGet = async ({
  endpoint,
  params = {},
  baseURL = "http://localhost:9000",
}) => {
  try {
    const res = await axios.get(`${baseURL}${endpoint}`, { params });
    return res;
  } catch (error) {
    if (error.response) {
      const { status, data } = error.response;

      return {
        status,
        message: data.message || "Something went wrong",
        data: {success: false},
      };
    } else if (error.request) {
        return {
        status: 0,
        message: "No response from server",
        data: {success: false},
      };
    } else {
        return {
        status: 0,
        message: "Unexpected error occurred",
        data: {success: false},
      };
    }
  }
};

// API utility function for PUT requests
export const apiPut = async ({
  endpoint,
  data = null,
  baseURL = "http://localhost:9000",
}) => {
  try {
    const res = await axios.put(`${baseURL}${endpoint}`, data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res;
  } catch (error) {
    if (error.response) {
      const { status, data } = error.response;
      return {
        status,
        message: data.message || "Something went wrong",
        error: true,
        data,
      };
    } else if (error.request) {
      console.error("No response from server:", error.message);
      return {
        status: 0,
        message: "No response from server",
        error: true,
      };
    } else {
      return {
        status: 0,
        message: "Unexpected error occurred",
        error: true,
      };
    }
  }
};

// API utility function for DELETE requests
export const apiDelete = async ({
  endpoint,
  data = null,
  baseURL = "http://localhost:9000",
}) => {
  try {
    const res = await axios.delete(`${baseURL}${endpoint}`, {
      data: data,
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return res;
  } catch (error) {
    if (error.response) {
      const { status, data } = error.response;
      return {
        status,
        message: data.message || "Something went wrong",
        data: {success: false},
      };
    } else if (error.request) {
      console.log("No response received from server");
      return {
        status: 0,
        message: "No response received from server",
        data: {success: false},
      };
    } else {
      console.log("Error", error.message);
      return {
        status: 0,
        message: "Unexpected error occurred",
        data: {success: false},
      };
    }
  }
};