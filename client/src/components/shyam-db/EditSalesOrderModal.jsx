import SalesOrderModal from "./SalesOrderModal";

export default function EditSalesOrderModal({
  open,
  initial,
  onClose,
  onSave,
}) {
  if (!open) return null;
  return (
    <SalesOrderModal
      open
      initial={initial}
      onClose={onClose}
      onSubmit={(data) => onSave(data)}
    />
  );
}
