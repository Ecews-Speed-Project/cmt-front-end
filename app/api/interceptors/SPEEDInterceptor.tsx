import axios from 'axios';
import { signOut, getSession } from 'next-auth/react';

const SPEEDInterceptor = axios.create();

SPEEDInterceptor.interceptors.request.use(async (config) => {
  const session = await getSession();
  if (session?.user?.access_token) {
    config.headers.Authorization = `Bearer ${session.user?.access_token}`;
  }
  return config;
});

SPEEDInterceptor.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await signOut();
      return Promise.reject(error);
    }
    return Promise.reject(error);
  }
);

export default SPEEDInterceptor;
