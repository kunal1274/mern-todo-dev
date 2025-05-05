import { useEffect } from "react";
import { toast } from "react-toastify";

export default function showImportToast(result) {
  const { created = 0, errors = [] } = result;
  const id = toast.info(`⏳  Importing …`, {
    autoClose: false,
    closeOnClick: false,
    toastId: "imp",
  });

  // simulate async – you may remove if server returns instantly
  setTimeout(() => {
    toast.update("imp", {
      render: `✅  ${created} orders added${
        errors.length ? ` • ${errors.length} errors` : ""
      }`,
      type: errors.length ? "warning" : "success",
      autoClose: 4000,
      closeOnClick: true,
    });
  }, 600);
}
