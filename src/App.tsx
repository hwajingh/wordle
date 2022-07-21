import React, { useState } from "react";
// import * as React from "react";
// import Stack from "@mui/material/Stack";
import logo from "./logo.svg";
import "./App.css";
import styles from "./app.module.css";
import axios from "axios";
import { removeWhiteSpaces } from "./helper";
import classNames from "classnames";
// import Button from "@mui/material/Button";

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

  const wordGuess = "enter";

  return (
    <div
      tabIndex={0}
      className={styles.root}
      onKeyDown={(e) => {
        const currentWord = wordList[count];
        let curr = [...wordList];

        // split currentWord into array of characters
        let mod = currentWord.split("");
        // replace current char with corresponding index of mod
        mod[removeWhiteSpaces(currentWord).length] = e.key;

        // if mod length is less than 6 join mod
        if (removeWhiteSpaces(mod.join("")).length < 6) {
          if (e.key !== "Enter") {
            curr[count] = mod.join("");
          }
        }

        setWordList(curr);

        if (e.key === "Enter" && curr[count].length === 5) {
          axios
            .get(
              `https://api.dictionaryapi.dev/api/v2/entries/en/${curr[count]}`
            )
            .then(function (response: any) {
              // handle success
              const word = response.data[0].word;
              if (!word) {
                console.log(response.data.title);
              } else {
                console.log(word);
                let color = [];
                for (let i = 0; i < 5; i++) {
                  const currWordChar = curr[count].charAt(i);
                  if (currWordChar === wordGuess.charAt(i)) {
                    color[i] = styles.green;
                  } else if (wordGuess.includes(currWordChar)) {
                    color[i] = styles.yellow;
                  } else {
                    color[i] = styles.gray;
                  }
                }
                setCount(count + 1);

                let newColor = wordColors;
                newColor[count] = color;
                setWordColors(newColor);
              }
            });
        }
      }}
    >
      <div className={styles.wordList}>
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
    </div>
  );
}

export default App;
