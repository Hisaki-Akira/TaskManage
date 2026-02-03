# Sample Tasks

This document shows example tasks you can create to test the Task Manager application.

## Example Tasks for Testing

### Task 1: Project Kickoff
- **Title**: Project Kickoff Meeting
- **User Name**: Team Lead
- **Assignee**: Product Manager
- **Start Date**: 2026-02-03
- **End Date**: 2026-02-03
- **Status**: Completed
- **Description**: Initial meeting to discuss project goals, timeline, and team responsibilities.

### Task 2: Requirements Gathering
- **Title**: Gather Project Requirements
- **User Name**: Product Manager
- **Assignee**: Business Analyst
- **Start Date**: 2026-02-04
- **End Date**: 2026-02-10
- **Status**: In Progress
- **Description**: Meet with stakeholders to collect and document all project requirements.

### Task 3: Design Phase
- **Title**: Create System Design
- **User Name**: System Architect
- **Assignee**: Tech Lead
- **Start Date**: 2026-02-11
- **End Date**: 2026-02-17
- **Status**: Not Started
- **Description**: Design the system architecture, database schema, and API endpoints.

### Task 4: Frontend Development
- **Title**: Develop User Interface
- **User Name**: Frontend Developer
- **Assignee**: UI/UX Designer
- **Start Date**: 2026-02-18
- **End Date**: 2026-02-28
- **Status**: Not Started
- **Description**: Build responsive UI components and integrate with backend APIs.

### Task 5: Backend Development
- **Title**: Build Backend APIs
- **User Name**: Backend Developer
- **Assignee**: Database Admin
- **Start Date**: 2026-02-18
- **End Date**: 2026-02-28
- **Status**: Not Started
- **Description**: Develop RESTful APIs, database integration, and business logic.

### Task 6: Testing
- **Title**: Quality Assurance Testing
- **User Name**: QA Engineer
- **Assignee**: Test Automation Engineer
- **Start Date**: 2026-03-01
- **End Date**: 2026-03-07
- **Status**: Not Started
- **Description**: Perform unit testing, integration testing, and user acceptance testing.

### Task 7: Documentation
- **Title**: Write User Documentation
- **User Name**: Technical Writer
- **Assignee**: Product Manager
- **Start Date**: 2026-03-01
- **End Date**: 2026-03-05
- **Status**: Not Started
- **Description**: Create user guides, API documentation, and deployment instructions.

### Task 8: Deployment
- **Title**: Deploy to Production
- **User Name**: DevOps Engineer
- **Assignee**: System Administrator
- **Start Date**: 2026-03-08
- **End Date**: 2026-03-08
- **Status**: Not Started
- **Description**: Deploy application to production environment and configure monitoring.

## Task Data Structure

Each task in Firestore has the following structure:

```javascript
{
  title: "Task Title",              // String, required
  userName: "John Doe",             // String, required - User responsible for the task
  assignee: "Jane Smith",           // String, optional - Person assigned to help/review
  startDate: "2026-02-03",         // String (YYYY-MM-DD), required
  endDate: "2026-02-10",           // String (YYYY-MM-DD), required
  status: "In Progress",            // String, one of: "Not Started", "In Progress", "Completed", "On Hold"
  description: "Task details...",   // String, optional
  createdAt: Timestamp,             // Firebase Timestamp, auto-generated
  updatedAt: Timestamp              // Firebase Timestamp, auto-updated
}
```

### User Name vs Assignee

- **User Name** (required): The primary person responsible for this task. Tasks are grouped by user name in the Gantt chart view.
- **Assignee** (optional): A secondary person who may be helping or reviewing the task. This is useful for collaborative work.

## Status Options

The application supports four task statuses:

1. **Not Started** (Gray)
   - Task hasn't begun yet
   - Default status for new tasks
   - Progress: 0%

2. **In Progress** (Blue)
   - Work is currently being done
   - Use for active tasks
   - Progress: 50%

3. **Completed** (Green)
   - Task is finished
   - Use when work is done
   - Progress: 100%

4. **On Hold** (Orange)
   - Task is temporarily paused
   - Use when waiting for dependencies
   - Progress: 25%

## Best Practices for Task Creation

### Task Titles
✅ Good: "Design database schema for user authentication"
❌ Bad: "Database stuff"

✅ Good: "Implement login API endpoint"
❌ Bad: "Login"

### Date Ranges
- Keep tasks focused (1-2 weeks maximum)
- Break large tasks into smaller ones
- Account for weekends and holidays
- Leave buffer time for unexpected delays

### Assignees

- Use consistent naming (e.g., always "John Smith", not "John" or "J. Smith")
- **User Name** is the primary person responsible - this field is required
- **Assignee** is optional and used for secondary people (reviewers, helpers)
- Leave assignee blank if no secondary person is needed

### Descriptions
- Include acceptance criteria
- List dependencies on other tasks
- Note any special requirements
- Keep it concise but informative

## Creating a Sample Project

To test the application, create these tasks in order:

1. Start with a kickoff task (1 day, completed)
2. Add 2-3 short tasks (1 week each, in progress)
3. Add 3-4 medium tasks (2 weeks each, not started)
4. Add 1-2 long tasks (3 weeks each, not started)

This gives you a good mix to visualize in the Gantt chart.

## Example Gantt Chart Timeline

```
Feb  |  Mar  |  Apr
-----|-------|------
[Kickoff]
    [Requirements]
          [Design]
                [Frontend Dev]
                [Backend Dev]
                      [Testing]
                      [Docs]
                            [Deploy]
```

## Tips for Testing

1. **Create overlapping tasks** to see how the Gantt chart handles parallel work
2. **Use different statuses** to see the color coding
3. **Try drag-and-drop** in the Gantt chart to reschedule tasks
4. **Test on mobile** to verify responsive design
5. **Open in multiple browsers** to test real-time sync
6. **Edit and delete tasks** to verify all CRUD operations

## Sample Team Structure

For testing multi-user features, you can create accounts for:
- Team Lead (coordinator)
- Frontend Developer (UI work)
- Backend Developer (API work)
- QA Engineer (testing)
- DevOps Engineer (deployment)

Each person should create their own account and will be able to see and edit all tasks.

## Date Selection Tips

When selecting dates:
- **Start Date**: Should be today or in the future
- **End Date**: Must be on or after start date
- **Duration**: Shows up in Gantt chart width
- **Overlapping**: Multiple tasks can run simultaneously

## Common Patterns

### Sprint Planning
Create tasks for 1-2 week sprints:
```
Sprint 1: Feb 3 - Feb 14
Sprint 2: Feb 17 - Feb 28
Sprint 3: Mar 3 - Mar 14
```

### Milestone-Based
Group tasks by milestones:
```
Phase 1: Planning (Feb 3-10)
Phase 2: Development (Feb 11-28)
Phase 3: Testing (Mar 1-7)
Phase 4: Launch (Mar 8)
```

### Feature-Based
Organize by features:
```
Feature A: Tasks 1-3
Feature B: Tasks 4-6
Feature C: Tasks 7-9
```

## Next Steps

After creating sample tasks:
1. ✅ View them in Gantt chart
2. ✅ Switch to list view
3. ✅ Try editing a task
4. ✅ Delete a test task
5. ✅ Create your real project tasks!
