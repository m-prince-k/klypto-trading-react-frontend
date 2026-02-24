import React, { useState } from "react";
import {styles} from "./indicator"

export default function IndiatorSlide() {
  const [show, setShow] = useState(false);

  return (
    <div style={styles.page}>
      <button onClick={() => setShow(!show)} style={styles.button}>
        Slide {show ? "Right" : "Left"}
      </button>

      <div style={styles.container}>
        <div
          style={{
            ...styles.box,
            transform: show ? "translateX(0)" : "translateX(100%)"
          }}
        >
          Sliding Div
        </div>
      </div>
    </div>
  );
}


