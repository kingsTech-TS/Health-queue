# EKSU HEALTH CENTER REGISTRATION SYSTEM

# FRONTEND UI/UX MASTER PROMPT

You are working on the frontend of an existing **EKSU Health Center Registration System**.

Your task is to inspect the existing frontend and redesign/refactor it into a polished, modern, responsive, production-ready **Health Center Registration UI**.

This is a **registration-focused system**.

Do NOT design interfaces for:

- Doctors
- Head Nurses
- General Nurses
- Clerks
- Hospital admissions
- Hospital rooms
- Hospital visits
- Treatment management
- Doctor consultation
- Inpatient management
- Any other unrelated hospital-management functionality

The only account categories are:

```text
STUDENT
STAFF
ADMIN
```

Staff has only:

```text
LAB ATTENDANT
REGISTERING NURSE
```

---

# 1. FRONTEND TECHNOLOGY

Use the existing frontend stack if it is already configured correctly.

Preferred stack:

- Next.js
- TypeScript
- Tailwind CSS
- shadcn/ui
- Lucide React
- Framer Motion where useful
- Sonner for notifications

Use reusable components.

Do not duplicate UI implementations unnecessarily.

If the existing project already has a design system, inspect it first and extend it instead of replacing it blindly.

---

# 2. DESIGN DIRECTION

The application should feel like a **modern university health-service platform**.

Design characteristics:

- Clean
- Professional
- Calm
- Medical
- Academic
- Trustworthy
- Modern
- Accessible
- Responsive
- Minimal but polished

Avoid:

- Excessive gradients
- Overly flashy animations
- Gaming-style UI
- Excessive glassmorphism
- Huge decorative elements
- Cluttered dashboards
- Excessive rounded cards everywhere
- Unnecessary illustrations
- Dense tables on mobile

The interface should feel suitable for an official university system.

---

# 3. DESIGN SYSTEM

Create a consistent design system.

### Primary visual direction

Use a professional green/emerald-based palette with neutral surfaces.

Suggested:

```text
Primary: Emerald / University Green
Secondary: Deep Green
Background: Slate / Neutral
Surface: White
Text: Slate / Dark Neutral
Muted: Slate Gray
Success: Green
Warning: Amber
Danger: Red
Info: Blue
```

Do not hard-code colors repeatedly.

Create reusable Tailwind classes/components where appropriate.

---

# 4. TYPOGRAPHY

Use a clean modern sans-serif font.

Recommended:

- Inter
- Geist
- or the existing project font

Typography hierarchy:

```text
Page Title
Section Title
Card Title
Body
Muted Text
Caption
```

Do not use oversized typography inside dashboards.

---

# 5. GLOBAL LAYOUT

Create a reusable authenticated layout.

Desktop:

```text
┌────────────────────────────────────────────────────┐
│ Top Header                                          │
├───────────────┬────────────────────────────────────┤
│               │                                    │
│ Sidebar       │ Main Content                       │
│               │                                    │
│ Navigation    │                                    │
│               │                                    │
└───────────────┴────────────────────────────────────┘
```

Mobile:

```text
┌─────────────────────────────┐
│ Header       Menu           │
├─────────────────────────────┤
│                             │
│ Main Content                │
│                             │
└─────────────────────────────┘
```

The sidebar should collapse on mobile.

Do not create unnecessary blank space beside the sidebar.

---

# 6. TOP HEADER

Authenticated header should contain:

- Page title/breadcrumb
- Notifications
- User avatar
- User name
- Role/sub-role
- Dropdown menu

Dropdown:

```text
Profile
Reset Password
Logout
```

For staff:

```text
Staff Name
Staff ID
Sub-role
```

For students:

```text
Student Name
Registration/Matric Number
Level
```

---

# 7. GLOBAL COMPONENTS

Create reusable components for:

