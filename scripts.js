const sentences = [
  {
    hebrew: "שלום, איך אתה?",
    transliteration: "Shalom, eikh atah?",
    english: "Hello, how are you?",
    difficulty: "A1",
  },
  {
    hebrew: "האם אתה מדבר עברית?",
    transliteration: "Ha'im atah medaber ivrit?",
    english: "Do you speak Hebrew?",
    difficulty: "A1",
  },
  {
    hebrew: "אני רוצה להזמין קפה בבקשה",
    transliteration: "Ani rotzeh lehazmin kafe bevakasha",
    english: "I want to order a coffee, please",
    difficulty: "A1",
  },
  {
    hebrew: "הילד משחק בפארק עם הכלב שלו",
    transliteration: "Hayeled mesachek b'park im hakelev shelo",
    english: "The boy is playing in the park with his dog",
    difficulty: "A2",
  },
  {
    hebrew: "אם הייתי יודע, הייתי אומר לך",
    transliteration: "Im hayiti yodea, hayiti omer lekha",
    english: "If I had known, I would have told you",
    difficulty: "B2",
  },
  {
    hebrew: "המשפחה שלי חוגגת את ראש השנה",
    transliteration: "Hamishpacha sheli chogeghet et Rosh Hashana",
    english: "My family celebrates Rosh Hashanah",
    difficulty: "A2",
  },
  {
    hebrew: "העיר ירושלים היא עיר עתיקה מאוד",
    transliteration: "Ha'ir Yerushalayim hi ir atika meod",
    english: "The city of Jerusalem is very ancient",
    difficulty: "B1",
  },
  {
    hebrew: "השמש זורחת במזרח ושוקעת במערב",
    transliteration: "Ha-shemesh zorachat ba-mizrach ve-shokaat ba-ma'arav",
    english: "The sun rises in the east and sets in the west",
    difficulty: "A2",
  },
];

let score = 0;
let availableSentences = [...sentences];
let currentSentence = getNextSentence();

document.addEventListener("DOMContentLoaded", () => {
  loadSentence();
});

function getNextSentence() {
  if (availableSentences.length === 0) {
    availableSentences = [...sentences]; // Reset the list when all questions are answered
  }
  return availableSentences.splice(
    Math.floor(Math.random() * availableSentences.length),
    1
  )[0];
}

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
    button.onclick = () => checkAnswer(option, button);
    answersDiv.appendChild(button);
  });
}

function checkAnswer(answer, button) {
  if (answer === currentSentence.english) {
    score++;
    button.classList.add("correct");
    availableSentences = availableSentences.filter(
      (s) => s !== currentSentence
    );
  } else {
    score = Math.max(score - 1, 0);
    button.classList.add("incorrect");
  }

  document.getElementById("score").textContent = `Score: ${score}`;
  document.getElementById("progress-bar").style.width = `${
    (score / 10) * 100
  }%`;

  setTimeout(() => {
    button.classList.remove("correct", "incorrect");
    currentSentence = getNextSentence();
    loadSentence();
  }, 1000);
}
