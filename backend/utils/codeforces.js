const axios = require("axios");
const Match = require("../models/Match");

async function getRandomProblem(rating) {
  try {
    const res = await axios.get("https://codeforces.com/api/problemset.problems");

    const problems = res.data.result.problems.filter(
      (p) => p.rating == rating && p.contestId && p.index
    );

    const allUsedProblems = await Match.find({}, { problemId: 1, _id: 0 });
    const usedProblemIds = new Set(allUsedProblems.map((m) => m.problemId));

    const unusedProblems = problems.filter(
      (p) => !usedProblemIds.has(`${p.contestId}-${p.index}`)
    );

    if (unusedProblems.length === 0) {
      throw new Error("No unused problems left for the given rating.");
    }

    const random = unusedProblems[Math.floor(Math.random() * unusedProblems.length)];

    return {
      contestId: random.contestId,
      index: random.index,
      name: random.name,
      rating: random.rating,
      problemId: `${random.contestId}-${random.index}`
    };
  } catch (err) {
    console.error("Error in getRandomProblem:", err.message);
    throw err;
  }
}

module.exports = getRandomProblem;