- Sidebar
- Header
- Breadcrumb
- Page header
- Stat card
- Status badge
- Data table
- Search input
- Filter dropdown
- Date picker
- Modal
- Confirmation dialog
- Form field
- File upload
- Empty state
- Loading state
- Skeleton
- Error state
- Pagination
- Tabs
- Drawer
- Toast
- Queue card
- Student card
- Profile card
- Pink File section
- Timeline
- Progress indicator

Do not recreate these components separately for each page.

---

# 8. AUTHENTICATION PAGES

Create polished authentication pages.

Pages:

```text
/login
/register
/forgot-password
/reset-password
```

Use a centered authentication layout.

Desktop:

```text
┌──────────────────────────────────────────────────────┐
│                                                      │
│     EKSU HEALTH CENTER                              │
│                                                      │
│     ┌──────────────────────────────┐                 │
│     │ Login                        │                 │
│     │                              │                 │
│     │ Email                        │                 │
│     │ Password                     │                 │
│     │                              │                 │
│     │ [ Login ]                    │                 │
│     │                              │                 │
│     │ Forgot Password?             │                 │
│     └──────────────────────────────┘                 │
│                                                      │
└──────────────────────────────────────────────────────┘
```

Include EKSU/university health-service branding where the existing project provides appropriate assets.

---

# 9. STUDENT REGISTRATION PAGE

Student registration form:

```text
Registration / Matric Number
Email
Faculty
Department
Level
Password
Confirm Password
```

Use:

- Clear labels
- Helpful validation
- Password visibility toggle
- Inline errors
- Loading state
- Success/error toast

Do not overwhelm the user with too many fields.

---

# 10. STUDENT ONBOARDING

Create a multi-step onboarding experience.

Suggested step indicator:

```text
1 Account
2 Personal Information
3 Documents
4 Complete
```

The user should clearly see their current step.

Example:

```text
Personal Information
──────────────────────────────
Step 2 of 3

Surname
First Name
Last Name
Age
Nationality
State of Origin
Religion
Marital Status

                 [Continue]
```

Do not allow skipping required onboarding steps.

---

# 11. DOCUMENT UPLOAD UI

Create polished upload components for:

- Passport photograph
- Signature

Upload component should support:

- Drag and drop
- Browse file
- Image preview
- Replace image
- Remove image
- Upload progress
- File validation
- Error state

Example:

```text
┌──────────────────────────────────┐
│          Passport                │
│                                  │
│       ┌──────────────┐           │
│       │              │           │
│       │   Preview    │           │
│       │              │           │
│       └──────────────┘           │
│                                  │
│     [ Replace Image ]            │
└──────────────────────────────────┘
```

---

# 12. STUDENT DASHBOARD

The Student Dashboard should immediately show the student's registration progress.

Top section:

```text
Good morning, Solomon

Health Center Registration
Track your registration progress and access your health center records.
```

Then statistics/cards:

```text
Registration Status
Current Stage
HC Number
Queue Number
```

---

# 13. REGISTRATION PROGRESS

Create a visually clear progress timeline.

Example:

```text
✓ Account Created
      │
      ↓
✓ Personal Information
      │
      ↓
✓ Passport & Signature
      │
      ↓
✓ Laboratory
      │
      ↓
✓ Physical Examination
      │
      ↓
✓ Pink File
      │
      ↓
✓ Registration Completed
      │
      ↓
✓ Health Center Card
```

Use different visual states:

- Completed
- Current
- Pending
- Locked

The current action should be prominent.

---

# 14. STUDENT DASHBOARD ACTIONS

Depending on registration state, display relevant actions:

```text
Continue Registration
View Queue
View Pink File
View Profile
Health Center Card
Reset Password
```

Do not show actions the student is not yet allowed to perform.

---

# 15. STUDENT PROFILE

Create:

```text
/profile
```

Profile layout:

