import React, { useState } from "react";
// import * as React from "react";
// import Stack from "@mui/material/Stack";
// import logo from "./logo.svg";
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

  const wordGuess = "tiger";

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
        if (e.key === "Backspace") {
          mod[removeWhiteSpaces(currentWord).length - 1] = " ";
        } else {
          mod[removeWhiteSpaces(currentWord).length] = e.key;
        }
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
                alert(response.data.title);
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

                if (curr[count] === wordGuess) {
                  alert("you got it");
                }
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

        <div className="Keyboard-module_row__YWe5w">
          <button type="button" data-key="q" className="Key-module_key__Rv-Vp">
            q
          </button>
          <button type="button" data-key="w" className="Key-module_key__Rv-Vp">
            w
          </button>
          <button type="button" data-key="e" className="Key-module_key__Rv-Vp">
            e
          </button>
          <button type="button" data-key="r" className="Key-module_key__Rv-Vp">
            r
          </button>
          <button type="button" data-key="t" className="Key-module_key__Rv-Vp">
            t
          </button>
          <button type="button" data-key="y" className="Key-module_key__Rv-Vp">
            y
          </button>
          <button type="button" data-key="u" className="Key-module_key__Rv-Vp">
            u
          </button>
          <button type="button" data-key="i" className="Key-module_key__Rv-Vp">
            i
          </button>
          <button type="button" data-key="o" className="Key-module_key__Rv-Vp">
            o
          </button>
          <button type="button" data-key="p" className="Key-module_key__Rv-Vp">
            p
          </button>

          <div className="Keyboard-module_row__YWe5w">
            <div data-testid="spacer" className="Key-module_half__ljsj8"></div>
            <button
              type="button"
              data-key="a"
              className="Key-module_key__Rv-Vp"
            >
              a
            </button>
            <button
              type="button"
              data-key="s"
              className="Key-module_key__Rv-Vp"
            >
              s
            </button>
            <button
              type="button"
              data-key="d"
              className="Key-module_key__Rv-Vp"
            >
              d
            </button>
            <button
              type="button"
              data-key="f"
              className="Key-module_key__Rv-Vp"
            >
              f
            </button>
            <button
              type="button"
              data-key="g"
              className="Key-module_key__Rv-Vp"
            >
              g
            </button>
            <button
              type="button"
              data-key="h"
              className="Key-module_key__Rv-Vp"
            >
              h
            </button>
            <button
              type="button"
              data-key="j"
              className="Key-module_key__Rv-Vp"
            >
              j
            </button>
            <button
              type="button"
              data-key="k"
              className="Key-module_key__Rv-Vp"
            >
              k
            </button>
            <button
              type="button"
              data-key="l"
              className="Key-module_key__Rv-Vp"
            >
              l
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
