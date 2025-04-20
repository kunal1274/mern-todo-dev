import axios from "axios";

const API = axios.create({
  baseURL:
    import.meta.env.VITE_API_URL_ERP || "http://localhost:5050/fms/api/v0",
});

// LIST with query params
export const fetchSalesOrders = (params) =>
  API.get("/sales-orders", { params }).then((res) => res.data.data);

// CREATE
export const createSalesOrder = (payload) =>
  API.post("/sales-orders", payload).then((res) => res.data.data);

// UPDATE by _id
export const updateSalesOrder = (salesOrderId, payload) =>
  API.put(`/sales-orders/${salesOrderId}`, payload).then((res) => res.data);

// DELETE (soft delete keeps `archived` flag false if you want)
export const deleteSalesOrder = (salesOrderId) =>
  API.delete(`/sales-orders/${salesOrderId}`).then((res) => res.data);

// PATCH archive/unarchive
export const toggleArchiveSO = (salesOrderId, archived) =>
  API.patch(`/sales-orders/${salesOrderId}/archive`, { archived }).then(
    (r) => r.data
  );

/* ---------- status action ---------- */
export const triggerSOAction1 = (salesOrderId, action) =>
  API.patch(`/sales-orders/${salesOrderId}/actions/${action}`).then(
    (r) => r.data
  );

export const triggerSOAction = (salesOrderId, action) =>
  API.patch(`/sales-orders/${salesOrderId}/actions/${action}`);

// allow a payload (e.g. qty) ------------------------------------
export const triggerSOActionWithData1 = (salesOrderId, action, data) =>
  API.patch(`/sales-orders/${salesOrderId}/actions/${action}`, data);

export const triggerSOActionWithData = (salesOrderId, action, data = {}) =>
  API.patch(`/sales-orders/${salesOrderId}/actions/${action}/data`, data);

export const fetchSalesOrder = (id) =>
  API.get(`/sales-orders/${id}`).then((r) => r.data);

// partial movements ------------------------------------------------
export const addShipment = (id, payload) =>
  API.post(`/sales-orders/${id}/ship`, payload);
export const addDelivery = (id, payload) =>
  API.post(`/sales-orders/${id}/deliver`, payload);
export const addInvoice = (id, payload) =>
  API.post(`/sales-orders/${id}/invoice`, payload);

// payments ---------------------------------------------------------
export const addPayment = (id, payload) =>
  API.post(`/sales-orders/${id}/payments`, payload);

// export stub ------------------------------------------------------
export const exportSingle = (id) =>
  API.get(`/sales-orders/${id}/export`, { responseType: "blob" });

/* -------- duplicate -------- */
export const duplicateSO = (id) =>
  API.post(`/sales-orders/${id}/duplicate`).then((r) => r.data);

/* -------- banks (stub) ----- */
export const fetchBanks = (id) => API.get(`/sales-orders/${id}/banks`);
export const addBank = (id, p) => API.post(`/sales-orders/${id}/banks`, p);

/* ---------- export ---------- */

/*

export const exportSalesOrders = async (format = "csv", params = {}) => {
  const res = await API.get("/sales-orders/export", {
    params: { ...params, format },
    responseType: "blob",
  });
  return res.data; // blob
};
*/

/* ---------- import ---------- */
/*
export const importSalesOrders = async (file) => {
  const fd = new FormData();
  fd.append("file", file);
  const res = await API.post("/sales-orders/import", fd, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};
*/
/* ---------- stats ---------- */
/*
export const fetchStats = (grp = "status", prd = "all") =>
  API.get("/sales-orders/stats", {
    params: { groupBy: grp, period: prd },
  }).then((r) => r.data);
  */
