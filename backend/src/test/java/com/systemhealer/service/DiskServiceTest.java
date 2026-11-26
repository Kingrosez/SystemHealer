package com.systemhealer.service;

import com.systemhealer.api.DiskScanRequest;
import com.systemhealer.api.DiskUsageResponse;
import com.systemhealer.model.Task;
import com.systemhealer.model.TaskStatus;
import com.systemhealer.model.TaskType;
import com.systemhealer.repository.TaskRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.api.io.TempDir;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class DiskServiceTest {

    @Mock
    private TaskRepository taskRepository;

    @InjectMocks
    private DiskService diskService;

    @Test
    void getDiskUsageReturnsDriveAndUsageLists() {
        DiskUsageResponse response = diskService.getDiskUsage();

        assertNotNull(response);
        assertNotNull(response.getDrives());
        assertNotNull(response.getUsage());
    }

    @Test
    void scanSummarizesTopLevelChildren(@TempDir Path tempDir) throws IOException {
        Files.writeString(tempDir.resolve("a.txt"), "hello");
        Files.createDirectory(tempDir.resolve("sub"));
        Files.writeString(tempDir.resolve("sub").resolve("b.txt"), "world!");

        when(taskRepository.save(any(Task.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        Task task = new Task(TaskType.DISK_SCAN, TaskStatus.RUNNING, "test scan");
        DiskScanRequest request = new DiskScanRequest();
        request.setDrive(tempDir.toString());
        request.setMaxDepth(3);

        diskService.scan(task, request);

        assertEquals(TaskStatus.SUCCESS, task.getStatus());
        assertEquals(100, task.getProgressPercent());

        DiskUsageResponse response = diskService.getDiskUsage();
        assertFalse(response.getUsage().isEmpty());
        assertTrue(response.getUsage().stream()
                .anyMatch(item -> "sub".equals(item.getName()) && item.getSizeBytes() == 6L));
        assertTrue(response.getUsage().stream()
                .anyMatch(item -> "a.txt".equals(item.getName()) && item.getSizeBytes() == 5L));
    }
}
