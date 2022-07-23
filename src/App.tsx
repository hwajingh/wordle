import React, { useEffect, useState } from "react";
// import * as React from "react";
// import Stack from "@mui/material/Stack";
// import logo from "./logo.svg";
import "./App.css";
import styles from "./app.module.css";
import axios from "axios";
import { removeWhiteSpaces } from "./helper";
import classNames from "classnames";
// import Button from "@mui/material/Button";
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

  const wordBank = ["TIGER", "ENTER"];

  const [rando, setRando] = useState<number>(0);

  const getRandomInt = (max: number) => {
    let num = Math.floor(Math.random() * max);

    setRando(num);
  };
  useEffect(() => {
    getRandomInt(wordBank.length);
  }, [wordBank.length]);

  const onLetterTyped = (letter: string) => {
    const currentWord = wordList[count];
    let curr = [...wordList];

    letter = letter.toUpperCase();
    console.log(letter);
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
            console.log(word);
            let color = [];
            for (let i = 0; i < 5; i++) {
              const currWordChar = curr[count].charAt(i);
              if (currWordChar === wordBank[rando].charAt(i)) {
                color[i] = styles.green;
              } else if (wordBank[rando].includes(currWordChar)) {
                color[i] = styles.yellow;
              } else {
                color[i] = styles.gray;
              }
            }
            setCount(count + 1);

            console.log(wordBank[rando]);
            let newColor = wordColors;
            newColor[count] = color;
            setWordColors(newColor);

            if (curr[count] === wordBank[rando]) {
              alert("you got it");
            }
          }
        });
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
        <div className={styles.wordGrid}>
          {wordList.map((word, wordIndex) => (
            <div className={styles.wordItem}>
              {word.split("").map((letter, index) => {
                if (wordColors[wordIndex]?.[index]) {
                  return (
                    <div
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
                    <div className={classNames(styles.letter)}>{letter}</div>
                  );
                }
              })}
            </div>
          ))}
        </div>
        <div className={styles.keyboard}>
          <button
            className={styles.button}
            onClick={() => {
              onLetterTyped("Q");
            }}
            type="button"
          >
            Q
          </button>
          <button
            className={styles.button}
            onClick={() => {
              onLetterTyped("W");
            }}
            type="button"
          >
            W
          </button>
          <button
            className={styles.button}
            onClick={() => {
              onLetterTyped("E");
            }}
            type="button"
          >
            E
          </button>
          <button
            className={styles.button}
            onClick={() => {
              onLetterTyped("R");
            }}
            type="button"
          >
            R
          </button>
          <button
            className={styles.button}
            onClick={() => {
              onLetterTyped("T");
            }}
            type="button"
          >
            T
          </button>
          <button
            className={styles.button}
            onClick={() => {
              onLetterTyped("Y");
            }}
            type="button"
          >
            Y
          </button>
          <button
            className={styles.button}
            onClick={() => {
              onLetterTyped("Q");
            }}
            type="button"
          >
            U
          </button>
          <button
            className={styles.button}
            onClick={() => {
              onLetterTyped("I");
            }}
            type="button"
          >
            I
          </button>
          <button
            className={styles.button}
            onClick={() => {
              onLetterTyped("O");
            }}
            type="button"
          >
            O
          </button>
          <button
            className={styles.button}
            onClick={() => {
              onLetterTyped("P");
            }}
            type="button"
          >
            P
          </button>
        </div>

        <div className={styles.keyboard}>
          <button
            className={styles.button}
            onClick={() => {
              onLetterTyped("A");
            }}
            type="button"
          >
            A
          </button>
          <button
            className={styles.button}
            onClick={() => {
              onLetterTyped("S");
            }}
            type="button"
          >
            S
          </button>
          <button
            className={styles.button}
            onClick={() => {
              onLetterTyped("D");
            }}
            type="button"
          >
            D
          </button>
          <button
            className={styles.button}
            onClick={() => {
              onLetterTyped("F");
            }}
            type="button"
          >
            F
          </button>
          <button
            className={styles.button}
            onClick={() => {
              onLetterTyped("G");
            }}
            type="button"
          >
            G
          </button>
          <button
            className={styles.button}
            onClick={() => {
              onLetterTyped("H");
            }}
            type="button"
          >
            H
          </button>
          <button
            className={styles.button}
            onClick={() => {
              onLetterTyped("J");
            }}
            type="button"
          >
            J
          </button>
          <button
            className={styles.button}
            onClick={() => {
              onLetterTyped("K");
            }}
            type="button"
          >
            K
          </button>
          <button
            className={styles.button}
            onClick={() => {
              onLetterTyped("L");
            }}
            type="button"
          >
            L
          </button>
        </div>

        <div className={styles.keyboard}>
          <button
            className={styles.button}
            onClick={() => {
              onLetterTyped("Z");
            }}
            type="button"
          >
            Z
          </button>
          <button
            className={styles.button}
            onClick={() => {
              onLetterTyped("X");
            }}
            type="button"
          >
            X
          </button>
          <button
            className={styles.button}
            onClick={() => {
              onLetterTyped("C");
            }}
            type="button"
          >
            C
          </button>
          <button
            className={styles.button}
            onClick={() => {
              onLetterTyped("V");
            }}
            type="button"
          >
            V
          </button>
          <button
            className={styles.button}
            onClick={() => {
              onLetterTyped("B");
            }}
            type="button"
          >
            B
          </button>
          <button
            className={styles.button}
            onClick={() => {
              onLetterTyped("N");
            }}
            type="button"
          >
            N
          </button>
          <button
            className={styles.button}
            onClick={() => {
              onLetterTyped("M");
            }}
            type="button"
          >
            M
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