```text
┌────────────────────────────────────────────┐
│ Profile                                    │
├────────────────────────────────────────────┤
│                                            │
│       Passport                             │
│                                            │
│ Full Name                                  │
│ Level                                      │
│ Faculty                                    │
│ Department                                 │
│ Registration/Matric Number                 │
│ HC Number                                  │
│                                            │
│ Signature                                  │
│                                            │
│ [ Reset Password ]                         │
└────────────────────────────────────────────┘
```

The profile should look like an official university record.

---

# 16. STUDENT QUEUE PAGE

Create a clear queue interface.

Display:

```text
Your Queue Number
#024

Current Number
#018

Students Ahead
5

Estimated Waiting
25 minutes
```

Use a large queue number card.

Also show:

```text
Queue Date
Scheduled Time
Queue Status
```

Status:

- Waiting
- Called
- Completed
- Missed

---

# 17. STUDENT HEALTH CENTER CARD

Create a realistic digital health center card.

The card should look printable.

Desktop:

```text
┌──────────────────────────────────────────────┐
│ EKITI STATE UNIVERSITY                      │
│ ADO-EKITI                                   │
│ UNIVERSITY HEALTH SERVICES                  │
│                                              │
│ REGISTRATION CARD                            │
│                                              │
│ Registration Number                          │
│                                              │
└──────────────────────────────────────────────┘
```

Back:

```text
┌──────────────────────────────────────────────┐
│ H.C. Number                                  │
│ Surname                                      │
│ First Names                                  │
│ HRO's Initials                               │
│ Signature                                    │
│ Matric Number                                │
│ Faculty / Department                         │
│                                              │
│ ┌───────────────┐                            │
│ │ Passport      │                            │
│ │               │                            │
│ └───────────────┘                            │
│                                              │
│ KEEP THIS CARD CAREFULLY AND BRING IT        │
│ WITH YOU WHENEVER YOU COME FOR TREATMENT     │
└──────────────────────────────────────────────┘
```

Provide:

```text
[ View Card ]
[ Download Card ]
[ Print Card ]
```

Use print-specific CSS.

---

# 18. STAFF REGISTRATION

Staff registration page:

```text
Staff Registration

Title
Full Name
Email
Sub-role
Password
Confirm Password
Staff ID
```

Sub-role dropdown:

```text
Lab Attendant
Registering Nurse
```

After submission:

Display a clear pending approval state.

```text
Registration Submitted

Your staff account has been submitted for
administrator approval.

You will be able to access your dashboard
after your account has been approved.
```

---

# 19. STAFF PENDING APPROVAL SCREEN

If a staff member attempts to log in before approval:

Display a dedicated screen.

```text
Account Pending Approval

Your staff account is currently awaiting
administrator approval.

Staff ID
Sub-role
Account Status

Pending Approval

Please contact the administrator if you
need assistance.
```

Do NOT show the staff dashboard.

---

# 20. STAFF SUSPENSION SCREEN

If staff status is suspended:

Do NOT render the dashboard.

Display:

```text
Account Suspended

Your staff account has been temporarily
suspended.

Reason for suspension:

[ Suspension reason ]

Suspended on:
[ Date ]

Please contact the administrator for
further information.
```

Use a serious but professional design.

Do not use frightening or aggressive visuals.

---

# 21. STAFF DASHBOARD

Staff dashboard must dynamically adapt to sub-role.

Header:

```text
Good morning, [Staff Name]

[Lab Attendant]
```

or:

```text
Good morning, [Staff Name]

[Registering Nurse]
```

Dashboard cards:

```text
Students Today
Waiting
Attended
Missed
```

Queue section:

```text
Current Queue

#021   Student Name      Waiting
#022   Student Name      Called
#023   Student Name      Completed
```

---

# 22. LAB ATTENDANT NAVIGATION

Lab Attendant sidebar:

```text
Dashboard
Laboratory Queue
Students
Pink Files
Activity
Profile
Reset Password
Logout
```

