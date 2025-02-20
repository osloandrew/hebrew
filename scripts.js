let sentences = [];
let availableSentences = []; // Tracks sentences remaining in the current cycle
let incorrectSentences = []; // Stores sentences answered incorrectly
let currentSentence = null;
let score = 0;
let currentLevel = "A1"; // Default level
const levels = ["A1", "A2", "B1", "B2", "C1", "C2"];

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

document.addEventListener("DOMContentLoaded", () => {
  document
    .getElementById("difficulty-select")
    .addEventListener("change", (event) => {
      currentLevel = event.target.value;
      score = 0; // Reset score
      document.getElementById("score").textContent = `Score: ${score}`;
      document.getElementById("progress-bar").style.width = "0%"; // Reset progress bar
      startGame();
    });
  startGame();
});

function startGame() {
  availableSentences = sentences.filter((s) => s.difficulty === currentLevel);
  incorrectSentences = []; // Reset incorrect sentence tracking
  shuffleArray(availableSentences);
  updateAvailableCount();
  currentSentence = availableSentences.shift(); // ✅ Assign & remove first sentence properly
  loadSentence();
}

function getNextSentence() {
  if (availableSentences.length === 0) {
    if (incorrectSentences.length > 0) {
      availableSentences = [...incorrectSentences];
      incorrectSentences = [];
    } else {
      availableSentences = sentences.filter(
        (s) => s.difficulty === currentLevel
      );
    }
    shuffleArray(availableSentences);
  }

  // ✅ Prevent infinite loop scenario
  return availableSentences.length > 0 ? availableSentences.shift() : null;
}

function removeNiqqud(text) {
  return text.replace(/[\u05B0-\u05BC\u05C1\u05C2\u05C4\u05C5]/g, "");
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

  document.getElementById("difficulty-select").value = currentLevel;

  const answersDiv = document.getElementById("answers");
  answersDiv.innerHTML = "";

  let punctuationType = currentSentence.english.trim().slice(-1); // Gets the last character (e.g., ".", "?", "!")
  let answerOptions = sentences
    .filter(
      (s) =>
        s.difficulty === currentSentence.difficulty &&
        s.english !== currentSentence.english &&
        s.english.trim().slice(-1) === punctuationType // Match punctuation
    )
    .map((s) => s.english);

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

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

function updateAvailableCount() {
  document.getElementById("available-count").textContent = `Remaining: ${
    availableSentences.length + incorrectSentences.length
  }`;
}

function checkAnswer(answer, button) {
  const answerButtons = document.querySelectorAll(".button");

  if (answer === currentSentence.english) {
    score++;
    button.classList.add("correct");
    goodChime.play();

    if (answer === currentSentence.english) {
      if (availableSentences.includes(currentSentence)) {
        availableSentences = availableSentences.filter(
          (s) => s !== currentSentence
        );
      }
    } else {
      if (!incorrectSentences.includes(currentSentence)) {
        incorrectSentences.push(currentSentence);
      }
    }

    updateAvailableCount(); // ✅ Call update only once, not twice
  } else {
    if (!(currentLevel === "A1" && score === 0)) {
      score--;
    }
    button.classList.add("incorrect");
    badChime.play();
    incorrectSentences.push(currentSentence);

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

  updateAvailableCount(); // ✅ Now updates IMMEDIATELY after selecting an answer

  if (score >= 10) {
    setTimeout(() => {
      score = 0;
      document.getElementById("score").textContent = `Score: ${score}`;
      document.getElementById("progress-bar").style.width = "0%";
    }, 1500);
  }

  if (availableSentences.length === 0 && incorrectSentences.length === 0) {
    setTimeout(() => {
      startGame(true);
    }, 1500);
    return;
  }

  setTimeout(() => {
    answerButtons.forEach((btn) =>
      btn.classList.remove("correct", "incorrect")
    );
    currentSentence = getNextSentence();
    loadSentence();
  }, 1500);
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
