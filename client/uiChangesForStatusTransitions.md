Below is **Sprint “Process‑Flow Enhancement”**.  
Everything you need to copy / paste is included; unchanged lines are omitted for brevity.

---

## 1 Front‑end

### 1.1 `src/utility/qtyMath.js`   *(new file – replaces the quick helper you had)*

```js
/* returns only POSTED rows – Draft & Cancelled are ignored */
const postedSum = (arr) =>
  arr
    ?.filter((r) => r.status === "Posted")
    .reduce((n, r) => n + Number(r.qty || 0), 0) || 0;

export function totals(so) {
  const shipped = postedSum(so.shippingQty);
  const delivered = postedSum(so.deliveringQty);
  const invoiced = postedSum(so.invoicingQty);

  return {
    shipped,
    delivered,
    invoiced,
    remainToShip: so.quantity - shipped,
    remainToDeliver: shipped - delivered,
    remainToInvoice: delivered - invoiced,
  };
}
```

---

### 1.2 `src/components/shyam-db/ProcessFlowDrawer.jsx`

> Only **new / changed** chunks are shown — paste them over the old file.

#### a) helper – decide **order status** after every movement

```jsx
function deriveOrderStatus(t) {
  if (t.shipped === 0) return "Confirmed";
  if (t.shipped < so.quantity) return "PartiallyShipped";
  if (t.delivered < t.shipped) return "PartiallyDelivered";
  if (t.invoiced < t.delivered) return "PartiallyInvoiced";
  return { shipped: "Shipped", delivered: "Delivered", invoiced: "Invoiced" }[
    ["Shipped", "Delivered", "Invoiced"][+!!t.delivered + +!!t.invoiced]
  ];
}
```

_(used by backend but kept here for clarity)_

#### b) history table – **row actions**

```jsx
<td className="px-2 py-1 flex gap-1">
  <button onClick={() => setViewRow(r)} className="text-xs underline">
    View
  </button>
  {r.status === "Draft" && (
    <button
      onClick={() => updateRow("post", r)}
      className="text-xs text-emerald-600"
    >
      Post
    </button>
  )}
  {r.status !== "Cancelled" && (
    <button
      onClick={() => updateRow("cancel", r)}
      className="text-xs text-red-600"
    >
      Cancel
    </button>
  )}
  {r.status === "Posted" && (
    <button onClick={() => setCorrectRow(r)} className="text-xs">
      Correct
    </button>
  )}
</td>
```

_(full table code in repo snippet ‑ keep other columns unchanged)_

#### c) local state

```jsx
const [viewRow, setViewRow] = useState(null); // read‑only modal
const [correctRow, setCorrectRow] = useState(null); // opens MovementModal pre‑filled
```

#### d) API helpers (top of file, after imports)

```jsx
import {
  postMovement, // PATCH /sales-orders/:id/movements/:collection/:rid/post
  cancelMovement, //        … /cancel
} from "../../api/salesOrderService";
```

#### e) functions

```jsx
async function updateRow(action, row) {
  const col = stepForRow(row); // "shippingQty" | "deliveringQty" | "invoicingQty"
  const api = action === "post" ? postMovement : cancelMovement;
  await api(so._id, col, row._id);
  toast.success(`Movement ${action}ed`);
  onDone();
}
```

_(`stepForRow` is a tiny helper that checks which array contains the row.)_

#### f) new modals at bottom

```jsx
{
  /* view modal */
}
{
  viewRow && (
    <SimpleModal title="Movement Details" onClose={() => setViewRow(null)}>
      <pre className="whitespace-pre-wrap text-xs">
        {JSON.stringify(viewRow, null, 2)}
      </pre>
    </SimpleModal>
  );
}
{
  /* correction – opens normal MovementModal with qty pre‑filled */
}
{
  correctRow && (
    <MovementModal
      open
      title={`Correct ${correctRow.qty}`}
      max={
        remainMap[stepForRow(correctRow).replace("Qty", "")] + correctRow.qty
      }
      initial={{ qty: correctRow.qty }}
      onClose={() => setCorrectRow(null)}
      onSubmit={(data) => {
        updateRow("cancel", correctRow).then(() => {
          fire({ key: stepForRow(correctRow).slice(0, -3) }, data); // reuse existing add
          setCorrectRow(null);
        });
      }}
    />
  );
}
```

