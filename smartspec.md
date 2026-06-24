***Software****** ******Design Specification for Smart Interactive Learning System (Version 2.0)***

Software Design Specification

for

ABC System

**Version ****<****2****.****0****>**

** **

**Group No.: ****2**

| **WONG YIK SIANG** | **261UC2406N** |  |
| --- | --- | --- |
| **CHAN JIA SHENG** | **261UC2401R** |  |
| **KO JIA HUI** | **261UC240TG** |  |
| **TEE BING ZHE** | **261UC240C4** |  |
|  |  |  |

|  |  |
| --- | --- |
|  |  |
|  |  |
|  |  |
| **Date:** | **5 June 2026** |

**Contents**

# Contents

Contents	2

Revisions	4

	1	System Overview	5

		1.1	Description	5

		1.2	Actors	5

		1.3	Assumptions and Dependencies	5

		1.4	Use Case Diagram	5

	2	Activity Diagrams	6

	2.1.1 Use Case 1	6

	2.1.2 Use Case 2	6

	2.1.3 Use Case 3	6

	2.1.4 Use Case 4	6

	2.1.5 Use Case 5	6

	2.1.6 Use Case 6	6

	2.1.7 Use Case 7	6

	3	Data Design	7

		3.1	Design Class Diagram	7

		3.2	Data Dictionary	7

		3.3	Data Structures	7

		3.3.1	Data Structure 1	7

		3.3.2	Data Structure 2	7

	3.4	7

	4	Behavioral Modeling	8

		4.1	Sequence Diagrams	8

		4.1.1	Use Case 1	8

		4.1.2	Use Case 2	8

		4.1.3	Use Case 3	9

		4.1.4	Use Case 4	9

		4.1.5	Use Case 5	10

	4.1.6	11

	4.1.7	12

	4.1.8	13

	4.1.9	14

	4.1.10	15

		4.2	State Diagram	21

	5	Architecture Design	22

		5.1	Software Architecture	22

		5.1.1	Subsystem 1—User & Authentication	23

		5.1.2	Subsystem 2—Course & Content	24

	5.1.3 Subsystem 3— Assessment	25

	5.1.4 Subsystem 4—Progress & Analytics	26

	5.1.5 Subsystem 5— Notification	27

	6	Interface Design	29

		6.1	Main Screens	29

		6.2	Subsystem 1 Screens	29

		6.3	Subsystem 2 Screens	29

	7	Component Design	30

		7.1	Main Components	30

		7.1.1	Component 1	30

	8	Deployment Design	31

		8.1	Deployment Diagram	31

	9	Summary	32

References	33

		

# Revisions

| **Version** | **Primary Author(s)** | **Description of Version** | **Date Completed** |
| --- | --- | --- | --- |
| SRS  in Part 1(as Ver 1.0) SDS in Part 2(as Ver 2.0.X) *System Documentation in Part 3 (as Ver 3.0) Draft Type and Number | Full Name | Information about the revision. This table does not need to be filled in whenever a document is touched, only when the version is being upgraded. | 00/00/00 |

# System Overview

## Description

#### The Smart Interactive Learning System is a web-based platform that integrates interactive content delivery, automated assessment, real-time progress tracking, and role-specific analytics into a single cohesive system. The system serves four main actors: Student, Instructor, Academic Advisor, and Admin

####           Student

#### Students can log in, enroll the courses, access lesson materials and videos, take quizzes with auto-grading, submit assignments, track their own progress, and also view grades with instructor feedback.

#### Academic advisor

#### Advisors can view student profiles, monitor student progress and performance, review grades and academic records, provide academic advice, approve or recommend course enrolments, identify at-risk students, and generate academic reports.

 

#### Admin

#### Admins can help to manage user accounts, manage courses, assign instructors to courses, post announcements, manage student enrolments, view reports, and handle messages from users.

 

####          Instructor

#### Instructors can manage their profile, upload learning materials to course modules, create quizzes and assignments, view student progress, view course analytics dashboards, and receive real-time notifications on student activities.

## Actors

| **Actor** | **Use Cases** |
| --- | --- |
| Student | Login Manage profile Enroll in Courses Access Lessons & Videos Take Quizzes Submit Assignments Track Progress View Grades & Feedback Receive Notifications |
| Academic Advisor | Login Manage profile View Student Profiles Monitor Student Progress and Performance Review Grades and Academic Records Generate Reports Receive Notifications |
| Admin | Login Manage user account Manage courses View report Manage student enrollments Manage Notification View & manage user activity logs |
| Instructor | Login Manage Profile Manage Course Upload Learning Materials Create Quiz/Assignment Configure quiz feedback & tips Grade Assignments View Student Progress View Analytics Dashboard Receive Notifications |

## Assumptions and Dependencies

- All users have access to a modern web browser (Chrome, Firefox) and a stable internet connection.

 

- Users, including students, advisor and instructor are equipped a smartphone or a laptop to interact with the system web.

 

- The system relies on a functioning database to store and retrieve user and course information.

 

- Each user is registered under a single role only (Student, Instructor, Academic Advisor, or Admin), and role assignment is managed by the admin.

 

- Instructors are responsible for creating and maintaining their own course content, including videos, quizzes, and assignment deadlines.

 

- Video content is assumed to be hosted on a third-party platform (e.g., YouTube) or internal file server. Video playback depends on the availability of that service.

 

- Auto-grading applies to MCQ and fill-in-the-blank questions only. Short answer questions may require manual grading by the instructor.

 

- All academic programmes, departments, and course structures are pre-configured by the admin before the system goes live.

 

- The system depends on a relational database (e.g., MySQL) for storing all user data, course content, quiz results, and activity logs.

## Use Case Diagram

# Activity Diagram

	## 2.1 Activity Diagrams

	**Actor 1: Student**

### 2.1.1 Use Case 1

| **Use Case Name** | **Login** |
| --- | --- |
| Actors | Student |
| Preconditions | Student account is registered and authorized by Admin. |
| Normal Flow | Description | The student logs in using email and password. |
|  | Postconditions | Student account is login and the student is redirected to their personalised dashboard |
| Alternative flows and exceptions | If validation fails, descriptive error messages are shown. |
| Non functional requirements | Passwords must be stored using a secure hashing algorithm. |

### 2.1.2 Use Case 2

| **Use Case Name** | **Manage Profile** |
| --- | --- |
| Actors | Student |
| Preconditions | Student is logged in. |
| Normal Flow | Description | Student navigates to the Profile section. Student views current information (name, academic level, programme/department, learning preferences). Student edits desired fields and uploads a profile photo if needed. Student clicks Save. System validates and updates the profile. Updated information is reflected immediately across the system. |
|  | Postconditions | Student profile is updated and changes are visible across the system, including the student dashboard and advisor view. |
| Alternative flows and exceptions | If required fields are blank, system shows a validation error. If uploaded photo exceeds size limit, system rejects it and prompts for a smaller file. If an unsupported file format is uploaded, system displays a format error. |
| Non functional requirements | Profile photo must not exceed 5MB and must be JPG or PNG format. |

### 2.1.3 Use Case 3

| **Use Case Name** | **Enroll in a Course** |
| --- | --- |
| Actors | Student |
| Preconditions | Student is logged in. The course is available and open for enrolment. |
| Normal Flow | Description | Student browses the course catalogue, selects a course, and clicks Enroll. The system records the enrolment and adds the course to the student's dashboard. |
|  | Postconditions | Students are enrolled in the course and can access all course content, lessons, and assessments. |
| Alternative flows and exceptions | If the student is already enrolled in the course, the system displays a message indicating that the student is already enrolled. |
| Non-functional requirements | Enrolment confirmation must be loaded displayed immediately. |

### 2.1.4 Use Case 4

| **Use Case Name** | **Access Lessons ****&**** Videos** |
| --- | --- |
| Actors | Student |
| Preconditions | Logged in and enrolled in a course with published lessons/videos. |
| Normal Flow | Description | Student navigates to their enrolled course and selects a module. The system displays a list of lessons and embedded video content. The student clicks on a lesson or video to open it. The system renders the content (text, PDF, or embedded video) within the platform. |
|  | Postconditions | Student successfully views the lesson or video. Completion status for the lesson is updated in the student's progress tracker. |
| Alternative flows and exceptions | If the video fails to load, the system displays an error message and suggests the student retry or contact support. |
| Non-functional requirements |  |

### 2.1.5 Use Case 5

| **Use Case Name** | **Take a Quiz** |
| --- | --- |
| Actors | Student |
| Preconditions | Student is enrolled in the course and the quiz is open. |
| Normal Flow | Description | Students open a quiz from their course page. The system presents randomised questions (MCQ, fill-in-the-blank, short answer) within a set time limit. The student submits answers; the system auto-grades the submission and provides instant feedback with tips for improvement. |
|  | Postconditions | Quiz scores are recorded. The students views their results, correct answers, and improvement tips. Score updates in the progress tracker. |
| Alternative flows and exceptions | If the student disconnects mid-quiz, answers submitted so far are saved. If time expires, the quiz is auto submitted. |
| Non-functional requirements | Auto-grading results must thoroughly submission. |

### 2.1.6 Use case 6

| **Use Case Name** | **Submit Assignment** |
| --- | --- |
| Actors | Student |
| Preconditions | Student is logged in, enrolled in the course, and the coursework submission window is open (before deadline). |
| Normal Flow | Description | Student opens a coursework item and clicks Submit. The system presents a submission form where the student can upload files (e.g. PDF, Word, ZIP) and optionally add a text note. The student reviews their submission and confirms. The system records the submission with a timestamp and sends a confirmation notification to the student. |
|  | Postconditions | Submission is saved and timestamped. The coursework status is updated to Submitted. The instructor is notified of the new submission. The student receives an in-app notification. |
| Alternative flows and exceptions | If the student submits before the deadline, they may resubmit and the latest submission overwrites the previous one. If the deadline has passed, the Submit button is disabled and the coursework is marked Closed. If the uploaded file exceeds the size limit , the system rejects it and prompts the student to reduce the file size. |
| Non-functional requirements | File upload must support common formats (PDF, DOCX, PPTX, ZIP, JPG, PNG) up to 50 MB. Upload progress must be shown with a progress bar. |

### 2.1.7 Use Case 7

| **Use Case Name** | **Track Progress** |
| --- | --- |
| Actors | Student |
| Preconditions | Student is enrolled in at least one course. |
| Normal Flow | Description | Students access their personal dashboard to view module completion status, quiz scores, assignment grades, and recommended next steps. The system displays visual progress bars and performance analytics per course. |
|  | Postconditions | Student views up-to-date progress data and is directed to incomplete modules or upcoming assessments. |
| Alternative flows and exceptions | If no activity exists yet, the dashboard displays a getting started guide. |
| Non-functional requirements | Dashboards must reflect activity updates in real time. |

### 2.1.8 Use Case 8

** **

| **Use Case Name** | **View Grade and Feedback** |
| --- | --- |
| Actors | Student |
| Preconditions | Student is logged in and enrolled in at least one course. Instructor or system has graded at least one quiz or assignment. |
| Normal Flow | Description | Student navigates to the Grades section within a course. The system displays a list of all graded quizzes and assignments with scores, grade breakdowns, and written feedback from the instructor. Student clicks on a specific item to view detailed feedback. |
|  | Postconditions | Student views their grades and all  instructor feedback. Grade history is available for all completed assessments within the course. |
| Alternative flows and exceptions | If an assignment has not yet been graded, it is displayed with a Pending status and an estimated review timeframe. If the instructor has not provided written feedback, the grade is shown without a feedback note. |
| Non-functional requirements |  |

### 2.1.9 Use Case 9

| **Use Case Name** | **Receive Notifications** |
| --- | --- |
| Actors | Student |
| Preconditions | Student is logged in and enrolled in at least one course. |
| Normal Flow | Description | System detects a triggering event (assignment deadline approaching, new content uploaded, or quiz score released). System generates a notification and delivers it to the student's notification inbox. Student sees a notification indicator in the navigation bar. Student clicks the notification icon to open the notification panel. Student reads the notification and clicks through to the relevant course, quiz, or assignment. System marks the notification as read. |
|  | Postconditions | Notification is marked as read. Student is directed to the relevant section of the system. |
| Alternative flows and exceptions | If the student does not log in, unread notifications are retained and shown upon next login. If the linked course or assignment is no longer available, system shows a message that the content has been removed. |
| Non-functional requirements | Unread notifications must persist until manually dismissed or read. |

**Actor 2: Academic Advisor**

### 2.2.1 Use Case 1

| **Use Case Name** | **Login** |
| --- | --- |
| Actors | Academic Advisor |
| Preconditions | Advisor account is registered and authorized by Admin. |
| Normal Flow | Description | Advisor enters email and password on the login page. The system verifies the credentials and grants access to the advisor dashboard. |
|  | Postconditions | Advisor is successfully logged in and redirected to the dashboard. |
| Alternative flows and exceptions | If credentials are incorrect, an error message is displayed. |
| Non-functional requirements | . |

