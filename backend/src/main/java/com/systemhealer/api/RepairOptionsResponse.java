package com.systemhealer.api;

import java.util.List;

/**
 * Response for the /api/repair/options endpoint.
 * Mirrors the structure defined in API contract 4.3.
 */
public class RepairOptionsResponse {

    private List<RepairOption> options;

    public RepairOptionsResponse() {}

    public RepairOptionsResponse(List<RepairOption> options) {
        this.options = options;
    }

    public List<RepairOption> getOptions() { return options; }
    public void setOptions(List<RepairOption> options) { this.options = options; }

    public static class RepairOption {
        private String id;
        private String name;
        private String risk;

        public RepairOption() {}

        public RepairOption(String id, String name, String risk) {
            this.id = id;
            this.name = name;
            this.risk = risk;
        }

        public String getId() { return id; }
        public void setId(String id) { this.id = id; }

        public String getName() { return name; }
        public void setName(String name) { this.name = name; }

        public String getRisk() { return risk; }
        public void setRisk(String risk) { this.risk = risk; }
    }
}