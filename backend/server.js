import express from "express";
import cors from "cors";
import mongoose from "mongoose";

// 🔐 Replace this with your own MongoDB connection string
const MONGO_URI = "mongodb+srv://2005abuhamza:abuhamza@clusterog.5tzaf6p.mongodb.net/?retryWrites=true&w=majority&appName=ClusterOG";

// Connect to MongoDB
mongoose
    .connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log("✅ Connected to MongoDB"))
    .catch((err) => console.error("MongoDB connection error:", err));

// Define post schema and model
const postSchema = new mongoose.Schema({
    username: { type: String, required: true },
    content: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    likes: { type: Number, default: 0 },
    emoji: { type: String },
    bgColor: { type: String }
});

const Post = mongoose.model("Post", postSchema);

// Initialize Express app
const app = express();

const allowedOrigins = [
    "https://mini-messanger.vercel.app",   // Frontend hosted on Vercel (production)
    "http://localhost:3000",                // Local development frontend
    "https://minimessanger.onrender.com"    // Backend URL for Render (for testing)
];

app.use(cors({
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);  // Allow the request
        } else {
            callback(new Error("CORS not allowed by this server"));  // Block the request
        }
    },
    methods: ["GET", "POST", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type"],
}));

app.use((req, res, next) => {
    console.log("Request Origin:", req.headers.origin); // Debugging CORS
    next();
});

app.use(express.json());  // Parse JSON bodies

// Get all posts
app.get("/posts", async (req, res) => {
    try {
        const posts = await Post.find().sort({ createdAt: -1 });
        res.json(posts);
    } catch (err) {
        console.error("Error fetching posts:", err);  // Log the error
        res.status(500).json({ error: "Failed to fetch posts" });
    }
});

// Add a new post
app.post("/posts", async (req, res) => {
    const { username, content, emoji, bgColor } = req.body;
    const newPost = new Post({
        username,
        content,
        emoji,
        bgColor,
    });

    try {
        await newPost.save();
        res.status(201).json(newPost);
    } catch (err) {
        res.status(500).json({ error: "Failed to create post" });
    }
});

// Delete a post
app.delete("/posts/:id", async (req, res) => {
    try {
        const post = await Post.findByIdAndDelete(req.params.id);
        if (post) {
            res.sendStatus(204);
        } else {
            res.status(404).json({ error: "Post not found" });
        }
    } catch (err) {
        res.status(500).json({ error: "Failed to delete post" });
    }
});

// Like a post
app.post("/posts/:id/like", async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (post) {
            post.likes += 1;
            await post.save();
            res.json(post);
        } else {
            res.status(404).json({ error: "Post not found" });
        }
    } catch (err) {
        res.status(500).json({ error: "Failed to like post" });
    }
});

// Start the server
const PORT = process.env.PORT || 5000;  // Default to 5000 if PORT is not set
app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
});