Do NOT show:

- Physical examination management
- Registration nurse functionality
- Hospital management
- Doctor functionality

---

# 23. REGISTERING NURSE NAVIGATION

Registering Nurse sidebar:

```text
Dashboard
Registration Queue
Students
Pink Files
Activity
Profile
Reset Password
Logout
```

Do NOT show:

- Laboratory management
- Doctor functionality
- Hospital management

---

# 24. LABORATORY QUEUE PAGE

Create:

```text
Laboratory Queue
```

Top actions:

```text
[ Configure Queue ]
[ Start Queue ]
```

Configuration modal:

```text
Number of Students
Queue Date
Starting Time
Minutes per Student

[ Save Queue ]
```

Queue table:

```text
Queue #
Student
HC Number
Level
Department
Status
Scheduled Time
Action
```

Actions:

```text
Call
View
Mark Completed
Mark Missed
```

---

# 25. QUEUE CALLING UI

When staff calls a student, show a prominent current-student panel.

```text
NOW SERVING

Queue #024

John Doe

HC-1034

100 Level
Computer Science

[ Open Student ]
[ Mark Completed ]
[ Mark Missed ]
```

Make the current student visually prominent.

---

# 26. LABORATORY STUDENT RECORD

When the Lab Attendant opens a student:

Show a student summary first:

```text
Student Information

Full Name
HC Number
Level
Faculty
Department
Queue Number
```

Then laboratory form.

---

# 27. LABORATORY FORM UI

Create sections.

### Laboratory Information

Fields:

```text
Hospital Number
Laboratory Number
Nature of Specimen
Date Collected
Time Collected
Diagnosis / Clinical Details
Test Required
Doctor
Doctor's Signature
Date
```

Every field is optional.

Do not display unnecessary required indicators.

---

# 28. ANTIBIOTIC SENSITIVITY UI

Create a clean table:

```text
Antibiotic                    Result
────────────────────────────────────────
Penicillin                    [ Select ]
Ampicillin                    [ Select ]
Methicillin                   [ Select ]
Carbenicillin                 [ Select ]
Erythromycin                  [ Select ]
Chloramphenicol               [ Select ]
Streptomycin                  [ Select ]
Kanamycin                     [ Select ]
Gentamycin                    [ Select ]
Colistin                      [ Select ]
Cotrimoxazole                 [ Select ]
Nalidixic Acid                [ Select ]
Nitrofurantoin                [ Select ]
Amoxicillin/Clavulanate       [ Select ]
Ciprofloxacin                 [ Select ]
Ceftazidime                   [ Select ]
Cefuroxime                    [ Select ]
Ofloxacin                     [ Select ]
Ceftriaxone                   [ Select ]
Cloxacillin                   [ Select ]
```

Results are optional.

Do not force the user to fill every antibiotic.

---

# 29. LABORATORY SAVE

Bottom of form:

```text
[ Save Laboratory Record ]
```

On save:

- Show loading state.
- Disable duplicate submissions.
- Show success toast.
- Return to student record/queue.
- Update queue status.
- Show saved timestamp.

Example toast:

```text
Laboratory record saved successfully.
```

---

# 30. REGISTERING NURSE QUEUE

Registration queue page should have the same queue structure.

Display:

```text
Registration Queue

Queue #
Student
HC Number
Level
Department
Status
Scheduled Time
```

Actions:

```text
Call
Open
Completed
Missed
```

---

# 31. PHYSICAL EXAMINATION UI

When Registering Nurse opens a student:

Top student information card:

```text
Student

Full Name
HC Number
Level
Faculty
Department
```

Then:

```text
Physical Examination
```

Form sections:

### Measurements

```text
Weight (kg) *
Height (cm) *
```

### General Examination

```text
Visual Acuity
Left Eye
Right Eye
With glasses
Hearing
Eyes
Ear/Nose/Throat
Lymphatic glands
Spinal Reflexes
```

