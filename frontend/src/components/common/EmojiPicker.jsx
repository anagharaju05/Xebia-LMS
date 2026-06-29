import { useState, useEffect, useRef } from "react";

const CATEGORIES = [
  {
    name: "Tech",
    icon: "💻",
    emojis: [
      "💻", "📊", "☁️", "🎨", "🚀", "💡", "📚", "✍️", "🔧", "🛡️",
      "🌐", "📱", "🔍", "⚙️", "🔑", "🧪", "📈", "🤖", "⚡", "✨",
      "🧠", "🧩", "📁", "📝", "✏️", "🏷️", "💼", "🏢", "🎓", "📐"
    ]
  },
  {
    name: "Faces",
    icon: "😊",
    emojis: [
      "😀", "😃", "😄", "😁", "😆", "😅", "😂", "🤣", "😊", "😇",
      "🙂", "🙃", "😉", "😌", "😍", "🥰", "😘", "😗", "😙", "😚",
      "😋", "😛", "😝", "😜", "🤪", "🤨", "🧐", "🤓", "😎", "🤩"
    ]
  },
  {
    name: "Symbols",
    icon: "🌟",
    emojis: [
      "📢", "💬", "✅", "❌", "❓", "⚠️", "ℹ️", "➕", "➖", "🎯",
      "🏆", "🔥", "🌟", "⭐", "💯", "📍", "🔔", "🔒", "🔓", "💎",
      "🥇", "🥈", "🥉", "📈", "📉", "🛡️", "🔑", "🚩", "⚡", "✨"
    ]
  },
  {
    name: "Nature",
    icon: "🌍",
    emojis: [
      "🌱", "🌲", "🍀", "🍁", "🌸", "🌞", "🌙", "🌍", "🌎", "🌏",
      "🪐", "🍎", "🍕", "🍔", "🍟", "☕", "🥤", "🍻", "🥂", "🎉",
      "✈️", "🚗", "🚲", "🏠", "🏢", "🌈", "🎈", "🎁", "🎨", "🎵"
    ]
  }
];

export default function EmojiPicker({ label, value, onChange, placeholder, required }) {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const containerRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="emoji-picker-container" ref={containerRef}>
      <label className="field">
        <span>{label} {required && <em style={{ color: "var(--orange)", fontStyle: "normal" }}>*</em>}</span>
        <div className="emoji-input-wrapper" style={{ position: "relative", width: "100%" }}>
          <input
            type="text"
            value={value || ""}
            readOnly
            onClick={() => setOpen(!open)}
            placeholder={placeholder || "Click to pick an emoji..."}
            style={{ cursor: "pointer", width: "100%" }}
          />
          {open && (
            <div className="emoji-picker-dropdown">
              <div className="emoji-categories">
                {CATEGORIES.map((cat, idx) => (
                  <button
                    key={cat.name}
                    type="button"
                    className={`emoji-cat-btn ${activeTab === idx ? "active" : ""}`}
                    onClick={() => setActiveTab(idx)}
                    title={cat.name}
                  >
                    <span>{cat.icon}</span>
                    <span className="emoji-cat-name">{cat.name}</span>
                  </button>
                ))}
              </div>
              <div className="emoji-grid">
                {CATEGORIES[activeTab].emojis.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    className="emoji-btn"
                    onClick={() => {
                      onChange(emoji);
                      setOpen(false);
                    }}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </label>
    </div>
  );
}
