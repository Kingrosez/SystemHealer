package com.systemhealer.repository;

import com.systemhealer.model.RepairLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.List;

/**
 * Repository for RepairLog entities providing CRUD operations and custom queries.
 */
public interface RepairLogRepository extends JpaRepository<RepairLog, Long> {

    /**
     * Find all log lines for a specific task, ordered by timestamp.
     */
    List<RepairLog> findByTaskIdOrderByTimestampAsc(String taskId);

    /**
     * Find log lines for a task after a specific timestamp (for streaming).
     */
    List<RepairLog> findByTaskIdAndTimestampAfterOrderByTimestampAsc(String taskId, Instant timestamp);

    /**
     * Delete log entries older than the specified timestamp.
     */
    @Modifying
    @Query("DELETE FROM RepairLog r WHERE r.timestamp < :cutoff")
    void deleteLogsBefore(@Param("cutoff") Instant cutoff);

    /**
     * Count log entries before a specific timestamp.
     */
    long countByTimestampBefore(Instant timestamp);
}