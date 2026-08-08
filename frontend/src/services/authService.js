import api, { call } from './api';

export const authService = {
  register: (name, email, password, role) => call(api.post('/auth/register', { name, email, password, role })),
  login: (email, password) => call(api.post('/auth/login', { email, password })),
  me: () => call(api.get('/auth/me'))
};
