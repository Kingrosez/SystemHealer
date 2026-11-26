package com.systemhealer.api;

import java.util.List;

/**
 * Duplicate groups plus the single-use token required to execute a deletion.
 */
public class DuplicatePreviewResponse extends DuplicateGroupsResponse {
    private String confirmToken;

    public DuplicatePreviewResponse() {}

    public DuplicatePreviewResponse(List<DuplicateGroup> items, int page, int size, long total, String confirmToken) {
        super(items, page, size, total);
        this.confirmToken = confirmToken;
    }

    public String getConfirmToken() { return confirmToken; }
    public void setConfirmToken(String confirmToken) { this.confirmToken = confirmToken; }
}
