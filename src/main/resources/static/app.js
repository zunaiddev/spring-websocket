// Alias SockJs to SockJS so both spellings work seamlessly
window.SockJs = window.SockJS;

document.addEventListener("DOMContentLoaded", () => {
    // DOM Elements
    const joinScreen = document.getElementById("join-screen");
    const chatScreen = document.getElementById("chat-screen");
    const joinForm = document.getElementById("join-form");
    const joinBtn = document.getElementById("join-btn");
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

    // 1. Join Handler
    function handleJoin(e) {
        if (e && typeof e.preventDefault === "function") {
            e.preventDefault();
        }

        const username = nameInput ? nameInput.value.trim() : "";
        if (!username) return;

        currentUserName = username;
        if (userDisplayName) userDisplayName.textContent = currentUserName;
        if (userAvatar) userAvatar.textContent = currentUserName.charAt(0).toUpperCase();

        // Transition from Join Screen to Chat Screen
        if (joinScreen) joinScreen.classList.add("hidden");
        if (chatScreen) chatScreen.classList.remove("hidden");

        if (messageInput) {
            messageInput.focus();
        }

        // Connect to WebSocket
        connectWebSocket();
    }

    if (joinForm) {
        joinForm.addEventListener("submit", handleJoin);
    }

    if (joinBtn) {
        joinBtn.addEventListener("click", handleJoin);
    }

    if (nameInput) {
        nameInput.addEventListener("keydown", (e) => {
            if (e.key === "Enter") {
                handleJoin(e);
            }
        });
    }

    function connectWebSocket() {
        updateConnectionStatus(false, "Connecting...");

        try {
            const socket = new SockJS("/chat");
            stompClient = Stomp.over(socket);

            console.log("Username: ", currentUserName);

            stompClient.connect({username: currentUserName}, function (frame) {
                updateConnectionStatus(true, "Connected");
                console.log("Connected to STOMP broker:", frame);

                stompClient.subscribe("/topic/messages", function (response) {
                    try {
                        const payload = JSON.parse(response.body);
                        const rawMsg = payload.message !== undefined ? payload.message : response.body;
                        addMessage(rawMsg);
                    } catch (err) {
                        addMessage(response.body);
                    }
                });

                stompClient.subscribe("/topic/user-status", function (response) {
                    try {
                        const payload = JSON.parse(response.body);
                        console.log(payload);
                    } catch (err) {
                        console.log(response.body);
                    }
                });
            }, function (error) {
                console.error("STOMP connection error:", error);
                updateConnectionStatus(false, "Disconnected");
            });
        } catch (err) {
            console.error("Failed to initialize SockJS/STOMP:", err);
            updateConnectionStatus(false, "Disconnected");
        }
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
    function handleSendMessage(e) {
        if (e && typeof e.preventDefault === "function") {
            e.preventDefault();
        }

        const text = messageInput ? messageInput.value.trim() : "";
        if (!text || !stompClient || !isConnected) return;

        const formattedMessage = currentUserName ? `${currentUserName}: ${text}` : text;

        try {
            stompClient.send("/app/send-message", {}, JSON.stringify({
                message: formattedMessage,
            }));
            messageInput.value = "";
            messageInput.focus();
        } catch (err) {
            console.error("Failed to send message:", err);
        }
    }

    if (messageForm) {
        messageForm.addEventListener("submit", handleSendMessage);
    }

    if (sendBtn) {
        sendBtn.addEventListener("click", handleSendMessage);
    }

    if (messageInput) {
        messageInput.addEventListener("keydown", (e) => {
            if (e.key === "Enter") {
                handleSendMessage(e);
            }
        });
    }

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

        if (messagesContainer) {
            messagesContainer.appendChild(bubble);
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }
    }
});
