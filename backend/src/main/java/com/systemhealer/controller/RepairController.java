package com.systemhealer.controller;

import com.systemhealer.api.RepairStartRequest;
import com.systemhealer.exception.SystemHealerException;
import com.systemhealer.exception.ErrorCodes;
import com.systemhealer.model.Task;
import com.systemhealer.model.TaskStatus;
import com.systemhealer.model.TaskType;
import com.systemhealer.repository.TaskRepository;
import com.systemhealer.service.RepairService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ConcurrentHashMap;

@RestController
@RequestMapping("/api/repair")
public class RepairController {

    private static final long RESTORE_POINT_TOKEN_TTL_SECONDS = 300;

    private final Map<String, Instant> restorePointTokens = new ConcurrentHashMap<>();

    @Autowired
    private RepairService repairService;

    @Autowired
    private TaskRepository taskRepository;

    /**
     * Start a repair run.
     * Returns 202 with taskId and streamUrl immediately.
     * If createRestorePoint is true, creates a restore point first.
     */
    @PostMapping("/start")
    public ResponseEntity<RepairStartResponse> start(
            @RequestBody RepairStartRequest request,
            @RequestHeader(value = "X-Confirm-Token", required = false) String confirmToken) {

        // Check for restore point token if creating restore point
        if (request.isCreateRestorePoint() && !consumeRestorePointToken(confirmToken)) {
            String token = generateRestorePointToken();
            return ResponseEntity
                    .status(HttpStatus.CONFLICT)
                    .body(new RepairStartResponse(null, null, "restore_point_required", token));
        }

        Task task = new Task(TaskType.REPAIR, TaskStatus.RUNNING, "Repair scan: " + request.getActions());
        Task savedTask = taskRepository.save(task);

        // Start repair asynchronously
        final String taskId = savedTask.getId();
        CompletableFuture.runAsync(() -> {
            Task t = taskRepository.findById(taskId).orElse(savedTask);
            repairService.startRepair(t, request);
        });

        String streamUrl = "/api/repair/stream/" + savedTask.getId();
        RepairStartResponse response = new RepairStartResponse(savedTask.getId(), streamUrl, null, null);

        return ResponseEntity.accepted().body(response);
    }

    /**
     * Generate a single-use restore point confirmation token.
     */
    private String generateRestorePointToken() {
        Instant now = Instant.now();
        restorePointTokens.entrySet().removeIf(entry -> entry.getValue().isBefore(now));

        String token = "rp_" + UUID.randomUUID();
        restorePointTokens.put(token, now.plusSeconds(RESTORE_POINT_TOKEN_TTL_SECONDS));
        return token;
    }

    /**
     * Consume a restore point token, returning true when it is valid and unused.
     */
    private boolean consumeRestorePointToken(String token) {
        if (token == null) {
            return false;
        }

        Instant expiry = restorePointTokens.remove(token);
        return expiry != null && expiry.isAfter(Instant.now());
    }

