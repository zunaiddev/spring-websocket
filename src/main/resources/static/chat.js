const stompClient = new StompJs.Client({
    brokerURL: 'ws://localhost:8080/gs-guide-websocket',

    onConnect: () => {
        console.log("Connected");

        stompClient.subscribe("/user/queue/messages", (message) => {
            const data = JSON.parse(message.body);
            console.log(data);
            showMessages(data);
        });
    }
});

function sendMessage(){
    stompClient.publish({
        destination: "/app/chat",
        body: JSON.stringify({
            sender: $("#sender").val(),
            receiver: $("#receiver").val(),
            message: $("#message").val()
        })
    });
}

function showMessages(message) {
    $("#messages").append("<tr><td>" + message + "</td></tr>");
}

$(function (){
    $("#send").click((e) => {
        e.preventDefault();
        sendMessage();
    });
});

stompClient.activate();