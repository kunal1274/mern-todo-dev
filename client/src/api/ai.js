import axios from "axios";
const AI = axios.create({
  baseURL: import.meta.env.VITE_API_URL_AI || "/fms/api/v0/ai",
});

export const askAI = (question) =>
  AI.post("/query", { question, userId: "demoUser" }).then(
    (r) => r.data.response
  );

export const insightsForOrder = (id) =>
  AI.get(`/insights/${id}`).then((r) => r.data);

export const chatAboutOrder = (question, orderNum = "") =>
  AI.post("/query", { question, orderNum }).then((r) => r.data.response);
