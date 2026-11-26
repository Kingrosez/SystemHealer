package com.systemhealer.api;

import java.time.Instant;
import java.util.List;

public class RepairHistoryItem {
    private String id;
    private String status;
    private Instant startedAt;
    private String errorMessage;

    public RepairHistoryItem() {}

    public RepairHistoryItem(String id, String status, Instant startedAt, String errorMessage) {
        this.id = id;
        this.status = status;
        this.startedAt = startedAt;
        this.errorMessage = errorMessage;
    }

    public RepairHistoryItem(String id, String startedAt, String finishedAt, List<String> actions, String status, RepairSummary summary) {
        this.id = id;
        this.startedAt = Instant.parse(startedAt);
        this.finishedAt = finishedAt != null ? Instant.parse(finishedAt) : null;
        this.actions = actions;
        this.status = status;
        this.summary = summary;
    }

    private Instant finishedAt;
    private List<String> actions;
    private RepairSummary summary;

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public Instant getStartedAt() { return startedAt; }
    public void setStartedAt(Instant startedAt) { this.startedAt = startedAt; }
    public Instant getFinishedAt() { return finishedAt; }
    public void setFinishedAt(Instant finishedAt) { this.finishedAt = finishedAt; }
    public String getErrorMessage() { return errorMessage; }
    public void setErrorMessage(String errorMessage) { this.errorMessage = errorMessage; }
    public List<String> getActions() { return actions; }
    public void setActions(List<String> actions) { this.actions = actions; }
    public RepairSummary getSummary() { return summary; }
    public void setSummary(RepairSummary summary) { this.summary = summary; }
}