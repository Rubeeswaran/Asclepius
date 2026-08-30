import { Search, Bell, UserRound } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";

export default function Navbar() {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  function submit(e) {
    e.preventDefault();

    if (!query.trim()) return;

    navigate(`/?q=${encodeURIComponent(query.trim())}`);
  }

  return (
    <header className="navbar">
      <Link to="/" className="brand">
        <span className="brand-mark">✦</span>
        <span>Asclepius</span>
      </Link>

      <nav>
        <Link to="/" className="nav-link">
          Home
        </Link>

        <Link to="/" className="nav-link">
          Search
        </Link>

        <Link to="/analytics" className="nav-link">
          Analytics
        </Link>

        <Link to="/references" className="nav-link">
          References
        </Link>
      </nav>

      <div className="nav-right">
        <form className="top-search" onSubmit={submit}>
          <Search size={15} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search target, disease..."
          />
        </form>

        <button className="icon-button">
          <Bell size={17} />
        </button>

        <button className="icon-button">
          <UserRound size={17} />
        </button>
      </div>
    </header>
  );
}
