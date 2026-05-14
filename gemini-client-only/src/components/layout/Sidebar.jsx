import { useMemo } from "react";
import { MessageSquare, Plus, Trash2 } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { createNewChat, deleteChatById, getChats } from "../../utils/chatStore";

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();

  const chats = useMemo(() => getChats(), [location.pathname]);

  const handleNewChat = () => {
    const newChat = createNewChat();
    navigate(`/chat/${newChat.id}`);
  };

  const handleDelete = (e, chatId) => {
    e.preventDefault();
    e.stopPropagation();
    deleteChatById(chatId);

    const remaining = getChats();
    if (location.pathname.includes(`/chat/${chatId}`)) {
      if (remaining.length > 0) navigate(`/chat/${remaining[0].id}`);
      else navigate("/");
    } else {
      navigate(location.pathname);
    }
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-brand" onClick={() => navigate("/")}>
        <div className="brand-mark">G</div>
        <div>
          <div className="brand-title">Gemini Chat</div>
          <div className="brand-subtitle">{chats.length} saved chats</div>
        </div>
      </div>

      <button className="new-chat-btn" onClick={handleNewChat}>
        <Plus size={18} />
        <span>New</span>
      </button>

      <div className="sidebar-section">
        <div className="sidebar-section-title">Chats</div>

        <div className="sidebar-list">
          {chats.length === 0 ? (
            <div className="sidebar-empty">No chats yet</div>
          ) : (
            chats.map((chat) => {
              const active = location.pathname === `/chat/${chat.id}`;
              return (
                <Link
                  to={`/chat/${chat.id}`}
                  key={chat.id}
                  className={`chat-item ${active ? "active" : ""}`}
                >
                  <MessageSquare size={16} className="chat-item-icon" />
                  <div className="chat-item-body">
                    <div className="chat-item-title">{chat.title}</div>
                    <div className="chat-item-meta">
                      {chat.messages?.length || 0} messages
                    </div>
                  </div>

                  <button
                    className="chat-delete-btn"
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