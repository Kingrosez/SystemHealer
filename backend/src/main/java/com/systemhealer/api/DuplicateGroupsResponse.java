package com.systemhealer.api;

import java.util.List;

public class DuplicateGroupsResponse {
    private List<DuplicateGroup> items;
    private int page;
    private int size;
    private long total;

    public DuplicateGroupsResponse() {}

    public DuplicateGroupsResponse(List<DuplicateGroup> items, int page, int size, long total) {
        this.items = items;
        this.page = page;
        this.size = size;
        this.total = total;
    }

    public List<DuplicateGroup> getItems() { return items; }
    public void setItems(List<DuplicateGroup> items) { this.items = items; }

    public int getPage() { return page; }
    public void setPage(int page) { this.page = page; }

    public int getSize() { return size; }
    public void setSize(int size) { this.size = size; }

    public long getTotal() { return total; }
    public void setTotal(long total) { this.total = total; }

    public static class DuplicateGroup {
        private String groupId;
        private String hash;
        private long sizeBytes;
        private List<DuplicateFile> files;

        public DuplicateGroup() {}

        public DuplicateGroup(String groupId, String hash, long sizeBytes, List<DuplicateFile> files) {
            this.groupId = groupId;
            this.hash = hash;
            this.sizeBytes = sizeBytes;
            this.files = files;
        }

        public String getGroupId() { return groupId; }
        public void setGroupId(String groupId) { this.groupId = groupId; }

        public String getHash() { return hash; }
        public void setHash(String hash) { this.hash = hash; }

        public long getSizeBytes() { return sizeBytes; }
        public void setSizeBytes(long sizeBytes) { this.sizeBytes = sizeBytes; }

        public List<DuplicateFile> getFiles() { return files; }
        public void setFiles(List<DuplicateFile> files) { this.files = files; }

        public static class DuplicateFile {
            private String id;
            private String path;
            private String modifiedAt;

            public DuplicateFile() {}

            public DuplicateFile(String id, String path, String modifiedAt) {
                this.id = id;
                this.path = path;
                this.modifiedAt = modifiedAt;
            }

            public String getId() { return id; }
            public void setId(String id) { this.id = id; }

            public String getPath() { return path; }
            public void setPath(String path) { this.path = path; }

            public String getModifiedAt() { return modifiedAt; }
            public void setModifiedAt(String modifiedAt) { this.modifiedAt = modifiedAt; }
        }
    }
}