### 2.2.2 Use Case 2

| **Use Case Name** | **Manage profile** |
| --- | --- |
| Actors | Academic Advisor |
| Preconditions | Academic Advisor is logged in. |
| Normal Flow | Description | Advisor navigates to the Profile section. Advisor views current information (name, department, contact details, assigned student cohort). Advisor edits desired fields and uploads a profile photo if needed. Advisor clicks Save. System validates and updates the profile. Updated information is reflected immediately across the system. |
|  | Postconditions | Advisor profile is updated and visible to students and admins across the system. |
| Alternative flows and exceptions | If required fields are blank, system shows a validation error. If uploaded photo exceeds size limit, system rejects it and prompts for a smaller file. |
| Non-functional requirements | Profile photo must not exceed 5MB and must be JPG or PNG format. |

### 2.2.3 Use Case 3

| **Use Case Name** | **View Student Profile** |
| --- | --- |
| Actors | Academic Advisor |
| Preconditions | Advisor account is registered and authorized. Advisor is logged into the system. |
| Normal Flow | Description | Advisor selects the "Student Profiles" option from the dashboard. The system displays a list of assigned students. Advisor selects a student to view detailed profile information. |
|  | Postconditions | Advisor can view the selected student’s profile details. |
| Alternative flows and exceptions | If no students are assigned, the system displays a "No students assigned" message. |
| Non-functional requirements |  |

### 2.2.4 Use Case 4

| **Use Case Name** | **Monitor Student Progress and Performance** |
| --- | --- |
| Actors | Academic Advisor |
| Preconditions | Advisor is logged in. Student academic data is available in the system. |
| Normal Flow | Description | Advisor selects a student and views progress indicators such as GPA, completed courses. The system displays performance analytics. |
|  | Postconditions | Advisor can monitor and analyze student performance. |
| Alternative flows and exceptions | If student data is unavailable, an error message is displayed. |
| Non-functional requirements |  |

### 2.2.5 Use Case 5

| **Use Case Name** | **Review Grades ****&**** Academic Records** |
| --- | --- |
| Actors | Academic Advisor |
| Preconditions | Advisor is logged in. Grades and academic records are stored in the system. |
| Normal Flow | Description | Advisor accesses a student’s academic record section. The system displays course grades, GPA, and academic history. |
|  | Postconditions | Advisor can review complete academic records. |
| Alternative flows and exceptions | If records are incomplete or unavailable, the system notifies the advisor. |
| Non-functional requirements |  |

### 2.2.6 Use Case 6

| **Use Case Name** | **Generate Reports** |
| --- | --- |
| Actors | Academic Advisor |
| Preconditions | Advisor is logged in. Student data is available in the system. |
| Normal Flow | Description | Advisor selects the "Generate Report" option and chooses the report type (progress report or academic summary). The system generates and displays the report. |
|  | Postconditions | Report is generated successfully and available for download or viewing. |
| Alternative flows and exceptions | If data is incomplete, the system notifies the advisor. |

### 2.2.7 Use Case 7

| **Use Case Name** | **Receive notifications** |
| --- | --- |
| Actors | Academic Advisor |
| Preconditions | Academic Advisor is logged in and has at least one student assigned to their cohort. |
| Normal Flow | Description | System detects a triggering event for an assigned student (missed deadline, performance drop below threshold, or flagged as at-risk). System generates a notification and delivers it to the advisor's notification inbox. Advisor sees a notification indicator in the navigation bar. Advisor clicks the notification icon to open the notification panel. Advisor reads the notification and clicks through to the relevant student's profile or progress report. System marks the notification as read. |
|  | Postconditions | Notification is marked as read. Advisor is directed to the relevant student record or performance page. |
| Alternative flows and exceptions | If the advisor does not log in, unread notifications are retained and shown upon next login. If the student record is no longer accessible (e.g. student account deactivated), system notifies the advisor that the record is unavailable. |
| Non-functional requirements | Unread notifications must persist until manually dismissed or read. |

## Actor 3: Admin

### 2.3.1 Use Case 1

| **Use Case Name** | **Login** |
| --- | --- |
| Actors | Admin |
| Preconditions | Admin account is registered and authorized. |
| Normal Flow | Description | Admin enters Username, email and password on the login page. The system verifies the credentials and grants access to the admin dashboard. |
|  | Postconditions | Admin is successfully logged in and redirected to the dashboard. |
| Alternative flows and exceptions | If credentials are incorrect, an error message is displayed. |
| Non-functional requirements |  |

### 2.3.2 Use Case 2

| **Use Case Name** | **Manage Users** |
| --- | --- |
| Actors | Admin |
| Preconditions | Admin is logged in. |
| Normal Flow | Description | Admin views the list of users. Admin can view, add, edit, or inactive user accounts. The system updates user information accordingly. |
|  | Postconditions | User data is updated in the system. |
| Alternative flows and exceptions | If invalid data is entered, the system displays an error message. |
| Non-functional requirements |  |

### 2.3.3 Use Case 3 

| **Use Case Name** | **Manage Courses** |
| --- | --- |
| Actors | Admin |
| Preconditions | Admin is logged in. |
| Normal Flow | Description | Admin creates, edits, or archieve courses. The system saves and updates the course information. |
|  | Postconditions | Course information is updated in the system. |
| Alternative flows and exceptions | If required fields are missing, the system prompts the Admin to complete them. |
| Non-functional requirements |  |

### 2.3.4  Use Case 4

| **Use Case Name** | **View Reports** |
| --- | --- |
| Actors | Admin |
| Preconditions | Admin is logged in. |
| Normal Flow | Description | Admin selects a report (e.g., student enrollment). The system generates and displays the report. |
|  | Postconditions | Report is displayed to the Admin. |
| Alternative flows and exceptions | If no data is available, the system shows an empty report message. |
| Non-functional requirements |  |

### 2.3.5 Use Case 5

| **Use Case Name** | **Manage student enrollments** |
| --- | --- |
| Actors | Admin |
| Preconditions | Admin is logged in. |
| Normal Flow | Description | Admin navigates to the enrollment section. The system displays a list of enrollments submitted by students. Admin views, add, drop and edit student enrollment details. |
|  | Postconditions | Student enrollment status is updated. |
| Alternative flows and exceptions | If no student enrollment is found, the system displays a message indicating that no student enrollment has been found. |
| Non-functional requirements |  |

### 2.3.6 Use Case 6

| **Use Case Name** | **Manage Notification** |
| --- | --- |
| Actors | Admin |
| Preconditions | Admin is logged in. The notification system is active and at least one notification type (announcement, deadline alert, quiz score) is configured in the system. |
| Normal Flow | Description | Admin navigates to the Manage Notification section in the admin dashboard. System displays a list of all existing notifications with status (sent, scheduled, draft). Admin selects an action — create new notification, edit an existing draft, or delete a notification. If creating: Admin fills in the notification title, message body, target audience (all users, specific role, or specific course), and delivery time. Admin clicks Send Now or Schedule for Later. System validates all fields and delivers or queues the notification. System confirms successful send or scheduling and updates the notification list. |
|  | Postconditions | Notification is delivered to the targeted users' notification inbox or saved as a scheduled notification pending delivery at the set time. |
| Alternative flows and exceptions | If required fields (title, message, target audience) are left blank, the system shows a validation error and prevents sending. |
| Non-functional requirements |  |

### 2.3.7 Use Case 7

| **Use Case Name** | **View ****&**** manage user activity logs** |
| --- | --- |
| Actors | Admin |
| Preconditions | Admin is logged in. At least one user has performed a tracked activity. |
| Normal Flow | Description | Admin navigates to the User Activity Logs section in the admin dashboard. System displays a list of all users with their most recent tracked activities. Admin filters logs by user role, date range, or activity type (quizzes taken, videos watched, pages visited). Admin selects a specific user to view their detailed activity history. System displays a full chronological log of that user's learning activities. Admin optionally exports the log as a report. |
|  | Postconditions | Admin has viewed the requested activity logs. If exported, a report file is downloaded to the admin's device. |
| Alternative flows and exceptions | If no activity matches the applied filter, system displays a "No records found" message. If the export fails, system displays an error and prompts the admin to retry. |
| Non-functional requirements |  |

## Actor 4: Instructor

### 2.4.1 Use Case 1

| **Use Case Name** | **Login** |
| --- | --- |
| Actors | Instructor |
| Preconditions | Instructor has a registered account in the system. |
| Normal Flow | Description | 1. Navigates to the login page. 2. Enters registered email and password. 3. System validates credentials. 4. System grants access and redirects instructor to the dashboard. |
|  | Postconditions | Instructor is authenticated and has access to all instructor-specific features. |
| Alternative flows and exceptions | If credentials are incorrect, system shows an error and allows retry. |
| Non-functional requirements | Passwords stored using secure hashing (bcrypt). |

### 2.4.2 Use Case 2

| **Use Case Name** | **Manage Profile** |
| --- | --- |
| Actors | Instructor |
| Preconditions | Instructor is logged in. |
| Normal Flow | Description | 1. Instructor navigates to the Profile section. 2. Instructor views current info (name, specialization, subjects taught, office hours). 3. Instructor edits desired fields and uploads a profile photo if needed. 4. Instructor clicks Save. 5. System validates and updates the profile. |
|  | Postconditions | Instructor profile is updated and changes are reflected immediately across the system. |
| Alternative flows and exceptions | If required fields are blank, system shows a validation error. If uploaded photo exceeds size limit, system rejects it and prompts for a smaller file. |
| Non-functional requirements | Profile photo must not exceed 5MB and must be JPG or PNG format. |

### 2.4.3 Use Case 3

| **Use Case Name** | **Manage Course** |
| --- | --- |
| Actors | Instructor |
| Preconditions | Instructor is logged in and has at least one existing course with at least one module. |
| Normal Flow | Description | Instructor navigates to My Courses. System displays all courses with status (Draft, Published, Archived). Instructor selects an action: **Create** — Fill in course details, add modules and lessons, save as Draft or publish. System saves and notifies students if published. **Edit** — Select course, update desired fields, save. System saves and notifies students if published. ** Archive / Delete **— Select course, confirm prompt. System archives or removes the course. |
|  | Postconditions | Course is created, updated, or archived/deleted in the system. Changes are reflected in the instructor's course management panel. Enrolled students are notified where applicable. |
| Alternative flows and exceptions | If required fields are blank, system shows a validation error and prevents saving. If the instructor publishes a course with no lessons, system blocks publishing and prompts to add content first. |
| Non-functional requirements |  |

### 2.4.4 Use Case 4

| **Use Case Name** | **Upload Learning Materials** |
| --- | --- |
| Actors | Instructor |
| Preconditions | Instructor is logged in and has at least one existing course with at least one module. |
| Normal Flow | Description | 1. Instructor opens a course module and selects Upload Materials. 2. Instructor chooses file type (video, PDF, document, or link). 3. Instructor uploads the file or pastes a video URL. 4. System processes and stores the material, linking it to the selected module. 5. System confirms upload with a success message. |
|  | Postconditions | Learning materials are linked to the module and accessible to enrolled students. |
| Alternative flows and exceptions | If file exceeds size limit, system rejects and notifies instructor. If unsupported format is uploaded, system shows an error and lists accepted formats. |
| Non-functional requirements |  |

### 2.4.5 Use Case 5

| **Use Case Name** | **Create Quiz/Assignment** |
| --- | --- |
| Actors | Instructor |
| Preconditions | Instructor is logged in and has at least one existing course with at least one module. |
| Normal Flow | Description | 1. Navigate to module 2. Select "Add Assessment" 3. Add questions (MCQ, fill-in-the-blank, short answer) 4. Configure time limit, randomization, attempts 5. Add feedback tips 6. Publish quiz 7. System notifies enrolled students. |
|  | Postconditions | Quiz saved and linked to module; students notified, student can attempt it based on configure settings. |
| Alternative flows and exceptions | If no questions are added, system prevents publishing and shows an error. |
| Non-functional requirements | randomization ensures unique question order per student |

### 2.4.6 Use Case 6

| **Use Case Name** | **Configure quiz feedback ****&**** tips** |
| --- | --- |
| Actors | Instructor |
| Preconditions | Instructor is logged in. At least one quiz has been created for a course. |
| Normal Flow | Description | Instructor navigates to the quiz management section and selects a quiz. Instructor selects a question to configure feedback for. Instructor enters the improvement tip to be shown after a student answers incorrectly. Instructor repeats steps 2–4 for remaining questions as needed. Instructor clicks Save Feedback. System saves feedback and tips; they are displayed to students automatically after each quiz attempt. |
|  | Postconditions | Feedback and improvement tips are saved and will be shown to students automatically after each relevant quiz attempt. |
| Alternative flows and exceptions | If the quiz has already been attempted by students, the system warns the instructor that feedback changes will apply to future attempts only. |
| Non-functional requirements | Feedback text must not exceed 500 characters per question. |

### 2.4.7 Use Case 7

