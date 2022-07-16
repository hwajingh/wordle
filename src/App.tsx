import React, { useState } from "react";
import logo from "./logo.svg";
import "./App.css";
import styles from "./app.module.css";
function App() {
  const [wordList, setWordList] = useState<string[]>([
    "     ",
    "     ",
    "     ",
    "     ",
    "     ",
    "     ",
  ]);

  const [count, setCount] = useState(0);

  return (
    <div
      tabIndex={0}
      className={styles.root}
      onKeyDown={(e) => {
        const currentWord = wordList[count];
        let curr = [...wordList];

        let mod = currentWord.split("");
        mod[currentWord.replace(/\s/g, "").length] = e.key;

        if (mod.join("").replace(/\s/g, "").length < 6) {
          if (e.key !== "Enter") {
            curr[count] = mod.join("");
          }
        }

        setWordList(curr);

        if (e.key === "Enter" && curr[count].length === 5) {
          setCount(count + 1);
        }
      }}
    >
      <div className={styles.wordList}>
        {wordList.map((word) => (
          <div className={styles.wordItem}>
            {word.split("").map((letter) => (
              <div className={styles.letter}>{letter}</div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
