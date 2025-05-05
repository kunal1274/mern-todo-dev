import axios from "axios";

const API = axios.create({ baseURL: import.meta.env.VITE_API_URL_ERP });

export const listSites = (q = {}) =>
  API.get("/sites", { params: q }).then((r) => r.siteData);
export const viewSite = (id) => API.get(`/sites/${id}`).then((r) => r.data);
export const createSite = (payload) =>
  API.post("/sites", payload).then((r) => r.data);
export const updateSite = (id, payload) =>
  API.put(`/sites/${id}`, payload).then((r) => r.data);
export const deleteSite = (id) =>
  API.delete(`/sites/${id}`).then((r) => r.data);
export const toggleArchive = (id, flag) =>
  API.patch(`/sites/${id}/archive`, { archived: flag }).then((r) => r.data);
