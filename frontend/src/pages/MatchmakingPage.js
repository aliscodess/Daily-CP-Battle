import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import socket from "../socket";
import "./MatchmakingPage.css";

export default function MatchmakingPage({ username }) {
  const [opponent, setOpponent] = useState("");
  const [problemRating, setProblemRating] = useState("");
  const [maxTime, setMaxTime] = useState("");
  const [cfHandle, setCfHandle] = useState("");
  const [incomingInvite, setIncomingInvite] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    socket.emit("register", username);

    socket.on("receive-invite", (data) => {
      setIncomingInvite(data); // now contains from, problemRating, maxTime
    });

    socket.on("start-match", ({ roomId }) => {
      navigate(`/match/${roomId}`);
    });

    return () => {
      socket.off("receive-invite");
      socket.off("start-match");
    };
  }, [username, navigate]);

  const sendInvite = () => {
    if (!opponent || !problemRating || !maxTime ||!cfHandle) return;
    localStorage.setItem("cfHandle", cfHandle);
    console.log("Sending invite with:");
    console.log("Opponent:", opponent);
    console.log("Rating:", problemRating);
    console.log("Time:", maxTime);
    socket.emit("send-invite", {
      from: username,
      to: opponent,
      problemRating:parseInt(problemRating, 10),
      maxTime:parseInt(maxTime, 10),
    });
    alert(`Invite sent to ${opponent}`);
    setOpponent("");
    setProblemRating("");
    setMaxTime("");
  };

  const acceptInvite = () => {
    localStorage.setItem("cfHandle", cfHandle); // Add this before emit if you render a field

    socket.emit("accept-invite", 
    { from: incomingInvite.from, 
      to: username,
      problemRating: incomingInvite.problemRating, 
      maxTime: incomingInvite.maxTime  });
    setIncomingInvite(null);
  };

  const rejectInvite = () => {
    setIncomingInvite(null);
  };

  return (
    <div className="matchmaking-page">
      <div className="matchmaking-card">
        <h2 className="welcome-text">Welcome{username ? `, ${username}` : ""}</h2>
        <p className="subtext">Invite someone for a daily coding battle</p>
        <div className="input-group">
          <input
            className="username-input"
            placeholder="Opponent's username"
            value={opponent}
            onChange={(e) => setOpponent(e.target.value)}
          />
          <input
            className="username-input"
            placeholder="Problem Rating (e.g. 1200)"
            type="number"
            value={problemRating}
            onChange={(e) => setProblemRating(e.target.value)}
          />
          <input
            className="username-input"
            placeholder="Max Time (in mins)"
            type="number"
            value={maxTime}
            onChange={(e) => setMaxTime(e.target.value)}
          />
          <input
            className="username-input"
            placeholder="Your Codeforces Handle"
            value={cfHandle}
            onChange={(e) => setCfHandle(e.target.value)}
          />
          <button className="invite-btn" onClick={sendInvite}>
            🚀 Send Invite
          </button>
        </div>

        {incomingInvite && (
          <div className="invite-popup">
             <input
              className="username-input"
              placeholder="Your Codeforces Handle"
              value={cfHandle}
              onChange={(e) => setCfHandle(e.target.value)}
            />
            <p className="invite-msg">
              ⚔ <strong>{incomingInvite.from}</strong> has challenged you!
            </p>
            <p className="invite-details">
              🧠 <strong>Problem Rating:</strong> {incomingInvite.problemRating}
              <br />
              ⏱ <strong>Max Time:</strong> {incomingInvite.maxTime} minutes
            </p>
            <div className="invite-buttons">
              <button className="accept-btn" onClick={acceptInvite}>
                ✅ Accept
              </button>
              <button className="reject-btn" onClick={rejectInvite}>
                ❌ Reject
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
