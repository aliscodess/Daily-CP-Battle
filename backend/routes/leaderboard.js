// backend/routes/leaderboard.js
router.get("/leaderboard", async (req, res) => {
  const users = await User.find();
  const data = users.map(u => ({
    username: u.username,
    wins: u.history.filter(h => h.result === "win").length,
    played: u.history.length
  }));

  data.sort((a, b) => b.wins - a.wins);
  res.json(data);
});
