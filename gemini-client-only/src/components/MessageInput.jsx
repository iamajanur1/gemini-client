import React, { useEffect, useRef, useState } from "react";

export default function MessageInput({ onSend, disabled }) {
  const [value, setValue] = useState("");
  const inputRef = useRef(null);

  useEffect(() => {
    const input = inputRef.current;
    if (!input) return;

    input.style.height = "0px";
    input.style.height = `${Math.min(input.scrollHeight, 180)}px`;
  }, [value]);

  const submit = () => {
    const prompt = value.trim();
    if (!prompt || disabled) return;

    onSend?.(prompt);
    setValue("");
  };

  return (
    <form
      className="composer"
      onSubmit={(event) => {
        event.preventDefault();
        submit();
      }}
    >
      <label className="composer-field">
        <span className="sr-only">Message</span>
        <textarea
          ref={inputRef}
          rows={1}
          placeholder="Ask Gemini anything..."
          value={value}
          onChange={(event) => setValue(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              submit();
            }
          }}
          disabled={disabled}
        />
      </label>

      <button className="send-button" type="submit" disabled={disabled || !value.trim()} aria-label="Send message">
        <span>Send</span>
      </button>
    </form>
  );
}
