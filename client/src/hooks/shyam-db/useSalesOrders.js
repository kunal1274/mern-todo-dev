import { useEffect, useState, useCallback } from "react";
import * as svc from "../../api/salesOrderService.js";
import { toast } from "react-toastify";

export default function useSalesOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState({ search: "", status: "ALL" });

  // fetch list
  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await svc.fetchSalesOrders(query);
      setOrders(data);
    } finally {
      setLoading(false);
    }
  }, [query]);

  useEffect(() => {
    load();
  }, [load]);

  // CRUD helpers surfaced to UI
  return {
    orders,
    loading,
    setQuery,
    refresh: load,
    create: async (payload) => {
      await svc.createSalesOrder(payload);
      toast.success("Sales order created");
      load();
    },
    update: async (id, p) => {
      await svc.updateSalesOrder(id, p);
      toast.success("Sales order updated");
      load();
    },
    remove: async (id) => {
      await svc.deleteSalesOrder(id);
      toast.success("Sales order Deleted");
      load();
    },
    archive: async (id, a) => {
      await svc.toggleArchiveSO(id, a);
      toast.info(a ? "Archived" : "Un‑archived");
      load();
    },
  };
}
