# Visual Feature Guide

This document describes the visual appearance and user interface of the enhanced task scheduler features.

## 1. Next Up Panel

### Location
- Appears at the top of the main content area, immediately below the header
- Above the "Add Task" button
- Full width of content area

### Visual Design
```
┌─────────────────────────────────────────────────────────────┐
│ 🎯 次のタスク                                          ×    │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │  Gather Project Requirements                           │ │
│ │                                                         │ │
│ │  担当: Product Manager                                   │ │
│ │  期間: 2026-02-04 - 2026-02-10                          │ │
│ │  状態: 進行中                                           │ │
│ │  依存タスク: 1件（すべて完了）                             │ │
│ │  詳細: Meet with stakeholders to collect requirements   │ │
│ └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### Color Scheme
- Background: Purple gradient (same as header - #667eea to #764ba2)
- Text: White
- Content box: Semi-transparent white background with blur effect
- Dismiss button: Circular, semi-transparent white background

### Behavior
- Slides down with animation when a ready task is available
- Updates automatically when tasks are completed
- Can be dismissed by clicking the × button
- Shows "すべてのタスクがブロックされています" if all tasks are blocked
- Hidden if all tasks are complete or on hold

## 2. Task Creation/Edit Modal - Dependency Field

### Location
- In the task modal form
- Below the "Description" field
- Above the form action buttons

### Visual Design
```
┌─────────────────────────────────────────────────┐
│ 依存タスク（このタスクの前に完了すべきタスク）      │
│ ┌─────────────────────────────────────────────┐ │
│ │ Project Kickoff Meeting (2026-02-03 - ...)  │ │
│ │ Gather Project Requirements (2026-02-04...) │ │
│ │ Create System Design (2026-02-11 - 2026...) │ │
│ │                                             │ │
│ └─────────────────────────────────────────────┘ │
│ Ctrl/Cmd + クリックで複数選択できます              │
└─────────────────────────────────────────────────┘
```

### Features
- Multi-select dropdown (size="4" for visibility)
- Shows task title with date range
- Supports Ctrl/Cmd + Click for multiple selections
- Options show all tasks except the current one being edited
- Helper text below explains multi-select

## 3. Gantt Chart - Task Popup with Dependencies

### Enhanced Popup Content
```
┌──────────────────────────────────────────────┐
│ Develop User Interface 🟢準備完了              │
│                                              │
│ ユーザー: Frontend Developer                  │
│ 担当者: UI/UX Designer                       │
│ 状態: 未着手                                  │
│ 期間: 2026-02-18 - 2026-02-28               │
│                                              │
│ 依存タスク:                                   │
│  • Create System Design (完了)               │
│                                              │
│ このタスクに依存しているタスク:                  │
│  • Quality Assurance Testing                 │
│  • Write User Documentation                  │
│                                              │
│ 説明: Build responsive UI components...      │
└──────────────────────────────────────────────┘
```

### Status Badges in Popup
- **🟢準備完了** (Green background) - All dependencies complete, ready to start
- **🔴ブロック中** (Red background) - Has incomplete dependencies

### Visual Indicators
- Badge appears next to task title in popup header
- Green badge: `rgba(76, 175, 80, 0.2)` background, `#388e3c` text
- Red badge: `rgba(244, 67, 54, 0.2)` background, `#d32f2f` text
- Lists are bulleted for clarity

## 4. List View - Task Cards with Dependencies

### Task Card Layout
```
┌─────────────────────────────────────────────────────────────┐
│ Build Backend APIs                                          │
│ 進行中  🔴ブロック中                                         │
│                                                             │
│ ユーザー: Backend Developer                                 │
│ 担当者: Database Admin                                      │
│ 開始日: 2026-02-18                                          │
│ 終了日: 2026-02-28                                          │
│                                                             │
│ 依存タスク:                                                  │
│  → Create System Design (未着手)                            │
│  → Gather Requirements (完了)                               │
│                                                             │
│ このタスクに依存しているタスク:                                │
│  → Quality Assurance Testing                                │
│                                                             │
│ 説明: Develop RESTful APIs, database integration...         │
│                                                             │
│ [ 編集 ]  [ 削除 ]                                         │
└─────────────────────────────────────────────────────────────┘
```

