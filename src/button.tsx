import React from "react";
import styles from "./app.module.css";

interface ButtonProps {
  value: string;
  onLetterTyped: () => void;
}

export function Button(props: ButtonProps) {
  return (
    <button
      className={styles.button}
      onClick={() => {
        props.onLetterTyped();
      }}
      type="button"
    >
      {props.value}
    </button>
  );
}
