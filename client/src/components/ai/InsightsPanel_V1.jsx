import { useEffect, useState } from "react";
import { insightsForOrder } from "../../api/ai.js";

export default function InsightsPanel({ orderId }) {
  const [data, setData] = useState(null);
  useEffect(() => {
    insightsForOrder(orderId).then(setData);
  }, [orderId]);

  if (!data) return null;
  return (
    <div className="mb-4 rounded-lg border bg-white p-4 text-sm shadow max-h-10">
      <h4 className="mb-2 font-semibold">AI Insights</h4>
      <p>
        <b>Summary:</b> {String(data.summary)}
      </p>
      <p>
        <b>Payment Risk:</b> {String(data.paymentRisk)}
      </p>
      <p>
        <b>Profit Margin:</b> {String(data.profitMargin)}
      </p>
      <p>
        <b>Alerts:</b> {String(data.alerts)}
      </p>
    </div>
  );
}
