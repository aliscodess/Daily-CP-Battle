const express = require("express");
const router = express.Router();
const Match = require("../models/Match");
const axios = require("axios");
const getRandomProblem = require("../utils/codeforces");

// POST /api/match/matchmake
router.post("/matchmake", async (req, res) => {
  try {
    const { player1, player2, problemRating } = req.body;

    const rating = parseInt(problemRating, 10);
    const problem = await getRandomProblem(rating);

    if (!problem) {
      return res.status(500).json({ error: "Unable to fetch problem" });
    }
    console.log("Selected problem:", problem); // ✅ Add this

    const roomId = `${[player1, player2].sort().join("_")}_${Date.now()}`;

    const newMatch = new Match({
      roomId,
      players: [player1, player2],
      contestId: problem.contestId,
      index: problem.index,
      problemId: problem.problemId,
      problemName: problem.name,
      problemRating: problem.rating || rating,
      date: new Date(),
    });
    console.log("Match being saved:", newMatch);


    await newMatch.save();

    res.json({
      roomId,
      problem: {
        name: problem.name,
        link: `https://codeforces.com/problemset/problem/${problem.contestId}/${problem.index}`,
        id: `${problem.contestId}${problem.index}`,
        rating: problem.rating || rating,
      },
    });
  } catch (err) {
    console.error("Error in /matchmake:", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
});


// GET /api/match/:roomId
router.get("/:roomId", async (req, res) => {
  try {
    const match = await Match.findOne({
      roomId: req.params.roomId,
    });

    if (!match) {
      return res.status(404).json({ error: "Match not found" });
    }
    console.log("Fetched match from DB:", match);
    console.log("contestId:", match.contestId, "index:", match.index);

    const contestId = match.contestId;
    const index = match.index;

    const cfRes = await axios.get("https://codeforces.com/api/problemset.problems");
    const problems = cfRes.data.result.problems;

    const problem = problems.find(
      (p) => p.contestId == contestId && p.index == index
    );
    console.log(`Sending problem: ${contestId}${index} with rating ${problem?.rating || match.problemRating}`);

    res.json({
      roomId: match.roomId,
      players: match.players,
      problem: {
        name: problem?.name || `Problem ${index}`,
        link: `https://codeforces.com/problemset/problem/${contestId}/${index}`,
        id: `${contestId}${index}`,
        rating: problem?.rating || match.problemRating || "Unknown"
      },
    });
  } catch (err) {
    console.error("Error in /:roomId:", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
