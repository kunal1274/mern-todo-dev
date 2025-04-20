import { useState, useEffect } from "react";
import { insightsForOrder } from "../../api/ai";

export default function InsightsPanel({ orderId }) {
  const [data, setData] = useState(null);
  useEffect(() => {
    insightsForOrder(orderId).then(setData);
  }, [orderId]);

  if (!data) return null;
  const entries = Object.entries(data.summary);

  return (
    <div className="mb-4 rounded-lg border bg-white p-4 text-sm shadow">
      <h4 className="mb-2 font-semibold">AI Insights</h4>
      {entries.map(([key, value]) => (
        <p key={key}>
          <b>
            {key
              .replace(/([A-Z])/g, " $1")
              .replace(/^./, (str) => str.toUpperCase())}
            :
          </b>{" "}
          {value}
        </p>
      ))}

      {/* 2. Additional AI‐derived metrics */}
      <p>
        <b>Payment Risk:</b> {data.paymentRisk}
      </p>
      <p>
        <b>Profit Margin:</b> {data.profitMargin}
      </p>
      {/* These fields assume your backend now returns them: */}
      <p>
        <b>Outstanding Shipments:</b> {data.outstandingShipments}
      </p>
      <p>
        <b>Outstanding Deliveries:</b> {data.outstandingDeliveries}
      </p>
      <p>
        <b>Shipment Bottlenecks:</b> {data.shipmentBottlenecks}
      </p>

      <p>
        <b>Alerts:</b> {data.alerts.join(", ")}
      </p>
    </div>
  );
}