| **Use Case Name** | **Grade Assignment** |
| --- | --- |
| Actors | Instructor |
| Preconditions | Instructor is logged in. Instructor has at least one published course with enrolled students. At least one assignment submission exists for the selected course. |
| Normal Flow | Description | Instructor opens the Instructor Dashboard and selects a course. Instructor navigates to the “Assignments” section. System displays a list of assignments with submitted student work. Instructor selects an assignment to grade. System displays student submissions with submission details (student name, submission date, file/content). Instructor reviews the submission. Instructor enters marks and optional feedback/comments. Instructor saves the grade. System updates the student’s grade record and recalculates overall course performance. System notifies the student that grading is completed. |
|  | Postconditions | Student’s assignment is graded and recorded in the system. Grade and feedback are visible to the student. Course performance records are updated. |
| Alternative flows and exceptions | If no submissions are available, system displays a “No submissions found” message. If grading data is invalid (e.g., marks exceed maximum), system prompts instructor to correct input. If saving fails due to system error, system notifies instructor and offers a retry option. |
| Non-functional requirements |  |

### 2.4.8 Use Case 8

| **Use Case Name** | **View Student Progress** |
| --- | --- |
| Actors | Instructor |
| Preconditions | Instructor is logged in and has at least one published course with enrolled students who have completed at least one activity. |
| Normal Flow | Description | 1. Instructor opens the Instructor Dashboard and selects a course. 2. System displays enrolled students with module completion status. 3. Instructor selects a student to view detailed performance: quiz scores, grades, activity logs, time spent. 4. System highlights at-risk students based on low performance. 5. Instructor can export the report as PDF or CSV. |
|  | Postconditions | Instructor has a detailed view of individual and class-wide student progress and can take follow-up actions. |
| Alternative flows and exceptions | If no students have completed any activity, system shows an insufficient data message. If export fails, system notifies instructor and offers a retry. |
| Non-functional requirements | . |

### 2.4.9 Use Case 9

| **Use Case Name** | **View Analytics Dashboard** |
| --- | --- |
| Actors | Instructor |
| Preconditions | Instructor is logged in and has at least one active course with student activity data. |
| Normal Flow | Description | 1. Instructor navigates to the Analytics Dashboard. 2. System displays course-level analytics: engagement charts, average quiz scores, submission rates, and performance distribution. 3. Instructor filters data by course, module, date range 4. System renders visual charts (bar, line, pie) to represent trends. 5. Instructor drills down into specific metrics for deeper analysis. |
|  | Postconditions | Instructor has an overview of course performance and engagement for data-driven decisions. |
| Alternative flows and exceptions | If no data matches the selected filter, system shows an empty state with a prompt to adjust the filter. If charts fail to load, system shows a refresh button. |
| Non-functional requirements |  |

 

### 2.4.10 Use Case 10

| **Use Case Name** | **Receive Notifications** |
| --- | --- |
| Actors | Instructor |
| Preconditions | Instructor is logged in and has at least one active course. |
| Normal Flow | Description | 1. System automatically generates notifications for events (student submissions, assignment deadlines, quiz score releases, new content added). 2. Notifications appear in the instructor's notification panel in real time. 3. Instructor clicks a notification to be redirected to the relevant page. 4. Instructor can mark notifications as read or clear all |
|  | Postconditions | Instructor is kept informed of all relevant course activity. Read notifications are marked accordingly. |
| Alternative flows and exceptions | If instructor has no active courses, notification panel shows no new notifications. If a notification fails to deliver, system retries automatically. |
| Non-functional requirements |  |

	

# Data Design

## Design Class Diagram

### 3.1.1 Data Dictionary

| **Table Name** | **Field Name** | **Data Type** | **Length** | **PK/FK** | **Required** | **Null/Not Null** | **Description** |
| --- | --- | --- | --- | --- | --- | --- | --- |
| **user** | user_id | INT | Auto increment | PK | Yes | Not Null | Unique identifier for each user. |
|  | username | VARCHAR | 100 |  | Yes | Not Null | Unique username for login purposes. |
|  | email | VARCHAR | 150 |  | Yes | Not Null | Unique email address used for authentication. |
|  | password_hash | VARCHAR | 255 |  | Yes | Not Null | Encrypted password stored using a secure hashing algorithm. |
|  | role | ENUM('student','instructor','advisor','admin') | - |  | Yes | Not Null | Role of the user. |
|  | department | VARCHAR | 100 |  | No | Null | Department the user belongs to. |
|  | photo_url | VARCHAR | 255 |  | No | Null | URL or file path to the user's profile photo. |
|  | phone_number | VARCHAR | 20 |  | No | Null | Contact phone number of the user. |
|  | status | ENUM('active','inactive','suspended') | - |  | Yes | Not Null | Account status. |
|  | created_at | TIMESTAMP | - |  | Yes | Not Null | Timestamp when the user account was created. |
| **student_profile** | user_id | INT | - | PK, FK → user(user_id) | Yes | Not Null | References the user this profile belongs to. |
|  | academic_level | VARCHAR | 50 |  | No | Null | Academic level of the student. |
|  | programme | VARCHAR | 100 |  | No | Null | Programme the student is enrolled in. |
|  | learning_preferences | TEXT | - |  | No | Null | Student's preferred learning style. |
|  | advisor_id | INT | - | FK → user(user_id) | No | Null | References the assigned academic advisor. |
|  | gpa | DECIMAL | 3,2 |  | Yes | Not Null | Student's current GPA. |
|  | is_at_risk | BOOLEAN | - |  | Yes | Not Null | Flag indicating if the student is academically at risk. |
| **instructor_profile** | user_id | INT | - | PK, FK → user(user_id) | Yes | Not Null | References the user this profile belongs to. |
|  | specialization | VARCHAR | 150 |  | No | Null | Area of specialization of the instructor. |
|  | subjects_taught | TEXT | - |  | No | Null | List of subjects taught by the instructor. |
|  | office_hours | VARCHAR | 255 |  | No | Null | Scheduled office hours of the instructor. |
| **course** | course_id | INT | Auto increment | PK | Yes | Not Null | Unique identifier for each course. |
|  | instructor_id | INT | - | FK → user(user_id) | Yes | Not Null | References the instructor who created the course. |
|  | title | VARCHAR | 200 |  | Yes | Not Null | Title of the course. |
|  | description | TEXT | - |  | No | Null | Detailed description of the course. |
|  | status | ENUM('draft','published','archived') | - |  | Yes | Not Null | Course state. |
|  | created_at | TIMESTAMP | - |  | Yes | Not Null | Timestamp when the course was created. |
| **enrollment** | enrollment_id | INT | Auto increment | PK | Yes | Not Null | Unique identifier for each enrolment record. |
|  | user_id | INT | - | FK → user(user_id) | Yes | Not Null | References the student who enrolled. |
|  | course_id | INT | - | FK → course(course_id) | Yes | Not Null | References the course the student enrolled in. |
|  | enrolled_at | TIMESTAMP | - |  | Yes | Not Null | Timestamp when the student enrolled. |
|  | status | ENUM('active','completed','dropped','suspended') | - |  | Yes | Not Null | Enrollment status. |
|  | completion_percent | DECIMAL | 5,2 |  | Yes | Not Null | Overall completion percentage in the course. |
|  | completed_at | TIMESTAMP | - |  | No | Null | Timestamp when the student completed the course. |
| **module** | module_id | INT | Auto increment | PK | Yes | Not Null | Unique identifier for each module. |
|  | course_id | INT | - | FK → course(course_id) | Yes | Not Null | References the course this module belongs to. |
|  | title | VARCHAR | 200 |  | Yes | Not Null | Title of the module. |
|  | description | TEXT | - |  | No | Null | Description of the module content. |
|  | sort_order | INT | - |  | Yes | Not Null | Display order of this module within the course. |
| **lesson** | lesson_id | INT | Auto increment | PK | Yes | Not Null | Unique identifier for each lesson. |
|  | module_id | INT | - | FK → module(module_id) | Yes | Not Null | References the module this lesson belongs to. |
|  | title | VARCHAR | 200 |  | Yes | Not Null | Title of the lesson. |
|  | content_type | ENUM('video','text','pdf','other') | - |  | Yes | Not Null | Type of lesson content. |
|  | content_url | VARCHAR | 500 |  | No | Null | URL to the lesson content file. |
|  | content_text | LONGTEXT | - |  | No | Null | Inline text content of the lesson. |
|  | sort_order | INT | - |  | Yes | Not Null | Display order within the module. |
|  | duration_minutes | INT | - |  | No | Null | Estimated duration of the lesson in minutes. |
|  | status | ENUM('draft','published','archived') | - |  | Yes | Not Null | Lesson status. |
| **quiz** | quiz_id | INT | Auto increment | PK | Yes | Not Null | Unique identifier for each quiz. |
|  | course_id | INT | - | FK → course(course_id) | Yes | Not Null | References the course this quiz belongs to. |
|  | module_id | INT | - | FK → module(module_id) | No | Null | References the module this quiz belongs to. |
|  | created_by | INT | - | FK → user(user_id) | Yes | Not Null | References the instructor who created the quiz. |
|  | title | VARCHAR | 200 |  | Yes | Not Null | Title of the quiz. |
|  | description | TEXT | - |  | No | Null | Description or instructions for the quiz. |
|  | status | ENUM('draft','published','archived') | - |  | Yes | Not Null | Quiz state. |
|  | due_date | DATETIME | - |  | No | Null | Deadline for quiz submission. |
|  | time_limit_minutes | INT | - |  | No | Null | Time allowed to complete the quiz, in minutes. |
|  | max_attempts | INT | - |  | Yes | Not Null | Maximum number of attempts allowed. |
|  | randomize_questions | BOOLEAN | - |  | Yes | Not Null | Whether questions are randomised for each attempt. |
|  | num_questions_per_attempt | INT | - |  | No | Null | Number of questions shown per attempt. |
|  | submission_type | ENUM('online_quiz','file_upload','mixed') | - |  | Yes | Not Null | Submission type. |
|  | created_at | TIMESTAMP | - |  | Yes | Not Null | Timestamp when the quiz was created. |
| **question** | question_id | INT | Auto increment | PK | Yes | Not Null | Unique identifier for each question. |
|  | quiz_id | INT | - | FK → quiz(quiz_id) | Yes | Not Null | References the quiz this question belongs to. |
|  | question_type | ENUM('mcq','fill_blank','short_answer') | - |  | Yes | Not Null | Type of question. |
|  | question_text | TEXT | - |  | Yes | Not Null | The text of the question. |
|  | options | JSON | - |  | No | Null | Answer options for MCQ questions. |
|  | correct_answer | TEXT | - |  | Yes | Not Null | The correct answer for auto-grading. |
|  | points | INT | - |  | Yes | Not Null | Points awarded for a correct answer. |
|  | improvement_tip | TEXT | - |  | No | Null | Tip shown when the student answers incorrectly. |
|  | sort_order | INT | - |  | Yes | Not Null | Display order of the question within the quiz. |
| **quiz_attempt** | quiz_attempt_id | INT | Auto increment | PK | Yes | Not Null | Unique identifier for each quiz attempt. |
|  | quiz_id | INT | - | FK → quiz(quiz_id) | Yes | Not Null | References the quiz being attempted. |
|  | user_id | INT | - | FK → user(user_id) | Yes | Not Null | References the student who made the attempt. |
|  | start_time | DATETIME | - |  | Yes | Not Null | Timestamp when the attempt started. |
|  | end_time | DATETIME | - |  | No | Null | Timestamp when the attempt ended. |
|  | score | DECIMAL | 6,2 |  | No | Null | Score achieved in the attempt. |
|  | attempt_number | INT | - |  | Yes | Not Null | Attempt sequence number for the student-quiz pair. |
|  | status | ENUM('in_progress','submitted','graded','expired') | - |  | Yes | Not Null | Attempt status. |
|  | created_at | TIMESTAMP | - |  | Yes | Not Null | Timestamp when the attempt record was created. |
| **answer** | answer_id | INT | Auto increment | PK | Yes | Not Null | Unique identifier for each answer record. |
|  | quiz_attempt_id | INT | - | FK → quiz_attempt(quiz_attempt_id) | Yes | Not Null | References the quiz attempt this answer belongs to. |
|  | question_id | INT | - | FK → question(question_id) | Yes | Not Null | References the question being answered. |
|  | user_answer | TEXT | - |  | No | Null | The answer submitted by the student. |
|  | is_correct | BOOLEAN | - |  | No | Null | Whether the answer is correct. |
|  | score_awarded | DECIMAL | 6,2 |  | No | Null | Points awarded for this answer. |
|  | feedback | TEXT | - |  | No | Null | Feedback message shown to the student. |
|  | file_url | VARCHAR | 500 |  | No | Null | URL to uploaded file for file-based submissions. |
|  | graded_by_user_id | INT | - | FK → user(user_id) | No | Null | References the instructor who manually graded the answer. |
| **module_progress** | user_id | INT | - | PK, FK → user(user_id) | Yes | Not Null | References the student being tracked. |
|  | module_id | INT | - | PK, FK → module(module_id) | Yes | Not Null | References the module being tracked. |
|  | status | ENUM('not_started','in_progress','completed') | - |  | Yes | Not Null | Progress status. |
|  | completion_percentage | DECIMAL | 5,2 |  | Yes | Not Null | Percentage of module completion. |
|  | last_accessed | DATETIME | - |  | No | Null | Timestamp of the student's most recent access. |
|  | completed_at | DATETIME | - |  | No | Null | Timestamp when the student completed the module. |
| **activity_log** | activity_log_id | INT | Auto increment | PK | Yes | Not Null | Unique identifier for each activity log record. |
|  | user_id | INT | - | FK → user(user_id) | Yes | Not Null | References the user who performed the activity. |
|  | activity_type | VARCHAR | 100 |  | Yes | Not Null | Type of activity. |
|  | description | TEXT | - |  | No | Null | Brief description of the activity. |
|  | related_item_type | VARCHAR | 100 |  | No | Null | Type of item related to the activity. |
|  | related_item_id | INT | - |  | No | Null | Identifier of the related item. |
|  | created_at | TIMESTAMP | - |  | Yes | Not Null | Timestamp when the activity was performed. |
| **notification** | notification_id | INT | Auto increment | PK | Yes | Not Null | Unique identifier for each notification. |
|  | user_id | INT | - | FK → user(user_id) | Yes | Not Null | References the user who receives the notification. |
|  | title | VARCHAR | 200 |  | Yes | Not Null | Title or subject of the notification. |
|  | message | TEXT | - |  | Yes | Not Null | Full message content of the notification. |
|  | type | VARCHAR | 100 |  | Yes | Not Null | Notification type. |
|  | is_read | BOOLEAN | - |  | Yes | Not Null | Whether the user has read the notification. |
|  | related_item_type | VARCHAR | 100 |  | No | Null | Type of item that triggered the notification. |
|  | related_item_id | INT | - |  | No | Null | Identifier of the item that triggered the notification. |
|  | target_role | ENUM('student','instructor','advisor','admin') | - |  | No | Null | Role targeted by the notification. |
|  | scheduled_at | DATETIME | - |  | No | Null | Scheduled send time. |
|  | created_at | TIMESTAMP | - |  | Yes | Not Null | Timestamp when the notification was created. |
| **quiz_feedback** | quiz_feedback_id | INT | Auto increment | PK | Yes | Not Null | Unique identifier for each quiz feedback record. |
|  | quiz_id | INT | - | FK → quiz(quiz_id) | Yes | Not Null | References the quiz this feedback belongs to. |
|  | min_score | DECIMAL | 5,2 |  | Yes | Not Null | Minimum score percentage that triggers the feedback. |
|  | max_score | DECIMAL | 5,2 |  | Yes | Not Null | Maximum score percentage that triggers the feedback. |
|  | feedback_message | TEXT | - |  | Yes | Not Null | Feedback message shown to the student. |

