package com.systemhealer.controller;

import com.systemhealer.api.RepairOptionsResponse;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/repair")
public class RepairOptionsController {

    @GetMapping("/options")
    public RepairOptionsResponse options() {
        return new RepairOptionsResponse(java.util.List.of(
                new RepairOptionsResponse.RepairOption("sfc", "System File Checker", "low"),
                new RepairOptionsResponse.RepairOption("dism", "DISM Image Repair", "low"),
                new RepairOptionsResponse.RepairOption("network", "Network Reset", "medium"),
                new RepairOptionsResponse.RepairOption("windows-update", "Windows Update Repair", "medium")
        ));
    }
}