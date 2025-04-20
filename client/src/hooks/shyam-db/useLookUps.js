import axios from "axios";
import { useEffect, useState } from "react";

const API = axios.create({
  baseURL:
    import.meta.env.VITE_API_URL_ERP || "http://localhost:5050/fms/api/v0",
});

export default function useLookups() {
  const [cust, setCust] = useState([]);
  const [item, setItem] = useState([]);

  useEffect(() => {
    API.get("/customers?fields=_id,name,code,contactNum").then((r) =>
      setCust(r.data.data)
    );
    API.get("/items?fields=_id,name,code,unit,price").then((r) =>
      setItem(r.data.data)
    );
  }, []);

  return { cust, item };
}
