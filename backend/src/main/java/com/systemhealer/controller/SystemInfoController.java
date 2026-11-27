package com.systemhealer.controller;

import com.systemhealer.api.SystemInfo;
import com.systemhealer.service.SystemInfoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class SystemInfoController {

    @Autowired
    private SystemInfoService systemInfoService;

    @GetMapping("/system/info")
    public SystemInfo systemInfo() {
        return systemInfoService.getSystemInfo();
    }
}