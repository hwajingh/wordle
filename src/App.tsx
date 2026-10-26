import React, { useEffect, useRef, useState } from "react";
import "./App.css";
import styles from "./app.module.css";
import axios from "axios";
import { isLetter, removeWhiteSpaces } from "./helper";
import classNames from "classnames";
import { Button } from "./button";

const ENTER = "ENTER";
const BACKSPACE = "BACKSPACE";
const MAX_GUESSES = 6;
const WORD_LENGTH = 5;
const EMPTY_ROW = "     ";

// Two-pass Wordle colouring with letter counts. The old code used
// wordToGuess.includes(char), which over-counts duplicates: e.g.
// answer APPLE, guess PAPER would colour both Ps. Pass 1 marks exact
// matches and removes those letters from the pool; pass 2 marks
// present-but-misplaced only while that letter still remains.
export function scoreGuess(guess: string, answer: string): string[] {
  const color: string[] = new Array(WORD_LENGTH).fill(styles.gray);
  const remaining: Record<string, number> = {};
  for (let i = 0; i < WORD_LENGTH; i++) {
    if (guess[i] === answer[i]) {
      color[i] = styles.green;
    } else {
      remaining[answer[i]] = (remaining[answer[i]] ?? 0) + 1;
    }
  }
  for (let i = 0; i < WORD_LENGTH; i++) {
    if (color[i] === styles.green) continue;
    const ch = guess[i];
    if ((remaining[ch] ?? 0) > 0) {
      color[i] = styles.yellow;
      remaining[ch] -= 1;
    }
  }
  return color;
}

// A guess is only submittable when it is exactly 5 letters.
// The old code submitted whenever the row string was 5 chars long,
// and rows are padded with spaces, so "TIGE " (4 letters + space)
// was sent to the dictionary as "TIGE " and came back 404 as
// "not a word" — even though the player thought the row was full.
function isCompleteGuess(row: string | undefined): row is string {
  return !!row && /^[A-Z]{5}$/.test(row);
}

