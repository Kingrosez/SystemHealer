package com.systemhealer.controller;

import com.systemhealer.api.SettingsResponse;
import com.systemhealer.service.SettingsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/settings")
public class SettingsController {

    @Autowired
    private SettingsService settingsService;

    @GetMapping
    public ResponseEntity<SettingsResponse> get() {
        return ResponseEntity.ok(settingsService.getSettings());
    }

    @PutMapping
    public ResponseEntity<SettingsResponse> update(@RequestBody SettingsService.SettingsRequest request) {
        return ResponseEntity.ok(settingsService.updateSettings(request));
    }
}