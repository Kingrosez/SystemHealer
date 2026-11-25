package com.systemhealer.util;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import java.util.concurrent.Executor;

/**
 * Configuration for async task processing and SSE support.
 * Provides a thread pool for long-running operations and SSE emitter settings.
 */
@Configuration
@EnableAsync
public class SseConfig implements WebMvcConfigurer {

    @Bean("taskExecutor")
    public Executor taskExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(4);
        executor.setMaxPoolSize(8);
        executor.setQueueCapacity(100);
        executor.setThreadNamePrefix("SystemHealer-");
        executor.setAwaitTerminationSeconds(60);
        executor.initialize();
        return executor;
    }

    /**
     * Configure SSE emitter default timeout (in seconds).
     * Defaults to 30 minutes of inactivity before closing.
     *
     * @return default SSE emitter timeout
     */
    @Bean
    public int sseEmitterTimeout() {
        return 1800; // 30 minutes
    }
}