### Systems Examination

```text
Cardiovascular System
Blood Pressure
Pulse
Respiratory System
Breast Examination
Abdominal Examination
Genito-urinary System
Hernia
Musculo-skeletal System
Other observations
```

### Laboratory Findings

```text
Laboratory findings
Blood Tests
PVC
WBC
Blood Group
Haemoglobin Genotype
Urinalysis
Stool Analysis
Other Tests
```

### Chest Examination

```text
Chest X-ray
Heart
Lungs
Chest Cage
Others
```

### Conclusion

```text
Summary of Findings
Diagnosis
Remarks / Special Instructions
```

Only Weight and Height should have `*`.

---

# 32. STUDENT DIRECTORY

Staff should have a student directory.

Search by:

```text
Student Name
HC Number
Registration/Matric Number
```

Filters:

```text
Level
Faculty
Department
Registration Status
```

Display results as responsive cards on mobile and a table on desktop.

---

# 33. STUDENT RECORD VIEW

Student record page:

```text
Student Profile
────────────────────────────

Passport

Full Name
HC Number
Level
Faculty
Department

Registration Status

Laboratory
Physical Examination
Pink File
```

Use tabs:

```text
Overview
Registration
Laboratory
Physical Examination
Pink File
```

Only show information the current staff sub-role is authorized to see.

---

# 34. PINK FILE UI

Design the Pink File like a digital medical folder.

Header:

```text
PINK FILE

Student Name
HC Number
Level
Department
```

Tabs/sections:

```text
Personal Information
Documents
Registration
Laboratory
Physical Examination
```

Use a clean record layout.

Example:

```text
Personal Information

Full Name       John Doe
HC Number       HC-1024
Date of Birth   12/03/2006
Phone           080...
Religion        ...
State           ...
```

Laboratory section:

```text
Laboratory Records

Date
Laboratory Number
Test
Recorded By
Status
```

Physical Examination:

```text
Physical Examination

Weight
Height
Blood Pressure
Pulse
...
```

---

# 35. PINK FILE TIMELINE

Add a timeline showing important events.

Example:

```text
● Physical Examination Completed
  23 Sep 2026 — 10:32 AM
  Recorded by Registering Nurse

● Laboratory Result Added
  23 Sep 2026 — 9:45 AM
  Recorded by Lab Attendant

● Registration Started
  22 Sep 2026
```

This should make the record history easy to understand.

---

# 36. ADMIN DASHBOARD

Admin dashboard should be information-dense but clean.

Top:

```text
Good morning, Administrator

Health Center Registration Overview
```

Statistics:

```text
Total Students
Registered Students
Pending Registrations
Active Staff
Pending Staff Approvals
Suspended Staff
```

Second section:

```text
Registration Analytics

[ Week ] [ Month ]
```

Charts:

- Registration trend
- Students by level
- Students by faculty
- Students by department
- Registration status

---

# 37. ADMIN STUDENT MANAGEMENT

Page:

```text
Students
```

Actions:

```text
[ Upload Students ]
[ Add Student ]
```

Filters:

```text
Level
Faculty
Department
Registered Status
```

Search:

```text
Search by name, matric/registration number...
```

Table:

```text
Student
Identifier
Level
Faculty
Department
Registration Status
HC Number
Actions
```

---

# 38. BULK STUDENT UPLOAD UI

Create a professional upload modal/page.

Steps:

```text
1 Upload File
2 Validate
3 Preview
4 Import
5 Complete
```

Preview table:

```text
Name
Registration/Matric Number
Level
Faculty
Department
Status
```

Show validation errors clearly.

Example:

```text
24 records ready to import
3 records contain errors
```

Do not import invalid records silently.

---

# 39. ADMIN STAFF MANAGEMENT

Page:

```text
Staff Management
```

Tabs:

```text
All Staff
Pending Approval
Active
Suspended
```

