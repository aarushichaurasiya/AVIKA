import api, { call } from './api';

export const orderService = {
  create: (order) => call(api.post('/orders', order)),
  mine: () => call(api.get('/orders/mine')),
  get: (id) => call(api.get(`/orders/${id}`)),
  createPaymentIntent: (orderId) => call(api.post('/payments/create-intent', { orderId }))
};
