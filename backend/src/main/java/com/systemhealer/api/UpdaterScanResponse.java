package com.systemhealer.api;

import java.util.List;

public class UpdaterScanResponse {
    private boolean available;
    private List<SoftwareUpdate> updates;

    public UpdaterScanResponse() {}

    public UpdaterScanResponse(boolean available, List<SoftwareUpdate> updates) {
        this.available = available;
        this.updates = updates;
    }

    public boolean isAvailable() { return available; }
    public void setAvailable(boolean available) { this.available = available; }

    public List<SoftwareUpdate> getUpdates() { return updates; }
    public void setUpdates(List<SoftwareUpdate> updates) { this.updates = updates; }

    public static class SoftwareUpdate {
        private String id;
        private String name;
        private String currentVersion;
        private String availableVersion;

        public SoftwareUpdate() {}

        public SoftwareUpdate(String id, String name, String currentVersion, String availableVersion) {
            this.id = id;
            this.name = name;
            this.currentVersion = currentVersion;
            this.availableVersion = availableVersion;
        }

        public String getId() { return id; }
        public void setId(String id) { this.id = id; }

        public String getName() { return name; }
        public void setName(String name) { this.name = name; }

        public String getCurrentVersion() { return currentVersion; }
        public void setCurrentVersion(String currentVersion) { this.currentVersion = currentVersion; }

        public String getAvailableVersion() { return availableVersion; }
        public void setAvailableVersion(String availableVersion) { this.availableVersion = availableVersion; }
    }
}