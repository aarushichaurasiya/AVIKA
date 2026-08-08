import api, { call } from './api';

export const menuService = {
  list: (kitchenId) => call(api.get(`/kitchens/${kitchenId}/menu`)),
  create: (kitchenId, item) => call(api.post(`/kitchens/${kitchenId}/menu`, item)),
  update: (kitchenId, itemId, item) => call(api.patch(`/kitchens/${kitchenId}/menu/${itemId}`, item)),
  remove: (kitchenId, itemId) => call(api.delete(`/kitchens/${kitchenId}/menu/${itemId}`))
};
