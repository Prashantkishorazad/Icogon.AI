import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});


// ===============================
// REQUEST INTERCEPTOR
// ===============================

api.interceptors.request.use(
  (config) => {

    const token =
      localStorage.getItem("access_token");

    if (token) {
      config.headers.Authorization =
        `Bearer ${token}`;
    }

    console.log(
      "API REQUEST:",
      config.method?.toUpperCase(),
      config.url
    );

    return config;
  },

  (error) => {
    return Promise.reject(error);
  }
);


// ===============================
// RESPONSE INTERCEPTOR
// ===============================

api.interceptors.response.use(
  (response) => {

    console.log(
      "API RESPONSE:",
      response.status,
      response.config.url
    );

    return response;
  },

  (error) => {

    console.error(
      "API ERROR:",
      error.response?.status,
      error.config?.url,
      error.response?.data
    );

    if (
      error.response?.status === 401
    ) {

      const requestUrl =
        error.config?.url || "";

      // Don't redirect when the LOGIN request
      // itself fails.
      const isLoginRequest =
        requestUrl.includes("/auth/login");

      if (!isLoginRequest) {

        localStorage.removeItem(
          "access_token"
        );

        localStorage.removeItem(
          "user"
        );

        window.location.href =
          "/login";
      }
    }

    return Promise.reject(error);
  }
);

export default api;