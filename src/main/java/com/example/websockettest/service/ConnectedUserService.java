package com.example.websockettest.service;

import lombok.Getter;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Getter
@Service
public class ConnectedUserService {
    private final Map<String, Object> connectedUsers;

    public ConnectedUserService(){
        this.connectedUsers = new HashMap<>();
    }

    public void put(String sessionId, String s) {
        this.connectedUsers.put(sessionId, s);
    }

    public void remove(String sessionId) {
        this.connectedUsers.remove(sessionId);
    }

    public int size(){
        return this.connectedUsers.size();
    }
}
