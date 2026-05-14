import { useMemo } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Plus, MessageSquare, Trash2, Sparkles } from "lucide-react";
import { createNewChat, deleteChatById, getChats } from "../../utils/chatStore";

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const chats = useMemo(() => getChats(), [location.pathname]);

  const handleNew = () => {
    const chat = createNewChat();
    navigate(`/chat/${chat.id}`);
  };

  const handleDelete = (e, id) => {
    e.preventDefault();
    e.stopPropagation();
    deleteChatById(id);

    const remaining = getChats();
    if (location.pathname === `/chat/${id}`) {
      if (remaining.length) navigate(`/chat/${remaining[0].id}`);
      else navigate("/");
    }
  };

  return (
    <aside className="sidebar">
      <button className="sidebar-brand" onClick={() => navigate("/")}>
        <div className="brand-mark">
          <Sparkles size={16} />
        </div>
        <div className="brand-text">
          <div className="brand-title">Gemini Chat</div>
          <div className="brand-subtitle">{chats.length} saved chats</div>
        </div>
      </button>

      <button className="new-chat-btn" onClick={handleNew}>
        <Plus size={18} />
        <span>New Chat</span>
      </button>

      <div className="sidebar-section">
        <div className="sidebar-section-label">Chats</div>

        <div className="chat-list">
          {chats.length === 0 ? (
            <div className="empty-chat-list">No chats yet</div>
          ) : (
            chats.map((chat) => {
              const active = location.pathname === `/chat/${chat.id}`;
              return (
                <Link
                  key={chat.id}
                  to={`/chat/${chat.id}`}
                  className={`chat-item ${active ? "active" : ""}`}
                >
                  <MessageSquare size={16} className="chat-item-icon" />
                  <div className="chat-item-content">
                    <div className="chat-item-title">{chat.title}</div>
                    <div className="chat-item-meta">
                      {chat.messages?.length || 0} messages
                    </div>
                  </div>
                  <button
                    className="chat-item-delete"
                    onClick={(e) => handleDelete(e, chat.id)}
                    title="Delete chat"
                  >
                    <Trash2 size={14} />
                  </button>
                </Link>
              );
            })
          )}
        </div>
      </div>
    </aside>
  );
}