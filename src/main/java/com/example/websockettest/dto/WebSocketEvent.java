package com.example.websockettest.dto;

public record WebSocketEvent(
        String username,
        String sessionId,
        String status,
        int totalActiveConnections
) {
}