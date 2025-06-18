import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./MatchResultPage.css";

function MatchResultPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { winner, loser, results } = location.state || {};

  if (!winner || !loser || !results) {
    return (
      <div className="result-container">
        <p>Invalid match result. Please return to home.</p>
        <button onClick={() => navigate("/")}>Go Home</button>
      </div>
    );
  }

  return (
    <div className="result-container">
      <h1>🏁 Match Result</h1>

      <div className="player-result winner">
        🏆 <strong>{winner}</strong> won!
        <p>Points: <span className="points-win">+{results[winner].points}</span></p>
      </div>

      <div className="player-result loser">
        ❌ <strong>{loser}</strong> lost.
        <p>Points: <span className="points-lose">{results[loser].points}</span></p>
      </div>

      <button className="home-btn" onClick={() => navigate("/")}>Back to Home</button>
    </div>
  );
}

export default MatchResultPage;