function App() {
  const [wordList, setWordList] = useState<string[]>(
    Array.from({ length: MAX_GUESSES }, () => EMPTY_ROW),
  );
  const [wordColors, setWordColors] = useState<string[][]>([[]]);
  const [count, setCount] = useState(0);
  const [wordToGuess, setWordToGuess] = useState<string>("");
  const [answerLoaded, setAnswerLoaded] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    rootRef.current?.focus();
  }, []);

  useEffect(() => {
    axios
      .get(`https://random-word-api.herokuapp.com/word?length=5`, {
        timeout: 5000,
      })
      .then(function (response: any) {
        const word =
          typeof response.data?.[0] === "string"
            ? response.data[0].toUpperCase()
            : "";
        // Guard against a malformed / wrong-length answer: never
        // colour guesses against an empty or short answer.
        if (/^[A-Z]{5}$/.test(word)) {
          setWordToGuess(word);
          setAnswerLoaded(true);
        } else {
          alert("Could not load a word to guess. Please refresh and try again.");
        }
      })
      .catch(function () {
        alert("Could not load a word to guess. Please refresh and try again.");
      });
  }, []);

  const submitGuess = (guess: string, rowIndex: number) => {
    // Correct answer bypasses the dictionary entirely. The old code
    // rejected a correct guess whenever the dictionary request failed
    // for any reason (network, rate limit, outage) — including the
    // reported case where a valid word was shown as "not a word".
    if (guess === wordToGuess) {
      const color = scoreGuess(guess, wordToGuess);
      setWordColors((prev) => {
        const next = [...prev];
        next[rowIndex] = color;
        return next;
      });
      setCount((prev) => prev + 1);
      setGameOver(true);
      alert("You got it");
      return;
    }

    setIsChecking(true);
    // Normalise to lowercase: the dictionary is case-insensitive in
    // practice, but sending the uppercase guess relies on that.
    axios
      .get(
        `https://api.dictionaryapi.dev/api/v2/entries/en/${guess.toLowerCase()}`,
        { timeout: 5000 },
      )
      .then(function (response: any) {
        // Validity is the HTTP status (200), not the shape of the
        // body: a 200 with an unexpected body used to fall through
        // to "not a word" via the !word check.
        const color = scoreGuess(guess, wordToGuess);
        setWordColors((prev) => {
          const next = [...prev];
          next[rowIndex] = color;
          return next;
        });
        setCount((prev) => prev + 1);
        if (rowIndex === MAX_GUESSES - 1) {
          setGameOver(true);
          alert(` The Word is ${wordToGuess}`);
        }
      })
      .catch(function (error: any) {
        // Only a 404 means "not a word". Any other failure (network,
        // timeout, 429, 500) is a check failure, not a judgement on
        // the word — misreporting it as "not a word" was the bug.
        if (error?.response?.status === 404) {
          alert("not a word");
        } else {
          alert("Could not check that word. Please try again.");
        }
      })
      .finally(function () {
        setIsChecking(false);
      });
  };

  const onLetterTyped = (letter: string) => {
    // Game over, a check in flight, or no current row: ignore input.
    // The old code kept accepting input after the last row, so
    // wordList[6] was undefined and the next keypress crashed on
    // .split(). Double-Enter also submitted the same row twice.
    if (gameOver || isChecking || count >= MAX_GUESSES) return;
    letter = letter.toUpperCase();

    const currentWord = wordList[count];
    if (currentWord === undefined) return;

    if (letter === ENTER) {
      if (!answerLoaded) {
        alert("Still loading a word to guess. Please wait a moment.");
        return;
      }
      // Ignore Enter on an incomplete row instead of sending a
      // space-padded guess to the dictionary and showing "not a word".
      if (!isCompleteGuess(currentWord)) return;
      submitGuess(currentWord, count);
      return;
    }

    if (letter === BACKSPACE) {
      const letters = removeWhiteSpaces(currentWord);
      if (letters.length === 0) return;
      const next =
        currentWord.slice(0, letters.length - 1) + " " +
        currentWord.slice(letters.length);
      setWordList((prev) => {
        const nextList = [...prev];
        nextList[count] = next;
        return nextList;
      });
      return;
    }

    if (!isLetter(letter)) return;
    const letters = removeWhiteSpaces(currentWord);
    // Row full: ignore extra letters instead of overflowing the row.
    if (letters.length >= WORD_LENGTH) return;
    const next =
      currentWord.slice(0, letters.length) +
      letter +
      currentWord.slice(letters.length + 1);
    setWordList((prev) => {
      const nextList = [...prev];
      nextList[count] = next;
      return nextList;
    });
    // Keep keyboard focus on the root div after on-screen clicks,
    // otherwise physical-keyboard input silently stops working.
    rootRef.current?.focus();
  };

  return (
    <div
      ref={rootRef}
      tabIndex={0}
      className={styles.root}
      onKeyDown={(e) => {
        onLetterTyped(e.key);
      }}
    >
      <div className={styles.wordList}>
        <div className={styles.header}>Tiger Wordle</div>

        <div className={styles.wordGrid}>
          {wordList.map((word, wordIndex) => (
            <div className={styles.wordItem} key={wordIndex}>
              {word.split("").map((letter, index) => {
                if (wordColors[wordIndex]?.[index]) {
                  return (
                    <div
                      key={index}
                      className={classNames(
                        styles.letter,
                        wordColors[wordIndex][index]
                      )}
                    >
                      {letter}
                    </div>
                  );
                } else {
                  return (
                    <div key={index} className={classNames(styles.letter)}>{letter}</div>
                  );
                }
              })}
            </div>
          ))}
        </div>
        <div className={styles.keyboard}>
          <Button
            value="Q"
            onLetterTyped={() => {
              onLetterTyped("Q");
            }}
          />

          <Button
            value="W"
            onLetterTyped={() => {
              onLetterTyped("W");
            }}
          />
          <Button
            value="E"
            onLetterTyped={() => {
              onLetterTyped("E");
            }}
          />
          <Button
            value="R"
            onLetterTyped={() => {
              onLetterTyped("R");
            }}
          />
          <Button
            value="T"
            onLetterTyped={() => {
              onLetterTyped("T");
            }}
          />
          <Button
            value="Y"
            onLetterTyped={() => {
              onLetterTyped("Y");
            }}
          />
          <Button
            value="U"
            onLetterTyped={() => {
              onLetterTyped("U");
            }}
          />
          <Button
            value="I"
            onLetterTyped={() => {
              onLetterTyped("I");
            }}
          />
          <Button
            value="O"
            onLetterTyped={() => {
              onLetterTyped("O");
            }}
          />
          <Button
            value="P"
            onLetterTyped={() => {
              onLetterTyped("P");
            }}
          />
        </div>

        <div className={styles.keyboard}>
          <Button
            value="A"
            onLetterTyped={() => {
              onLetterTyped("A");
            }}
          />
          <Button
            value="S"
            onLetterTyped={() => {
              onLetterTyped("S");
            }}
          />
          <Button
            value="D"
            onLetterTyped={() => {
              onLetterTyped("D");
            }}
          />
          <Button
            value="F"
            onLetterTyped={() => {
              onLetterTyped("F");
            }}
          />
          <Button
            value="G"
            onLetterTyped={() => {
              onLetterTyped("G");
            }}
          />
          <Button
            value="H"
            onLetterTyped={() => {
              onLetterTyped("H");
            }}
          />
          <Button
            value="J"
            onLetterTyped={() => {
              onLetterTyped("J");
            }}
          />
          <Button
            value="K"
            onLetterTyped={() => {
              onLetterTyped("K");
            }}
          />
          <Button
            value="L"
            onLetterTyped={() => {
              onLetterTyped("L");
            }}
          />
        </div>

        <div className={styles.keyboard}>
          <button
            className={styles.specialButton}
            onClick={() => {
              onLetterTyped("Enter");
            }}
          >
            Enter
          </button>
          <Button
            value="Z"
            onLetterTyped={() => {
              onLetterTyped("Z");
            }}
          />
          <Button
            value="X"
            onLetterTyped={() => {
              onLetterTyped("X");
            }}
          />
          <Button
            value="C"
            onLetterTyped={() => {
              onLetterTyped("C");
            }}
          />
          <Button
            value="V"
            onLetterTyped={() => {
              onLetterTyped("V");
            }}
          />
          <Button
            value="B"
            onLetterTyped={() => {
              onLetterTyped("B");
            }}
          />
          <Button
            value="N"
            onLetterTyped={() => {
              onLetterTyped("N");
            }}
          />
          <Button
            value="M"
            onLetterTyped={() => {
              onLetterTyped("M");
            }}
          />

          <button
            className={styles.specialButton}
            onClick={() => {
              onLetterTyped("Backspace");
            }}
          >
            Backspace
          </button>
        </div>
        <div className={styles.footer}>Made by Tiger Hong</div>
      </div>
    </div>
  );
}

export default App;
