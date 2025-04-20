export default function CardPlaceholderCrystal({ className = "" }) {
  return (
    <div
      className={`h-56 rounded-lg bg-gray-200/50 animate-pulse ${className}`}
    />
  );
}
