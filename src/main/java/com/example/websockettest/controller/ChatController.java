package com.example.websockettest.controller;

import com.example.websockettest.dto.ChatMessage;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

@Controller
@RequiredArgsConstructor
public class ChatController {
    private final SimpMessagingTemplate template;

    @MessageMapping("/chat")
    public void sendMessage(ChatMessage message) {
        template.convertAndSendToUser(
                message.receiver(),
                "/queue/messages",
                message
        );
    }
}