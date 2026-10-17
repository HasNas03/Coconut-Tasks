import React, { useEffect, useRef, useState } from 'react';

const TASKS_STORAGE_KEY = 'coconut-tasks';

function loadSavedTasks() {
    try {
        const savedTasks = window.localStorage.getItem(TASKS_STORAGE_KEY);
        if (savedTasks === null) {
            return { tasks: [], error: null };
        }

        const parsedTasks = JSON.parse(savedTasks);
        if (!Array.isArray(parsedTasks) || !parsedTasks.every(task =>
            Number.isSafeInteger(task.id) && typeof task.text === 'string'
        )) {
            throw new Error('Saved tasks have an invalid format.');
        }

        const tasks = parsedTasks.map(task => ({
            ...task,
            done: task.done === true,
        }));
        return { tasks, error: null };
    } catch (error) {
        console.error('Unable to load saved tasks from this browser.', error);
        return {
            tasks: [],
            error: 'Saved tasks could not be loaded. New changes may not be saved.',
        };
    }
}

function Todolist() {
    const [savedState] = useState(loadSavedTasks);
    const [tasks, setTasks] = useState(savedState.tasks);
    const [storageError, setStorageError] = useState(savedState.error);
    const [newTask, setNewTask] = useState("");
    const [draggedTaskId, setDraggedTaskId] = useState(null);
    const [taskPendingDelete, setTaskPendingDelete] = useState(null);
    const nextTaskId = useRef(
        savedState.tasks.reduce((nextId, task) => Math.max(nextId, task.id + 1), 0)
    );
    const completedTaskCount = tasks.filter(task => task.done).length;
    const progressPercent = tasks.length === 0
        ? 0
        : Math.round((completedTaskCount / tasks.length) * 100);

    useEffect(() => {
        try {
            window.localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(tasks));
            setStorageError(null);
        } catch (error) {
            console.error('Unable to save tasks to this browser.', error);
            setStorageError('Tasks could not be saved. Check your browser storage settings.');
        }
    }, [tasks]);

    function handleInputChange(event) {
        setNewTask(event.target.value);
    }

    function addTask() {
        if (newTask.trim() !== "") {
            setTasks(t => [...t, { id: nextTaskId.current++, text: newTask.trim(), done: false }]);
            setNewTask("");
        }
    }

    function toggleTaskCompletion(taskId) {
        setTasks(currentTasks => currentTasks.map(task =>
            task.id === taskId ? { ...task, done: !task.done } : task
        ));
    }

    function handleTaskRowClick(event, taskId) {
        if (event.target instanceof Element && event.target.closest("button")) {
            return;
        }
        toggleTaskCompletion(taskId);
    }

    function handleTaskRowKeyDown(event, taskId) {
        if (event.target !== event.currentTarget || (event.key !== "Enter" && event.key !== " ")) {
            return;
        }
        event.preventDefault();
        toggleTaskCompletion(taskId);
    }

    function moveTask(taskId, offset) {
        setTasks(currentTasks => {
            const currentIndex = currentTasks.findIndex(task => task.id === taskId);
            const targetIndex = currentIndex + offset;
            if (currentIndex < 0 || targetIndex < 0 || targetIndex >= currentTasks.length) {
                return currentTasks;
            }

            const updatedTasks = [...currentTasks];
            [updatedTasks[currentIndex], updatedTasks[targetIndex]] =
                [updatedTasks[targetIndex], updatedTasks[currentIndex]];
            return updatedTasks;
        });
    }

    function confirmDelete() {
        if (taskPendingDelete !== null) {
            setTasks(currentTasks => currentTasks.filter(task => task.id !== taskPendingDelete));
            setTaskPendingDelete(null);
        }
    }

    function handleDragStart(event, taskId) {
        event.dataTransfer.effectAllowed = "move";
        event.dataTransfer.setData("text/plain", String(taskId));
        setDraggedTaskId(taskId);
    }

    function handleDragOver(event, targetTaskId) {
        event.preventDefault();
        if (draggedTaskId === null || draggedTaskId === targetTaskId) {
            return;
        }

        event.dataTransfer.dropEffect = "move";
        setTasks(currentTasks => {
            const sourceIndex = currentTasks.findIndex(task => task.id === draggedTaskId);
            const targetIndex = currentTasks.findIndex(task => task.id === targetTaskId);
            if (sourceIndex < 0 || targetIndex < 0 || sourceIndex === targetIndex) {
                return currentTasks;
            }

            const updatedTasks = [...currentTasks];
            const [draggedTask] = updatedTasks.splice(sourceIndex, 1);
            updatedTasks.splice(targetIndex, 0, draggedTask);
            return updatedTasks;
        });
    }

    function handleDragKeyDown(event, taskId) {
        if (event.key === "ArrowUp" || event.key === "ArrowDown") {
            event.preventDefault();
            moveTask(taskId, event.key === "ArrowUp" ? -1 : 1);
        }
    }

    function handleSubmit(event) {
        event.preventDefault();
        addTask();
    }

    return (
        <main className="to-do-list">
            <header className="page-heading">
                <span className="eyebrow">Stay a little more intentional</span>
                <h1>Coconut</h1>
                <p>Stay prepared , one task at a time</p>
            </header>

            <section className="planner-card" aria-label="Task planner">
                <div className="planner-top">
                    <h2>What's on your mind?</h2>
                    <span className="task-count" aria-live="polite">
                        {tasks.length} {tasks.length === 1 ? "task" : "tasks"} planned
                    </span>
                </div>

                <form className="task-form" onSubmit={handleSubmit}>
                    <input
                        type="text"
                        placeholder="What would you like to get done?"
                        aria-label="Enter a task"
                        value={newTask}
                        onChange={handleInputChange}
                    />
                    <button className="add-button" type="submit">Add task</button>
                </form>

                <div className="task-progress">
                    <div className="progress-label">
                        <span>Progress</span>
                        <span>{completedTaskCount} of {tasks.length} done</span>
                    </div>
                    <div
                        className="progress-track"
                        role="progressbar"
                        aria-label="Tasks completed"
                        aria-valuemin="0"
                        aria-valuemax={Math.max(tasks.length, 1)}
                        aria-valuenow={completedTaskCount}
                        aria-valuetext={`${completedTaskCount} of ${tasks.length} tasks completed`}
                    >
                        <div
                            className="progress-fill"
                            style={{ width: `${progressPercent}%` }}
                        />
                    </div>
                </div>

                {storageError && <p className="storage-error" role="alert">{storageError}</p>}

                {tasks.length === 0 ? (
                    <div className="empty-state">
                        <h3>No tasks yet</h3>
                        <p>Add a small thing you’d like to get done today.<br />You can always rearrange your list as you go.</p>
                    </div>
                ) : (
                    <ol>
                        {tasks.map(task => (
                            <li
                                key={task.id}
                                className={draggedTaskId === task.id ? "task-row is-dragging" : "task-row"}
                                tabIndex={0}
                                onClick={event => handleTaskRowClick(event, task.id)}
                                onKeyDown={event => handleTaskRowKeyDown(event, task.id)}
                                onDragOver={event => handleDragOver(event, task.id)}
                                onDrop={event => event.preventDefault()}
                            >
                                <button
                                    className={`completion-toggle${task.done ? " is-complete" : ""}`}
                                    type="button"
                                    aria-label={`${task.done ? "Mark" : "Complete"} ${task.text}${task.done ? " as incomplete" : ""}`}
                                    aria-pressed={task.done}
                                    onClick={() => toggleTaskCompletion(task.id)}
                                >
                                    {task.done ? "✓" : ""}
                                </button>
                                <span className={`text${task.done ? " is-complete" : ""}`}>{task.text}</span>
                                <button
                                    className="delete-button"
                                    type="button"
                                    onClick={() => setTaskPendingDelete(task.id)}
                                >
                                    Delete
                                </button>
                                <button
                                    className="drag-handle"
                                    type="button"
                                    draggable
                                    aria-label={`Reorder ${task.text}. Use up and down arrow keys to move it.`}
                                    onDragStart={event => handleDragStart(event, task.id)}
                                    onDragEnd={() => setDraggedTaskId(null)}
                                    onKeyDown={event => handleDragKeyDown(event, task.id)}
                                >
                                    ⠿
                                </button>
                            </li>
                        ))}
                    </ol>
                )}
            </section>

            {taskPendingDelete !== null && (
                <div className="dialog-backdrop" onMouseDown={event => {
                    if (event.target === event.currentTarget) {
                        setTaskPendingDelete(null);
                    }
                }}>
                    <section
                        className="delete-dialog"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="delete-dialog-title"
                        aria-describedby="delete-dialog-description"
                    >
                        <h2 id="delete-dialog-title">Delete this task?</h2>
                        <p id="delete-dialog-description">This task will be removed from your list.</p>
                        <div className="dialog-actions">
                            <button
                                className="cancel-button"
                                type="button"
                                onClick={() => setTaskPendingDelete(null)}
                            >
                                Never Mind
                            </button>
                            <button className="confirm-delete-button" type="button" onClick={confirmDelete}>
                                Delete task
                            </button>
                        </div>
                    </section>
                </div>
            )}
        </main>
    );
}

export default Todolist;