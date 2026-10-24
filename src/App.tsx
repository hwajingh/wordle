import React, { useEffect, useState } from "react";
// import * as React from "react";
// import Stack from "@mui/material/Stack";
// import logo from "./logo.svg";
import "./App.css";
import styles from "./app.module.css";
import axios from "axios";
import { isLetter, removeWhiteSpaces } from "./helper";
import classNames from "classnames";
import { Button } from "./button";

const ENTER = "ENTER";
const BACKSPACE = "BACKSPACE";

function App() {
  const [wordList, setWordList] = useState<string[]>([
    "     ",
    "     ",
    "     ",
    "     ",
    "     ",
    "     ",
  ]);

  const [wordColors, setWordColors] = useState<string[][]>([[]]);

  const [count, setCount] = useState(0);

  const [wordToGuess, setWordToGuess] = useState<string>("");

  useEffect(() => {
    axios
      .get(`https://random-word-api.herokuapp.com/word?length=5`)
      .then(function (response: any) {
        // handle success
        const word = response.data[0].toUpperCase();

        setWordToGuess(word);
      })
      .catch(function () {
        // FIX: previously a failed answer fetch left wordToGuess "" with
        // no message, making the game unwinnable.
        alert("Could not load a word to guess. Please refresh and try again.");
      });
  }, []);

  const onLetterTyped = (letter: string) => {
    letter = letter.toUpperCase();
    if (isLetter(letter) || letter === BACKSPACE || letter === ENTER) {
      const currentWord = wordList[count];
      let curr = [...wordList];

      // split currentWord into array of characters
      let mod = currentWord.split("");
      // replace current char with corresponding index of mod
      if (letter === BACKSPACE) {
        mod[removeWhiteSpaces(currentWord).length - 1] = " ";
      } else {
        mod[removeWhiteSpaces(currentWord).length] = letter;
      }
      // if mod length is less than 6 join mod
      if (removeWhiteSpaces(mod.join("")).length < 6) {
        if (letter !== ENTER) {
          curr[count] = mod.join("");
        }
      }

      setWordList(curr);

      if (letter === ENTER && curr[count].length === 5) {
        axios
          .get(`https://api.dictionaryapi.dev/api/v2/entries/en/${curr[count]}`)
          .then(function (response: any) {
            // handle success
            const word = response.data[0].word;
            if (!word) {
              alert("not a word");
            } else {
              let color: string[] = [];
              for (let i = 0; i < 5; i++) {
                const currWordChar = curr[count].charAt(i);
                if (currWordChar === wordToGuess.charAt(i)) {
                  color[i] = styles.green;
                } else if (wordToGuess.includes(currWordChar)) {
                  color[i] = styles.yellow;
                } else {
                  color[i] = styles.gray;
                }
              }
              setCount((prevCount) => prevCount + 1);

              // FIX: previously this mutated wordColors in place and passed
              // the same array reference back, so React could bail out and
              // leave guessed-row colours stale.
              setWordColors((prevColors) => {
                const nextColors = [...prevColors];
                nextColors[count] = color;
                return nextColors;
              });

              if (curr[count] === wordToGuess) {
                alert("You got it");
              } else if (count === 5) {
                alert(` The Word is ${wordToGuess}`);
              }
            }
          })
          .catch(function () {
            // FIX: a non-word returns HTTP 404, which rejects the promise.
            // Previously there was no .catch, so the alert above never ran
            // and the guess was silently swallowed.
            alert("not a word");
          });
      }
    }
  };

  return (
    <div
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
