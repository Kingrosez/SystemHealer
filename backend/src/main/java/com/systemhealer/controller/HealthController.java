package com.systemhealer.controller;

import com.systemhealer.api.HealthResponse;
import com.systemhealer.util.CommandRunner;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api")
public class HealthController {

    @Autowired
    private CommandRunner commandRunner;

    @GetMapping("/health")
    public HealthResponse health() {
        String uptimeSeconds = getSystemUptimeSeconds();
        return new HealthResponse("ok", "0.1.0", uptimeSeconds);
    }

    private String getSystemUptimeSeconds() {
        try {
            var result = commandRunner.run(List.of(
                    "powershell", "-Command", "[datetime]::.UtcNow - (Get-CimInstance Win32_OperatingSystem).LastBootUpTime | %{$_.TotalSeconds}"
            ), 10);
            if (result.success()) {
                String output = result.getStdout().trim();
                // Output might have decimals, round to whole seconds
                double seconds = Double.parseDouble(output);
                return String.valueOf((long) seconds);
            }
        } catch (Exception e) {
            // Fall through to default
        }
        return "0";
    }
}