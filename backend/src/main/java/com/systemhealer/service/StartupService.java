package com.systemhealer.service;

import com.systemhealer.api.StartupProgramsResponse;
import com.systemhealer.util.CommandRunner;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public class StartupService {

    @Autowired
    private CommandRunner commandRunner;

    public StartupProgramsResponse getStartupPrograms(int page, int size) {
        // In production: query Windows registry (HKCU\Software\Microsoft\Windows\CurrentVersion\Run, HKLM equivalents)
        // and Task Scheduler for startup programs
        return new StartupProgramsResponse(
                List.of(
                        new StartupProgramsResponse.StartupProgram(
                                UUID.randomUUID().toString(),
                                "Example App",
                                "Example Inc.",
                                "C:\\Program Files\\Example\\app.exe",
                                true,
                                "medium"
                        ),
                        new StartupProgramsResponse.StartupProgram(
                                UUID.randomUUID().toString(),
                                "Another Tool",
                                "Another Corp",
                                "C:\\Tools\\tool.exe",
                                false,
                                "low"
                        )
                ),
                page, size, 2
        );
    }

    public void toggleStartup(String id, boolean enabled) {
        // In production: modify registry or Task Scheduler entry
        // For now, just log the action
        System.out.println("Toggle startup " + id + " to " + (enabled ? "enabled" : "disabled"));
    }
}