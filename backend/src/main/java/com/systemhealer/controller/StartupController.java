package com.systemhealer.controller;

import com.systemhealer.api.StartupProgramsResponse;
import com.systemhealer.exception.SystemHealerException;
import com.systemhealer.exception.ErrorCodes;
import com.systemhealer.service.StartupService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/startup")
public class StartupController {

    @Autowired
    private StartupService startupService;

    @GetMapping("/programs")
    public ResponseEntity<StartupProgramsResponse> list(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "100") int size) {
        return ResponseEntity.ok(startupService.getStartupPrograms(page, size));
    }

    @PutMapping("/programs/{id}")
    public ResponseEntity<Void> toggle(@PathVariable String id, @RequestBody ToggleRequest request) {
        startupService.toggleStartup(id, request.isEnabled());
        return ResponseEntity.noContent().build();
    }

    public static class ToggleRequest {
        private boolean enabled;

        public boolean isEnabled() { return enabled; }
        public void setEnabled(boolean enabled) { this.enabled = enabled; }
    }
}