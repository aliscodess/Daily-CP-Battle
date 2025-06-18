// index.js or server.js
const express = require("express");
const http = require("http");
const cors = require("cors");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const { Server } = require("socket.io");
const Match = require("./models/Match");
const getRandomProblem = require("./utils/codeforces");

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log(err));

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true
  }
});

const axios = require("axios");
const userSocketMap = {}; // username -> socket.id
const matchViewers = {}; // Track users who opened the problem
const activeMonitors = {}; // Track polling intervals

io.on("connection", (socket) => {
  console.log("User connected: " + socket.id);

  socket.on("register", (username) => {
    userSocketMap[username] = socket.id;
    console.log(`${username} registered with socket ID ${socket.id}`);
  });

  socket.on("send-invite", ({ from, to, problemRating, maxTime }) => {
    const targetSocketId = userSocketMap[to];
    if (targetSocketId) {
      io.to(targetSocketId).emit("receive-invite", {
        from,
        problemRating,
        maxTime,
      });
    }
  });

  socket.on("accept-invite", async ({ from, to, problemRating, maxTime }) => {
    const fromSocketId = userSocketMap[from];
    const toSocketId = userSocketMap[to];
    if (!fromSocketId || !toSocketId) return;

    try {
      const rating = parseInt(problemRating, 10);
      const problem = await getRandomProblem(rating);
      if (!problem) return;

      const roomId = `${[from, to].sort().join("_")}_${Date.now()}`;

      const newMatch = new Match({
        roomId,
        players: [from, to],
        contestId: problem.contestId,
        index: problem.index,
        problemId: `${problem.contestId}-${problem.index}`,
        problemName: problem.name,
        problemRating: problem.rating,
        maxTime,
      });

      await newMatch.save();

      const problemLink = `https://codeforces.com/problemset/problem/${problem.contestId}/${problem.index}`;
      const matchData = {
        roomId,
        problem: {
          name: problem.name,
          rating: problem.rating,
          link: problemLink,
        },
      };

      io.to(fromSocketId).emit("start-match", matchData);
      io.to(toSocketId).emit("start-match", matchData);
    } catch (err) {
      console.error("Error during match creation:", err.message);
    }
  });

  socket.on("problemOpened", async ({ roomId, username, handle }) => {
    if (!matchViewers[roomId]) matchViewers[roomId] = new Map();
    matchViewers[roomId].set(username, handle);

    if (matchViewers[roomId].size === 2) {
      const [[u1, h1], [u2, h2]] = [...matchViewers[roomId].entries()];
      const match = await Match.findOne({ roomId });
      if (!match) return;

      const { contestId, index, maxTime } = match;

      io.to(userSocketMap[u1]).emit("startTimer", { maxTime });
      io.to(userSocketMap[u2]).emit("startTimer", { maxTime });

      monitorMatch(roomId, h1, h2, u1, u2, contestId, index);
    }
  });

  socket.on("submitSolution", ({ roomId, user }) => {
    socket.to(roomId).emit("solutionSubmitted", user);
  });

  socket.on("disconnect", () => {
    for (const user in userSocketMap) {
      if (userSocketMap[user] === socket.id) {
        delete userSocketMap[user];
        break;
      }
    }
    console.log("User disconnected: " + socket.id);
  });
});

async function checkIfSolved(handle, contestId, index) {
  try {
    const res = await axios.get(`https://codeforces.com/api/user.status?handle=${handle}&from=1&count=20`);
    return res.data.result.some(sub =>
      sub.problem.contestId == contestId &&
      sub.problem.index == index &&
      sub.verdict === "OK"
    );
  } catch (err) {
    console.error("Error checking submissions:", err.message);
    return false;
  }
}

function monitorMatch(roomId, h1, h2, u1, u2, contestId, index) {
  if (activeMonitors[roomId]) return;

  const interval = setInterval(async () => {
    const [s1, s2] = await Promise.all([
      checkIfSolved(h1, contestId, index),
      checkIfSolved(h2, contestId, index),
    ]);

    if (s1 || s2) {
      clearInterval(interval);
      delete activeMonitors[roomId];

      const winner = s1 ? u1 : u2;
      const loser = s1 ? u2 : u1;

      const WIN_POINTS = 10;
const LOSE_POINTS = -5;

const matchResultPayload = {
  winner,
  loser,
  results: {
    [winner]: { points: WIN_POINTS },
    [loser]: { points: LOSE_POINTS },
  }
};

    await Match.updateOne({ roomId }, { winner });

    io.to(userSocketMap[u1]).emit("matchResult", matchResultPayload);
    io.to(userSocketMap[u2]).emit("matchResult", matchResultPayload);

    }
  }, 1000);

  activeMonitors[roomId] = interval;
}

// Routes
app.use("/api/match", require("./routes/match"));
app.use("/api", require("./routes/auth"));
app.get("/", (req, res) => res.send("API is running"));

server.listen(5000, () => console.log("Server running on port 5000"));
