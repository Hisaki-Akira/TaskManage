# Task Scheduler Guide

This guide explains the enhanced scheduling features that help you understand task relationships, identify next actions, and assess schedule impacts.

## Overview

The Task Manager has been enhanced with intelligent scheduling capabilities:

1. **Next Up Panel** - Shows you what to work on next
2. **Task Dependencies** - Define prerequisite relationships
3. **Smart Status Indicators** - Visual feedback on task readiness
4. **Impact Visualization** - See how changes affect other tasks

## Next Up Panel

### What It Does

The Next Up Panel intelligently identifies the most appropriate task for you to work on right now. It appears at the top of the main content area with a purple gradient background.

### How It Works

The panel shows tasks that meet ALL of these criteria:

- ✅ **Not completed** - Excludes finished tasks
- ✅ **Not on hold** - Excludes paused tasks  
- ✅ **All dependencies completed** - Only shows tasks that are ready to start
- ✅ **Should have started** - Start date is today or in the past
- ✅ **Earliest start date** - If multiple tasks qualify, shows the one that should have started first

### Example

```
Current Date: Feb 10, 2026

Available Tasks:
- Task A: Start Feb 5, no dependencies, not started → ✓ Ready
- Task B: Start Feb 8, depends on Task A (completed) → ✓ Ready  
- Task C: Start Feb 12, no dependencies → ✗ Not yet (future start date)
- Task D: Start Feb 6, depends on Task E (in progress) → ✗ Blocked
- Task F: Start Feb 1, completed → ✗ Already done

Result: Next Up shows Task A
Reason: Both Task A and Task B are ready (all dependencies met, start dates passed),
        but Task A has the earliest start date (Feb 5 vs Feb 8), so it's prioritized.
```

### Using Next Up

1. **View**: The panel appears automatically when tasks are available
2. **Review**: Check the task details, dependencies, and blocking relationships
3. **Dismiss**: Click the × button if you don't need this feature
4. **Auto-updates**: As you complete tasks, the next task automatically appears

## Task Dependencies

### Creating Dependencies

**When Creating a New Task:**
1. Fill in the basic task information
2. Scroll to the "Dependencies" field
3. Hold Ctrl (Windows/Linux) or Cmd (Mac) while clicking to select multiple tasks
4. Selected tasks must be completed before this new task can start

**When Editing a Task:**
1. Click Edit on the task
2. The Dependencies field shows current dependencies pre-selected
3. Modify by adding or removing tasks
4. Save to update relationships

### Dependency Rules

✅ **Allowed:**
- A task can depend on multiple other tasks
- Multiple tasks can depend on the same task
- Creating complex dependency chains

❌ **Not Allowed:**
- A task cannot depend on itself
- Circular dependencies (A→B→C→A) are prevented
- The system validates and warns you if you try

### Understanding Task States

**🟢 Ready (Green Badge)**
- All dependencies are completed
- Task can start immediately
- Shown in Next Up panel if start date has passed

**🔴 Blocked (Red Badge)**  
- Has one or more incomplete dependencies
- Cannot start until prerequisites are done
- Will become ready when dependencies complete

**⚪ No Badge**
- Task has no dependencies, OR
- Task is already completed or on hold

### Dependency Visualization

**In Gantt Chart:**
- Click any task bar to open a popup
- See "Dependencies" section listing tasks this depends on
- See "Blocking" section showing tasks waiting for this one
- Each dependency shows its current status

**In List View:**
- Each task card shows complete dependency information
- Dependencies listed with current status
- Blocking relationships clearly displayed
- Visual badges indicate ready/blocked state

## Schedule Impact Awareness

### Understanding Impact

When you look at any task, you can immediately see:

1. **What blocks this task** - Tasks that must complete first
2. **What this task blocks** - Tasks waiting for this one
3. **Current dependency status** - Whether prerequisites are complete

### Example: Impact Chain

