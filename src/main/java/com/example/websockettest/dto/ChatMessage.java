package com.example.websockettest.dto;

public record ChatMessage(
        String sender,
        String receiver,
        String message
) {}
