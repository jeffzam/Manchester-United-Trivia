"use client";

import { useMemo, useRef, useState } from "react";
import gameData from "./data/questions.json";

type Question = (typeof gameData.categories)[number]["questions"][number];
type Category = (typeof gameData.categories)[number];
type Stage = "intro" | "wheel" | "spinning" | "question" | "won" | "lost";

const LETTERS = ["A", "B", "C", "D"];

export default function Home() {
  const [stage, setStage] = useState<Stage>("intro");
  const [round, setRound] = useState(0);
  const [wheelRotation, setWheelRotation] = useState(0);
  const [category, setCategory] = useState<Category | null>(null);
  const [question, setQuestion] = useState<Question | null>(null);
  const [selected, setSelected] = useState<number | null>(null);
  const [hiddenAnswers, setHiddenAnswers] = useState<number[]>([]);
  const [fiftyAvailable, setFiftyAvailable] = useState(true);
  const [respinAvailable, setRespinAvailable] = useState(true);
  const usedQuestionIds = useRef(new Set<string>());

  const source = useMemo(
    () => gameData.sources.find((item) => item.id === question?.source),
    [question],
  );

  function resetGame() {
    usedQuestionIds.current = new Set();
    setRound(0);
    setCategory(null);
    setQuestion(null);
    setSelected(null);
    setHiddenAnswers([]);
    setFiftyAvailable(true);
    setRespinAvailable(true);
    setStage("wheel");
  }

  function chooseQuestion(chosenCategory: Category) {
    const fresh = chosenCategory.questions.filter(
      (item) => !usedQuestionIds.current.has(item.id),
    );
    const pool = fresh.length ? fresh : chosenCategory.questions;
    const nextQuestion = pool[Math.floor(Math.random() * pool.length)];
    usedQuestionIds.current.add(nextQuestion.id);
    setQuestion(nextQuestion);
    setSelected(null);
    setHiddenAnswers([]);
    setStage("question");
  }

  function spinWheel() {
    if (stage !== "wheel" && stage !== "question") return;
    const target = Math.floor(Math.random() * gameData.categories.length);
    const chosenCategory = gameData.categories[target];
    const normalized = ((wheelRotation % 360) + 360) % 360;
    const desired = (360 - target * 60) % 360;
    const delta = 1800 + ((desired - normalized + 360) % 360);

    setCategory(null);
    setQuestion(null);
    setSelected(null);
    setHiddenAnswers([]);
    setWheelRotation((value) => value + delta);
    setStage("spinning");

    window.setTimeout(() => {
      setCategory(chosenCategory);
      chooseQuestion(chosenCategory);
    }, 3400);
  }

  function useFiftyFifty() {
    if (!question || !fiftyAvailable || selected !== null) return;
    const wrong = question.answers
      .map((_, index) => index)
      .filter((index) => index !== question.correct)
      .sort(() => Math.random() - 0.5)
      .slice(0, 2);
    setHiddenAnswers(wrong);
    setFiftyAvailable(false);
  }

  function useRespin() {
    if (!respinAvailable || stage !== "question" || selected !== null) return;
    setRespinAvailable(false);
    setStage("wheel");
    window.setTimeout(spinWheel, 0);
  }

  function answer(index: number) {
    if (!question || selected !== null || hiddenAnswers.includes(index)) return;
    setSelected(index);
    if (index !== question.correct) {
      window.setTimeout(() => setStage("lost"), 900);
    }
  }

  function nextRound() {
    if (!question || selected !== question.correct) return;
    if (round === 9) {
      setStage("won");
      return;
    }
    setRound((value) => value + 1);
    setCategory(null);
    setQuestion(null);
    setSelected(null);
    setHiddenAnswers([]);
    setStage("wheel");
  }

  const correctAnswer = question ? selected === question.correct : false;

  return (
    <main className="game-shell">
      <div className="floodlight floodlight-left" aria-hidden="true" />
      <div className="floodlight floodlight-right" aria-hidden="true" />

      <header className="topbar">
        <a className="brand" href="#top" aria-label="United Trivia home">
          <span className="brand-mark">UT</span>
          <span><strong>UNITED</strong><small>TRIVIA</small></span>
        </a>
        <div className="topbar-center">THE THEATRE OF QUESTIONS</div>
        <div className="question-count"><span>{Math.min(round + 1, 10)}</span> / 10</div>
      </header>

      <section className="play-area" id="top">
        {stage === "intro" ? (
          <div className="intro-card">
            <p className="eyebrow">WELCOME TO OLD TRAFFORD</p>
            <h1>SPIN. THINK.<br /><em>GLORY AWAITS.</em></h1>
            <p className="intro-copy">
              Ten spins. Ten correct answers. Six corners of United history.
              One mistake ends the run—so use your lifelines wisely.
            </p>
            <div className="intro-categories">
              {gameData.categories.map((item) => (
                <span key={item.id}><b style={{ background: item.color }} />{item.name}</span>
              ))}
            </div>
            <button className="primary-button" onClick={resetGame}>ENTER THE THEATRE <span>→</span></button>
            <p className="daily-note">60 verified starter questions · 6 more queued every day</p>
          </div>
        ) : (
          <div className="game-grid">
            <section className="wheel-panel" aria-label="Category wheel">
              <div className="round-label">QUESTION {Math.min(round + 1, 10)} OF 10</div>
              <div className="progress-track" aria-label={`${round} of 10 answered correctly`}>
                {Array.from({ length: 10 }, (_, index) => (
                  <span key={index} className={index < round ? "done" : index === round ? "current" : ""} />
                ))}
              </div>
              <div className="wheel-wrap">
                <div className="pointer" aria-hidden="true" />
                <div className="wheel-shadow" />
                <div
                  className="wheel"
                  style={{ transform: `rotate(${wheelRotation}deg)` }}
                >
                  {gameData.categories.map((item, index) => (
                    <div className={`wheel-label wheel-label-${index}`} key={item.id}>
                      <span>{item.icon}</span><small>{item.shortName}</small>
                    </div>
                  ))}
                  <button
                    className="spin-button"
                    onClick={spinWheel}
                    disabled={stage !== "wheel"}
                    aria-label="Spin the category wheel"
                  >
                    <span>{stage === "spinning" ? "…" : "SPIN"}</span>
                    <small>{stage === "spinning" ? "ROLLING" : "THE WHEEL"}</small>
                  </button>
                </div>
              </div>
              <p className="wheel-instruction">
                {stage === "spinning" ? "The Stretford End holds its breath…" : stage === "wheel" ? "Press the centre to choose your category" : category?.name}
              </p>
            </section>

            <section className="quiz-panel" aria-live="polite">
              {stage === "wheel" || stage === "spinning" ? (
                <div className="waiting-card">
                  <span className="waiting-number">{String(round + 1).padStart(2, "0")}</span>
                  <p>{stage === "spinning" ? "THE WHEEL IS SPINNING" : "READY FOR THE NEXT QUESTION?"}</p>
                  <h2>{stage === "spinning" ? "CATEGORY INCOMING…" : "LET FATE PICK YOUR TEST."}</h2>
                  <div className="pitch-lines" aria-hidden="true"><i /><i /><i /></div>
                </div>
              ) : question && category ? (
                <div className="question-card">
                  <div className="category-chip" style={{ borderColor: category.color }}>
                    <b style={{ background: category.color }}>{category.icon}</b>{category.name}
                  </div>
                  <h2>{question.question}</h2>
                  <div className="answers">
                    {question.answers.map((answerText, index) => {
                      const hidden = hiddenAnswers.includes(index);
                      const isCorrect = selected !== null && index === question.correct;
                      const isWrong = selected === index && index !== question.correct;
                      return (
                        <button
                          key={answerText}
                          className={`answer ${hidden ? "hidden-answer" : ""} ${isCorrect ? "correct" : ""} ${isWrong ? "wrong" : ""}`}
                          onClick={() => answer(index)}
                          disabled={selected !== null || hidden}
                        >
                          <span>{LETTERS[index]}</span><strong>{hidden ? "—" : answerText}</strong>
                        </button>
                      );
                    })}
                  </div>
                  {selected === null ? (
                    <p className="answer-prompt">Select your final answer</p>
                  ) : correctAnswer ? (
                    <div className="result-strip success">
                      <div><strong>GOAL! THAT'S CORRECT.</strong><span>{question.fact}</span></div>
                      <button onClick={nextRound}>{round === 9 ? "LIFT THE TROPHY" : "NEXT SPIN →"}</button>
                    </div>
                  ) : (
                    <div className="result-strip fail"><strong>OFF TARGET.</strong><span>The correct answer was {question.answers[question.correct]}.</span></div>
                  )}
                  {source && <a className="question-source" href={source.url} target="_blank" rel="noreferrer">Fact source: {source.name}</a>}
                </div>
              ) : null}

              <div className="lifelines" aria-label="Lifelines">
                <div className="lifeline-heading"><span>LIFELINES</span><small>USE EACH ONCE</small></div>
                <button onClick={useFiftyFifty} disabled={!fiftyAvailable || stage !== "question" || selected !== null}>
                  <b>50:50</b><span>Remove two wrong answers</span>{!fiftyAvailable && <i>USED</i>}
                </button>
                <button onClick={useRespin} disabled={!respinAvailable || stage !== "question" || selected !== null}>
                  <b>↻</b><span>Spin for a new category</span>{!respinAvailable && <i>USED</i>}
                </button>
              </div>
            </section>
          </div>
        )}
      </section>

      {(stage === "lost" || stage === "won") && (
        <div className="end-overlay" role="dialog" aria-modal="true" aria-label={stage === "won" ? "You won" : "Game over"}>
          <div className={`end-card ${stage}`}>
            <span className="end-icon">{stage === "won" ? "♛" : "×"}</span>
            <p>{stage === "won" ? "TEN OUT OF TEN" : `RUN ENDED · QUESTION ${round + 1}`}</p>
            <h2>{stage === "won" ? "CHAMPION OF THE THEATRE!" : "FULL TIME."}</h2>
            <p className="end-copy">
              {stage === "won" ? "Perfect answers. The trophy is yours and the Stretford End is singing." : "One wrong answer ends the challenge. Dust yourself off and go again."}
            </p>
            <button className="primary-button" onClick={resetGame}>{stage === "won" ? "DEFEND THE TITLE" : "TRY AGAIN"} <span>↻</span></button>
          </div>
        </div>
      )}

      <footer>
        <span>FAN-MADE TRIVIA EXPERIENCE · NOT AFFILIATED WITH MANCHESTER UNITED FC</span>
        <details>
          <summary>Question sources</summary>
          <div>{gameData.sources.map((item) => <a href={item.url} target="_blank" rel="noreferrer" key={item.id}>{item.name}</a>)}</div>
        </details>
        <span>QUESTION BANK UPDATED {gameData.updatedOn}</span>
      </footer>
    </main>
  );
}
