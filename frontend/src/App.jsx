import React, { useState, useEffect, useRef } from "react";
import axios from "axios";

// Import our separated CSS files
import "./index.css";
import "./App.css";
import { marked } from "marked";
// --- SVG Icons ---
const SendIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-6 w-6"
  >
    <line x1="22" y1="2" x2="11" y2="13"></line>
    <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
  </svg>
);
const BotIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-8 w-8 text-white"
  >
    <path d="M12 8V4H8" />
    <rect width="16" height="12" x="4" y="8" rx="2" />
    <path d="M2 14h2" />
    <path d="M20 14h2" />
    <path d="M15 13v2" />
    <path d="M9 13v2" />
  </svg>
);
const UserIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-8 w-8 text-white"
  >
    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);
const SparkleIcon = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M12 3L9.5 8.5 4 11l5.5 2.5L12 19l2.5-5.5L20 11l-5.5-2.5z"></path>
  </svg>
);
const CloseIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-6 w-6"
  >
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);
const LinkIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-4 w-4"
  >
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.72"></path>
    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.72-1.72"></path>
  </svg>
);

const NavArrowLeftIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="15 18 9 12 15 6"></polyline>
  </svg>
);
const NavArrowRightIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="9 18 15 12 9 6"></polyline>
  </svg>
);
// --- Canvas Background Component ---
const CanvasBackground = () => {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let animationFrameId;
    let particles = [];
    const numParticles = 100;
    class Particle {
      constructor(x, y, size, speedX, speedY) {
        this.x = x;
        this.y = y;
        this.size = size;
        this.speedX = speedX;
        this.speedY = speedY;
      }
      update() {
        if (this.x > canvas.width || this.x < 0) this.speedX = -this.speedX;
        if (this.y > canvas.height || this.y < 0) this.speedY = -this.speedY;
        this.x += this.speedX;
        this.y += this.speedY;
      }
      draw() {
        ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    function init() {
      particles = [];
      for (let i = 0; i < numParticles; i++) {
        const size = Math.random() * 1.5 + 0.5;
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        const speedX = (Math.random() - 0.5) * 0.5;
        const speedY = (Math.random() - 0.5) * 0.5;
        particles.push(new Particle(x, y, size, speedX, speedY));
      }
    }
    function connect() {
      let opacityValue = 1;
      for (let a = 0; a < particles.length; a++) {
        for (let b = a; b < particles.length; b++) {
          const distance = Math.sqrt(
            (particles[a].x - particles[b].x) ** 2 +
              (particles[a].y - particles[b].y) ** 2
          );
          if (distance < 120) {
            opacityValue = 1 - distance / 120;
            ctx.strokeStyle = `rgba(255, 255, 255, ${opacityValue})`;
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(particles[a].x, particles[a].y);
            ctx.lineTo(particles[b].x, particles[b].y);
            ctx.stroke();
          }
        }
      }
    }
    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => {
        p.update();
        p.draw();
      });
      connect();
      animationFrameId = requestAnimationFrame(animate);
    }
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      init();
    };
    window.addEventListener("resize", resizeCanvas);
    resizeCanvas();
    animate();
    return () => {
      window.removeEventListener("resize", resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);
  return <canvas ref={canvasRef} className="canvas-background"></canvas>;
};

