import { useEffect, useRef, useState } from "react";

export function useToast(duration = 2600) {
  const [message, setMessage] = useState("");
  const timerRef = useRef(null);

  useEffect(() => () => window.clearTimeout(timerRef.current), []);

  function showToast(nextMessage) {
    setMessage(nextMessage);
    window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => setMessage(""), duration);
  }

  return { message, showToast };
}