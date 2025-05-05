// hooks/useFileUpload.js
import { useState } from "react";
import { API } from "../../api/salesOrderService.js";

export const useFileUpload = () => {
  const [progress, setProgress] = useState(0);
  const [busy, setBusy] = useState(false);

  const upload = (entity, id, files) => {
    const fd = new FormData();
    [...files].forEach((f) => fd.append("files", f));
    setBusy(true);
    return API.post(`/upload/${entity}/${id}`, fd, {
      // headers: { "Content-Type": "multipart/form-data" }, // ← add this
      onUploadProgress: (e) => {
        if (e.total) setProgress(Math.round((e.loaded * 100) / e.total));
      },
    }).finally(() => {
      setBusy(false);
      setProgress(0);
    });
  };
  return { upload, progress, busy };
};
