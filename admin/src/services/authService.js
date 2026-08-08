import api, { call } from './api';

export const authService = {
  login: (email, password) => call(api.post('/auth/login', { email, password })),
  register: (name, email, password) => call(api.post('/auth/register', { name, email, password, role: 'cook' })),
  me: () => call(api.get('/auth/me'))
};
