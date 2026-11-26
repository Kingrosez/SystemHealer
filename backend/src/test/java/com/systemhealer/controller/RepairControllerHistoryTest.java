package com.systemhealer.controller;

import com.systemhealer.model.Task;
import com.systemhealer.model.TaskStatus;
import com.systemhealer.model.TaskType;
import com.systemhealer.repository.TaskRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.ResponseEntity;

import java.time.Instant;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class RepairControllerHistoryTest {

    @Mock
    private TaskRepository taskRepository;

    @InjectMocks
    private RepairController repairController;

    @Test
    void historyReturnsNewestRepairTasksWithParsedActions() {
        Task newest = new Task(TaskType.REPAIR, TaskStatus.SUCCESS, "Repair scan: [sfc, dism]");
        newest.setStartedAt(Instant.parse("2026-11-24T10:00:00Z"));
        newest.setUpdatedAt(Instant.parse("2026-11-24T10:05:00Z"));

        Task older = new Task(TaskType.REPAIR, TaskStatus.FAILED, "Repair scan: [network]");
        older.setStartedAt(Instant.parse("2026-11-23T10:00:00Z"));
        older.setUpdatedAt(Instant.parse("2026-11-23T10:02:00Z"));

        when(taskRepository.findByType(TaskType.REPAIR))
                .thenReturn(List.of(older, newest));

        ResponseEntity<RepairController.RepairHistoryResponse> response =
                repairController.history(0, 1);

        RepairController.RepairHistoryResponse body = response.getBody();
        assertNotNull(body);
        assertEquals(2, body.getTotal());
        assertEquals(1, body.getItems().size());

        RepairController.RepairHistoryItem item = body.getItems().get(0);
        assertEquals(newest.getId(), item.getId());
        assertEquals("SUCCESS", item.getStatus());
        assertEquals(List.of("sfc", "dism"), item.getActions());
        assertEquals(2, item.getSummary().getRepaired());
        assertEquals("2026-11-24T10:05:00Z", item.getFinishedAt());
    }
}
