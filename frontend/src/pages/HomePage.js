import React from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./HomePage.css";

export default function HomePage() {
  const navigate = useNavigate();

 
    const startBattle = () => {
      navigate("/matchmaking");
    };
  return (
    <div className="cf-container">
      <nav className="cf-navbar">
        <a href="/home" className="cf-link">Home</a>
        <span className="cf-divider">|</span>
        <a href="/matchmaking" className="cf-link">Matchmaking</a>
        <span className="cf-divider">|</span>
        <a href="/leaderboard" className="cf-link">Leaderboard</a>
      </nav>
      <div className="cf-content">
        <h1 className="cf-title">Ready <br></br>for the<br></br>Challenge?</h1>
        <button className="cf-button" onClick={startBattle}>
          ⚔ Start Daily Battle
        </button>
      </div>
    </div>
  );
}
