package com.systemhealer.model;

import jakarta.persistence.*;
import java.time.Instant;

/**
 * Represents a log line for a task operation.
 * Used for streaming real-time logs via SSE.
 */
@Entity
@Table(name = "repair_logs")
public class RepairLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @Column(name = "task_id", nullable = false)
    private String taskId;

    @Column(name = "line", nullable = false, length = 4000)
    private String line;

    @Column(name = "level", nullable = false)
    private String level = "INFO";

    @Column(name = "step")
    private String step;

    @Column(name = "timestamp", nullable = false)
    private Instant timestamp;

    // Constructors
    public RepairLog() {
        this.timestamp = Instant.now();
    }

    public RepairLog(String taskId, String line, String level, String step) {
        this();
        this.taskId = taskId;
        this.line = line;
        this.level = level != null ? level : "INFO";
        this.step = step;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTaskId() { return taskId; }
    public void setTaskId(String taskId) { this.taskId = taskId; }

    public String getLine() { return line; }
    public void setLine(String line) { this.line = line; }

    public String getLevel() { return level; }
    public void setLevel(String level) { this.level = level; }

    public String getStep() { return step; }
    public void setStep(String step) { this.step = step; }

    public Instant getTimestamp() { return timestamp; }
    public void setTimestamp(Instant timestamp) { this.timestamp = timestamp; }
}