export default function renderStatus  (status: string) {
  const color = status === "active" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800";
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${color}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};