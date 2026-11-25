package com.systemhealer.api;

import java.util.List;

public class StartupProgramsResponse {
    private List<StartupProgram> items;
    private int page;
    private int size;
    private long total;

    public StartupProgramsResponse() {}

    public StartupProgramsResponse(List<StartupProgram> items, int page, int size, long total) {
        this.items = items;
        this.page = page;
        this.size = size;
        this.total = total;
    }

    public List<StartupProgram> getItems() { return items; }
    public void setItems(List<StartupProgram> items) { this.items = items; }

    public int getPage() { return page; }
    public void setPage(int page) { this.page = page; }

    public int getSize() { return size; }
    public void setSize(int size) { this.size = size; }

    public long getTotal() { return total; }
    public void setTotal(long total) { this.total = total; }

    public static class StartupProgram {
        private String id;
        private String name;
        private String publisher;
        private String path;
        private boolean enabled;
        private String impact;

        public StartupProgram() {}

        public StartupProgram(String id, String name, String publisher, String path, boolean enabled, String impact) {
            this.id = id;
            this.name = name;
            this.publisher = publisher;
            this.path = path;
            this.enabled = enabled;
            this.impact = impact;
        }

        public String getId() { return id; }
        public void setId(String id) { this.id = id; }

        public String getName() { return name; }
        public void setName(String name) { this.name = name; }

        public String getPublisher() { return publisher; }
        public void setPublisher(String publisher) { this.publisher = publisher; }

        public String getPath() { return path; }
        public void setPath(String path) { this.path = path; }

        public boolean isEnabled() { return enabled; }
        public void setEnabled(boolean enabled) { this.enabled = enabled; }

        public String getImpact() { return impact; }
        public void setImpact(String impact) { this.impact = impact; }
    }
}