package com.systemhealer.util;

import org.springframework.stereotype.Component;
import java.io.*;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.TimeUnit;

/**
 * Safe wrapper for ProcessBuilder execution with timeout enforcement.
 * Captures stdout/stderr and returns structured results.
 * All Windows command execution should go through this class.
 */
@Component
public class CommandRunner {

    private static final int DEFAULT_TIMEOUT_SECONDS = 600; // 10 minutes for SFC/DISM
    private static final int SHORT_TIMEOUT_SECONDS = 120;   // 2 minutes for lighter commands

    /**
     * Execute a command with timeout and capture output.
     *
     * @param command       the command and arguments as a list
     * @param timeoutSeconds the timeout in seconds (default: 600 for SFC/DISM)
     * @return structured result with exit code, stdout, and stderr
     * @throws InterruptedException if the thread is interrupted
     */
    public CommandResult run(List<String> command, int timeoutSeconds) throws InterruptedException {
        ProcessBuilder pb = new ProcessBuilder(command);
        pb.redirectErrorStream(true); // merge stderr into stdout
        pb.environment().put("PATH", System.getenv("PATH"));

        Process process = pb.start();

        // Read output in a separate thread to avoid deadlock
        StringBuilder output = new StringBuilder();
        List<String> errorLines = new ArrayList<>();

        Thread outputThread = new Thread(() -> {
            try (BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream()))) {
                String line;
                while ((line = reader.readLine()) != null) {
                    output.append(line).append("\n");
                }
            } catch (IOException e) {
                // Expected on process exit
            }
        });
        outputThread.start();

        // Wait for process to complete with timeout
        boolean completed = process.waitFor(timeoutSeconds, TimeUnit.SECONDS);

        try {
            outputThread.join();
        } catch (InterruptedException e) {
            process.destroy();
            Thread.currentThread().interrupt();
            throw e;
        }

        if (!completed) {
            process.destroyForcibly();
            return new CommandResult(
                    -1,
                    output.toString(),
                    "Command timed out after " + timeoutSeconds + " seconds"
            );
        }

        // Get any error output
        String stderr;
        try (BufferedReader errReader = new BufferedReader(new InputStreamReader(process.getErrorStream()))) {
            String line;
            StringBuilder stderrBuilder = new StringBuilder();
            while ((line = errReader.readLine()) != null) {
                stderrBuilder.append(line).append("\n");
            }
            stderr = stderrBuilder.toString();
            errorLines = List.of(stderr.split("\n"));
        } catch (IOException e) {
            stderr = "";
        }

        return new CommandResult(
                process.exitValue(),
                output.toString(),
                stderr
        );
    }

    /**
     * Execute a command with the default long timeout (10 minutes).
     *
     * @param command the command and arguments
     * @return structured result
     * @throws InterruptedException if interrupted
     */
    public CommandResult run(List<String> command) throws InterruptedException {
        return run(command, DEFAULT_TIMEOUT_SECONDS);
    }

    /**
     * Execute a short-lived command with reduced timeout (2 minutes).
     * Use for commands like winget scans that complete faster.
     *
     * @param command the command and arguments
     * @return structured result
     * @throws InterruptedException if interrupted
     */
    public CommandResult runShort(List<String> command) throws InterruptedException {
        return run(command, SHORT_TIMEOUT_SECONDS);
    }

    /**
     * Structured result from command execution.
     */
    public static class CommandResult {
        private final int exitCode;
        private final String stdout;
        private final String stderr;
        private final List<String> errorLines;

        public CommandResult(int exitCode, String stdout, String stderr) {
            this.exitCode = exitCode;
            this.stdout = stdout;
            this.stderr = stderr;
            this.errorLines = new ArrayList<>();
            if (stderr != null) {
                for (String line : stderr.split("\n")) {
                    if (!line.isEmpty()) {
                        this.errorLines.add(line);
                    }
                }
            }
        }

        public int getExitCode() { return exitCode; }
        public String getStdout() { return stdout; }
        public String getStderr() { return stderr; }
        public List<String> getErrorLines() { return errorLines; }
        public boolean success() { return exitCode == 0; }
        public boolean failed() { return exitCode != 0; }
    }
}