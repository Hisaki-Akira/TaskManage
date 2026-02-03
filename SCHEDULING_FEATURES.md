# Task Scheduling Features - User Guide

This document explains the new scheduling and dependency management features added to the Task Manager application.

## Overview

The Task Manager has been enhanced with comprehensive dependency management and scheduling features that help you:
1. **See what to work on next** - Clear indication of ready-to-start tasks
2. **Understand task relationships** - Visual dependency arrows and status
3. **Manage schedule changes** - Automatic cascade updates to dependent tasks

## Features

### 1. Task Dependencies

**What it does:** Define which tasks must be completed before a task can start.

**How to use:**
1. When creating or editing a task, scroll to the "Dependencies" field
2. Select one or more prerequisite tasks from the dropdown
3. Hold Ctrl (Windows/Linux) or Cmd (Mac) and click to select multiple tasks
4. The system validates your selection and warns about conflicts

**Validation:**
- **Circular dependencies**: The system prevents creating cycles (Task A → Task B → Task A)
- **Date conflicts**: Warns if a task starts before its dependencies complete
- **Suggested dates**: Recommends start dates based on dependency completion

**Example:**
```
Testing Task
├─ Depends on: Frontend Development
└─ Depends on: Backend Development

→ Testing cannot start until both Frontend and Backend are completed
```

### 2. Next Tasks Panel

**What it does:** Shows a list of tasks that are ready to work on right now.

**How it works:**
- Appears at the top of the Gantt chart view
- Shows tasks where all dependencies are completed
- Displays how many other tasks each next task is blocking
- Click any task to open and edit it

**Visual indicators:**
- 👤 **User icon**: Primary person responsible
- 📅 **Calendar icon**: Task date range
- 🔗 **Link icon**: Number of tasks blocked by this one

**Why it matters:**
- Quickly identify what you should work on next
- See which tasks have the highest impact (blocking many others)
- Prioritize work based on dependencies

### 3. Blocked Task Indicators

**What it does:** Visually shows when tasks cannot start due to incomplete dependencies.

**Visual cues:**
- **Dimmed appearance**: Blocked tasks appear faded in the Gantt chart
- **🔒 Lock icon**: Displayed on blocked task bars
- **Dependency status**: Popup shows which dependencies are ✓ completed or ⏳ pending

**In the popup:**
```
Task: Deployment
Status: Blocked ⚠️
Dependencies:
  ✓ Testing (completed)
  ⏳ Documentation (pending)
  
This task blocks: 0 other tasks
```

### 4. Dependency Visualization

**What it does:** Shows arrows connecting dependent tasks in the Gantt chart.

**Visual elements:**
- **Blue arrows**: Connect predecessor tasks to dependent tasks
- **Arrow direction**: Points from prerequisite → dependent task
- **Curved paths**: Easier to follow for non-adjacent tasks

**Reading the chart:**
```
Requirements ──➡──► Design ──➡──► Development ──➡──► Testing
```

### 5. Smart Schedule Management

**What it does:** Automatically updates dependent task dates when prerequisites change.

**Auto-cascade behavior:**
- When you drag a task to a new end date
- All tasks that depend on it shift by the same number of days
- Maintains task duration and dependencies
- Works recursively through the dependency chain

**Example:**
```
Before:
  Design:      Feb 10-17
  Development: Feb 18-28  (depends on Design)
  
After moving Design to end Feb 20:
  Design:      Feb 10-20  (+3 days)
  Development: Feb 21-31  (auto-shifted +3 days)
```

**Manual override:**
- You can still manually adjust dependent task dates
- System warns if dates conflict with dependencies
- Confirmation dialog shows suggested dates

### 6. Enhanced Task Highlighting

**What it does:** Visual feedback to help prioritize work.

**Highlight types:**
- **Pulsing border**: Next tasks (ready to work on) have an animated border
- **Dimmed + lock**: Blocked tasks are visually de-emphasized
- **Color coding**: Status colors (green=completed, blue=in progress, etc.)

## Best Practices

### Planning Dependencies

1. **Work backwards from goals**
   - Identify your end goal (e.g., "Deploy to Production")
   - List what must happen before it
   - Continue backwards to create the full chain

2. **Keep chains manageable**
   - Avoid creating too many dependencies
   - Break large tasks into smaller, parallel tasks when possible
   - Not every task needs dependencies

3. **Use partial dependencies**
   - If only part of Task A is needed before Task B
   - Split Task A into smaller tasks
   - Create dependency only on the needed part

### Managing Schedule Changes

