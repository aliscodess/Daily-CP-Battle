import React from "react";
import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <nav>
      <Link to="/">Home</Link> |{" "}
      <Link to="/match">Matchmaking</Link> |{" "}
      <Link to="/leaderboard">Leaderboard</Link>
    </nav>
  );
}
