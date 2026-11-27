package com.systemhealer.controller;

import com.systemhealer.api.RepairHistoryItem;
import com.systemhealer.api.RepairHistoryResponse;
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
    void historyReturnsRepairHistoryItems() {
        Task task = new Task(TaskType.REPAIR, TaskStatus.SUCCESS, "Repair scan: sfc");
        task.setStartedAt(Instant.parse("2026-11-24T10:00:00Z"));

        when(taskRepository.findByTypeOrderByStartedAtDesc(TaskType.REPAIR))
                .thenReturn(List.of(task));

        ResponseEntity<RepairHistoryResponse> response =
                repairController.history(0, 10);

        RepairHistoryResponse body = response.getBody();
        assertNotNull(body);
        assertEquals(1, body.getTotal());
        assertEquals(1, body.getItems().size());

        RepairHistoryItem item = body.getItems().get(0);
        assertEquals(task.getId(), item.getId());
        assertEquals("success", item.getStatus());
        assertEquals(Instant.parse("2026-11-24T10:00:00Z"), item.getStartedAt());
    }
}