## Data Structures

### Data Structure 1

| **Data Structure** | **Table** | **Reason** |
| --- | --- | --- |
| HashMap | user / student_profile / instructor_profile | Used for fast retrieval of user data using user_id. Supports authentication, role-based access (student, instructor, advisor, admin), and quick profile loading. |
| HashMap | course | Enables fast lookup of course details using course_id. Important for course management, instructor dashboard, and status updates (draft, published, archived). |
| HashMap | module | Provides efficient access to module data using module_id, supporting course structure management and lesson organization. |
| HashMap | lesson | Allows quick retrieval of lesson content using lesson_id, supporting content rendering and learning navigation. |
| HashMap | quiz | Used for fast access to quizzes using quiz_id, supporting quiz creation, publishing, validation, and linking to modules. |
| HashMap | question | Enables efficient lookup of questions using question_id, supporting quiz generation, grading, and auto-marking. |
| HashMap | quiz_attempt | Stores and retrieves quiz attempt records using quiz_attempt_id, supporting grading, tracking, and analytics. |
| HashMap | notification | Enables fast retrieval of notifications using user_id, supporting real-time updates for submissions, deadlines, and quiz results. |
| HashMap | activity_log | Stores user activities indexed by user_id, supporting tracking of actions like quiz attempts, lesson views, and system usage. |

### Data Structure 2

*<**TO DO: Describe the data structure and place the table with the details here.**>*

| **Data Structure** | **Table** | **Reason** |
| --- | --- | --- |
| ArrayList | course → module → lesson structure | Maintains ordered learning flow. Supports sequential navigation of course content and dynamic insertion of modules and lessons. |
| ArrayList | quiz questions | Stores questions in order within a quiz. Supports sequential display and optional randomization during quiz attempts. |
| ArrayList | quiz_attempt history | Keeps multiple attempts per student in sequence for performance tracking and grading history. |
| ArrayList | answer | Stores student answers in order for each quiz attempt, supporting grading and feedback generation. |
| ArrayList | module_progress | Tracks student progress across modules in sequence, supporting completion percentage and progress reports. |
| ArrayList | activity_log (chronological view) | Maintains ordered history of user actions for analytics, reporting, and behavior tracking. |

# Behavioral Modeling

## Sequence Diagrams

### Use Case 1

This sequence diagram outlines the student login process. The student enters their email and password, which are forwarded to the Auth Service. The Auth Service passes the credentials to the System for validation, which then queries the Database to retrieve the user record. The Database returns the user data to the System, which sends the authentication result back to the Auth Service. If the credentials are valid, the Auth Service redirects the student to their dashboard. If the credentials are invalid, an error message is displayed and the student may retry. Finally, the student's login activity is logged to the System.

### Use Case 2

This sequence diagram outlines the student profile update process. The student navigates to the Profile section, and the Profile UI displays the current profile information. The student edits their fields or uploads a photo, then clicks Save. The Profile UI forwards the input to the System for validation. If validation passes, the System updates the profile in the Database, and the Database confirms the save back to the System, which notifies the Profile UI of a successful update. If validation fails, the System returns a validation error to the Profile UI, which displays the error to the student. Once the update is completed successfully, a profile updated successfully message is returned to the student.

### Use Case 3

This sequence diagram outlines the student course enrollment process. The student browses the course catalogue, and the Course UI displays the available courses. The student selects a course and clicks Enroll, which triggers the Course UI to check course availability with the System. If the course is available, the System records the enrollment in the Database, and the Database confirms the enrollment back to the System. If the course is full or not open, the System notifies the student and offers a waitlist option. If enrollment is successful, the course is added to the student's dashboard.

### Use Case 4

This sequence diagram outlines the student lesson access process. The student navigates to an enrolled course, and the Course UI displays the available course modules. The student selects a module and lesson, prompting the Course UI to request the lesson content from the System. The System forwards the request to the Content service, which fetches the content or video and returns it to the System. The System then renders the lesson or video on the Course UI. If the content loads successfully, the student views the lesson. If the video fails to load, an error is shown and a retry is suggested. Once the lesson is completed, the System updates the lesson completion status in the Database.

### Use Case 5

This sequence diagram outlines the student quiz attempt process. The student opens a quiz, and the System validates the quiz status with the Quiz Engine. The Quiz Engine fetches the questions from the Database, which returns the question data. The Quiz Engine sends randomised questions to the System, which displays the quiz along with a timer to the student. The student submits their answers, and the System forwards the submission to the Quiz Engine for auto-grading. The Quiz Engine saves the score and answers to the Database, which confirms the save. The Quiz Engine then returns the score and feedback tips to the System, which displays the results to the student. Finally, the System updates the progress tracker in the Database. If the timer expires before submission, the quiz is auto-submitted.

### Use Case 6

This sequence diagram outlines the student assignment submission process. The student opens the assignment page, and the System displays the submission form. The student uploads a file along with a text note, and the System stores the file on the File Server, which returns a file URL. The System then validates the file format and size with the File Server, which confirms validation. The System records the submission with a timestamp and notifies the instructor via the Notification Service, which confirms the instructor has been notified. The System then sends a confirmation with a status of "Submitted" to the student. If the file is too large, an error message is displayed and the Submit button is disabled.

### Use Case 7

This sequence diagram outlines the student progress dashboard loading process. The student navigates to the dashboard, and the System requests progress data from the Analytics Engine. The Analytics Engine fetches enrollments and modules from the Database, which returns the module and completion data. The Analytics Engine then fetches quiz scores and grades from the Database, which returns the scores and assignment data. The Analytics Engine computes the analytics and recommendations and returns them to the System, which renders the progress bars and charts and displays the recommended next steps to the student. If no activity record exists yet, a "Getting Started" guide is displayed to the student instead.

### Use Case 8

This sequence diagram outlines the student grade viewing process. The student navigates to the Grades section, and the System fetches graded items from the Database, which returns a list of quiz and assignment grades. The System displays the grade list to the student. When the student clicks on a specific graded item, the System requests detailed feedback from the Grade Service. The Grade Service queries the feedback record from the Database, which returns the feedback and score data. The Grade Service sends a detailed grade breakdown back to the System, which displays the score, breakdown, and feedback to the student. If the assignment has not yet been graded, a "Pending" status along with an estimated review time is shown to the student instead.

### Use Case 9

This sequence diagram outlines the student notification process. The System detects a trigger event such as a deadline, new content, or a released score, and creates a notification by sending it to the Notification Service. The Notification Service saves the notification record to the Database, which returns the saved notification ID. The Notification Service then delivers the notification to the student's inbox, and the System displays a notification badge to the student. When the student clicks the notification icon, the System opens the notification panel. The student clicks on a notification item, and the System redirects them to the relevant page. The System then marks the notification as read in the Database, which confirms the update. If the student is not yet logged in, the unread notification is retained and displayed upon their next login. If the linked content has been removed, a "Content unavailable" message is shown to the student instead.

### 4.1.10 Use case 1

- This sequence diagram outlines the login process for an Academic Advisor. The Academic Advisor opens the login page by sending a request to the Login Page, which displays the login page back to the advisor. The advisor then enters their email and password, and the Login Page submits the credentials to the System. The System proceeds to verify the credentials internally through a self-call.

- If the credentials are valid, the System grants access to the Advisor Dashboard, which redirects the advisor to the advisor dashboard, completing a successful login. If the credentials are invalid, the System returns an error message to the Login Page, which then displays the error message to the Academic Advisor, prompting them to try again.

### 4.1.11 Use Case 2

- This sequence diagram outlines the profile management process for an Academic Advisor. The advisor navigates to the Profile Section, which displays the current profile information. The advisor then edits the fields and/or uploads a profile photo before clicking Save. The Profile Section submits the updated profile data to the System.

- If the data is valid and the photo is within the size limit, the System validates the data and sends an update request to the Database, which updates the profile record. A confirmation is returned to the advisor. If the required fields are blank, or the photo exceeds 5MB or is in an invalid format, the System returns a validation or size error message to the advisor. Once successfully updated, the new information is reflected across the system. A constraint note specifies that profile photos must be 5MB or less and in JPG or PNG format only.

### 4.1.12 Use Case 3

- This sequence diagram outlines the process by which an Academic Advisor views a student's profile. The advisor selects the "Student Profiles" option from the Advisor Dashboard, which requests the assigned student list from the System. The System then queries the Database for the assigned students.

- If students are assigned, the Database returns the student list, and the dashboard displays it to the advisor. The advisor selects a student, and the System fetches the selected student's profile from the Database, which returns the profile data. The detailed student profile is then displayed to the advisor. If no students are assigned, the System returns a "No students assigned" message to the advisor instead.

### 4.1.13 Use Case 4

- This sequence diagram outlines the process of monitoring a student's academic progress. The Academic Advisor selects a student from the Advisor Dashboard, which requests the student's progress data from the System. The System then queries the Database for academic data including GPA and completed courses.

- If the student's academic data is available, the Database returns the data to the System, which then generates performance analytics internally. The progress indicators and analytics are displayed to the advisor. If the student data is unavailable, the Database returns an error indicating that data is unavailable, and the System displays an error message to the advisor.

### 4.1.14 Use Case 5

- This sequence diagram outlines the process of reviewing a student's grades and academic records. The Academic Advisor accesses the student academic record section from the Advisor Dashboard, which requests the academic records from the System. The System queries the Database for grades, GPA, and academic history.

- If the records are complete and available, the Database returns the course grades, GPA, and academic history. The dashboard displays the complete academic records to the advisor, who then reviews the course grades, GPA, and academic history. If the records are incomplete or unavailable, the Database returns an incomplete or unavailable record status, and the System notifies the advisor accordingly.

### 4.1.15 Use Case 6

- This sequence diagram outlines the report generation process for an Academic Advisor. The advisor selects the "Generate Report" option from the Advisor Dashboard and chooses a report type, either a progress report or an academic summary. The dashboard submits the report generation request to the System, which queries the Database for the required student data.

- If the student data is complete, the Database returns the data, and the System generates the report internally. The completed report is then displayed to the advisor, available for download or viewing. If the data is incomplete, the Database returns an incomplete data status, and the System notifies the advisor that the data is incomplete.

