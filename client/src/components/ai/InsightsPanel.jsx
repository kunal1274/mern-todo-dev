import { useEffect, useState } from "react";
import { insightsForOrder } from "../../api/ai.js";

function RenderValue({ label, value }) {
  if (value == null) return null;
  if (Array.isArray(value)) {
    return (
      <div className="ml-4">
        <b>{label}:</b>
        <ul className="list-disc list-inside">
          {value.map((v, i) => (
            <li key={i}>{String(v)}</li>
          ))}
        </ul>
      </div>
    );
  }
  if (typeof value === "object") {
    return (
      <div className="ml-4">
        <b>{label}:</b>
        {Object.entries(value).map(([k, v]) => (
          <RenderValue key={k} label={k.replace(/([A-Z])/g, " $1")} value={v} />
        ))}
      </div>
    );
  }
  return (
    <p>
      <b>{label}:</b> {String(value)}
    </p>
  );
}

export default function InsightsPanel({ orderId }) {
  const [data, setData] = useState(null);
  useEffect(() => {
    insightsForOrder(orderId).then(setData);
  }, [orderId]);

  if (!data) return null;

  return (
    <div className="mb-4 rounded-lg border bg-white p-4 text-sm shadow h-64 max-h-64 overflow-auto">
      <h4 className="mb-2 font-semibold">AI Insights</h4>
      {Object.entries(data).map(([key, val]) => (
        <RenderValue
          key={key}
          label={key.replace(/([A-Z])/g, " $1")}
          value={val}
        />
      ))}
    </div>
  );
}
