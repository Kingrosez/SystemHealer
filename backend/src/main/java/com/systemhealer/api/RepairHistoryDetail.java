package com.systemhealer.api;

import com.systemhealer.model.Task;
import java.util.List;

public class RepairHistoryDetail {
    private Task task;
    private List<String> logLines;

    public RepairHistoryDetail() {}

    public RepairHistoryDetail(Task task) {
        this.task = task;
        this.logLines = List.of();
    }

    public RepairHistoryDetail(Task task, List<String> logLines) {
        this.task = task;
        this.logLines = logLines != null ? logLines : List.of();
    }

    public Task getTask() { return task; }
    public void setTask(Task task) { this.task = task; }
    public List<String> getLogLines() { return logLines; }
    public void setLogLines(List<String> logLines) { this.logLines = logLines; }
}