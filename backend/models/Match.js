const mongoose = require("mongoose");

const MatchSchema = new mongoose.Schema({
  roomId: { type: String, required: true },
  players: {
    type: [String],
    validate: [arr => arr.length === 2, "Exactly 2 players required"]
  },
  contestId: { type: Number, required: true },
  index: { type: String, required: true },
  problemId: { type: String, required: true },
  problemName: { type: String },
  problemRating: { type: Number },
  maxTime: { type: Number, default: 300 }, // ✅ Added this
  date: { type: Date, default: Date.now },
  winner: { type: String } // Optional: Store winner
});

module.exports = mongoose.model("Match", MatchSchema);
