package com.systemhealer.api;

import java.util.List;

public class LeftoversPreviewResponse {
    private List<LeftoverFile> files;
    private List<String> registryKeys;
    private String confirmToken;

    public LeftoversPreviewResponse() {}

    public LeftoversPreviewResponse(List<LeftoverFile> files, List<String> registryKeys, String confirmToken) {
        this.files = files;
        this.registryKeys = registryKeys;
        this.confirmToken = confirmToken;
    }

    public List<LeftoverFile> getFiles() { return files; }
    public void setFiles(List<LeftoverFile> files) { this.files = files; }

    public List<String> getRegistryKeys() { return registryKeys; }
    public void setRegistryKeys(List<String> registryKeys) { this.registryKeys = registryKeys; }

    public String getConfirmToken() { return confirmToken; }
    public void setConfirmToken(String confirmToken) { this.confirmToken = confirmToken; }

    public static class LeftoverFile {
        private String path;
        private long sizeBytes;

        public LeftoverFile() {}

        public LeftoverFile(String path, long sizeBytes) {
            this.path = path;
            this.sizeBytes = sizeBytes;
        }

        public String getPath() { return path; }
        public void setPath(String path) { this.path = path; }

        public long getSizeBytes() { return sizeBytes; }
        public void setSizeBytes(long sizeBytes) { this.sizeBytes = sizeBytes; }
    }
}