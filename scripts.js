let sentences = [];

const goodChime = new Audio("Resources/Audio/goodChime.wav");
const badChime = new Audio("Resources/Audio/badChime.wav");

fetch("hebrewwords.csv")
  .then((response) => response.text())
  .then((csvText) => {
    Papa.parse(csvText, {
      header: true, // Automatically uses the first row as column names
      skipEmptyLines: true, // Ignore empty lines
      complete: (result) => {
        console.log(`Total rows parsed: ${result.data.length}`);

        // Ensure column names exist
        if (
          !result.meta.fields.includes("sentenceHebrew") ||
          !result.meta.fields.includes("sentenceEnglish") ||
          !result.meta.fields.includes("CEFR")
        ) {
          console.error(
            "Error: One or more required columns are missing from the CSV!"
          );
          return;
        }

        let validRows = 0;
        let skippedRows = 0;

        sentences = result.data
          .map((row, index) => {
            const hebrewWithNiqqud = row.sentenceHebrew?.trim() || "";
            const hebrew = removeNiqqud(hebrewWithNiqqud);
            const english = row.sentenceEnglish?.trim() || "";
            const difficulty = row.CEFR?.trim() || "";

            // Ensure only complete rows are included
            if (!hebrew || !english || !difficulty) {
              console.warn(
                `Skipping row ${index + 1}: Missing required fields.`
              );
              skippedRows++;
              return null;
            }

            validRows++;
            return {
              hebrewWithNiqqud: adjustPunctuation(hebrewWithNiqqud),
              hebrew: adjustPunctuation(hebrew),
              english: english,
              difficulty: difficulty,
            };
          })
          .filter(Boolean); // Remove null entries but keep valid ones

        console.log(`✅ Total valid sentences loaded: ${validRows}`);
        console.log(`⚠️ Total sentences skipped: ${skippedRows}`);

        startGame();
      },
      error: (error) => console.error("Error parsing CSV:", error),
    });
  })
  .catch((error) => console.error("Error loading CSV:", error));

let score = 0;
let currentLevel = "A1"; // Start at A1 level
let availableSentences = [];
let currentSentence = null;
const levels = ["A1", "A2", "B1", "B2", "C1", "C2"];

document.addEventListener("DOMContentLoaded", () => {
  if (sentences.length > 0) {
    startGame();
  }
});

function startGame() {
  availableSentences = sentences.filter((s) => s.difficulty === currentLevel);
  currentSentence = getNextSentence();
  loadSentence();
  document.getElementById("progress-bar").style.width = "0%"; // Ensure progress bar is empty at start
  document.getElementById("score").textContent = `Score: ${score}`; // Ensure score is shown as 0
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

function removeNiqqud(text) {
  return text.replace(/[\u0591-\u05C7]/g, ""); // Removes Hebrew niqqud, but keeps Maqaf (־)
}

function adjustPunctuation(sentence) {
  return sentence.replace(/^([\u0590-\u05FF\s]+)([.?!])$/, "$1$2").trim();
}

function speakHebrew(text) {
  window.speechSynthesis.cancel(); // Stops any ongoing speech
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "he-IL";
  window.speechSynthesis.speak(utterance);
}

function loadSentence() {
  if (!currentSentence) return;

  const showNiqqud = localStorage.getItem("showNiqqud") === "true"; // Retrieve preference

  const hebrewTextElement = document.getElementById("hebrew-text");
  const hebrewTextCursiveElement = document.getElementById(
    "hebrew-text-cursive"
  );

  if (showNiqqud) {
    hebrewTextElement.textContent = currentSentence.hebrewWithNiqqud;
    hebrewTextCursiveElement.textContent = currentSentence.hebrew;
  } else {
    hebrewTextElement.textContent = currentSentence.hebrew;
    hebrewTextCursiveElement.textContent = currentSentence.hebrew;
  }

  document.getElementById("replay-audio").onclick = () =>
    speakHebrew(currentSentence.hebrewWithNiqqud); // Always speak the niqqud version

  speakHebrew(currentSentence.hebrewWithNiqqud); // Auto-play with niqqud version

  document.getElementById(
    "difficulty"
  ).textContent = `Difficulty: ${currentSentence.difficulty}`;

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
    if (!(currentLevel === "A1" && score === 0)) {
      score--;
    }
    button.classList.add("incorrect");
    badChime.play();

    answerButtons.forEach((btn) => {
      if (btn.textContent === currentSentence.english) {
        btn.classList.add("correct");
      }
    });
  }

  document.getElementById("score").textContent = `Score: ${score}`;
  document.getElementById("progress-bar").style.width = `${
    (Math.max(score, 0) / 10) * 100
  }%`;

  // **Add a small delay before level change for better user experience**
  if (score >= 10) {
    setTimeout(() => {
      changeLevel(1);
    }, 1500); // 1.5-second delay before level transition
    return;
  } else if (score <= -5 && currentLevel !== "A1") {
    setTimeout(() => {
      changeLevel(-1);
    }, 1500); // 1.5-second delay before level transition
    return;
  }

  // **Otherwise, just load a new sentence normally**
  setTimeout(() => {
    answerButtons.forEach((btn) =>
      btn.classList.remove("correct", "incorrect")
    );
    currentSentence = getNextSentence();
    loadSentence();
  }, 1500);
}

function changeLevel(direction) {
  let currentIndex = levels.indexOf(currentLevel);
  let newIndex = currentIndex + direction;
  if (newIndex >= 0 && newIndex < levels.length) {
    currentLevel = levels[newIndex];
    score = 0; // Reset score when changing level
    startGame();
  }
}

document
  .getElementById("toggle-transliteration")
  .addEventListener("click", () => {
    const hebrewTextElement = document.getElementById("hebrew-text");

    if (hebrewTextElement.dataset.niqqud === "true") {
      hebrewTextElement.textContent = adjustPunctuation(currentSentence.hebrew);
      hebrewTextElement.dataset.niqqud = "false";
      localStorage.setItem("showNiqqud", "false");
    } else {
      hebrewTextElement.textContent = adjustPunctuation(
        currentSentence.hebrewWithNiqqud
      );
      hebrewTextElement.dataset.niqqud = "true";
      localStorage.setItem("showNiqqud", "true");
    }
  });
