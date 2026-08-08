import api, { call } from './api';

export const userService = {
  updateProfile: (data) => call(api.patch('/users/me', data)),
  toggleFavorite: (kitchenId) => call(api.post(`/users/me/favorites/${kitchenId}`)),
  uploadImage: (file) => {
    const form = new FormData();
    form.append('image', file);
    return call(api.post('/uploads', form, { headers: { 'Content-Type': 'multipart/form-data' } }));
  }
};
