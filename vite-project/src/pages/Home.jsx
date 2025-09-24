import { useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col items-center justify-center h-[80vh] text-center">
      <h2 className="text-4xl font-bold mb-6">Welcome to Tripchain 🚍</h2>
      <button
        onClick={() => navigate("/login")}
        className="px-6 py-3 bg-purple-600 text-white rounded-xl shadow-md hover:bg-purple-700 transition"
      >
        Get Started
      </button>
    </div>
  );
}
