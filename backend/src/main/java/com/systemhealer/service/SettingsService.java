package com.systemhealer.service;

import com.systemhealer.api.SettingsResponse;
import com.systemhealer.model.AppSettings;
import com.systemhealer.repository.AppSettingsRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class SettingsService {

    @Autowired
    private AppSettingsRepository settingsRepository;

    public SettingsResponse getSettings() {
        Optional<AppSettings> settings = settingsRepository.findById("app");
        if (settings.isPresent()) {
            AppSettings s = settings.get();
            return new SettingsResponse(
                    s.getLogRetentionDays(),
                    s.getDefaultScanRoots(),
                    s.getTheme(),
                    s.isCreateRestorePointByDefault()
            );
        }
        // Return defaults
        return new SettingsResponse(90, List.of("C:\\Users"), "system", true);
    }

    public SettingsResponse updateSettings(SettingsRequest request) {
        AppSettings settings = settingsRepository.findById("app").orElse(new AppSettings("app"));
        if (request.getLogRetentionDays() != null) settings.setLogRetentionDays(request.getLogRetentionDays());
        if (request.getDefaultScanRoots() != null) settings.setDefaultScanRoots(request.getDefaultScanRoots());
        if (request.getTheme() != null) settings.setTheme(request.getTheme());
        if (request.getCreateRestorePointByDefault() != null) settings.setCreateRestorePointByDefault(request.getCreateRestorePointByDefault());

        settingsRepository.save(settings);
        return getSettings();
    }

    public static class SettingsRequest {
        private Integer logRetentionDays;
        private List<String> defaultScanRoots;
        private String theme;
        private Boolean createRestorePointByDefault;

        public Integer getLogRetentionDays() { return logRetentionDays; }
        public void setLogRetentionDays(Integer logRetentionDays) { this.logRetentionDays = logRetentionDays; }

        public List<String> getDefaultScanRoots() { return defaultScanRoots; }
        public void setDefaultScanRoots(List<String> defaultScanRoots) { this.defaultScanRoots = defaultScanRoots; }

        public String getTheme() { return theme; }
        public void setTheme(String theme) { this.theme = theme; }

        public Boolean getCreateRestorePointByDefault() { return createRestorePointByDefault; }
        public void setCreateRestorePointByDefault(Boolean createRestorePointByDefault) { this.createRestorePointByDefault = createRestorePointByDefault; }
    }
}