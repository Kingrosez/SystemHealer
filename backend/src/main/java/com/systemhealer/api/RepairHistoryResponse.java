package com.systemhealer.api;

import java.util.List;

public class RepairHistoryResponse {
    private List<RepairHistoryItem> items = List.of();
    private int page;
    private int size;
    private long total;

    public List<RepairHistoryItem> getItems() { return items; }
    public void setItems(List<RepairHistoryItem> items) { this.items = items; }
    public int getPage() { return page; }
    public void setPage(int page) { this.page = page; }
    public int getSize() { return size; }
    public void setSize(int size) { this.size = size; }
    public long getTotal() { return total; }
    public void setTotal(long total) { this.total = total; }
}