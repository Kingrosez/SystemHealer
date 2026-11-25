package com.systemhealer.api;

import java.util.List;

public class RestorePointResponse {
    private List<RestorePoint> points;

    public RestorePointResponse() {}

    public RestorePointResponse(List<RestorePoint> points) {
        this.points = points;
    }

    public List<RestorePoint> getPoints() { return points; }
    public void setPoints(List<RestorePoint> points) { this.points = points; }

    public static class RestorePoint {
        private String id;
        private String description;
        private String createdAt;
        private int sequenceNumber;

        public RestorePoint() {}

        public RestorePoint(String id, String description, String createdAt, int sequenceNumber) {
            this.id = id;
            this.description = description;
            this.createdAt = createdAt;
            this.sequenceNumber = sequenceNumber;
        }

        public String getId() { return id; }
        public void setId(String id) { this.id = id; }

        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }

        public String getCreatedAt() { return createdAt; }
        public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }

        public int getSequenceNumber() { return sequenceNumber; }
        public void setSequenceNumber(int sequenceNumber) { this.sequenceNumber = sequenceNumber; }
    }
}