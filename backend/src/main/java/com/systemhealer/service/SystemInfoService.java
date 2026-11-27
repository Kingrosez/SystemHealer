package com.systemhealer.service;

import com.systemhealer.api.SystemInfo;
import com.systemhealer.util.CommandRunner;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class SystemInfoService {

    @Autowired
    private CommandRunner commandRunner;

    public SystemInfo getSystemInfo() {
        String os = getOsInfo();
        String build = getBuildNumber();
        String cpu = getCpuInfo();
        int ramGb = getRamGb();
        boolean bitLockerEnabled = checkBitLocker();
        boolean wingetAvailable = checkWinget();

        return new SystemInfo(
                os,
                build,
                cpu,
                ramGb,
                isAdmin(),
                bitLockerEnabled,
                wingetAvailable
        );
    }

    private String getOsInfo() {
        try {
            var result = commandRunner.run(List.of(
                    "powershell", "-Command", "Get-CimInstance Win32_OperatingSystem | Select-Object -ExpandProperty Caption"
            ), 10);
            if (result.success()) {
                String output = result.getStdout().trim();
                return output.isEmpty() ? "Windows" : output;
            }
        } catch (Exception e) {
            // Fall through to default
        }
        return "Windows";
    }

    private String getBuildNumber() {
        try {
            var result = commandRunner.run(List.of(
                    "powershell", "-Command", "(Get-CimInstance Win32_OperatingSystem).BuildNumber"
            ), 10);
            if (result.success()) {
                String output = result.getStdout().trim();
                return output.isEmpty() ? "Unknown" : output;
            }
        } catch (Exception e) {
            // Fall through to default
        }
        return "Unknown";
    }

    private String getCpuInfo() {
        try {
            var result = commandRunner.run(List.of(
                    "powershell", "-Command", "Get-CimInstance Win32_Processor | Select-Object -ExpandProperty Name"
            ), 10);
            if (result.success()) {
                String output = result.getStdout().trim();
                // Get first line (primary CPU)
                String[] lines = output.split("\n");
                return lines.length > 0 && !lines[0].isEmpty() ? lines[0] : "Unknown CPU";
            }
        } catch (Exception e) {
            // Fall through to default
        }
        return "Unknown CPU";
    }

    private int getRamGb() {
        try {
            var result = commandRunner.run(List.of(
                    "powershell", "-Command", "Get-CimInstance Win32_ComputerSystem | Select-Object -ExpandProperty TotalPhysicalMemory"
            ), 10);
            if (result.success()) {
                String output = result.getStdout().trim();
                try {
                    long bytes = Long.parseLong(output);
                    return (int) (bytes / (1024L * 1024L * 1024L));
                } catch (NumberFormatException e) {
                    // Fall through to default
                }
            }
        } catch (Exception e) {
            // Fall through to default
        }
        return 8; // Default fallback
    }

    private boolean isAdmin() {
        try {
            var result = commandRunner.run(List.of(
                    "powershell", "-Command", "[Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent().IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)"
            ), 10);
            if (result.success()) {
                return result.getStdout().trim().equalsIgnoreCase("True");
            }
        } catch (Exception e) {
            // Fall through to default
        }
        return false;
    }

    private boolean checkBitLocker() {
        try {
            var result = commandRunner.run(List.of(
                    "powershell", "-Command", "Get-BitLockerVolume -MountPoint C: | Select-Object -ExpandProperty VolumeStatus"
            ), 10);
            if (result.success()) {
                String output = result.getStdout().trim();
                // VolumeStatus can be "FullyEncrypted", "EncryptionInProgress", "DecryptionInProgress", etc.
                return output.contains("Encrypted") || output.contains("Locking");
            }
        } catch (Exception e) {
            // Bitlocker not available or not enabled
        }
        return false;
    }

    private boolean checkWinget() {
        try {
            var result = commandRunner.run(List.of(
                    "powershell", "-Command", "Get-Command winget -ErrorAction SilentlyContinue"
            ), 10);
            return result.success();
        } catch (Exception e) {
            return false;
        }
    }
}