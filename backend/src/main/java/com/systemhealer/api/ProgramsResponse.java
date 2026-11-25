package com.systemhealer.api;

import java.util.List;

public class ProgramsResponse {
    private List<Program> items;
    private int page;
    private int size;
    private long total;

    public ProgramsResponse() {}

    public ProgramsResponse(List<Program> items, int page, int size, long total) {
        this.items = items;
        this.page = page;
        this.size = size;
        this.total = total;
    }

    public List<Program> getItems() { return items; }
    public void setItems(List<Program> items) { this.items = items; }

    public int getPage() { return page; }
    public void setPage(int page) { this.page = page; }

    public int getSize() { return size; }
    public void setSize(int size) { this.size = size; }

    public long getTotal() { return total; }
    public void setTotal(long total) { this.total = total; }

    public static class Program {
        private String id;
        private String name;
        private String publisher;
        private String version;
        private String installDate;
        private long sizeBytes;
        private String uninstallString;

        public Program() {}

        public Program(String id, String name, String publisher, String version, String installDate, long sizeBytes, String uninstallString) {
            this.id = id;
            this.name = name;
            this.publisher = publisher;
            this.version = version;
            this.installDate = installDate;
            this.sizeBytes = sizeBytes;
            this.uninstallString = uninstallString;
        }

        public String getId() { return id; }
        public void setId(String id) { this.id = id; }

        public String getName() { return name; }
        public void setName(String name) { this.name = name; }

        public String getPublisher() { return publisher; }
        public void setPublisher(String publisher) { this.publisher = publisher; }

        public String getVersion() { return version; }
        public void setVersion(String version) { this.version = version; }

        public String getInstallDate() { return installDate; }
        public void setInstallDate(String installDate) { this.installDate = installDate; }

        public long getSizeBytes() { return sizeBytes; }
        public void setSizeBytes(long sizeBytes) { this.sizeBytes = sizeBytes; }

        public String getUninstallString() { return uninstallString; }
        public void setUninstallString(String uninstallString) { this.uninstallString = uninstallString; }
    }
}