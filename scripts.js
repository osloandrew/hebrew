import { useState, useEffect } from "react";
import "styles.css";

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

export default function HebrewLearning() {
  const [currentSentence, setCurrentSentence] = useState(sentences[0]);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState("");

  useEffect(() => {
    const nextSentence = sentences.find(
      (s) => s.difficulty === Math.min(Math.max(Math.floor(score / 2), 1), 4)
    );
    setCurrentSentence(nextSentence || sentences[0]);
  }, [score]);

  const getShuffledAnswers = (sentence) => {
    const correctAnswer = sentence.english;
    let shuffled = sentences
      .map((s) => s.english)
      .filter((ans) => ans !== correctAnswer);
    shuffled = shuffled.sort(() => 0.5 - Math.random()).slice(0, 3);
    shuffled.push(correctAnswer);
    return shuffled.sort(() => 0.5 - Math.random());
  };

  const [answerOptions, setAnswerOptions] = useState(
    getShuffledAnswers(currentSentence)
  );

  useEffect(() => {
    setAnswerOptions(getShuffledAnswers(currentSentence));
  }, [currentSentence]);

  const checkAnswer = (answer) => {
    if (answer === currentSentence.english) {
      setFeedback("correct");
      setScore(score + 1);
    } else {
      setFeedback("incorrect");
      setScore(Math.max(score - 1, 0));
    }
    setTimeout(() => {
      setFeedback("");
      const nextSentence = sentences.find(
        (s) => s.difficulty === Math.min(Math.max(Math.floor(score / 2), 1), 4)
      );
      setCurrentSentence(nextSentence || sentences[0]);
    }, 1000);
  };

  return (
    <div className="container">
      <div className="card">
        <h2 className="question">{currentSentence.hebrew}</h2>
        <p className="transliteration">{currentSentence.transliteration}</p>
        <div className="answers">
          {answerOptions.map((option, index) => (
            <button
              key={index}
              onClick={() => checkAnswer(option)}
              className={`button ${
                feedback && option === currentSentence.english
                  ? "correct"
                  : feedback && option !== currentSentence.english
                  ? "incorrect"
                  : ""
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      </div>
      <div className="progress-container">
        <div
          className="progress-bar"
          style={{ width: `${(score / 10) * 100}%` }}
        ></div>
      </div>
      <p className="score">Score: {score}</p>
    </div>
  );
}
