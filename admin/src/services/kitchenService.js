import api, { call } from './api';

export const kitchenService = {
  mine: () => call(api.get('/kitchens/mine')),
  get: (id) => call(api.get(`/kitchens/${id}`)),
  create: (kitchen) => call(api.post('/kitchens', kitchen)),
  update: (id, kitchen) => call(api.patch(`/kitchens/${id}`, kitchen)),
  adminAll: (status) => call(api.get('/kitchens/admin/all', { params: status ? { status } : {} })),
  approve: (id, isApproved) => call(api.patch(`/kitchens/${id}/approve`, { isApproved })),
  addEmployee: (kitchenId, employee) => call(api.post(`/kitchens/${kitchenId}/employees`, employee)),
  removeEmployee: (kitchenId, employeeId) => call(api.delete(`/kitchens/${kitchenId}/employees/${employeeId}`))
};