### Status Badge Colors
- **🟢準備完了** - Green badge (task ready to start)
- **🔴ブロック中** - Red badge (task blocked by dependencies)
- No badge - Task has no dependencies or is complete/on hold

### Dependency List Styling
- Arrow (→) indicates dependency relationship
- Each dependency shows title and status
- Indented list for visual hierarchy
- Font size: 13px for dependency details

## 5. Visual Indicators Across Views

### Color Coding System

**Task Status Colors (existing):**
- Gray: Not Started
- Blue: In Progress  
- Green: Completed
- Orange: On Hold

**Dependency Status Badges (new):**
- Green (Ready): `background: rgba(76, 175, 80, 0.2); color: #388e3c`
- Red (Blocked): `background: rgba(244, 67, 54, 0.2); color: #d32f2f`
- Yellow (Has Dependencies): `background: rgba(255, 193, 7, 0.2); color: #f57c00`

### Badge Sizes
- Gantt popup badges: 11px font, 4px padding
- List view badges: 12px font, 4px padding
- Next Up panel: 14px font in content area

## 6. Responsive Design

### Desktop (1400px+)
- Next Up panel: Full width, single line layout
- Task modal: 600px max width, centered
- Dependency lists: Full visibility
- Badges: Standard size

### Tablet (768px - 1024px)  
- Next Up panel: Stacks content vertically
- Task modal: 90% width
- Dependency lists: Scrollable if needed
- Badges: Same size

### Mobile (320px - 767px)
- Next Up panel: Full width, stacked layout
- Task modal: Full width minus margins
- Dependency field: Smaller height (3 lines visible)
- Badges: Slightly smaller text
- Lists: Single column, full width

## 7. Animations and Transitions

### Next Up Panel
- Entry: `slideDown` animation (0.4s ease)
- Transforms from -20px to 0 with opacity fade
- Smooth background gradient

### Modal
- Entry: `slideIn` animation (0.3s ease)
- Overlay: `fadeIn` animation (0.3s)
- Backdrop blur effect on overlay

### Task Cards (List View)
- Hover: Slight lift effect (`translateY(-2px)`)
- Box shadow enhancement on hover
- Smooth transitions (0.2s)

### Buttons
- All buttons: 0.3s transition
- Hover states with color changes
- Dismiss button: Circular with hover highlight

## 8. Accessibility Features

### Keyboard Navigation
- Tab through form fields including dependency selector
- Enter to submit forms
- Escape to close modal
- Multi-select with Ctrl/Cmd + Click or keyboard arrows

### Screen Reader Support
- Semantic HTML structure
- Labels for all form fields
- ARIA attributes where needed
- Meaningful badge text

### Color Contrast
- All text meets WCAG AA standards
- Badge colors chosen for visibility
- High contrast on gradient backgrounds

## 9. Empty States

### No Ready Tasks
```
┌─────────────────────────────────────────────┐
│ 🎯 次のタスク                           ×   │
│ ┌─────────────────────────────────────────┐ │
│ │ すべてのタスクがブロックされています。    │ │
│ │ 依存関係を確認してください。             │ │
│ └─────────────────────────────────────────┘ │
└─────────────────────────────────────────────┘
```

### No Dependencies Selected
- Dependency field shows "依存なし" option
- No warning or error state
- Valid to have no dependencies

### No Tasks
- Standard empty state: "まだタスクがありません"
- Next Up panel hidden when no tasks exist

## 10. Error States

### Circular Dependency Detected
```
┌─────────────────────────────────────────┐
│ ⚠️ Alert                                │
│                                         │
│ 循環依存が検出されました。                │
│ 依存関係を見直してください。              │
│                                         │
│ [ OK ]                                  │
└─────────────────────────────────────────┘
```

### Self-Dependency Attempt
```
┌─────────────────────────────────────────┐
│ ⚠️ Alert                                │
│                                         │
│ タスクは自分自身に依存できません         │
│                                         │
│ [ OK ]                                  │
└─────────────────────────────────────────┘
```

## Summary

The visual design focuses on:
1. **Clarity** - Clear indicators and labels
2. **Consistency** - Same purple theme throughout
3. **Intuitiveness** - Visual cues match meaning (green=ready, red=blocked)
4. **Responsiveness** - Works on all screen sizes
5. **Accessibility** - Keyboard navigation and screen reader support

All new UI elements integrate seamlessly with the existing design while adding powerful new scheduling capabilities.
