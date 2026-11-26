package com.systemhealer.repository;

import com.systemhealer.model.Task;
import com.systemhealer.model.TaskStatus;
import com.systemhealer.model.TaskType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Optional;

/**
 * Repository for Task entities providing CRUD operations and custom queries.
 */
public interface TaskRepository extends JpaRepository<Task, String> {

    /**
     * Find all tasks by status.
     *
     * @param status the task status to filter by
     * @return list of tasks with the given status
     */
    List<Task> findByStatus(TaskStatus status);

    /**
     * Find tasks by type.
     *
     * @param type the task type to filter by
     * @return list of tasks with the given type
     */
    List<Task> findByType(TaskType type);

    /**
     * Find running tasks.
     *
     * @return list of tasks with RUNNING status
     */
    @Query("SELECT t FROM Task t WHERE t.status = 'RUNNING'")
    List<Task> findRunningTasks();

    /**
     * Find task by ID.
     *
     * @param id the task UUID
     * @ optional task
     */
    Optional<Task> findById(String id);

    /**
     * Find all tasks by type, ordered by start time descending.
     *
     * @param type the task type to filter by
     * @return list of tasks with the given type, newest first
     */
    List<Task> findByTypeOrderByStartedAtDesc(TaskType type);
}