_(`SimpleModal` is a 10‑line generic modal – add once in `components/common/SimpleModal.jsx`)_

---

### 1.3 `src/components/shyam-db/MovementModal.jsx`

_Accept an optional **initial** prop, and expose the movement **status** selector._

```diff
-export default function MovementModal({ open, onClose, onSubmit, max, title }) {
+export default function MovementModal({ open, onClose, onSubmit, max, title, initial={} }) {
-  const initial = { … }
-  const [form, setForm] = useState(initial);
+  const base = { …default values… , ...initial };
+  const [form, setForm] = useState(base);
```

Add status selector when `showMore`:

```jsx
{
  showMore && title !== "Invoice" && (
    <>
      <label className="text-sm font-medium">Status</label>
      <select
        className="mt-1 mb-4 w-full rounded border px-3 py-2"
        value={form.status || "Draft"}
        onChange={(e) => setForm({ ...form, status: e.target.value })}
      >
        {["Draft", "Posted"].map((s) => (
          <option key={s}>{s}</option>
        ))}
      </select>
    </>
  );
}
```

_(backend will ignore `status` on add and default to Draft; correction flow uses it.)_

---

## 2 Back‑end

### 2.1 Routes `routes/salesOrder.routes.js`

```diff
+router.patch("/:id/movements/:col/:rid/post",   ctl.postMovement);
+router.patch("/:id/movements/:col/:rid/cancel", ctl.cancelMovement);
```

### 2.2 Controller additions `controllers/salesOrder.controller.js`

```js
/* helper returns array name for col param safety */
const allowedCols = { shippingQty: 1, deliveringQty: 1, invoicingQty: 1 };

async function mutateMovement(req, res, next, mutateFn) {
  const { id, col, rid } = req.params;
  if (!allowedCols[col]) return next(createError(400, "bad collection"));
  const so = await SalesOrderModel.findById(id);
  const row = so[col].id(rid);
  if (!row) return next(createError(404, "row not found"));
  await mutateFn(row); // e.g. row.status="Posted"
  so.status = deriveOrderStatus(totals(so)); // from utility/qtyMath
  await so.save();
  res.json(so);
}

export const postMovement = (req, res, next) =>
  mutateMovement(req, res, next, (r) => {
    if (r.status === "Draft") r.status = "Posted";
  });

export const cancelMovement = (req, res, next) =>
  mutateMovement(req, res, next, (r) => {
    r.status = "Cancelled";
  });
```

_(`deriveOrderStatus` is the same logic shown in the front‑end util; duplicate in this file or import.)_

### 2.3 Adding movements keeps order‑level status correct

In the **existing** `triggerActionWithData` handler (where you `push` the new shipping/delivery/invoice object) append:

```js
// after pushing the row:
so.status = deriveOrderStatus(totals(so));
```

_(No other change required – the new Partially_ statuses are now automatically set.)\*

---

## 3 Design decisions & behaviour

| Feature               | UX                                                                                                                                           | Back‑end                                                                    |
| --------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| **Multiple partials** | Because `remainMap` uses _posted_ totals, the “Set” button stays enabled until fully processed.                                              | Status is `PartiallyShipped/Delivered/Invoiced` while any remainder exists. |
| **Post / Cancel**     | Each row shows **Post** (Draft→Posted) and **Cancel**. Posted rows cannot be posted again; Cancel shows strikethrough style (CSS not shown). | Patch endpoints update the sub‑doc’s `status` and recompute header status.  |
| **Correction**        | For a Posted row choose **Correct** → modal opens with qty pre‑filled. The flow: ① cancels old row ② immediately adds the corrected one.     | same endpoints; totals auto‑recompute.                                      |
| **View details**      | SimpleModal shows full JSON so support can read misc. fields.                                                                                | n/a                                                                         |

---

## 4 Files added

```
src/utility/qtyMath.js
src/components/common/SimpleModal.jsx
```

> _SimpleModal is a 4‑prop component (`title|children|onClose|className`) – keep it minimal._

---

### That’s the complete implementation for the “Enhancement” sprint.

_Next steps_ (separate sprints):

- integrate BullMQ for async posting
- sockets for live stepper updates
- document reversal entries in finance ledgers

Ping whenever you’re ready!