    @GetMapping("/stream/{taskId}")
    public SSEView stream(@PathVariable String taskId) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new SystemHealerException(
                        "Task not found: " + taskId,
                        ErrorCodes.TASK_NOT_FOUND,
                        HttpStatus.NOT_FOUND));
        return new SSEView(taskId);
    }

    @PostMapping("/{taskId}/cancel")
    public ResponseEntity<Void> cancel(@PathVariable String taskId) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new SystemHealerException(
                        "Task not found: " + taskId,
                        ErrorCodes.TASK_NOT_FOUND,
                        HttpStatus.NOT_FOUND));

        if (task.getStatus() != TaskStatus.RUNNING) {
            throw new SystemHealerException(
                    "Task is not running",
                    ErrorCodes.TASK_ALREADY_RUNNING,
                    HttpStatus.CONFLICT);
        }

        repairService.cancelRepair(taskId);
        task.setStatus(TaskStatus.CANCELLED);
        taskRepository.save(task);

        return ResponseEntity.noContent().build();
    }

    @GetMapping("/history")
    public ResponseEntity<RepairHistoryResponse> history(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size) {

        int safePage = Math.max(0, page);
        int safeSize = Math.max(1, Math.min(size, 200));

        List<Task> tasks = new ArrayList<>(taskRepository.findByType(TaskType.REPAIR));
        tasks.sort(Comparator.comparing(Task::getStartedAt).reversed());

        int from = Math.min(safePage * safeSize, tasks.size());
        int to = Math.min(from + safeSize, tasks.size());

        List<RepairHistoryItem> items = tasks.subList(from, to).stream()
                .map(this::toHistoryItem)
                .toList();

        RepairHistoryResponse response = new RepairHistoryResponse();
        response.setItems(items);
        response.setPage(safePage);
        response.setSize(safeSize);
        response.setTotal(tasks.size());
        return ResponseEntity.ok(response);
    }

    private RepairHistoryItem toHistoryItem(Task task) {
        RepairHistoryItem item = new RepairHistoryItem();
        item.setId(task.getId());
        item.setStartedAt(task.getStartedAt() != null ? task.getStartedAt().toString() : null);
        item.setFinishedAt(
                task.getStatus() == TaskStatus.RUNNING || task.getStatus() == TaskStatus.PENDING
                        ? null
                        : task.getUpdatedAt().toString());
        item.setStatus(task.getStatus().name());

        List<String> actions = parseActions(task.getDescription());
        item.setActions(actions);

        RepairSummary summary = new RepairSummary();
        if (task.getStatus() == TaskStatus.SUCCESS) {
            summary.setRepaired(actions.size());
        } else if (task.getStatus() == TaskStatus.FAILED) {
            summary.setFailed(actions.size());
        }
        item.setSummary(summary);

        return item;
    }

    private List<String> parseActions(String description) {
        if (description == null) {
            return List.of();
        }

        int start = description.indexOf('[');
        int end = description.lastIndexOf(']');
        if (start < 0 || end <= start) {
            return List.of();
        }

        String inner = description.substring(start + 1, end).trim();
        if (inner.isEmpty()) {
            return List.of();
        }

        return Arrays.stream(inner.split(","))
                .map(String::trim)
                .filter(action -> !action.isEmpty())
                .toList();
    }

    @GetMapping("/history/{id}")
    public ResponseEntity<RepairHistoryDetail> detail(@PathVariable String id) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new SystemHealerException(
                        "Repair history not found: " + id,
                        ErrorCodes.TASK_NOT_FOUND,
                        HttpStatus.NOT_FOUND));
        return ResponseEntity.ok(new RepairHistoryDetail(task));
    }

    // Helper DTOs
    public static class RepairStartResponse {
        private final String taskId;
        private final String streamUrl;
        private final String restorePointStatus;
        private final String restorePointToken;

        public RepairStartResponse(String taskId, String streamUrl, String restorePointStatus, String restorePointToken) {
            this.taskId = taskId;
            this.streamUrl = streamUrl;
            this.restorePointStatus = restorePointStatus;
            this.restorePointToken = restorePointToken;
        }

        public String getTaskId() { return taskId; }
        public String getStreamUrl() { return streamUrl; }
        public String getRestorePointStatus() { return restorePointStatus; }
        public String getRestorePointToken() { return restorePointToken; }
    }

    public static class RepairHistoryResponse {
        private java.util.List<RepairHistoryItem> items = java.util.List.of();
        private int page;
        private int size;
        private long total;

        public java.util.List<RepairHistoryItem> getItems() { return items; }
        public void setItems(java.util.List<RepairHistoryItem> items) { this.items = items; }
        public int getPage() { return page; }
        public void setPage(int page) { this.page = page; }
        public int getSize() { return size; }
        public void setSize(int size) { this.size = size; }
        public long getTotal() { return total; }
        public void setTotal(long total) { this.total = total; }
    }

    public static class RepairHistoryItem {
        private String id;
        private String startedAt;
        private String finishedAt;
        private java.util.List<String> actions;
        private String status;
        private RepairSummary summary;

        public String getId() { return id; }
        public void setId(String id) { this.id = id; }
        public String getStartedAt() { return startedAt; }
        public void setStartedAt(String startedAt) { this.startedAt = startedAt; }
        public String getFinishedAt() { return finishedAt; }
        public void setFinishedAt(String finishedAt) { this.finishedAt = finishedAt; }
        public java.util.List<String> getActions() { return actions; }
        public void setActions(java.util.List<String> actions) { this.actions = actions; }
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
        public RepairSummary getSummary() { return summary; }
        public void setSummary(RepairSummary summary) { this.summary = summary; }
    }

    public static class RepairSummary {
        private int repaired;
        private int failed;

        public int getRepaired() { return repaired; }
        public void setRepaired(int repaired) { this.repaired = repaired; }
        public int getFailed() { return failed; }
        public void setFailed(int failed) { this.failed = failed; }
    }

    public static class RepairHistoryDetail {
        private Task task;
        private java.util.List<String> logLines;

        public RepairHistoryDetail(Task task) {
            this.task = task;
            this.logLines = java.util.List.of();
        }

        public Task getTask() { return task; }
        public void setTask(Task task) { this.task = task; }
        public java.util.List<String> getLogLines() { return logLines; }
        public void setLogLines(java.util.List<String> logLines) { this.logLines = logLines; }
    }

    public static class SSEView {
        private final String taskId;

        public SSEView(String taskId) {
            this.taskId = taskId;
        }

        public String getTaskId() { return taskId; }
    }
}