import { FiChevronUp, FiChevronDown } from "react-icons/fi";

export default function TableHeadSort({ label, sortKey, sort, setSort }) {
  const active = sort.key === sortKey;
  const direction = active ? sort.dir : "none";

  const toggle = () =>
    setSort({
      key: sortKey,
      dir: active && sort.dir === "asc" ? "desc" : "asc",
    });

  return (
    <th
      onClick={toggle}
      className="cursor-pointer whitespace-nowrap px-4 py-2 text-left text-sm font-semibold text-gray-600 select-none"
    >
      {label}
      {direction !== "none" ? (
        direction === "asc" ? (
          <FiChevronUp className="inline ml-1 align-middle" />
        ) : (
          <FiChevronDown className="inline ml-1 align-middle" />
        )
      ) : null}
    </th>
  );
}