- 4.1.16 Use case 7

This sequence diagram outlines the notification process for an Academic Advisor. The System detects a triggering event such as a missed deadline, performance drop, or a flagged at-risk student, and sends the notification to the Notification Service, which stores the record in the Database. The Database confirms the storage, and the Notification Service delivers the notification to the advisor's inbox. The Navigation Bar then shows a notification indicator to the advisor.

The advisor clicks the notification icon to open the notification panel and clicks through to a student profile or progress report. The System marks the notification as read in the Database and redirects the advisor to the relevant student record or performance page. If the advisor does not log in, unread notifications are retained and displayed upon their next login. If the student account has been deactivated, the advisor is notified that the student record is unavailable. A constraint note specifies that unread notifications must persist until manually dismissed or read.

### 4.1.16 Use Case 1

This sequence diagram outlines the instructor login process. The instructor opens the login page, which displays the login form. The instructor submits their email and password, which are forwarded from the LoginPage to the AuthController, then passed to the AuthService for credential validation. The AuthService queries the Database to retrieve the user record by email and verifies the password using bcrypt hashing. If the credentials are valid, an authentication token is returned to the AuthController, which notifies the LoginPage of a successful login and redirects the instructor to their dashboard. If the credentials are invalid, an authentication error is returned through the same chain, and the LoginPage displays an error message while allowing the instructor to retry.

###  4.1.17 Use Case 2

This sequence diagram outlines the instructor manage profile process. The instructor navigates to the Profile section, and the ProfilePage loads and displays the current profile information including name, specialization, subjects taught, and office hours. The instructor edits the desired fields and optionally uploads a profile photo. If a photo is uploaded and it exceeds 5MB or has an invalid format, the ProfilePage forwards it to the ProfileController for validation, which returns a photo error, and the ProfilePage displays the error and prompts the instructor to retry. If no photo is uploaded or the photo is valid, the instructor clicks Save, and the ProfilePage sends the profile data to the ProfileController, which forwards it to the ProfileService for validation and saving. If any required fields are blank, a validation error is returned through the chain and displayed to the instructor. If all required fields are filled, the ProfileService updates the record in the Database, which confirms the update, and a success response is returned back to the instructor with the changes reflected immediately across the system.

### 4.1.18 Use Case 3

Here is the description for the **Instructor Manage Course (Use Case 3)** sequence diagram:

This sequence diagram outlines the instructor manage course process. The instructor navigates to My Courses, and the CoursePage displays all existing courses with their statuses (Draft, Published, or Archived). The instructor selects an action, and the flow branches into three alternatives. For the Create action, the instructor fills in the course details including title, modules, and lessons, then saves the course. The CoursePage forwards the data to the CourseController, which passes it to the CourseService for processing. If required fields are blank, a validation error is returned and displayed to the instructor. If all required fields are filled, a further check is performed  if the instructor attempts to publish a course with no lessons, the system blocks publishing and prompts the instructor to add content first. If the course is saved as Draft or has lessons, the CourseService saves it to the Database, optionally notifies enrolled students if published, and a success message is returned to the instructor. For the Edit action, the instructor selects a course and submits updated data, which is processed through the CourseController and CourseService to update the record in the Database, and the instructor is notified of the successful update. For the Archive or Delete action, the instructor selects a course and confirms the prompt, which triggers the CourseService to remove or archive the record in the Database, and the CoursePage displays the removal to the instructor.

### 4.1.19 Use Case 4

This sequence diagram outlines the instructor upload learning materials process. The instructor opens the upload page for a specific module, and the UploadPage loads and is displayed. The instructor selects the file type (video, PDF, document, or link) and either uploads a file or pastes a video URL. The UploadPage submits the file along with the module ID to the UploadController, which forwards it to the UploadService for validation. If the file has an invalid format or exceeds the size limit, the UploadService returns a file invalid error with the reason back through the UploadController to the UploadPage, which displays the error message and lists the accepted formats to the instructor. If the file is valid, the UploadService processes and stores the material linked to the specified module in the Database. The Database confirms the material has been stored, and a success response is passed back through the UploadService and UploadController to the UploadPage, which displays a confirmation of the successful upload to the instructor.

### 4.1.19 Use Case 5

This sequence diagram outlines the instructor's workflow for creating and publishing a quiz or assignment. The instructor navigates to a module, selects to add an assessment, and is presented with a form; they then add questions, configure quiz settings, and attach feedback tips — each step relayed through the AssessmentUI to the QuizController for temporary storage. Upon publishing, if questions have been added, the quiz data flows through the QuizService to the Database via an INSERT operation, which returns a quizId; the QuizController then triggers the NotificationService to alert all enrolled students, before relaying a success confirmation back to the instructor. Conversely, if no questions were added and the instructor attempts to publish, the QuizController's validation blocks the action and propagates an error back through the UI, preventing publication until the quiz is properly populated.

### 4.1.20 Use Case 6

This sequence diagram outlines the instructor's workflow for configuring quiz feedback and tips. The instructor navigates to the Quiz Management UI and selects a quiz, upon which the FeedbackController queries the Database to check the attempt count; if students have already attempted the quiz, a warning is surfaced indicating that changes will only apply to future attempts, while an unattempted quiz proceeds directly to the feedback form. Within a loop for each question to be configured, the instructor selects a question loading its data from the FeedbackController  then enters a feedback tip of up to 500 characters, which is stored temporarily per question before the form advances to the next. Once all tips are entered, the instructor saves, triggering a chain through the FeedbackController and QuizService to perform an UPDATE on the quiz_feedback table in the Database; a success confirmation then propagates back through the UI to notify the instructor that the feedback has been saved.

### 4.1.21 Use Case 7

This sequence diagram outlines the instructor's workflow for grading a student assignment. The instructor opens the course dashboard and navigates to the assignments section, prompting the AssignmentController to fetch the submission list from the Database; if no submissions exist, a message is displayed accordingly, while available submissions are listed for selection. Upon choosing an assignment, its full details including student name, submission date, and file content  are retrieved and displayed for review. The instructor then enters marks and comments, which the AssignmentController validates; invalid grading data prompts a correction notice, whereas valid data enables the save button and proceeds to persist the grade. On saving, if a system error occurs during the Database UPDATE, a failure is propagated back through the GradingService and displayed to the instructor with a retry option; if successful, the grade record is updated, the student is notified, and a confirmation of the saved grade is returned to the instructor.

### 4.1.22 Use Case 8

This sequence diagram outlines the instructor's workflow for viewing and exporting student progress. The instructor opens the dashboard, triggering a chain of calls through the ProgressController and ProgressService to query student activity from the Database. If no students have completed any activity, an insufficient data message is propagated back and displayed; otherwise, the retrieved student list is rendered and the instructor may select an individual student to view detailed records including quiz scores, grades, activity logs, and time spent with at-risk students highlighted accordingly. For the export flow, the instructor may choose to export a report, upon which the system generates and fetches the report data; a failed export surfaces an error with a retry option, while a successful one delivers the file as a download, and opting out of export simply retains the progress view on screen.

### 4.1.23 Use Case 9

This sequence diagram outlines the analytics dashboard viewing process for an instructor. Upon navigating to the dashboard, the system loads course analytics by querying the Database through the AnalyticsController and AnalyticsService, returning charts, scores, and rates for display. The instructor can then apply filters by course, module, or date range, which triggers a filtered database query; if no data matches the filter, an empty state is shown with a prompt to adjust the filter, while matching data is returned and passed to the dashboard for chart rendering. Should the charts fail to load, an error is reported and a refresh button is presented; on successful rendering, the instructor can drill down into a specific metric, prompting a detailed query to the Database and returning the metric detail for display.

### 4.1.24 Use Case 10

This sequence diagram outlines the notification receiving process for an instructor. The system generates and stores a notification via the NotificationService and Database, then attempts delivery through the NotificationController; if delivery fails, a retry is triggered, while successful delivery pushes the notification to the NotificationPanel. Depending on whether the instructor has active courses, the panel either shows a "no new notifications" message or displays the notification for interaction. Upon clicking, the system retrieves a redirect URL from the Database and navigates the instructor to the relevant page. Finally, the instructor can mark the notification as read or clear it, prompting a status update that propagates through the controller, service, and database, with the updated status reflected back on the panel.

### 4.1.25 Use Case 1

- This sequence diagram illustrates the admin login process. The admin navigates to the login page, and the Login UI displays the login form. The admin enters their username, email, and password and submits the form. The Login UI forwards the credentials to the Database for verification. Upon receiving the result, if authentication is successful, the admin is redirected to the admin dashboard. If the credentials are incorrect, an error message is displayed on the Login UI.

### 4.1.26 Use Case 2

- This sequence diagram outlines the admin user management process. The admin navigates to the user management section, and the UI displays the current list of users. The admin selects an action — adding, editing, or deactivating an account. If adding or editing, the UI sends the updated user data to the Database and receives a confirmation. If deactivating, the user's status is updated to inactive in the Database. If invalid data is entered, the UI displays a validation error. Upon successful completion, the user list is refreshed and displayed to the admin.

### 4.1.27 Use Case 3This sequence diagram describes the course management process for the admin. The admin navigates to the course management section, where the UI displays the existing course list. The admin selects an action — creating a new course, editing an existing one, or archiving a course. For create or edit actions, the updated course information is saved to the Database and a confirmation is returned. For archiving, the course status is updated in the Database. If required fields are missing, the UI prompts the admin to complete them before proceeding. On success, the updated course list is refreshed and displayed.

### 4.1.28 Use Case 4

- This sequence diagram outlines the admin report viewing process. The admin navigates to the Reports section, and the Reports UI displays the available report types. The admin selects a report type and time period, prompting the UI to query the Database accordingly. If data is found, the queried data is returned and the report is generated and displayed. If no data is available, an empty report message is shown. The admin can then save the report, which is stored back in the Database.

### 4.1.29 Use Case 5

- This sequence diagram describes the admin enrollment management process. The admin navigates to the enrollment section, and the Enrollment UI fetches and displays the list of current enrollments from the Database. The admin selects an action — adding, editing, or dropping an enrollment. For add or edit actions, the enrollment data is updated in the Database and confirmed. For drop actions, the enrollment is removed from the Database. If no enrollment is found matching the search, a corresponding message is displayed. Upon completion, the enrollment status is refreshed for the admin.

### 4.1.30 Use Case 6

- This sequence diagram outlines the admin notification management process. The admin navigates to the Manage Notifications section, and the Notification UI displays the existing notifications along with their statuses (sent, scheduled, or draft). The admin selects an action such as creating, editing, or deleting a notification. When creating, the admin fills in the title, message body, target audience, and delivery time. The Notification UI validates the fields and forwards the request to the Notification System, which stores the notification in the Database and confirms delivery or scheduling. If any required fields are left blank, a validation error is displayed. On success, the notification list is updated and shown to the admin.

### 4.1.31 Use Case 7

- This sequence diagram describes the admin activity log management process. The admin navigates to the User Activity Logs section, and the Activity Log UI fetches all user activity data from the Database, displaying it as a list of users with their most recent tracked activities. The admin applies filters by user role, date range, or activity type, and the UI queries the Database accordingly. If matching logs are found, the filtered results are displayed. If no records match the filter, a "no records found" message is shown. The admin can also request a log export, which triggers the Database to generate a report file that is then downloaded to the admin's device.

## State Diagram

The State Transition Diagram for the Smart Interactive Learning System models the dynamic behaviour of the system across 11 functional modules, illustrating how each module transitions between states in response to user actions and system events. The diagram uses solid arrows for internal transitions within a module and dashed arrows for cross-module interactions, of which there are 18 in total.

The top row covers the core user-facing workflows. The Authentication module governs the login lifecycle, including credential validation, account locking after maximum failed attempts, and a 5-minute timeout before unlock. The Profile Management module handles the edit-validate-update cycle, looping back on validation errors. Course Enrollment tracks a student from browsing the catalogue through to enrollment, handling the duplicate enrollment case. Lesson Access models content loading, viewing, and completion, with an error-retry path for failed loads. The Quiz module captures the full attempt lifecycle including disconnection recovery and auto-submission on timeout. The Assignment module handles file upload, review, submission, deadline enforcement, and instructor grading.

The bottom row covers supporting system functions. Progress Tracking aggregates student activity from first interaction through to course completion. Grade and Feedback tracks grades from pending through to student acknowledgement. The Notification module manages delivery states from generated through to read, handling offline users. Course Management covers the content lifecycle from draft to published, archived, or deleted. The User Account module manages admin-controlled account states including activation and deactivation. Report Generation models the select-generate-ready cycle with a no-data fallback.

The 18 cross-module interactions are a key design feature of the diagram, demonstrating how the modules are deeply interconnected. Notable linkages include: a successful login triggering profile access and catalogue browsing; course enrollment unlocking lesson access; lesson completion unlocking quizzes and updating progress tracking; quiz and assignment grading feeding into both the grade and feedback module and the notification system; and report generation informing user account management. These interactions reflect the system's integrated, event-driven architecture where activity in one module automatically propagates state changes across others.

