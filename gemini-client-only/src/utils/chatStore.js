const STORAGE_KEY = "gemini_chats_v1";

export function getChats() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveChats(chats) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(chats));
}

export function getChatById(id) {
  return getChats().find((c) => c.id === id) || null;
}

export function saveChat(chat) {
  const chats = getChats();
  const exists = chats.some((c) => c.id === chat.id);

  const updated = exists
    ? chats.map((c) => (c.id === chat.id ? chat : c))
    : [chat, ...chats];

  saveChats(updated);
}

export function createNewChat() {
  const now = new Date().toISOString();

  const newChat = {
    id: crypto.randomUUID(),
    title: "New chat",
    messages: [
      {
        id: crypto.randomUUID(),
        role: "assistant",
        content: "Ready when you are.",
      },
    ],
    createdAt: now,
  };

  const chats = getChats();
  saveChats([newChat, ...chats]);

  return newChat;
}

export function deleteChatById(id) {
  const chats = getChats().filter((c) => c.id !== id);
  saveChats(chats);
}

export function updateChatTitleFromFirstMessage(chat, text) {
  if (chat.title !== "New chat") return;

  const short =
    text.length > 25 ? text.substring(0, 25) + "..." : text;

  saveChat({
    ...chat,
    title: short,
  });
}