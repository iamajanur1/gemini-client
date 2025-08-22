import React, { useEffect, useRef, useState } from "react";

export default function MessageInput({ onSend, disabled }) {
  const [value, setValue] = useState("");
  const taRef = useRef(null);

  useEffect(() => {
    const el = taRef.current;
    if (!el) return;
    el.style.height = "0px";
    el.style.height = Math.min(el.scrollHeight, 160) + "px";
  }, [value]);

  const submit = () => {
    const v = value.trim();
    if (!v) return;
    onSend?.(v);
    setValue("");
  };

  return (
    <footer className="composer">
      <textarea
        ref={taRef}
        rows={1}
        placeholder="Type a message..."
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            if (!disabled) submit();
          }
        }}
        disabled={disabled}
      />
      <button className="btn primary" onClick={submit} disabled={disabled || !value.trim()}>
        Send
      </button>
    </footer>
  );
}
