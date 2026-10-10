package com.example.websockettest.controller;

import com.example.websockettest.dto.ChatMessage;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

@Controller
@RequiredArgsConstructor
public class ChatController {

    @MessageMapping("/send-message")
    @SendTo("/topic/messages")
   public ChatMessage sendMessage(ChatMessage chatMessage){
       return chatMessage;
   }
}