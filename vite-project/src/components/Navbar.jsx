import { Link, useNavigate } from "react-router-dom";

export default function Navbar({ user, setUser }) {
  const navigate = useNavigate();

  const handleTripchainClick = () => {
    if (window.confirm("Do you want to refresh the page?")) {
      navigate(0); // refresh page
    }
  };

  return (
    <nav className="flex justify-between items-center bg-purple-600 text-white px-6 py-4 shadow-md">
      <h1
        onClick={handleTripchainClick}
        className="text-2xl font-bold cursor-pointer"
      >
        Tripchain
      </h1>
      <ul className="flex gap-6 items-center">
        <li><Link to="/">Home</Link></li>
        <li><Link to="/about">About</Link></li>
        <li><Link to="/contact">Contact</Link></li>
        <li>
          {user ? (
            <span className="cursor-pointer" onClick={() => setUser(null)}>
              {user.name}'s Profile
            </span>
          ) : (
            <Link to="/login">Login / Sign Up</Link>
          )}
        </li>
      </ul>
    </nav>
  );
}