```
Design Phase (your task, in progress)
↓ blocks
Frontend Development (blocked, waiting for Design)
Backend Development (blocked, waiting for Design)
↓ block
Testing (blocked, waiting for Frontend AND Backend)
↓ blocks
Deployment (blocked, waiting for Testing)
```

If Design Phase is delayed:
- Frontend and Backend are directly impacted (shown in "Blocking" section)
- Testing is indirectly impacted (depends on Frontend/Backend)
- Deployment is further downstream (depends on Testing)

### Using Impact Information

**When Planning:**
- Check blocking relationships before committing to dates
- Identify critical path tasks (those that block many others)
- Plan parallel work for tasks with same dependencies

**When Delayed:**
- Review "Blocking" section to see immediate impact
- Check dependent task chains for full impact
- Communicate with owners of blocked tasks

**When Completing:**
- Mark task as completed
- Dependent tasks automatically become ready
- Next Up panel updates with newly available tasks

## Best Practices

### Setting Up Dependencies

1. **Start with high-level tasks** - Create major milestones first
2. **Add dependencies as you create** - Define relationships early
3. **Keep it simple** - Only add dependencies that truly matter
4. **Review regularly** - Update as project evolves

### Managing Work with Next Up

1. **Check daily** - Start each work session by checking Next Up
2. **Complete oldest first** - Follow the system's recommendations
3. **Update status promptly** - Mark tasks complete to unblock others
4. **Dismiss when needed** - Hide the panel if you need to focus on specific work

### Avoiding Common Issues

❌ **Don't create unnecessary dependencies**
- Only link tasks with true prerequisites
- Parallel work shouldn't have false dependencies

❌ **Don't forget to update status**
- Completed tasks should be marked "Completed"
- This unblocks dependent tasks

❌ **Don't ignore blocked tasks**
- Check why tasks are blocked
- Prioritize completing blocking tasks

✅ **Do review impact before changes**
- Check "Blocking" section before rescheduling
- Communicate delays to affected parties

✅ **Do use status appropriately**
- "On Hold" for truly paused work
- "In Progress" for active work
- "Completed" for finished work

## Troubleshooting

### Next Up Panel Not Showing

**Possible reasons:**
- You dismissed it (it won't show again until refresh)
- All tasks are completed
- All incomplete tasks are blocked by dependencies
- All incomplete tasks have future start dates

**Solution:** Review task list to understand the situation

### Task Shows as Blocked

**Check:**
1. View task details in Gantt or List view
2. Look at "Dependencies" section
3. Identify which prerequisites are incomplete
4. Complete those tasks first, OR
5. Remove the dependency if it's not needed

### Can't Create Dependency

**Possible reasons:**
- Would create circular dependency
- Task trying to depend on itself

**Solution:** Review dependency chain and restructure

### Dependency Not Showing

**Check:**
1. Refresh the page
2. Verify task was saved successfully
3. Check browser console for errors
4. Verify both tasks still exist

## Technical Details

### Data Structure

Dependencies are stored as an array of task IDs:

```javascript
{
  title: "Frontend Development",
  dependencies: ["design-task-id", "requirements-task-id"],
  // ... other fields
}
```

### State Calculation

A task is "Ready" when:
```javascript
task.status !== "Completed" &&
task.status !== "On Hold" &&
task.dependencies.every(depId => 
  dependentTask.status === "Completed"
)
```

### Next Up Selection

Algorithm:
1. Filter tasks by status (not completed/on hold)
2. Filter by dependencies (all complete)
3. Filter by start date (today or past)
4. Sort by start date (earliest first)
5. Return first task

## Future Enhancements

Possible future features:
- Visual dependency lines in Gantt chart
- Critical path highlighting
- Automatic date propagation
- Dependency templates
- Bulk dependency operations

---

For more information, see:
- [README.md](README.md) - General usage
- [FEATURES.md](FEATURES.md) - Complete feature list
- [SAMPLE_TASKS.md](SAMPLE_TASKS.md) - Example tasks with dependencies
