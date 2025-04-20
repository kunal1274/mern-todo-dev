import ChatBot from "../../components/ai/AIChatBot";
import CardPlaceholderCrystal from "../../components/shyam-db/CardPlaceholder";

export default function DashboardCrystal() {
  return (
    <>
      {/* title & filters */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Dashboard</h2>
          <p className="text-sm text-gray-400">
            Pretend not to be evil meow to be let out intently stare at the
            same .
          </p>
        </div>
        <div className="flex items-center gap-4">
          <button className="flex items-center gap-2 text-sm">
            <span className="inline-block w-4 h-4 bg-gray-300 rounded"></span>
            Learn More
          </button>
          <select className="rounded border px-2 py-1 text-sm">
            <option>This week</option>
            <option>This month</option>
          </select>
          <ChatBot initialPrompt="Ask me anything about your B² Dashboards…" />
        </div>
      </div>

      {/* first row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <CardPlaceholderCrystal />
        <CardPlaceholderCrystal />
      </div>

      {/* big panel */}
      <CardPlaceholderCrystal className="h-96" />
    </>
  );
}
