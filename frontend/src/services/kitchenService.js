import api, { call } from './api';

export const kitchenService = {
  near: (lat, lng, radiusKm = 5) => call(api.get('/kitchens', { params: { lat, lng, radiusKm } })),
  get: (id) => call(api.get(`/kitchens/${id}`)),
  mine: () => call(api.get('/kitchens/mine')),
  menu: (kitchenId) => call(api.get(`/kitchens/${kitchenId}/menu`)),
  create: (kitchen) => call(api.post('/kitchens', kitchen)),
  update: (id, kitchen) => call(api.patch(`/kitchens/${id}`, kitchen)),
  addEmployee: (kitchenId, employee) => call(api.post(`/kitchens/${kitchenId}/employees`, employee)),
  removeEmployee: (kitchenId, employeeId) => call(api.delete(`/kitchens/${kitchenId}/employees/${employeeId}`))
};
