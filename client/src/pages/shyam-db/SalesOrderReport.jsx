import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { fetchStats } from "../api/salesOrderService";

export default function SalesOrderReport() {
  const [data, setData] = useState([]);

  useEffect(() => {
    fetchStats("status", "thisWeek").then(setData);
  }, []);

  return (
    <section>
      <h2 className="mb-6 text-2xl font-semibold">Sales Order Report</h2>

      <div className="rounded-lg border bg-white p-6">
        <h4 className="mb-4 font-medium">By Status (This week)</h4>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <XAxis dataKey="_id" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="count" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