# Architecture Design

## Software Architecture

The Smart Interactive Learning System (SILS) is a web-based platform designed using a component-based architecture. The system is organized into four major subsystems, each corresponding to a primary user role: Student Management, Instructor Management, Academic Advisor Management, and Administrative Management. All four subsystems connect to the central Smart Interactive Learning System component, which serves as the integration hub of the entire platform.

The system is divided among team members as follows: 

- Student Management is assigned to WONG YIK SIANG

- Instructor Management is assigned to KO JIA HUI

- Academic Advisor Management is assigned to CHAN JIA SHENG

- Administrative Management is assigned to TEE BING ZHE.

### Subsystem 1-Student

The Student Management subsystem handles all functionality for student users. It consists of nine components: Login authenticates the student and redirects to the personalised dashboard; Manage Profile allows the student to update personal and academic information; Enroll Course enables the student to browse and register for available courses; Access Lessons provides access to lesson materials and embedded video content within enrolled courses; Take Quiz presents auto-graded quizzes with randomised questions and instant feedback; Submit Assignment allows the student to upload and submit assignment files before the deadline; Track Progress displays module completion status, quiz scores, and overall performance analytics; View Grades shows graded quiz and assignment results together with instructor feedback; and Receive Notifications delivers alerts on upcoming deadlines, newly uploaded content, and grade releases.

### Subsystem 2-Instructor

The Instructor Management subsystem provides instructors with all tools needed to create, manage, and deliver course content. It consists of nine components: Login authenticates the instructor and grants access to the instructor dashboard; Manage Profile allows the instructor to update professional information; Manage Course enables creation, editing, publishing, and archiving of courses; Upload Materials supports uploading of lesson files such as PDFs, videos, and documents into course modules; Create Quiz provides a quiz builder supporting MCQ, fill-in-the-blank, and short-answer question types; Grade Assignment allows the instructor to review student submissions and enter marks with written feedback; View Student Progress displays per-student completion rates, quiz scores, and at-risk flags; Analytics Dashboard shows course-level engagement charts, submission rates, and performance distributions; and Receive Notifications delivers real-time alerts on student submissions and course activities.

### 5.1.3 Subsystem 3-Academic Advisor

The Academic Advisor Management subsystem enables academic advisors to monitor and support the academic progress of their assigned students. It consists of six components: Login authenticates the advisor and redirects to the advisor dashboard; Manage Profile allows the advisor to update contact details and profile photo; View Student Profile displays the personal and academic details of assigned students; Monitor Performance provides performance analytics including GPA, module completion status, and at-risk flags; Generate Reports produces downloadable progress reports and academic summaries for selected students; and Receive Notifications sends alerts on student events such as missed deadlines or performance drops.

### 5.1.4 Subsystem 4- Admin

The Administrative Management subsystem provides administrators with full control over system-wide operations. It consists of seven components: Login authenticates the admin and redirects to the admin dashboard; Manage Courses allows admins to create, edit, and archive courses; Manage User enables admins to add, edit, and deactivate user accounts across all roles; View Reports generates and displays system-wide reports such as enrolment statistics; Manage Notifications supports creation, scheduling, and delivery of targeted notifications to users; Manage Enrollments allows admins to view, add, drop, or edit student course enrolments; and Activity Logs provides a chronological audit trail of all tracked user activities filterable by role, date, and activity type.

# Interface Design

## Main Screens

**Login page**

The login page of the **Smart Interactive Learning System** has a clean and simple design that makes it easy for users to log in. It contains two input fields for email and password, along with a blue “Sign In” button to access the system. The centered layout, soft background color, and organized structure create a professional and user-friendly interface that improves the overall user experience.

## Subsystem 1 Screens

**Student Dashboard**

The student dashboard page of the **Smart Interactive Learning System (SILS)** is designed to help students manage their learning activities easily and efficiently. The interface uses a modern dark theme with a sidebar menu that provides quick access to features such as My Courses, Course Catalogue, Quizzes, Assignments, Grades & Feedback, Notifications, and Profile. The dashboard displays important information including enrolled courses, average completion rate, current GPA, and upcoming quizzes. Students can also continue their learning through course cards that show module progress and course details. In addition, the page includes recent notifications, weekly activity tracking, and upcoming assessments to help students stay organized and monitor their academic progress effectively.

**Profile Page**** (Student)**

The Profile screen allows students to view and update their personal and academic information. It displays the student's name, email, phone number, and department on the left, and academic details such as academic level, programme, learning preferences, and assigned advisor on the right. Students can save changes using the Save Changes button.

**Enrolled Courses page**** (Student)**

The My Courses screen displays all courses the student is currently enrolled in. Each course card shows the course code, title, instructor name, number of modules and lessons, a progress bar, and enrolment status. Students can click on any course card to access its content.

**Course Page**** (Student)**

The Course Catalogue screen allows students to browse all available courses in the system. Each course card shows the category, course title, instructor name, number of modules, estimated duration, and rating. Students can enrol into a course by clicking the Enroll Now button on the respective card.

**Lesson Page**** (Student)**

The Lessons & Videos screen allows students to access lesson content within a course module. It displays an embedded video player at the top, showing the current lesson title and playback progress. Below the video, a lesson description provides a brief overview of the topic covered. On the right panel, students can see the list of upcoming and completed lessons with their respective durations. Students can mark a lesson as complete or download the lesson material as a PDF.

## Subsystem 2 Screens

**Instructor Dashboard**

The instructor dashboard page of the **Smart Interactive Learning System (SILS)** is designed to help instructors manage courses, students, and assessments efficiently. The interface features a modern dark theme with a sidebar menu that provides quick access to Dashboard, My Courses, Course Builder, Grading, Notifications, and Profile. The dashboard displays important information such as total courses, total students, total quizzes, and pending grading tasks. It also includes a recent submissions table that shows student names, quiz titles, scores, submission status, and dates, allowing instructors to monitor student performance and grading progress easily.

**My Courses Page (Instructor)**

12:35 PM

The My Courses screen allows instructors to view and manage all courses they have created. Each course is displayed as a card showing the course title, number of enrolled students, and a publication status badge indicating whether the course is published or still in draft. Instructors can interact with each course using three action buttons — Open to view the course content, Edit to modify the course details, and Archive to remove it from active listings. Draft courses do not display the Archive button until they are published. A prominent New Course button in the top right corner allows instructors to create and add a new course to their list.

**Course Builder Page (Instructor)**

The Course Builder screen allows instructors to construct and manage the full content structure of a course in one place. The screen is divided into three sections. The Modules & Lessons panel on the left enables instructors to organise course content into modules, with each module containing individual lessons such as documents, video lectures, or reference materials. Each lesson displays its estimated duration and can be removed using the delete button. Instructors can add new modules using the Module button and add lessons within each module using the Lesson button. The Quizzes panel on the right lists all assessments linked to the course, showing the quiz title, number of questions, total attempts, and publication status. Each quiz can be managed through the Questions, Edit, and Delete buttons. The Enrolled Students table at the bottom displays a list of students currently enrolled in the course, showing their name, email, course progress as a bar and percentage, average score, number of quizzes taken, and risk status.

**GradeSumbit Page (Instructor)**

The Grading screen presents instructors with a list of all student quiz and exam submissions that are pending evaluation. Each row in the table displays the student's name, the name of the submitted quiz or exam, the course it belongs to, and the date it was submitted. A Grade button in the Action column allows the instructor to open and assess each individual submission. The Grading menu item in the sidebar displays a badge indicating the total number of ungraded submissions awaiting attention, giving instructors a quick count without needing to open the screen.

**Notification (Instructor)**

The Notifications screen for the Instructor role displays system alerts relevant to the instructor's teaching activities. Each notification card shows a bold title describing the type of alert, a brief message with supporting details, and a timestamp on the right indicating when it was received. Notification types include pending grading reminders prompting the instructor to evaluate recently submitted assessments, student learning alerts flagging learners whose course completion rate has dropped below an acceptable threshold, and course status updates confirming when a course has been successfully published and made available for enrolment. Unread notifications include a Mark Read button to allow the instructor to acknowledge them, while read notifications remain visible for reference without the button.

## 6.4 Subsystem 3 Screens

**My Student Page (Advisor)**

The My Students screen displays a full list of all students assigned to the advisor in a structured table format. Each row represents a student and includes their name, email address, enrolled programme, academic level, current GPA, number of courses enrolled, and account status. Students flagged as at-risk are clearly marked with a warning icon and an "At Risk" label beneath their name, while their GPA is highlighted in red to draw attention. The account status is shown as a colour-coded badge, distinguishing between active and suspended students. Advisors can take action on each student by clicking the Profile button to view detailed student information or the Grades button to review their academic performance.

**Monitor Progress Page (Advisor)**

The Monitor Progress screen gives advisors a consolidated academic performance overview of all assigned students in a single table. Each row displays a student's name, enrolled programme, current GPA, average course completion rate represented as both a progress bar and a percentage, average quiz score, and total number of quizzes taken. The Risk column on the far right indicates each student's standing, showing either a green "OK" badge for students performing satisfactorily or an orange "At Risk" warning for those with low GPA, poor completion rates, and below-average quiz scores. GPA and quiz score values are colour-coded in green for healthy performance and red for concerning levels, allowing advisors to quickly identify students who require intervention.

**Generate Report Page** **(Advisor)**

The Generate Reports screen allows advisors to view and export structured academic reports for all assigned students. The screen features two tab options — Progress Report and Academic Summary — allowing advisors to switch between different report types. The currently active Progress Report tab displays a table listing each student's name, enrolled programme, GPA, number of courses, average completion rate, average score, and at-risk status. The at-risk column uses a green "No" indicator for students in good standing and an orange "Yes" warning for those flagged as at-risk. A generation date is displayed in the top right corner of the report panel, indicating when the report was last produced.

**Notification Page (Advisor)**

The Notifications screen displays all system alerts and updates relevant to the advisor in a chronological list. Each notification card shows a bold title indicating the type of alert, a brief descriptive message providing context, and a timestamp on the right indicating when the notification was received. Notification types include student at-risk alerts triggered by declining academic performance, pending submission alerts for assessments awaiting grading, and administrative notices such as newly assigned advisees. Unread notifications are accompanied by a Mark Read button, allowing advisors to acknowledge and manage their alerts. Read notifications remain visible without the button, keeping a full history of past alerts accessible on the screen.

## 6.5 Subsystem 4 Screens

**Admin Dashboard **

The dashboard page of the **Smart Interactive Learning System (SILS)** provides administrators with a clear overview of the platform’s activities and data. The interface uses a modern dark theme with a sidebar navigation menu that allows easy access to features such as Dashboard, Users, Courses, Enrollments, and Activity Logs. The main section displays important statistics including total users, total courses, enrollments, and active students. It also includes sections for top courses by enrollment and platform activity, helping administrators monitor system performance and user engagement efficiently.

**Manage User Page (Admin)**

The Manage Users screen allows administrators to view and manage all registered users in the system through the Admin Panel. The screen displays a table listing all users with columns for username, email, role, department, status, and available actions. An Add User button in the top right corner enables administrators to register new users into the system. The sidebar navigation is grouped into two sections — Management, which includes Users, Courses, and Enrollments, and System, which provides access to Activity Logs. The currently logged-in administrator's name and role are displayed at the bottom of the sidebar. In this instance, the user table is in a loading state, indicating that data is being retrieved from the system.

**Manage Courses (Admin)**

The Manage Courses screen allows administrators to view and oversee all courses available in the system through the Admin Panel. The screen displays a table listing all courses with columns for title, instructor, status, creation date, and available actions. An Add Course button in the top right corner enables administrators to manually create and register a new course into the system. The sidebar navigation remains consistent with other admin screens, grouped under Management and System sections. In this instance, the course table is in a loading state, indicating that data is being retrieved from the system.

**Manage Enrollments (Admin)**

The Manage Enrollments screen allows administrators to view and manage all student course enrollments across the system. The screen displays a table with columns for student name, email, course, enrollment status, enrollment date, and available actions. An Add Enrollment button in the top right corner enables administrators to manually enroll a student into a course. When no enrollment records exist, the table displays a "No enrollments found" message in the centre. The sidebar navigation remains consistent with other admin screens, organised under the Management and System sections.

**Activity Logs (Admin)**

The Activity Logs screen provides administrators with a system-wide audit trail of all user actions performed within the platform. The screen displays a table with columns for user, role, activity, description, and date, allowing administrators to track what actions were carried out, by whom, in what capacity, and when. This screen is accessible under the System section of the sidebar navigation and is intended for monitoring and oversight purposes. In this instance, the log table is in a loading state, indicating that activity records are being retrieved from the system.

# Component Design

## Main Components

