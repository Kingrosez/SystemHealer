package com.systemhealer.api;

public class RepairSummary {
    private int repaired;
    private int failed;

    public int getRepaired() { return repaired; }
    public void setRepaired(int repaired) { this.repaired = repaired; }
    public int getFailed() { return failed; }
    public void setFailed(int failed) { this.failed = failed; }
}