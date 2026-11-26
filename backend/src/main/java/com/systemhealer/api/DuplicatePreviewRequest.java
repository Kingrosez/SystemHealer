package com.systemhealer.api;

/**
 * Request body for POST /api/cleaner/duplicates/preview.
 * Page and size are optional; defaults to page 0, size 50.
 */
public class DuplicatePreviewRequest {
    private int page = 0;
    private int size = 50;

    public DuplicatePreviewRequest() {}

    public int getPage() { return page; }
    public void setPage(int page) { this.page = page; }

    public int getSize() { return size; }
    public void setSize(int size) { this.size = size; }
}