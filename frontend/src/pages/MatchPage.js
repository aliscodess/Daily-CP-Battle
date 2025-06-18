import React, { useEffect, useState,useRef } from "react";
import axios from "axios";
import socket from "../socket";
import { useParams, useNavigate } from "react-router-dom";
import "./MatchPage.css";

function MatchPage() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const [opponentDone, setOpponentDone] = useState(false);
  const [problem, setProblem] = useState(null);
  const [timer, setTimer] = useState(0);
  const [maxTime, setMaxTime] = useState(0);
  const intervalRef=useRef(null);

  const username = localStorage.getItem("username");
  const handle = localStorage.getItem("cfHandle");

  useEffect(() => {
    if (!username || !handle) {
      alert("Username or CF Handle not found. Please log in again.");
      navigate("/");
      return;
    }

    socket.emit("joinRoom", roomId);

    // Inform server that user has opened the problem
    socket.emit("problemOpened", {
      roomId,
      username,
      handle,
    });

 const handleStartTimer = ({ maxTime }) => {
    // Clear any existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    setMaxTime(maxTime);
    setTimer(maxTime);

    intervalRef.current = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

    const handleMatchResult = ({ winner, loser, results }) => {
  navigate("/match-result", {
    state: {
      winner,
      loser,
      results
    }
  });
};


    socket.on("startTimer", handleStartTimer);
    socket.on("matchResult", handleMatchResult);

    return () => {
      socket.off("startTimer", handleStartTimer);
      socket.off("matchResult", handleMatchResult);
    };
  }, [roomId, username, handle, navigate]);

  useEffect(() => {
    const handleSolutionSubmitted = (user) => {
      if (user !== username) {
        setOpponentDone(true);
      }
    };

    socket.on("solutionSubmitted", handleSolutionSubmitted);

    return () => {
      socket.off("solutionSubmitted", handleSolutionSubmitted);
    };
  }, [username]);

  useEffect(() => {
    const fetchMatch = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/match/${roomId}`);
        setProblem(res.data.problem);
      } catch (err) {
        console.error("Failed to load match:", err.message);
      }
    };

    fetchMatch();
  }, [roomId]);

  const submitSolution = () => {
    socket.emit("submitSolution", { roomId, user: username });
  };

  return (
    <div className="match-container">
      <div className="match-card">
        <h2 className="room-title">
          Room: <span>{roomId}</span>
        </h2>

        {problem ? (
          <div className="problem-section">
            <p><strong>Problem:</strong> {problem.name}</p>
            <p><strong>Rating:</strong> {problem.rating}</p>
            <a
              href={problem.link}
              target="_blank"
              rel="noopener noreferrer"
              className="problem-link"
            >
              Go to Problem
            </a>
          </div>
        ) : (
          <p className="loading">Loading problem...</p>
        )}

        {/* Timer visual */}
        <div className="timer-bar-container">
          <div
            className="timer-bar"
            style={{ width: `${(timer / maxTime) * 100}%` }}
          ></div>
        </div>
        <p>Time left: {timer} seconds</p>

        <button className="submit-button" onClick={submitSolution}>
          Mark as Done
        </button>

        {opponentDone && <p className="opponent-done">✅ Opponent has completed the problem!</p>}
      </div>
    </div>
  );
}

export default MatchPage;
