package com.systemhealer.controller;

import com.systemhealer.api.SystemInfo;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class SystemInfoController {

    @GetMapping("/system/info")
    public SystemInfo systemInfo() {
        return new SystemInfo(
                "Windows 11 Pro 23H2",
                "22631",
                "Intel Core i7-12700",
                32,
                true,
                false,
                true
        );
    }
}