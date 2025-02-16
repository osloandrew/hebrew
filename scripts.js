let sentences = [];

const goodChime = new Audio("Resources/Audio/goodChime.wav");
const badChime = new Audio("Resources/Audio/badChime.wav");

fetch("hebrewwords.csv")
  .then((response) => response.text())
  .then((data) => {
    const rows = data.split("\n").slice(1); // Remove header row
    sentences = rows
      .map((row) => {
        const cols = row.match(/(?:"([^"]+)")|([^,]+)/g); // Properly handles commas inside quotes
        if (cols && cols.length >= 9) {
          return {
            hebrew: cols[6].replace(/^"|"$/g, "").trim(), // sentenceHebrew
            transliteration: cols[7].replace(/^"|"$/g, "").trim(), // sentenceTransliteration
            english: cols[8].replace(/^"|"$/g, "").trim(), // sentenceEnglish
            difficulty: cols[1].replace(/^"|"$/g, "").trim(), // CEFR
          };
        }
      })
      .filter(Boolean); // Remove any undefined entries
    startGame();
  })
  .catch((error) => console.error("Error loading CSV:", error));

let score = 0;
let availableSentences = [];
let currentSentence = null;

document.addEventListener("DOMContentLoaded", () => {
  if (sentences.length > 0) {
    startGame();
  }
});

function startGame() {
  availableSentences = [...sentences];
  currentSentence = getNextSentence();
  loadSentence();
  document.getElementById("progress-bar").style.width = "0%"; // Ensure progress bar is empty at start
}

function getNextSentence() {
  if (availableSentences.length === 0) {
    availableSentences = [...sentences]; // Reset when all questions are answered
  }
  return availableSentences.splice(
    Math.floor(Math.random() * availableSentences.length),
    1
  )[0];
}

function adjustPunctuation(sentence) {
  // Ensure punctuation is placed at the end of the last line
  return sentence.replace(/^([\u0590-\u05FF\s]+)([.?!])$/, "$1$2").trim();
}

function loadSentence() {
  if (!currentSentence) return;

  // Ensure punctuation is on the left side
  const adjustedHebrew = adjustPunctuation(currentSentence.hebrew);

  document.getElementById("hebrew-text").textContent = adjustedHebrew;
  document.getElementById("transliteration").textContent =
    currentSentence.transliteration;
  document.getElementById(
    "difficulty"
  ).textContent = `CEFR Level: ${currentSentence.difficulty}`;

  const answersDiv = document.getElementById("answers");
  answersDiv.innerHTML = "";

  let answerOptions = sentences
    .map((s) => s.english)
    .filter((ans) => ans !== currentSentence.english);
  answerOptions = answerOptions.sort(() => 0.5 - Math.random()).slice(0, 3);
  answerOptions.push(currentSentence.english);
  answerOptions = answerOptions.sort(() => 0.5 - Math.random());

  answerOptions.forEach((option) => {
    const button = document.createElement("button");
    button.textContent = option;
    button.classList.add("button");
    button.onclick = () => checkAnswer(option, button);
    answersDiv.appendChild(button);
  });
}

function checkAnswer(answer, button) {
  const answerButtons = document.querySelectorAll(".button");

  if (answer === currentSentence.english) {
    score++;
    button.classList.add("correct");
    goodChime.play();
    availableSentences = availableSentences.filter(
      (s) => s !== currentSentence
    );
  } else {
    score = Math.max(score - 1, 0);
    button.classList.add("incorrect");
    badChime.play();

    // Highlight the correct answer
    answerButtons.forEach((btn) => {
      if (btn.textContent === currentSentence.english) {
        btn.classList.add("correct");
      }
    });
  }

  document.getElementById("score").textContent = `Score: ${score}`;
  document.getElementById("progress-bar").style.width = `${
    (score / 10) * 100
  }%`;

  setTimeout(() => {
    answerButtons.forEach((btn) =>
      btn.classList.remove("correct", "incorrect")
    );
    currentSentence = getNextSentence();
    loadSentence();
  }, 1500); // Increased delay to 1.5s to allow users to see the correct answer
}
