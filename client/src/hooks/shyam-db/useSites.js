import { useEffect, useState, useCallback } from "react";
import * as api from "../../api/shyam-db/siteMasterService";

export default function useSites() {
  const [sites, setSites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState({});

  // fetch list
  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.listSites(query);
      console.log("site data", data);
      setSites(data);
    } finally {
      setLoading(false);
    }
  }, [query]);

  useEffect(() => {
    load();
  }, [load]);

  return {
    sites,
    loading,
    refresh: load,
    setQuery,
    create: api.createSite,
    read: api.viewSite,
    update: api.updateSite,
    remove: api.deleteSite,
    archive: api.toggleArchive,
  };
}
