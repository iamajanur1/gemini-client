const LS_CHATS = "gemini_chats_v1";

// Read all chats
export function loadChats() {
  try {
    const raw = localStorage.getItem(LS_CHATS);
    const arr = raw ? JSON.parse(raw) : [];
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

// Save all chats
export function saveChats(chats) {
  localStorage.setItem(LS_CHATS, JSON.stringify(chats));
}

// Create a new empty chat
export function createChat() {
  const id = crypto.randomUUID();
  const now = Date.now();
  return {
    id,
    title: "New chat",
    messages: [
      {
        id: crypto.randomUUID(),
        role: "assistant",
        content: "New chat started. Ask anything!",
      },
    ],
    createdAt: now,
    updatedAt: now,
  };
}

// Update chat title from first user message
export function deriveTitle(messages) {
  const firstUser = messages.find((m) => m.role === "user");
  if (!firstUser) return "New chat";
  const text = firstUser.content.trim().replace(/\s+/g, " ");
  return text.length > 40 ? text.slice(0, 40) + "…" : text || "New chat";
}
