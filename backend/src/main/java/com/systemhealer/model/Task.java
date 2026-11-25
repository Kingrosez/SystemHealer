package com.systemhealer.model;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

/**
 * Entity tracking all long-running operations (repair, cleanup, duplicates, updater).
 * Each task gets a UUID and can be tracked via its status and SSE stream.
 */
@Entity
@Table(name = "tasks")
public class Task {

    @Id
    @Column(name = "id", nullable = false, updatable = false)
    private String id;

    @Column(name = "type", nullable = false)
    @Enumerated(EnumType.STRING)
    private TaskType type;

    @Column(name = "status", nullable = false)
    @Enumerated(EnumType.STRING)
    private TaskStatus status;

    @Column(name = "started_at", nullable = false)
    private Instant startedAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @Column(name = "current_step")
    private String currentStep;

    @Column(name = "progress_percent")
    private int progressPercent;

    @Column(name = "description")
    private String description;

    @Column(name = "error_code", length = 50)
    private String errorCode;

    @Column(name = "error_message")
    private String errorMessage;

    // Constructors
    public Task() {
        this.id = UUID.randomUUID().toString();
        this.startedAt = Instant.now();
        this.updatedAt = Instant.now();
        this.progressPercent = 0;
    }

    public Task(TaskType type, TaskStatus status, String description) {
        this();
        this.type = type;
        this.status = status;
        this.description = description;
    }

    // Getters and Setters
    public String getId() { return id; }

    public void setId(String id) { this.id = id; }

    public TaskType getType() { return type; }

    public void setType(TaskType type) { this.type = type; }

    public TaskStatus getStatus() { return status; }

    public void setStatus(TaskStatus status) { this.status = status; }

    public Instant getStartedAt() { return startedAt; }

    public void setStartedAt(Instant startedAt) { this.startedAt = startedAt; }

    public Instant getUpdatedAt() { return updatedAt; }

    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }

    public String getCurrentStep() { return currentStep; }

    public void setCurrentStep(String currentStep) { this.currentStep = currentStep; }

    public int getProgressPercent() { return progressPercent; }

    public void setProgressPercent(int progressPercent) { this.progressPercent = progressPercent; }

    public String getDescription() { return description; }

    public void setDescription(String description) { this.description = description; }

    public String getErrorCode() { return errorCode; }

    public void setErrorCode(String errorCode) { this.errorCode = errorCode; }

    public String getErrorMessage() { return errorMessage; }

    public void setErrorMessage(String errorMessage) { this.errorMessage = errorMessage; }

    @Override
    public String toString() {
        return "Task{" +
                "id='" + id + '\'' +
                ", type=" + type +
                ", status=" + status +
                ", startedAt=" + startedAt +
                ", updatedAt=" + updatedAt +
                ", currentStep='" + currentStep + '\'' +
                ", progressPercent=" + progressPercent +
                ", description='" + description + '\'' +
                '}';
    }
}