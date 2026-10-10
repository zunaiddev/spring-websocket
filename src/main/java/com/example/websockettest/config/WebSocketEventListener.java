package com.example.websockettest.config;

import com.example.websockettest.dto.WebSocketEvent;
import com.example.websockettest.service.ConnectedUserService;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.stereotype.Controller;
import org.springframework.web.socket.messaging.SessionConnectedEvent;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

import java.util.HashMap;
import java.util.Map;

@Controller
@Slf4j
@AllArgsConstructor
public class WebSocketEventListener {
    private final ConnectedUserService connectedUserService;
    private final SimpMessagingTemplate messagingTemplate;
    private static final String USER_STATUS_TOPIC = "/topic/user-status";

    @EventListener
    public void handleWebsocketConnectListener(SessionConnectedEvent event){
        StompHeaderAccessor accessor = StompHeaderAccessor.wrap(event.getMessage());
        String sessionId = accessor.getSessionId();
        String username = accessor.getFirstNativeHeader("username");

        System.out.println(" : " + accessor);

        if (sessionId != null){
            connectedUserService.put(sessionId, username == null ? "Guest User" : username);
        }

        log.info("WebSocket New Connection. Session ID: {}", sessionId);

        WebSocketEvent userEvent = new WebSocketEvent(
                username,
                sessionId,
                "CONNECTED",
                connectedUserService.size()
        );

        messagingTemplate.convertAndSend(USER_STATUS_TOPIC, userEvent);
    }

    @EventListener
    public void handleWebsocketDisconnectListener(SessionDisconnectEvent event){
        StompHeaderAccessor headerAccessor = StompHeaderAccessor.wrap(event.getMessage());
        String sessionId = headerAccessor.getSessionId();

        if (sessionId != null) {
            connectedUserService.remove(sessionId);

            log.info("WebSocket connection closed. Session ID: {}", sessionId);
            log.info("Total active connections: {}", connectedUserService.size());
        }
    }
}