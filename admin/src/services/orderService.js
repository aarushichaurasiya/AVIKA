import api, { call } from './api';

export const orderService = {
  forKitchen: (kitchenId, status) => call(api.get(`/orders/kitchen/${kitchenId}`, { params: status ? { status } : {} })),
  updateStatus: (orderId, status) => call(api.patch(`/orders/${orderId}/status`, { status }))
};