| **Subsystem** | **Component** |
| --- | --- |
| **Student Management Subsystem** | Student Login Component |
|  | Student Profile Management Component |
|  | Course Enrollment Component |
|  | Lesson & Video Access Component |
|  | Quiz Attempt Component |
|  | Assignment Submission Component |
|  | Progress Tracking Component |
|  | Grade & Feedback Viewer Component |
|  | Notification Component |
| **Academic Advisor Subsystem** | Advisor Login Component |
|  | Advisor Profile Management Component |
|  | Student Profile Viewing Component |
|  | Student Progress Monitoring Component |
|  | Academic Record Review Component |
|  | Report Generation Component |
|  | Notification Component |
| **Admin Management Subsystem** | Admin Login Component |
|  | User Account Management Component |
|  | Course Management Component |
|  | Enrollment Management Component |
|  | Report Viewing Component |
|  | Notification Management Component |
|  | User Activity Log Management Component |
| **Instructor Management Subsystem** | Instructor Login Component |
|  | Instructor Profile Management Component |
|  | Course Management Component |
|  | Learning Material Upload Component |
|  | Quiz/Assignment Creation Component |
|  | Quiz Feedback Configuration Component |
|  | Assignment Grading Component |
|  | Student Progress Viewing Component |
|  | Analytics Dashboard Component |
|  | Notification Component |

### Student Login Component

| Activity Diagram | Pseudocode |
| --- | --- |
|  | BEGIN StudentLogin   DISPLAY login page    INPUT email, password    IF email IS EMPTY OR password IS EMPTY THEN     DISPLAY "Please fill in all fields"     GOTO BEGIN StudentLogin   END IF    SEND email, password TO AuthService   QUERY Database FOR user WHERE email = input email    IF user NOT FOUND THEN     DISPLAY "Invalid email or password"     GOTO BEGIN StudentLogin   END IF    VERIFY password AGAINST stored hash    IF password DOES NOT MATCH THEN     DISPLAY "Invalid email or password"     GOTO BEGIN StudentLogin   END IF    LOG login activity   GENERATE session token   REDIRECT TO student dashboard END StudentLogin |

### 7.1.2 Student Profile Management Component

| Activity Diagram | Pseudocode |
| --- | --- |
|  | BEGIN StudentManageProfile   FETCH profile FROM Database   DISPLAY current profile information    INPUT updated fields   INPUT profile photo (optional)    IF photo IS UPLOADED THEN     IF photo size > 5MB THEN       DISPLAY "Photo exceeds size limit"       GOTO INPUT profile photo     END IF     IF photo format NOT IN [JPG, PNG] THEN       DISPLAY "Unsupported file format"       GOTO INPUT profile photo     END IF   END IF    IF required fields ARE EMPTY THEN     DISPLAY validation error     GOTO INPUT updated fields   END IF    UPDATE profile IN Database   DISPLAY "Profile updated successfully" END StudentManageProfile |

### 7.1.3 Course Enrollment Component

| Activity Diagram | Pseudocode |
| --- | --- |
|  | BEGIN StudentEnrollCourse   FETCH course list FROM Database   DISPLAY available courses    INPUT selected course    IF student IS ALREADY ENROLLED IN selected course THEN     DISPLAY "You are already enrolled in this course"     GOTO DISPLAY available courses   END IF    IF course IS NOT OPEN FOR ENROLLMENT THEN     DISPLAY "This course is not open for enrollment"     GOTO DISPLAY available courses   END IF    INSERT enrollment record INTO Database   ADD course TO student dashboard   DISPLAY enrollment confirmation END StudentEnrollCourse |

### 7.1.4 Lesson & Video Access Component

| Activity Diagram | Pseudocode |
| --- | --- |
|  | BEGIN StudentAccessLesson   FETCH course modules FROM Database   DISPLAY module list    INPUT selected module   DISPLAY lesson list    INPUT selected lesson    REQUEST lesson content FROM Content Service   Content Service FETCHES content FROM storage    IF content FAILS TO LOAD THEN     DISPLAY "Content could not be loaded. Please retry."     GOTO INPUT selected lesson   END IF    RENDER lesson content    ON lesson completion     UPDATE lesson completion status IN Database   END ON END StudentAccessLesson |

### 7.1.5 Quiz Attempt Component

| Activity Diagram | Pseudocode |
| --- | --- |
|  | BEGIN StudentTakeQuiz   VERIFY quiz IS OPEN AND student IS WITHIN attempt limit    IF quiz IS CLOSED OR attempt limit IS EXCEEDED THEN     DISPLAY restriction message     STOP   END IF    FETCH questions FROM Database VIA Quiz Engine   RANDOMISE question order   DISPLAY questions WITH timer    WHILE quiz IS IN PROGRESS AND timer HAS NOT EXPIRED DO     INPUT student answers      IF student DISCONNECTS THEN       SAVE answers submitted so far     END IF   END WHILE    IF timer EXPIRES THEN     AUTO-SUBMIT quiz   ELSE     student SUBMITS quiz   END IF    FOR EACH question DO     IF question type IN [MCQ, fill-in-the-blank] THEN       AUTO-GRADE answer       IF answer IS INCORRECT THEN         ATTACH improvement tip       END IF     ELSE       MARK AS pending manual grading     END IF   END FOR    CALCULATE total score   SAVE score, answers, attempt record TO Database   DISPLAY results and improvement tips   UPDATE progress tracker IN Database END StudentTakeQuiz |

### 7.1.6 Assignment Submission Component

| Activity Diagram | Pseudocode |
| --- | --- |
|  | BEGIN StudentSubmitAssignment   DISPLAY submission form    IF deadline HAS PASSED THEN     DISABLE Submit button     DISPLAY "Submission closed. Deadline has passed."     STOP   END IF    INPUT file(s) and optional text note   DISPLAY upload progress bar    IF file size > 50MB THEN     DISPLAY "File exceeds the 50MB limit"     GOTO INPUT file(s)   END IF    IF file format NOT IN [PDF, DOCX, PPTX, ZIP, JPG, PNG] THEN     DISPLAY "Unsupported file format"     GOTO INPUT file(s)   END IF    STORE file ON File Server   OBTAIN file URL    RECORD submission IN Database WITH timestamp AND status = "Submitted"   NOTIFY instructor VIA Notification Service   SEND confirmation notification TO student    IF student RESUBMITS BEFORE deadline THEN     OVERWRITE previous submission     UPDATE timestamp IN Database   END IF END StudentSubmitAssignment |

### 7.1.7 Progress Tracking Component

| Activity Diagram | Pseudocode |
| --- | --- |
|  | BEGIN StudentTrackProgress   REQUEST progress data FROM Analytics Engine   Analytics Engine FETCHES enrollments, modules, quiz scores, grades FROM Database    IF no activity records EXIST THEN     DISPLAY "Getting Started" guide     STOP   END IF    COMPUTE completion percentage per course   COMPUTE overall quiz performance   COMPUTE recommended next steps    DISPLAY progress bars per course   DISPLAY performance analytics   DISPLAY recommended next steps END StudentTrackProgress |

### 7.1.8 Grade & Feedback Viewer Component

| Activity Diagram | Pseudocode |
| --- | --- |
|  | BEGIN StudentViewGrades   FETCH graded assessments FROM Database   DISPLAY list with item name, score, status    FOR EACH assessment DO     IF status = "Pending" THEN       DISPLAY "Pending – estimated review time"     ELSE       DISPLAY score and grade breakdown     END IF   END FOR    INPUT selected assessment item    FETCH detailed feedback FROM Grade Service   Grade Service FETCHES feedback record FROM Database    IF no written feedback EXISTS THEN     DISPLAY score without feedback note   ELSE     DISPLAY score, grade breakdown, instructor feedback   END IF END StudentViewGrades |

### 7.1.9 Notification Component

| Activity Diagram | Pseudocode |
| --- | --- |
|  | BEGIN StudentReceiveNotifications   DETECT triggering event    GENERATE notification record   SAVE notification TO Database   DELIVER notification TO student inbox   DISPLAY notification badge IN navigation bar    INPUT student clicks notification icon   DISPLAY notification panel    INPUT student clicks notification item    IF linked content IS NO LONGER AVAILABLE THEN     DISPLAY "This content has been removed"     STOP   END IF    REDIRECT TO relevant page   MARK notification AS read IN Database    IF student IS NOT LOGGED IN THEN     RETAIN unread notifications     DISPLAY unread notifications ON next login   END IF END StudentReceiveNotifications |

### 7.2.1. Advisor Login Component

| Activity Diagram | Pseudocode |
| --- | --- |
|  | BEGIN AdvisorLogin   DISPLAY login form   INPUT email, password   SUBMIT credentials TO System    VERIFY credentials AGAINST Database    IF credentials ARE INVALID THEN     DISPLAY "Invalid email or password"     GOTO DISPLAY login form   END IF    REDIRECT TO Advisor Dashboard END AdvisorLogin |

### 7.2.2 Advisor Profile Management Component

| Activity Diagram | Pseudocode |
| --- | --- |
|  | BEGIN AdvisorManageProfile   FETCH current profile FROM Database   DISPLAY current profile information    INPUT updated fields   INPUT profile photo (optional)    IF photo IS UPLOADED THEN     IF photo size > 5MB OR format NOT IN [JPG, PNG] THEN       DISPLAY "Photo must be JPG or PNG and not exceed 5MB"       GOTO INPUT profile photo     END IF   END IF    IF required fields ARE EMPTY THEN     DISPLAY validation error     GOTO INPUT updated fields   END IF    UPDATE profile IN Database   DISPLAY "Profile updated successfully" END AdvisorManageProfile |

### 7.2.3 Student Profile Viewing Component

| Activity Diagram | Pseudocode |
| --- | --- |
|  | BEGIN AdvisorViewStudentProfile   QUERY Database FOR students ASSIGNED TO advisor    IF no students ARE ASSIGNED THEN     DISPLAY "No students assigned"     STOP   END IF    DISPLAY assigned student list    INPUT selected student    FETCH student profile FROM Database   DISPLAY student profile details END AdvisorViewStudentProfile |

### 7.2.4 Student Progress Monitoring Component

| Activity Diagram | Pseudocode |
| --- | --- |
|  | BEGIN AdvisorMonitorProgress   INPUT selected student   QUERY Database FOR student academic data    IF data IS UNAVAILABLE THEN     DISPLAY "Student data is unavailable"     STOP   END IF    GENERATE performance analytics FROM fetched data    DISPLAY GPA   DISPLAY completed courses   DISPLAY module completion percentages   DISPLAY at-risk flag IF applicable END AdvisorMonitorProgress |

### 7.2.5 Academic Record Review Component

| Activity Diagram | Pseudocode |
| --- | --- |
|  | BEGIN AdvisorReviewAcademicRecords   REQUEST academic records FROM Database    IF records ARE INCOMPLETE OR UNAVAILABLE THEN     DISPLAY "Academic records are incomplete or unavailable"     STOP   END IF    DISPLAY course grades   DISPLAY GPA   DISPLAY academic history END AdvisorReviewAcademicRecords |

### 7.2.6 Report Generation Component

| Activity Diagram | Pseudocode |
| --- | --- |
|  | BEGIN AdvisorGenerateReport   INPUT report type FROM [Progress Report, Academic Summary]   REQUEST student data FROM Database    IF data IS INCOMPLETE THEN     DISPLAY "Insufficient data to generate report"     STOP   END IF    GENERATE report FROM retrieved data   DISPLAY report   MAKE report AVAILABLE FOR download END AdvisorGenerateReport |

### 7.2.7 Notification Component

| Activity Diagram | Pseudocode |
| --- | --- |
|  | BEGIN AdvisorReceiveNotifications   DETECT triggering event FOR assigned student    GENERATE notification   SAVE notification TO Database   DELIVER notification TO advisor inbox   DISPLAY notification indicator IN navigation bar    INPUT advisor clicks notification icon   DISPLAY notification panel    INPUT advisor clicks notification item    IF student record IS NO LONGER ACCESSIBLE THEN     DISPLAY "Student record is unavailable"     STOP   END IF    REDIRECT TO relevant student profile or progress report   MARK notification AS read IN Database    IF advisor IS NOT LOGGED IN THEN     RETAIN unread notifications     DISPLAY unread notifications ON next login   END IF END AdvisorReceiveNotifications |

### 7.3.1 Admin Login Component

| Activity Diagram | Pseudocode |
| --- | --- |
|  | BEGIN AdminLogin   DISPLAY login form   INPUT username, email, password   SUBMIT credentials TO System    VERIFY credentials AGAINST Database    IF credentials ARE INCORRECT THEN     DISPLAY "Invalid credentials"     GOTO DISPLAY login form   END IF    REDIRECT TO Admin Dashboard END AdminLogin |

### 7.3.2 User Account Management Component