1. **Review impact before committing**
   - Check the "blocks N tasks" indicator
   - Consider how date changes affect downstream tasks
   - Communicate changes to affected team members

2. **Use the Next Tasks panel**
   - Start your day by checking this panel
   - Focus on tasks with high blocking counts
   - Mark tasks as completed to unblock others

3. **Monitor blocked tasks**
   - Regularly check for tasks with the 🔒 icon
   - Work with task owners to complete blocking dependencies
   - Adjust plans if dependencies are delayed

### Identifying Bottlenecks

1. **Critical path items**
   - Tasks that block many others are your critical path
   - Prioritize these to keep the project moving
   - Consider adding resources to critical tasks

2. **Dependency chains**
   - Long chains of dependencies create schedule risk
   - Look for opportunities to parallelize work
   - Identify tasks that could start earlier

## Common Scenarios

### Scenario 1: Starting a New Project

1. Create milestone tasks (Kickoff, Planning, Development, Testing, Launch)
2. Add dependencies to create the basic flow
3. Break down each milestone into smaller tasks
4. Add specific dependencies between detailed tasks
5. Use the Next Tasks panel to see where to start

### Scenario 2: Task is Delayed

1. Update the task's end date by dragging in Gantt chart
2. System automatically shifts dependent tasks
3. Review the impact on downstream tasks
4. Communicate with affected team members
5. Adjust other tasks if needed to meet deadlines

### Scenario 3: Adding a New Task Mid-Project

1. Create the new task
2. Select which existing tasks it depends on
3. Select which existing tasks depend on it (edit those tasks)
4. Check if it appears in Next Tasks panel (if dependencies are met)
5. Adjust dates as needed

### Scenario 4: Finding What to Work On

1. Look at the Next Tasks panel
2. Sort by "blocks N tasks" to find high-impact items
3. Click a task to view details
4. Start work and update status to "In Progress"
5. Mark as "Completed" when done to unblock dependent tasks

## Keyboard Shortcuts

- **Ctrl/Cmd + Click**: Select multiple dependencies
- **Drag task bar**: Change task dates (auto-updates dependents)
- **Click task**: View details in popup

## Tips and Tricks

1. **Color-code by priority**: Use status to indicate urgency
   - "Not Started" (gray): Low priority
   - "In Progress" (blue): Current work
   - "On Hold" (orange): Blocked or waiting
   - "Completed" (green): Done

2. **Use dependencies sparingly**: Not every task needs dependencies
   - Only add dependencies for true prerequisites
   - Avoid creating unnecessary complexity

3. **Regular updates**: Keep task statuses current
   - Mark tasks as completed promptly
   - This unblocks dependent tasks in Next Tasks panel
   - Real-time updates benefit all team members

4. **Review the Gantt chart regularly**
   - Look for blocked tasks piling up
   - Identify tasks on the critical path
   - Adjust plans proactively

## Troubleshooting

**Q: Why can't I add a dependency?**
- The system detected a circular dependency
- Adding this dependency would create a cycle
- Review the dependency chain and remove cycles

**Q: Task isn't showing in Next Tasks panel**
- Check if all dependencies are marked as "Completed"
- Verify the task status isn't "Completed"
- Refresh the page if needed

**Q: Dependency arrows not showing**
- Arrows only appear in Gantt chart view (not list view)
- Make sure tasks have dependencies defined
- Try switching view modes to trigger redraw

**Q: Auto-cascade not working**
- Make sure you're dragging the task bar (changing dates)
- Check that dependent tasks exist
- Verify dependencies are properly defined

## Technical Notes

**Data Storage:**
- Dependencies stored as array of task IDs in Firestore
- Format: `dependencies: ["taskId1", "taskId2", ...]`
- Empty array `[]` means no dependencies

**Browser Compatibility:**
- Works in all modern browsers
- SVG arrows require SVG support
- Real-time updates use Firestore listeners

**Performance:**
- Dependency calculations run client-side
- Efficient for projects with hundreds of tasks
- Arrows redraw when Gantt chart updates

## Future Enhancements

Possible future additions (not currently implemented):
- Dependency types (finish-to-start, start-to-start, etc.)
- Lag time between dependent tasks
- Critical path highlighting
- Gantt chart export with dependencies
- Dependency templates for common workflows

## Getting Help

If you encounter issues:
1. Check this guide for common scenarios
2. Review the main README.md for general help
3. Check browser console for error messages
4. Open an issue on GitHub with details

---

**Remember**: Dependencies are a powerful tool for managing complex projects. Start simple and add complexity as needed. The goal is to help you see what to work on next and understand the impact of changes, not to create unnecessary constraints.