Table:

```text
Staff
Staff ID
Sub-role
Email
Status
Registered Date
Actions
```

Actions:

```text
Approve
Suspend
Unsuspend
View Profile
```

---

# 40. STAFF SUSPENSION MODAL

When Admin clicks Suspend:

```text
Suspend Staff

Staff:
John Doe

Staff ID:
STF-001

Reason for suspension *

[ Enter reason... ]

This reason will be shown to the
suspended staff member.

[ Cancel ] [ Suspend Staff ]
```

Reason must be visibly required in the UI.

---

# 41. REGISTRATION PERIOD MANAGEMENT

Page:

```text
Registration Periods
```

Display:

```text
Period
Start Date
End Date
Start Time
End Time
Status
Actions
```

Actions:

```text
Edit
Delete
Activate
Deactivate
```

Create modal:

```text
Period Name
Start Date
End Date
Start Time
End Time

[ Create Period ]
```

---

# 42. ADMIN ANALYTICS

Create an analytics page with:

```text
[ Week ] [ Month ]
```

Cards:

```text
Students Registered
Registrations Completed
Registrations Pending
Students Attended
Students Missed
Laboratory Records
Physical Examinations
```

Charts should be readable and responsive.

Do not overload the page with charts.

---

# 43. RESPONSIVE DESIGN

The system must work properly on:

- Mobile
- Tablet
- Laptop
- Desktop

### Mobile

Use:

- Bottom navigation where appropriate
- Collapsible sidebar
- Cards instead of wide tables
- Horizontal scrolling only when genuinely necessary
- Sticky actions for long forms
- Large touch targets

### Tablet

Use two-column layouts where appropriate.

### Desktop

Use:

- Sidebar
- Multi-column cards
- Data tables
- Charts
- Larger information layouts

---

# 44. FORM UX

All forms must have:

- Clear labels
- Required indicators
- Helpful placeholders
- Inline validation
- Error messages
- Loading states
- Disabled submission while processing
- Success states

Required fields:

```text
*
```

Optional fields should NOT show a required indicator.

---

# 45. EMPTY STATES

Every list should have a useful empty state.

Example:

```text
No students found

There are no students matching
your current filters.

[ Clear Filters ]
```

Queue:

```text
No students in queue

Students will appear here when
they join the queue.
```

---

# 46. LOADING STATES

Use skeleton loaders instead of blank pages.

Examples:

- Dashboard skeleton
- Table skeleton
- Profile skeleton
- Pink File skeleton
- Queue skeleton

Avoid unnecessary spinners everywhere.

---

# 47. ERROR STATES

Create friendly error states.

Example:

```text
Something went wrong

We couldn't load this information.

[ Try Again ]
```

Do not expose raw API errors to users.

---

# 48. CONFIRMATION DIALOGS

For destructive actions:

- Delete student
- Delete registration period
- Suspend staff
- Delete staff

Use confirmation dialogs.

Example:

```text
Are you sure?

This action cannot be easily undone.

[ Cancel ] [ Confirm ]
```

For suspension, always require the reason before confirmation.

---

# 49. NOTIFICATIONS

Use toast notifications for:

- Successful save
- Successful upload
- Successful approval
- Successful suspension
- Successful unsuspension
- Successful queue configuration
- Failed requests
- Validation failures

Do not use toast notifications for information that must remain visible on the page.

---

# 50. ACCESS CONTROL UI

Frontend navigation must respect the authenticated user's role.

Student:

```text
Dashboard
Registration
Queue
Pink File
Health Card
Profile
```

Lab Attendant:

```text
Dashboard
Laboratory Queue
Students
Pink Files
Activity
Profile
```

Registering Nurse:

```text
Dashboard
Registration Queue
Students
Pink Files
Activity
Profile
```

Admin:

```text
Dashboard
Students
Staff
Registration Periods
Analytics
Activity Logs
Settings
Profile
```

