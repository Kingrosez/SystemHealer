package com.systemhealer.service;

import com.systemhealer.api.DiskScanRequest;
import com.systemhealer.api.DiskUsageResponse;
import com.systemhealer.exception.ErrorCodes;
import com.systemhealer.model.Task;
import com.systemhealer.model.TaskStatus;
import com.systemhealer.repository.TaskRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.File;
import java.io.IOException;
import java.nio.file.FileStore;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.stream.Stream;

@Service
public class DiskService {

    private static final int DEFAULT_MAX_DEPTH = 3;
    private static final int MAX_MAX_DEPTH = 10;
    private static final int MAX_USAGE_ITEMS = 200;

    @Autowired
    private TaskRepository taskRepository;

    private volatile List<DiskUsageResponse.DiskUsageItem> latestUsage = List.of();

    public DiskUsageResponse getDiskUsage() {
        return new DiskUsageResponse(listDrives(), latestUsage);
    }

    public void scan(Task task, DiskScanRequest request) {
        try {
            task.setStatus(TaskStatus.RUNNING);
            task.setCurrentStep("Scanning " + request.getDrive());
            task.setProgressPercent(5);
            taskRepository.save(task);

            Path root = resolveRoot(request.getDrive());
            if (!Files.isDirectory(root)) {
                fail(task, ErrorCodes.DISK_DRIVE_NOT_FOUND, "Drive not found: " + request.getDrive());
                return;
            }

            int maxDepth = clampDepth(request.getMaxDepth());
            List<DiskUsageResponse.DiskUsageItem> items = new ArrayList<>();

            try (Stream<Path> children = Files.list(root)) {
                for (Path child : children.limit(MAX_USAGE_ITEMS).toList()) {
                    boolean directory = Files.isDirectory(child);
                    long size = directory
                            ? directorySize(child, Math.max(1, maxDepth - 1))
                            : safeSize(child);
                    items.add(new DiskUsageResponse.DiskUsageItem(
                            child.toString(),
                            child.getFileName() != null ? child.getFileName().toString() : child.toString(),
                            size,
                            directory,
                            List.of()
                    ));
                }
            }

            items.sort(Comparator
                    .comparingLong(DiskUsageResponse.DiskUsageItem::getSizeBytes)
                    .reversed());
            latestUsage = List.copyOf(items);

            task.setProgressPercent(100);
            task.setCurrentStep("Scan complete");
            task.setStatus(TaskStatus.SUCCESS);
            taskRepository.save(task);
        } catch (Exception e) {
            fail(task, ErrorCodes.DISK_SCAN_FAILED, e.getMessage());
        }
    }

    private List<DiskUsageResponse.DiskDrive> listDrives() {
        File[] roots = File.listRoots();
        if (roots == null) {
            return List.of();
        }

        List<DiskUsageResponse.DiskDrive> drives = new ArrayList<>();
        for (File root : roots) {
            long total = root.getTotalSpace();
            long free = root.getFreeSpace();
            long used = Math.max(0, total - free);
            String letter = normalizeLetter(root.getPath());
            String label = root.getPath();
            String fileSystem = "UNKNOWN";

            try {
                FileStore store = Files.getFileStore(root.toPath());
                fileSystem = store.type();
                if (label == null || label.isBlank()) {
                    label = store.name();
                }
            } catch (IOException | SecurityException ignored) {
            }

            drives.add(new DiskUsageResponse.DiskDrive(letter, label, total, used, free, fileSystem));
        }
        return drives;
    }

    private Path resolveRoot(String drive) {
        String value = drive == null ? "" : drive.trim();
        if (value.matches("(?i)^[a-z]:$")) {
            value = value + "\\";
        }
        return Paths.get(value).toAbsolutePath().normalize();
    }

    private int clampDepth(Integer requested) {
        int depth = requested == null ? DEFAULT_MAX_DEPTH : requested;
        return Math.max(1, Math.min(depth, MAX_MAX_DEPTH));
    }

    private long directorySize(Path directory, int maxDepth) {
        try (Stream<Path> walk = Files.walk(directory, maxDepth)) {
            return walk.filter(Files::isRegularFile).mapToLong(this::safeSize).sum();
        } catch (IOException | RuntimeException e) {
            return 0L;
        }
    }

    private long safeSize(Path path) {
        try {
            return Files.size(path);
        } catch (IOException | RuntimeException e) {
            return 0L;
        }
    }

    private String normalizeLetter(String path) {
        if (path != null && path.matches("(?i)^[a-z]:[\\\\/]?$")) {
            return path.substring(0, 2).toUpperCase(Locale.ROOT);
        }
        return path;
    }

    private void fail(Task task, String errorCode, String message) {
        task.setStatus(TaskStatus.FAILED);
        task.setErrorCode(errorCode);
        task.setErrorMessage(message);
        taskRepository.save(task);
    }
}
