// Alias SockJs to SockJS so both spellings work seamlessly
window.SockJs = window.SockJS;

// DOM Elements
const joinScreen = document.getElementById("join-screen");
const chatScreen = document.getElementById("chat-screen");
const joinForm = document.getElementById("join-form");
const nameInput = document.getElementById("name");
const userDisplayName = document.getElementById("user-display-name");
const userAvatar = document.getElementById("user-avatar");

const messageForm = document.getElementById("message-form");
const messageInput = document.getElementById("message");
const messagesContainer = document.getElementById("messages");
const sendBtn = document.getElementById("send-btn");
const statusDot = document.getElementById("status-dot");
const statusText = document.getElementById("status-text");

// Application State
let stompClient = null;
let currentUserName = "";
let isConnected = false;

// 1. Join Form Handler
joinForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const username = nameInput.value.trim();
    if (!username) return;

    currentUserName = username;
    userDisplayName.textContent = currentUserName;
    userAvatar.textContent = currentUserName.charAt(0).toUpperCase();

    // Transition from Join Screen to Chat Screen
    joinScreen.classList.add("hidden");
    chatScreen.classList.remove("hidden");

    if (messageInput) {
        messageInput.focus();
    }

    // Connect to WebSocket
    connectWebSocket();
});

// 2. WebSocket Connection Management
function connectWebSocket() {
    updateConnectionStatus(false, "Connecting...");

    const socket = new SockJS("/chat");
    stompClient = Stomp.over(socket);

    stompClient.connect({}, function (frame) {
        updateConnectionStatus(true, "Connected");
        console.log("Connected to STOMP broker:", frame);

        // Subscribe to chat topic
        stompClient.subscribe("/topic/messages", function (response) {
            try {
                const payload = JSON.parse(response.body);
                const rawMsg = payload.message !== undefined ? payload.message : response.body;
                addMessage(rawMsg);
            } catch (err) {
                addMessage(response.body);
            }
        });
    }, function (error) {
        console.error("STOMP connection error:", error);
        updateConnectionStatus(false, "Disconnected");
    });
}

function updateConnectionStatus(connected, text) {
    isConnected = connected;
    if (statusText) statusText.textContent = text;
    if (statusDot) {
        statusDot.style.backgroundColor = connected ? "#10b981" : "#ef4444";
        statusDot.style.boxShadow = connected ? "0 0 8px #10b981" : "0 0 8px #ef4444";
    }
    if (sendBtn) sendBtn.disabled = !connected;
}

// 3. Message Send Handler
messageForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const text = messageInput.value.trim();
    if (!text || !stompClient || !isConnected) return;

    // Prefix message with username
    const formattedMessage = currentUserName ? `${currentUserName}: ${text}` : text;

    stompClient.send("/app/send-message", {}, JSON.stringify({
        message: formattedMessage,
    }));

    messageInput.value = "";
    messageInput.focus();
});

// 4. Render Message Bubble
function addMessage(msg) {
    let author = "User";
    let text = msg;

    // Parse "Author: Message" format
    if (typeof msg === "string") {
        const colonIndex = msg.indexOf(": ");
        if (colonIndex !== -1) {
            author = msg.substring(0, colonIndex);
            text = msg.substring(colonIndex + 2);
        }
    } else if (typeof msg === "object" && msg !== null) {
        text = msg.message || JSON.stringify(msg);
    }

    const isMine = author === currentUserName;

    const bubble = document.createElement("div");
    bubble.className = `message-bubble ${isMine ? "outgoing" : "incoming"}`;

    const authorEle = document.createElement("span");
    authorEle.className = "message-author";
    authorEle.textContent = isMine ? "You" : author;

    const contentEle = document.createElement("div");
    contentEle.className = "message-content";
    contentEle.textContent = text;

    const timeEle = document.createElement("span");
    timeEle.className = "message-time";
    const now = new Date();
    timeEle.textContent = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    bubble.appendChild(authorEle);
    bubble.appendChild(contentEle);
    bubble.appendChild(timeEle);

    messagesContainer.appendChild(bubble);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}
