const nameInput = document.querySelector("#name");
const messageInput = document.querySelector("#message");
const messages = document.querySelector("#messages");
const sendBtn = document.querySelector("#send-btn");
const form = document.querySelector("form");
const socket = new SockJS("/chat");
const stompClient = Stomp.over(socket);

window.onload = connect;

form.addEventListener("submit", (e)=>{
    e.preventDefault();

    const name = nameInput.value;
    const message = messageInput.value;

    stompClient.send("/app/send-message",{}, JSON.stringify({
        message,
    }));
});

function addMessage(msg){
    const ele = document.createElement("p");
    ele.textContent = typeof msg === "object" && msg !== null ? (msg.message || JSON.stringify(msg)) : msg;

    messages.appendChild(ele);
    messageInput.value = "";
}

function connect(){
    stompClient.connect({}, function (){
        setConnected(true);
        stompClient.subscribe("/topic/messages", function (data){
            addMessage(JSON.parse(data.body));
        });
    });
    console.log("Connected to the socket");
}

setConnected(true);

function setConnected(val){
    sendBtn.disabled = !val;
}
