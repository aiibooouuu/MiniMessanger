import { useEffect, useState } from "react";
import "./App.css";

const BACKEND_URL = "https://minimessanger.onrender.com";

function App() {
  const [posts, setPosts] = useState([]);
  const [content, setContent] = useState("");
  const [username, setUsername] = useState(""); // ⬅️ new state
  const [likedPosts, setLikedPosts] = useState([]);
  const [selectedEmoji, setSelectedEmoji] = useState("🙂");
  const [selectedColor, setSelectedColor] = useState("#7f08e05b");


  useEffect(() => {
    const storedName = localStorage.getItem("username");
    if (storedName) {
      setUsername(storedName);
    } else {
      const inputName = prompt("Enter your name:");
      if (inputName && inputName.trim() !== "") {
        setUsername(inputName.trim());
        localStorage.setItem("username", inputName.trim());
      }
    }
  
    fetchPosts();
  }, []);
  
  const fetchPosts = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/posts`);
      if (!res.ok) throw new Error(`Failed to fetch posts: ${res.statusText}`);
      const data = await res.json();
      setPosts(data);
    } catch (err) {
      console.error("Error fetching posts:", err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim() || !username.trim()) return; // ⬅️ Validate both fields

    const res = await fetch(`${BACKEND_URL}/posts`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        content,
        username,
        emoji: selectedEmoji,
        bgColor: selectedColor,
      }),
    });
    

    if (res.ok) {
      const newPost = await res.json();
      setPosts((prev) => [newPost, ...prev]);
      setContent("");
    } else {
      console.error("Failed to post");
    }
  };

  // const deletePost = async (id) => {
  //   await fetch(`${BACKEND_URL}/posts/${id}`, {
  //     method: "DELETE",
  //   });
  //   setPosts((prev) => prev.filter((post) => post._id !== id));
  // };

  const toggleLike = async (id) => {
    try {
      const res = await fetch(`${BACKEND_URL}/posts/${id}/like`, {
        method: "POST",
      });

      if (res.ok) {
        const updatedPost = await res.json();
        setPosts((prev) =>
          prev.map((post) => (post._id === updatedPost._id ? updatedPost : post))
        );
      }
    } catch (err) {
      console.error("Failed to like post:", err);
    }

    setLikedPosts((prev) =>
      prev.includes(id) ? prev.filter((pid) => pid !== id) : [...prev, id]
    );
  };

  return (
    <div className="app-container">
      <div className="sidebar">
        <h2>Mini Messanger 🗣️</h2>
        <form onSubmit={handleSubmit} className="post-form">
        <div className="emoji-picker">
          {["🙂", "😎", "😢", "🔥", "🎉", "🤖", "😡", "😇", "💡", "🥳"].map((emoji, index) => (
            <span
              key={index}
              className={`emoji-option ${selectedEmoji === emoji ? "selected" : ""}`}
              onClick={() => setSelectedEmoji(emoji)}
            >
              {emoji}
            </span>
          ))}
        </div>


        <div className="color-picker">
          {["#7f08e05b", "#1da1f25b", "#ff63475b", "#32cd325b", "#ff14935b"].map((color, index) => (
            <div
              key={index}
              className={`color-circle ${selectedColor === color ? "selected" : ""}`}
              style={{ backgroundColor: color }}
              onClick={() => setSelectedColor(color)}
            ></div>
          ))}
        </div>


          {/* <input
            type="text"
            placeholder="Your name"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="username-input"
          /> */}

          <textarea
            placeholder="What's happening?"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
          <button className="button1" type="submit">Post</button>
          <div className="change-name">
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your name"
              className="username-input"
            />
            <button
              type="button"
              className="change-name-button"
              onClick={() => {
                if (username.trim() !== "") {
                  localStorage.setItem("username", username.trim());
                  alert("Name updated!");
                }
              }}
            >
              Update Name
            </button>
          </div>
        </form>
      </div>

      <div className="feed">
        {posts.map((post) => (
          <div
          key={post._id}
          className="post"
          style={{ backgroundColor: post.bgColor || console.log(post.bgColor) }}
        >
          <div className="post-header">
            <small className="timestamp">
              {new Date(post.createdAt).toLocaleString()} &nbsp;
            </small>
            <span className="username">{post.emoji || "🙂"} {post.username}</span>
          </div>
          <div className="post-body">
            <p>{post.content}</p>
          </div>
          <div className="post-actions">
          <button
            onClick={() => toggleLike(post._id)}
            className={likedPosts.includes(post._id) ? "liked" : "like"}
          >
            LIKE
          </button>
          <span className="like-count">❤️ {post.likes || 0}</span>
            {/* <button className="delete" onClick={() => deletePost(post._id)}>
              DELETE
            </button> */}
          </div>
        </div>
        
        
        ))}
      </div>
    </div>
  );
}

export default App;
