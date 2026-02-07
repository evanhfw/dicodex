

# Cohort Monitoring Dashboard

A high-performance, single-page dashboard for a facilitator managing 25 students in a Coding Camp. Built with React, Tailwind CSS, Shadcn UI, and Recharts — all frontend with hardcoded dummy data.

---

## 1. Header — Program Timeline Roadmap

- A full-width visual progress bar showing the program journey
- Displays **Start Date**, a **"Today" marker**, and **End Date**
- Text label: e.g., *"Day 45 of 90 — 50% Journey"*
- Clean, DBS Foundation-inspired styling (red accent on white/gray background)

## 2. Summary Row — The "Pulse" of the Class

Four large KPI cards showing the distribution of students across categories:

| Card | Color | Example |
|------|-------|---------|
| Need Special Attention | 🔴 Red | 3 students |
| Lagging Behind | 🟡 Yellow | 5 students |
| On Ideal Schedule | 🟢 Green | 12 students |
| Ahead of Schedule | 🔵 Blue | 5 students |

Each card displays the count prominently with a label and subtle icon.

## 3. The "Critical List" — Unsubmitted Assignments (Center Left)

- A card listing currently active assignments
- Each row shows the assignment name and count of students who haven't submitted
- Example: *"Module 3: Data Viz — 6 Pending"*
- Sorted by highest pending count for quick prioritization

## 4. Attendance Analytics — Bar Chart (Center Right)

- A bar chart (using Recharts) showing **Weekly Attendance Trend** over the last 4 weeks
- Each bar represents average attendance rate for that week
- Clean axis labels and tooltips
- Matches the red/gray color theme

## 5. Quick-View Student Grid (Bottom)

- A compact grid of **25 mini-cards** (5 columns × 5 rows on desktop, responsive on smaller screens)
- Each mini-card shows:
  - **Student name**
  - **Color-coded status dot** (Red / Yellow / Green / Blue)
  - **A small sparkline** showing their progress trend
- Hovering a card could show a tooltip with more detail (attendance rate, submission status)

## 6. Dummy Data

- A JSON array of 25 student objects with: `name`, `status`, `assignment_submitted`, `attendance_rate`, and `weekly_progress` (array for sparkline)
- 3–4 active assignments with varying submission counts
- 4 weeks of attendance data for the bar chart

## Visual Style

- **DBS Foundation-inspired**: Primary red (#E31837), white backgrounds, dark gray text, light gray borders
- Professional, high-contrast, data-dense layout
- Clean typography with clear visual hierarchy
- No backend needed — purely frontend with static data

