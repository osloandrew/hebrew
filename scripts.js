const sentences = [
  {
    hebrew: "שלום, איך אתה?",
    transliteration: "Shalom, eikh atah?",
    english: "Hello, how are you?",
    difficulty: 1,
  },
  {
    hebrew: "האם אתה מדבר עברית?",
    transliteration: "Ha'im atah medaber ivrit?",
    english: "Do you speak Hebrew?",
    difficulty: 1,
  },
  {
    hebrew: "אני רוצה להזמין קפה בבקשה",
    transliteration: "Ani rotzeh lehazmin kafe bevakasha",
    english: "I want to order a coffee, please",
    difficulty: 2,
  },
  {
    hebrew: "הילד משחק בפארק עם הכלב שלו",
    transliteration: "Hayeled mesachek b'park im hakelev shelo",
    english: "The boy is playing in the park with his dog",
    difficulty: 3,
  },
  {
    hebrew: "אם הייתי יודע, הייתי אומר לך",
    transliteration: "Im hayiti yodea, hayiti omer lekha",
    english: "If I had known, I would have told you",
    difficulty: 4,
  },
];

let score = 0;
let currentSentence = sentences[0];

document.addEventListener("DOMContentLoaded", () => {
  loadSentence();
});

function loadSentence() {
  document.getElementById("hebrew-text").textContent = currentSentence.hebrew;
  document.getElementById("transliteration").textContent =
    currentSentence.transliteration;

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
    button.onclick = () => checkAnswer(option);
    answersDiv.appendChild(button);
  });
}

function checkAnswer(answer) {
  if (answer === currentSentence.english) {
    score++;
  } else {
    score = Math.max(score - 1, 0);
  }

  document.getElementById("score").textContent = `Score: ${score}`;
  document.getElementById("progress-bar").style.width = `${
    (score / 10) * 100
  }%`;

  currentSentence =
    sentences.find(
      (s) => s.difficulty === Math.min(Math.max(Math.floor(score / 2), 1), 4)
    ) || sentences[0];
  loadSentence();
}