Do not expose unrelated routes in navigation.

Remember:

**Frontend hiding is not security.**

Backend authorization remains authoritative.

---

# 51. ANIMATION

Use Framer Motion sparingly.

Good uses:

- Page transitions
- Modal entrance
- Card entrance
- Queue status changes
- Progress transitions
- Sidebar transitions

Avoid:

- Excessive bouncing
- Constant animations
- Long transitions
- Distracting dashboard effects

Animations should generally be short and subtle.

---

# 52. ACCESSIBILITY

Follow good accessibility practices.

Use:

- Semantic HTML
- Keyboard navigation
- Visible focus states
- Proper labels
- ARIA where necessary
- Sufficient contrast
- Accessible dialogs
- Accessible dropdowns
- Accessible form errors

Do not rely only on color to communicate status.

For example:

```text
✓ Completed
● Waiting
! Attention
× Failed
```

---

# 53. PRINT STYLES

Create print-friendly styling for:

- Health Center Card
- Pink File where appropriate
- Laboratory record where appropriate
- Physical examination record where appropriate

The Health Center Card should print cleanly without:

- Sidebar
- Header
- Buttons
- Navigation
- Unnecessary UI

---

# 54. ROUTE STRUCTURE

Use a clean route structure.

Suggested:

```text
/login
/register
/forgot-password
/reset-password

/student/dashboard
/student/profile
/student/registration
/student/queue
/student/pink-file
/student/health-card

/staff/dashboard
/staff/profile
/staff/queue
/staff/students
/staff/pink-files
/staff/activity

/admin/dashboard
/admin/students
/admin/staff
/admin/registration-periods
/admin/analytics
/admin/activity
/admin/settings
```

Adapt this to the existing application structure rather than blindly replacing it.

---

# 55. IMPORTANT UI STATES

Every major page must support:

```text
Loading
Success
Empty
Error
Unauthorized
Pending
Suspended
Completed
```

Do not design only the happy path.

---

# 56. DESIGN CONSISTENCY

Every page should feel like the same application.

Maintain consistency in:

- Spacing
- Border radius
- Typography
- Buttons
- Form controls
- Cards
- Tables
- Status badges
- Icons
- Modals
- Page headers

Do not create a different design language for every dashboard.

---

# 57. FINAL FRONTEND REQUIREMENT

Before implementation:

1. Inspect the existing frontend.
2. Identify existing reusable components.
3. Identify existing routes.
4. Identify existing dashboards.
5. Identify existing forms.
6. Identify existing design system.
7. Reuse good existing components.
8. Refactor conflicting components.
9. Remove UI for out-of-scope functionality.
10. Implement the new registration-focused interface.

Do not blindly rewrite the entire frontend.

The final UI must clearly represent:

```text
STUDENT
    ↓
REGISTRATION
    ↓
LABORATORY
    ↓
PHYSICAL EXAMINATION
    ↓
PINK FILE
    ↓
HEALTH CENTER CARD
```

And the staff structure:

```text
STAFF
 ├── LAB ATTENDANT
 │      └── Laboratory Queue
 │      └── Laboratory Records
 │      └── Pink Files
 │
 └── REGISTERING NURSE
        └── Registration Queue
        └── Physical Examination
        └── Pink Files
```

Admin:

```text
ADMIN
 ├── Analytics
 ├── Students
 ├── Staff
 ├── Registration Periods
 ├── Activity Logs
 └── System Management
```

The UI must be:

**professional, responsive, accessible, clean, modern, university-appropriate, and production-ready.**

Do not add functionality outside this registration scope.

Do not invent additional compulsory fields.

Do not visually mark optional fields as required.

Do not show dashboards to pending or suspended staff.

Do not expose navigation belonging to another role.

Do not use mock data as if it were real data when API integration is available.

Build reusable components instead of duplicated page-specific UI.