// --- Main App Component ---
export default function App() {
  const [messages, setMessages] = useState(() => {
    // Try to get the chat history from localStorage
    const savedMessages = localStorage.getItem("chatHistory");
    // If it exists, parse it from JSON. Otherwise, start with an empty array.
    return savedMessages ? JSON.parse(savedMessages) : [];
  });
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sourceModal, setSourceModal] = useState({
    isOpen: false,
    source: null,
  });
  const chatEndRef = useRef(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  useEffect(scrollToBottom, [messages, isLoading]);

  const handleSendMessage = async (e, promptOverride) => {
    if (e) e.preventDefault();
    const messageText = promptOverride || inputValue;
    if (!messageText.trim()) return;

    const userMessage = { text: messageText, sender: "user" };
    setMessages((prev) => [...prev, userMessage]);
    if (!promptOverride) setInputValue("");
    setIsLoading(true);

    try {
      const response = await axios.post("http://127.0.0.1:8000/query", {
        query: messageText,
        top_k: 5,
      });
      const botResponse = {
        text: response.data.answer,
        sender: "bot",
        sources: response.data.retrieved_sources_with_metadata,
        userQuery: messageText,
      };
      setMessages((prev) => [...prev, botResponse]);
    } catch (error) {
      console.error("Error calling RAG backend:", error);
      const errorMessage = {
        text: "An error occurred while contacting the AI. Please ensure the backend is running.",
        sender: "bot",
        sources: [],
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExamplePrompt = (prompt) => {
    setInputValue(prompt);
    handleSendMessage(null, prompt);
  };

  const ExamplePrompts = () => (
    <div className="example-prompts-grid">
      <button
        onClick={() => handleExamplePrompt("What are the symptoms of malaria?")}
        className="prompt-button"
      >
        <p className="prompt-title">Symptoms of Malaria</p>
        <p className="prompt-subtitle">What are the common signs?</p>
      </button>
      <button
        onClick={() => handleExamplePrompt("How can I improve my diet?")}
        className="prompt-button"
      >
        <p className="prompt-title">Improving Diet</p>
        <p className="prompt-subtitle">What are some healthy eating tips?</p>
      </button>
    </div>
  );

  const WelcomeScreen = () => (
    <div className="welcome-screen">
      <div className="welcome-icon-container">
        <BotIcon />
      </div>
      <h1 className="welcome-title">Your Health Compass</h1>
      <p className="welcome-subtitle">
        Ask me anything about global health topics.
      </p>
      <div className="welcome-prompts">
        <ExamplePrompts />
      </div>
    </div>
  );

  // In src/App.jsx

  // This is the final, complete, and bug-free version of the component
  const ChatMessage = ({ message }) => {
    const isBot = message.sender === "bot";

    // This function handles the click event for inline [Source X] links for documents.
    const handleInlineSourceClick = (e) => {
      // Prevent the link from trying to navigate
      e.preventDefault();
      const sourceIndex = parseInt(
        e.target.getAttribute("data-source-index"),
        10
      );

      if (message.sources && message.sources[sourceIndex]) {
        // We only care about document sources for the modal
        const docSources = message.sources.filter(
          (s) => s.metadata.type !== "web"
        );
        const sourceToFind = message.sources[sourceIndex];
        const docIndex = docSources.indexOf(sourceToFind);

        if (docIndex > -1) {
          setSourceModal({
            isOpen: true,
            sources: docSources,
            currentIndex: docIndex,
          });
        }
      }
    };

    // A robust function to process the bot's response text
    const processBotText = (text, sources) => {
      if (!text) return { __html: "" };

      // 1. Convert core Markdown (bold, lists) to HTML
      let html = marked(text);

      // 2. Find all [Source X] citations and convert them into appropriate links
      html = html.replace(/\[Source (\d+)\]/g, (match, numberStr) => {
        const number = parseInt(numberStr, 10);
        const index = number - 1; // Convert to 0-based index

        if (sources && sources[index]) {
          const source = sources[index];
          if (source.metadata.type === "web") {
            // It's a web source, create a standard external link
            return `<a href="${source.metadata.source}" target="_blank" rel="noopener noreferrer" class="source-link">Source ${number}</a>`;
          } else {
            // It's a document source, create a link that will trigger our click handler
            return `<a href="#" class="source-link" data-source-index="${index}">Source ${number}</a>`;
          }
        }
        return match; // If source not found, return the original text like "[Source 99]"
      });
      return { __html: html };
    };

    // This handles click events on the entire message bubble.
    // If a user clicks an inline document source link, it will trigger the modal.
    const handleBubbleClick = (e) => {
      if (
        e.target.matches("a.source-link") &&
        e.target.hasAttribute("data-source-index")
      ) {
        handleInlineSourceClick(e);
      }
    };

    return (
      <div className={`message-container ${isBot ? "bot" : "user"}`}>
        {isBot && (
          <div className="avatar bot-avatar">
            <BotIcon />
          </div>
        )}

        <div
          className={`message-bubble ${isBot ? "bot-bubble" : "user-bubble"}`}
          onClick={isBot ? handleBubbleClick : null}
        >
          <div
            className="message-text"
            dangerouslySetInnerHTML={
              isBot
                ? processBotText(message.text, message.sources)
                : { __html: message.text }
            }
          />

          {/* This is the section for the source chips at the bottom */}
          {isBot && message.sources && message.sources.length > 0 && (
            <div className="sources-container">
              <div className="sources-list">
                {message.sources.map((source, i) => {
                  const sourceType = source.metadata.type;
                  if (sourceType === "web") {
                    return (
                      <a
                        key={i}
                        href={source.metadata.source}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="source-chip web-source"
                        title={source.metadata.title}
                      >
                        <LinkIcon />{" "}
                        {source.metadata.title || `Web Source ${i + 1}`}
                      </a>
                    );
                  } else {
                    // It's a document
                    return (
                      <button
                        key={i}
                        onClick={() => {
                          // Correctly find the index ONLY among the document sources
                          const docSources = message.sources.filter(
                            (s) => s.metadata.type !== "web"
                          );
                          const docIndex = docSources.indexOf(source);
                          if (docIndex > -1) {
                            setSourceModal({
                              isOpen: true,
                              sources: docSources,
                              currentIndex: docIndex,
                            });
                          }
                        }}
                        className="source-chip"
                      >
                        {/* Correctly label the chip based on its order among documents */}
                        Source{" "}
                        {message.sources
                          .filter((s) => s.metadata.type !== "web")
                          .indexOf(source) + 1}
                      </button>
                    );
                  }
                })}
              </div>
            </div>
          )}
        </div>

        {!isBot && (
          <div className="avatar user-avatar">
            <UserIcon />
          </div>
        )}
      </div>
    );
  };

  const formatSourceName = (filename) => {
    if (!filename) return "Source Document";

    let name = filename.replace(/\.pdf$/i, "");

    name = name.replace(/WHO_Fact_Sheet_/gi, "");

    name = name.replace(/_/g, " ");

    return name.trim();
  };

  const SourceModal = () => {
    const { isOpen, sources, currentIndex } = sourceModal;

    if (!isOpen) return null;

    const handleClose = () =>
      setSourceModal({ isOpen: false, sources: [], currentIndex: null });

    const handleNext = (e) => {
      e.stopPropagation(); // Prevent modal from closing
      const nextIndex = (currentIndex + 1) % sources.length;
      setSourceModal((prev) => ({ ...prev, currentIndex: nextIndex }));
    };

    const handlePrev = (e) => {
      e.stopPropagation(); // Prevent modal from closing
      const prevIndex = (currentIndex - 1 + sources.length) % sources.length;
      setSourceModal((prev) => ({ ...prev, currentIndex: prevIndex }));
    };

    const currentSource = sources[currentIndex];

    return (
      <div className="modal-overlay" onClick={handleClose}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h2 className="modal-title">
              <SparkleIcon className="w-6 h-6 text-blue-400" />
              Source ({currentIndex + 1} / {sources.length})
            </h2>
            <button onClick={handleClose} className="modal-close-button">
              <CloseIcon />
            </button>
          </div>

          <div className="modal-body">
            {/* --- THE NEW MIDDLE NAVIGATION BUTTONS --- */}
            <button onClick={handlePrev} className="modal-nav-button prev">
              <NavArrowLeftIcon />
            </button>

            <div className="source-text custom-scrollbar">
              <h4 className="source-filename">
                {formatSourceName(
                  decodeURIComponent(currentSource.metadata.source)
                )}
              </h4>
              <p>{currentSource.content}</p>
            </div>

            <button onClick={handleNext} className="modal-nav-button next">
              <NavArrowRightIcon />
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="app-container">
      <CanvasBackground />
      <SourceModal />
      <main className="main-content">
        <header className="app-header">
          <div className="header-content">
            <h1 className="header-title">Your Health Compass </h1>
          </div>
        </header>
        <div className="chat-area custom-scrollbar">
          <div className="chat-content">
            {messages.length === 0 ? (
              <WelcomeScreen />
            ) : (
              <div className="message-list">
                {messages.map((msg, index) => (
                  <ChatMessage key={index} message={msg} />
                ))}
                {/* --- REFINED: "Bot is thinking" indicator --- */}
                {isLoading && (
                  <div className="message-container bot">
                    <div className="avatar bot-avatar">
                      <BotIcon />
                    </div>
                    <div className="message-bubble bot-bubble">
                      <div className="thinking-bubble">
                        <span className="thinking-dot dot-1"></span>
                        <span className="thinking-dot dot-2"></span>
                        <span className="thinking-dot dot-3"></span>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={chatEndRef}></div>
              </div>
            )}
          </div>
        </div>
        <div className="input-area">
          <div className="input-content">
            <form onSubmit={handleSendMessage} className="input-form">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Ask about a health topic..."
                className="text-input"
              />
              <button
                type="submit"
                className="send-button"
                disabled={isLoading || !inputValue.trim()}
              >
                <SendIcon />
              </button>
            </form>
            <p className="disclaimer">
              Disclaimer: This is an AI-powered tool, not a medical
              professional. Always consult a healthcare provider for any health
              concerns.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
