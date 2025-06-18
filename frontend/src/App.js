import React from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";

import Home from "./pages/HomePage";
import MatchPage from "./pages/MatchPage";
import MatchmakingPage from "./pages/MatchmakingPage";
import LoginSignup from "./pages/LoginSignup";
import MatchResultPage from "./pages/MatchResultPage";
import "./App.css";

// Auth check
const isAuthenticated = () => {
  return !!localStorage.getItem("token");
};

function App() {
  return (
    <Router>
      <Routes>
        {/* Public route */}
        <Route path="/" element={<LoginSignup />} />

        {/* Protected routes (no Navbar) */}
        <Route
          path="/home"
          element={
            isAuthenticated() ? (
              <Home />
            ) : (
              <Navigate to="/" />
            )
          }
        />
        <Route
          path="/match/:roomId"
          element={
            isAuthenticated() ? (
              <MatchPage />
            ) : (
              <Navigate to="/" />
            )
          }
        />
        <Route
  path="/matchmaking"
  element={
    isAuthenticated() ? (
      <MatchmakingPage username={localStorage.getItem("username")} />
    ) : (
      <Navigate to="/" />
    )
  }
/>
      <Route
  path="/match-result"
  element={
    isAuthenticated() ? (
      <MatchResultPage />
    ) : (
      <Navigate to="/" />
    )
  }
/>


      </Routes>
    </Router>
  );
}

export default App;
