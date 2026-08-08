/**
 * Avika API client.
 * Points at the Express backend from Phase 3. Change API_BASE_URL once
 * you deploy the backend (e.g. https://api.avika.app).
 *
 * Every method returns { ok, data, error }. Callers check `ok` rather than
 * relying on thrown exceptions, so a network failure (backend not running)
 * degrades to a clear message instead of a broken page.
 */
var Avika = (function () {
  var API_BASE_URL = window.AVIKA_API_BASE_URL || 'http://localhost:4000/api';
  var TOKEN_KEY = 'avika_token';

  // localStorage can throw in some sandboxed/preview contexts (e.g. private
  // browsing, or an iframe without storage access). Fall back to an
  // in-memory token for the current page load so the app doesn't crash —
  // it just won't persist a login across refreshes in that fallback case.
  var memoryToken = null;
  function getToken() {
    try { return localStorage.getItem(TOKEN_KEY) || memoryToken; }
    catch (e) { return memoryToken; }
  }
  function setToken(token) {
    memoryToken = token;
    try { localStorage.setItem(TOKEN_KEY, token); } catch (e) { /* ignore */ }
  }
  function clearToken() {
    memoryToken = null;
    try { localStorage.removeItem(TOKEN_KEY); } catch (e) { /* ignore */ }
  }

  async function request(path, options) {
    options = options || {};
    var headers = Object.assign({ 'Content-Type': 'application/json' }, options.headers || {});
    var token = getToken();
    if (token) headers.Authorization = 'Bearer ' + token;

    try {
      var res = await fetch(API_BASE_URL + path, {
        method: options.method || 'GET',
        headers: headers,
        body: options.body ? JSON.stringify(options.body) : undefined
      });
      var json = await res.json().catch(function () { return {}; });

      if (!res.ok) {
        var message = (json.error && json.error.message) || 'Request failed (' + res.status + ')';
        return { ok: false, data: null, error: message, details: json.error && json.error.details };
      }
      return { ok: true, data: json.data, meta: json.meta, error: null };
    } catch (err) {
      return {
        ok: false,
        data: null,
        error: 'Could not reach the Avika API at ' + API_BASE_URL + '. Is the backend running?'
      };
    }
  }

  return {
    auth: {
      register: function (name, email, password, role) {
        return request('/auth/register', { method: 'POST', body: { name, email, password, role } });
      },
      login: function (email, password) {
        return request('/auth/login', { method: 'POST', body: { email, password } });
      },
      me: function () {
        return request('/auth/me');
      },
      logout: clearToken,
      saveSession: function (data) {
        if (data && data.token) setToken(data.token);
      },
      isLoggedIn: function () {
        return Boolean(getToken());
      }
    },
    kitchens: {
      near: function (lat, lng, radiusKm) {
        var q = '?lat=' + lat + '&lng=' + lng + '&radiusKm=' + (radiusKm || 5);
        return request('/kitchens' + q);
      },
      get: function (id) {
        return request('/kitchens/' + id);
      },
      mine: function () {
        return request('/kitchens/mine');
      },
      menu: function (kitchenId) {
        return request('/kitchens/' + kitchenId + '/menu');
      },
      create: function (kitchen) {
        return request('/kitchens', { method: 'POST', body: kitchen });
      },
      update: function (id, kitchen) {
        return request('/kitchens/' + id, { method: 'PATCH', body: kitchen });
      },
      adminAll: function (status) {
        return request('/kitchens/admin/all' + (status ? '?status=' + status : ''));
      },
      approve: function (id, isApproved) {
        return request('/kitchens/' + id + '/approve', { method: 'PATCH', body: { isApproved: isApproved } });
      },
      addEmployee: function (kitchenId, employee) {
        return request('/kitchens/' + kitchenId + '/employees', { method: 'POST', body: employee });
      },
      removeEmployee: function (kitchenId, employeeId) {
        return request('/kitchens/' + kitchenId + '/employees/' + employeeId, { method: 'DELETE' });
      }
    },
    orders: {
      create: function (order) {
        return request('/orders', { method: 'POST', body: order });
      },
      mine: function () {
        return request('/orders/mine');
      },
      forKitchen: function (kitchenId, status) {
        var q = status ? '?status=' + status : '';
        return request('/orders/kitchen/' + kitchenId + q);
      },
      get: function (id) {
        return request('/orders/' + id);
      },
      updateStatus: function (id, status) {
        return request('/orders/' + id + '/status', { method: 'PATCH', body: { status } });
      }
    },
    cart: {
      KEY: 'avika_cart',
      get: function () {
        try { return JSON.parse(localStorage.getItem(this.KEY)) || {}; }
        catch (e) { return {}; }
      },
      save: function (cart) {
        try { localStorage.setItem(this.KEY, JSON.stringify(cart)); } catch (e) { /* ignore */ }
      },
      clear: function () {
        try { localStorage.removeItem(this.KEY); } catch (e) { /* ignore */ }
      }
    },
    payments: {
      createIntent: function (orderId) {
        return request('/payments/create-intent', { method: 'POST', body: { orderId } });
      }
    },
    uploads: {
      // Bypasses request()'s JSON content-type since this needs multipart/form-data.
      image: async function (file) {
        var token = getToken();
        var form = new FormData();
        form.append('image', file);
        try {
          var res = await fetch(API_BASE_URL + '/uploads', {
            method: 'POST',
            headers: token ? { Authorization: 'Bearer ' + token } : {},
            body: form
          });
          var json = await res.json().catch(function () { return {}; });
          if (!res.ok) return { ok: false, data: null, error: (json.error && json.error.message) || 'Upload failed' };
          return { ok: true, data: json.data, error: null };
        } catch (err) {
          return { ok: false, data: null, error: 'Could not reach the Avika API at ' + API_BASE_URL };
        }
      }
    },
    users: {
      toggleFavorite: function (kitchenId) {
        return request('/users/me/favorites/' + kitchenId, { method: 'POST' });
      },
      updateProfile: function (data) {
        return request('/users/me', { method: 'PATCH', body: data });
      }
    }
  };
})();
