package com.systemhealer.service;

import com.systemhealer.api.SystemInfo;
import com.systemhealer.util.CommandRunner;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.io.IOException;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class SystemInfoServiceTest {

    @Mock
    private CommandRunner commandRunner;

    @InjectMocks
    private SystemInfoService systemInfoService;

    @Test
    void getSystemInfoReturnsSystemInfoWithRealValues() throws InterruptedException, IOException {
        // Mock OS info
        CommandRunner.CommandResult osResult = new CommandRunner.CommandResult(
                0, "Windows 11 Pro 23H2", ""
        );

        // Mock build number
        CommandRunner.CommandResult buildResult = new CommandRunner.CommandResult(
                0, "22631", ""
        );

        // Mock CPU info
        CommandRunner.CommandResult cpuResult = new CommandRunner.CommandResult(
                0, "Intel Core i7-12700\nCPU Details", ""
        );

        // Mock RAM (in bytes)
        CommandRunner.CommandResult ramResult = new CommandRunner.CommandResult(
                0, "34359738368", "" // 32 GB in bytes
        );

        // Mock admin check
        CommandRunner.CommandResult adminResult = new CommandRunner.CommandResult(
                0, "True", ""
        );

        // Mock BitLocker check
        CommandRunner.CommandResult bitLockerResult = new CommandRunner.CommandResult(
                0, "FullyEncrypted", ""
        );

        // Mock winget check
        CommandRunner.CommandResult wingetResult = new CommandRunner.CommandResult(
                0, "", ""
        );

        when(commandRunner.run(List.of(
                "powershell", "-Command", "Get-CimInstance Win32_OperatingSystem | Select-Object -ExpandProperty Caption"
        ), 10)).thenReturn(osResult);

        when(commandRunner.run(List.of(
                "powershell", "-Command", "(Get-CimInstance Win32_OperatingSystem).BuildNumber"
        ), 10)).thenReturn(buildResult);

        when(commandRunner.run(List.of(
                "powershell", "-Command", "Get-CimInstance Win32_Processor | Select-Object -ExpandProperty Name"
        ), 10)).thenReturn(cpuResult);

        when(commandRunner.run(List.of(
                "powershell", "-Command", "Get-CimInstance Win32_ComputerSystem | Select-Object -ExpandProperty TotalPhysicalMemory"
        ), 10)).thenReturn(ramResult);

        when(commandRunner.run(List.of(
                "powershell", "-Command", "[Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent().IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)"
        ), 10)).thenReturn(adminResult);

        when(commandRunner.run(List.of(
                "powershell", "-Command", "Get-BitLockerVolume -MountPoint C: | Select-Object -ExpandProperty VolumeStatus"
        ), 10)).thenReturn(bitLockerResult);

        when(commandRunner.run(List.of(
                "powershell", "-Command", "Get-Command winget -ErrorAction SilentlyContinue"
        ), 10)).thenReturn(wingetResult);

        SystemInfo info = systemInfoService.getSystemInfo();

        assertNotNull(info);
        assertTrue(info.getRamGb() > 0);
        assertFalse(info.getOs().isEmpty());
    }

    @Test
    void getSystemInfoReturnsDefaultValuesOnCommandFailure() throws InterruptedException, IOException {
        // Mock command failure for all operations
        CommandRunner.CommandResult failureResult = new CommandRunner.CommandResult(
                -1, "", "Command failed"
        );

        when(commandRunner.run(List.of(
                "powershell", "-Command", "Get-CimInstance Win32_OperatingSystem | Select-Object -ExpandProperty Caption"
        ), 10)).thenReturn(failureResult);

        when(commandRunner.run(List.of(
                "powershell", "-Command", "(Get-CimInstance Win32_OperatingSystem).BuildNumber"
        ), 10)).thenReturn(failureResult);

        when(commandRunner.run(List.of(
                "powershell", "-Command", "Get-CimInstance Win32_Processor | Select-Object -ExpandProperty Name"
        ), 10)).thenReturn(failureResult);

        when(commandRunner.run(List.of(
                "powershell", "-Command", "Get-CimInstance Win32_ComputerSystem | Select-Object -ExpandProperty TotalPhysicalMemory"
        ), 10)).thenReturn(failureResult);

        when(commandRunner.run(List.of(
                "powershell", "-Command", "[Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent().IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)"
        ), 10)).thenReturn(failureResult);

        when(commandRunner.run(List.of(
                "powershell", "-Command", "Get-BitLockerVolume -MountPoint C: | Select-Object -ExpandProperty VolumeStatus"
        ), 10)).thenReturn(failureResult);

        when(commandRunner.run(List.of(
                "powershell", "-Command", "Get-Command winget -ErrorAction SilentlyContinue"
        ), 10)).thenReturn(failureResult);

        SystemInfo info = systemInfoService.getSystemInfo();

        assertNotNull(info);
        // Should have default fallback values
        assertTrue(info.getRamGb() > 0); // Default is 8GB
    }
}