| Activity Diagram | Pseudocode |
| --- | --- |
|  | BEGIN AdminManageUsers   FETCH user list FROM Database   DISPLAY user list    INPUT selected action FROM [Add, Edit, Deactivate]    IF action = Add THEN     INPUT new user details     IF data IS INVALID OR MISSING THEN       DISPLAY validation error       GOTO INPUT new user details     END IF     INSERT user record INTO Database     DISPLAY updated user list    ELSE IF action = Edit THEN     INPUT selected user     INPUT updated details     IF data IS INVALID THEN       DISPLAY validation error       GOTO INPUT updated details     END IF     UPDATE user record IN Database     DISPLAY updated user list    ELSE IF action = Deactivate THEN     INPUT selected user     UPDATE user status TO "inactive" IN Database     DISPLAY updated user list   END IF END AdminManageUsers |

### 7.3.3 Course Management Component

| Activity Diagram | Pseudocode |
| --- | --- |
|  | BEGIN AdminManageCourses   FETCH course list FROM Database   DISPLAY course list    INPUT selected action FROM [Create, Edit, Archive]    IF action = Create THEN     INPUT course details     IF required fields ARE MISSING THEN       DISPLAY "Please complete all required fields"       GOTO INPUT course details     END IF     INSERT course record INTO Database     DISPLAY updated course list    ELSE IF action = Edit THEN     INPUT selected course     INPUT updated details     IF required fields ARE MISSING THEN       DISPLAY "Please complete all required fields"       GOTO INPUT updated details     END IF     UPDATE course record IN Database     DISPLAY updated course list    ELSE IF action = Archive THEN     INPUT selected course     UPDATE course status TO "archived" IN Database     DISPLAY updated course list   END IF END AdminManageCourses |

### 7.3.4 Enrollment Management Component

| Activity Diagram | Pseudocode |
| --- | --- |
|  | BEGIN AdminViewReports   DISPLAY available report types    INPUT selected report type AND time period   QUERY Database FOR relevant data    IF no data IS AVAILABLE THEN     DISPLAY "No data available for this report"     STOP   END IF    GENERATE AND DISPLAY report  END AdminViewReports |

### 7.3.5 Report Viewing Component

| Activity Diagram | Pseudocode |
| --- | --- |
|  | BEGIN AdminManageEnrollments   FETCH enrollment records FROM Database   DISPLAY enrollment list    INPUT selected action FROM [Add, Edit, Drop]    IF action = Add THEN     INPUT student AND course     INSERT enrollment record INTO Database     DISPLAY updated enrollment list    ELSE IF action = Edit THEN     INPUT selected enrollment     INPUT updated details     UPDATE enrollment record IN Database     DISPLAY updated enrollment list    ELSE IF action = Drop THEN     INPUT selected enrollment     DELETE enrollment record FROM Database     DISPLAY updated enrollment list   END IF    IF no enrollment IS FOUND THEN     DISPLAY "No enrollment record found"   END IF END AdminManageEnrollments |

### 7.3.6 Notification Management Component

| Activity Diagram | Pseudocode |
| --- | --- |
|  | BEGIN AdminManageNotifications   FETCH notification list FROM Database   DISPLAY notifications WITH statuses    INPUT selected action FROM [Create, Edit, Delete]    IF action = Create THEN     INPUT title, message body, target audience, delivery time      IF title OR message OR target audience IS EMPTY THEN       DISPLAY validation error       GOTO INPUT title, message body, target audience, delivery time     END IF      IF delivery = "Send Now" THEN       DELIVER notification TO target users     ELSE       SAVE notification AS scheduled IN Database     END IF     DISPLAY updated notification list    ELSE IF action = Edit THEN     INPUT selected draft notification     INPUT updated fields     SAVE updated draft TO Database     DISPLAY updated notification list    ELSE IF action = Delete THEN     INPUT selected notification     DELETE notification FROM Database     DISPLAY updated notification list   END IF END AdminManageNotifications |

### 7.3.7  User Activity Log Management Component

| Activity Diagram | Pseudocode |
| --- | --- |
|  | BEGIN AdminManageActivityLogs   FETCH all activity data FROM Database   DISPLAY user activity list    INPUT filters FROM [user role, date range, activity type]   QUERY Database WITH applied filters    IF no records MATCH filter THEN     DISPLAY "No records found"     STOP   END IF    DISPLAY filtered results    INPUT selected user   FETCH full activity history FROM Database   DISPLAY detailed activity log    IF admin CLICKS Export THEN     GENERATE report file FROM Database      IF export FAILS THEN       DISPLAY error AND retry option     ELSE       DOWNLOAD report file TO admin device     END IF   END IF END AdminManageActivityLogs |

### 7.4.1 Instructor Login Component

| Activity Diagram | Pseudocode |
| --- | --- |
|  | BEGIN InstructorLogin   DISPLAY login form   INPUT email, password   SUBMIT credentials TO AuthController    AuthController SENDS credentials TO AuthService   AuthService QUERIES Database FOR user BY email   VERIFY password USING bcrypt    IF credentials ARE INVALID THEN     DISPLAY "Invalid email or password"     GOTO DISPLAY login form   END IF    GENERATE authentication token   REDIRECT TO Instructor Dashboard END InstructorLogin |

### 7.4.2 Instructor Profile Management Component

| Activity Diagram | Pseudocode |
| --- | --- |
|  | BEGIN InstructorManageProfile   FETCH current profile FROM Database   DISPLAY current profile information    INPUT updated fields   INPUT profile photo (optional)    IF photo IS UPLOADED THEN     IF photo size > 5MB OR format NOT IN [JPG, PNG] THEN       DISPLAY "Photo must be JPG or PNG and not exceed 5MB"       GOTO INPUT profile photo     END IF   END IF    IF required fields ARE EMPTY THEN     DISPLAY validation error     GOTO INPUT updated fields   END IF    UPDATE profile IN Database   DISPLAY "Profile updated successfully" END InstructorManageProfile |

### 7.4.3 Course Management Component

| Activity Diagram | Pseudocode |
| --- | --- |
|  | BEGIN InstructorManageCourse   FETCH all instructor courses FROM Database   DISPLAY courses WITH statuses    INPUT selected action FROM [Create, Edit, Archive, Delete]    IF action = Create THEN     INPUT course details     IF required fields ARE EMPTY THEN       DISPLAY validation error       GOTO INPUT course details     END IF     IF instructor PUBLISHES WITH no lessons THEN       DISPLAY "Add at least one lesson before publishing"       GOTO INPUT course details     END IF     SAVE course TO Database     IF status = Published THEN       NOTIFY enrolled students     END IF     DISPLAY success confirmation    ELSE IF action = Edit THEN     INPUT selected course     INPUT updated fields     UPDATE course IN Database     IF status = Published THEN       NOTIFY enrolled students     END IF     DISPLAY success confirmation    ELSE IF action = Archive THEN     INPUT selected course     ARCHIVE course IN Database    ELSE IF action = Delete THEN     INPUT selected course     DELETE course FROM Database   END IF END InstructorManageCourse |

### 7.4.4 Learning Material Upload Component

| Activity Diagram | Pseudocode |
| --- | --- |
|  | BEGIN InstructorUploadMaterials   DISPLAY upload interface    INPUT file type FROM [video, PDF, document, link]    IF file upload THEN     INPUT file   ELSE     INPUT video URL   END IF    VALIDATE file VIA UploadService    IF file format IS UNSUPPORTED THEN     DISPLAY "Unsupported format. Accepted formats: [list]"     GOTO INPUT file type   END IF    IF file size EXCEEDS limit THEN     DISPLAY "File size exceeds the allowed limit"     GOTO INPUT file type   END IF    STORE material IN Database LINKED TO module   DISPLAY "Upload successful" END InstructorUploadMaterials |

### 7.4.5 Quiz/Assignment Creation Component

| Activity Diagram | Pseudocode |
| --- | --- |
|  | BEGIN InstructorCreateQuiz   DISPLAY assessment creation form    FOR EACH question DO     INPUT question type FROM [MCQ, fill-in-the-blank, short answer]     INPUT question text, options, correct answer     INPUT improvement feedback tip   END FOR    INPUT time limit   INPUT randomization setting   INPUT maximum attempts   INPUT number of questions per attempt    IF no questions HAVE BEEN ADDED THEN     DISPLAY "Add at least one question before publishing"     GOTO FOR EACH question   END IF    INSERT quiz AND questions INTO Database   NOTIFY enrolled students   DISPLAY success confirmation END InstructorCreateQuiz |

### 7.4.6 Quiz Feedback Configuration Component

| Activity Diagram | Pseudocode |
| --- | --- |
|  | BEGIN InstructorConfigureQuizFeedback   INPUT selected quiz   QUERY Database FOR attempt count ON selected quiz    IF attempt count > 0 THEN     DISPLAY "Changes will apply to future attempts only"   END IF    DISPLAY feedback configuration form    FOR EACH question DO     INPUT selected question     FETCH question data FROM Database     INPUT improvement tip (max 500 characters)     STORE tip temporarily   END FOR    UPDATE quiz_feedback IN Database   DISPLAY "Feedback saved successfully" END InstructorConfigureQuizFeedback |

### 7.4.7 Assignment Grading Component

| Activity Diagram | Pseudocode |
| --- | --- |
|  | BEGIN InstructorGradeAssignment   FETCH submission list FROM Database    IF no submissions EXIST THEN     DISPLAY "No submissions found"     STOP   END IF    DISPLAY submission list    INPUT selected assignment   FETCH AND DISPLAY submission details    INPUT marks AND optional feedback    IF marks EXCEED maximum allowed THEN     DISPLAY "Invalid marks: value exceeds the maximum score"     GOTO INPUT marks AND optional feedback   END IF    SAVE grade TO Database    IF save FAILS THEN     DISPLAY "Save failed. Please retry."     GOTO SAVE grade TO Database   END IF    NOTIFY student THAT grading IS COMPLETE   DISPLAY "Grade saved successfully" END InstructorGradeAssignment |

### 7.4.8 Student Progress Viewing Component

| Activity Diagram | Pseudocode |
| --- | --- |
|  | BEGIN InstructorViewStudentProgress   INPUT selected course   QUERY Database FOR student activity VIA ProgressService    IF no activity EXISTS THEN     DISPLAY "Insufficient data: no student activity recorded"     STOP   END IF    DISPLAY enrolled students WITH module completion status   HIGHLIGHT at-risk students    INPUT selected student   FETCH AND DISPLAY quiz scores, grades, activity logs, time spent    IF instructor CLICKS Export THEN     GENERATE report      IF export FAILS THEN       DISPLAY error AND retry option     ELSE       DOWNLOAD report AS PDF OR CSV     END IF   END IF END InstructorViewStudentProgress |

### 7.4.9 Analytics Dashboard Component

| Activity Diagram | Pseudocode |
| --- | --- |
|  | BEGIN InstructorViewAnalytics   QUERY Database FOR course analytics VIA AnalyticsService   FETCH engagement charts, quiz scores, submission rates, performance distribution    DISPLAY analytics AND charts    INPUT filters FROM [course, module, date range]   QUERY Database WITH applied filters    IF no data MATCHES filter THEN     DISPLAY "No data found. Adjust your filter."     STOP   END IF    RENDER filtered charts    IF charts FAIL TO LOAD THEN     DISPLAY error AND Refresh button     STOP   END IF    INPUT selected metric   QUERY Database FOR detailed metric data   DISPLAY metric detail END InstructorViewAnalytics |

### 7.4.10 Notification Component

| Activity Diagram | Pseudocode |
| --- | --- |
|  | BEGIN InstructorReceiveNotifications   DETECT triggering event    GENERATE AND STORE notification IN Database   ATTEMPT delivery VIA NotificationController    IF delivery FAILS THEN     RETRY delivery   END IF    PUSH notification TO Notification Panel    IF instructor HAS no active courses THEN     DISPLAY "No new notifications"     STOP   END IF    DISPLAY notification IN panel    INPUT instructor clicks notification   FETCH redirect URL FROM Database   REDIRECT TO relevant page    INPUT mark as read OR clear all   UPDATE notification status IN Database   REFLECT updated status ON panel END InstructorReceiveNotifications |

 

# Deployment Design

## Deployment Diagram

Smart Interactive Learning System adopts a three-tier deployment architecture built on Node.js/Express.

Client tier consists of three device types ,PC/Laptop, Smartphone/Tablet, and Admin PC. This all communicating with the application server over HTTPS/TLS.

Application server tier hosts both the frontend and backend on a single Node.js/Express instance. The frontend is served as a React.js SPA, while the backend exposes an Express REST API (routes/controllers). Supporting components include an Auth Middleware (JWT + bcrypt), Business Services covering user, course, quiz, progress, and notification logic, a File Upload Service using Multer, and an on-demand Report Service. Runtime configuration is managed via a .env file storing DB_HOST, JWT_SECRET, and PORT.

Data/external service tier consists of two components: a XAMPP/MySQL database server hosting sils_db (15-table schema), connected via MySQL Protocol over TCP/IP port 3306, and an external video hosting service (YouTube/File Server) providing embedded video URLs, accessed over HTTPS.

#   Summary

<Summarize the design approach and readiness for implementation.>

# References

<List any references or sources used.>

***Page ******6***