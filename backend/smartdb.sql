-- ============================================================
--  Smart Interactive Learning System
--  Full Database Schema — matches SRS Section 6.2 exactly
--  Group 2 | Version 1.0
-- ============================================================

CREATE DATABASE IF NOT EXISTS smartdb;
USE smartdb;

-- ============================================================
-- 1. user  (Section 6.2.1)
--    Represents all system users: students, instructors,
--    academic advisors, and admins.
-- ============================================================
CREATE TABLE user (
  user_id         INT           AUTO_INCREMENT PRIMARY KEY, 
  username        VARCHAR(100)  NOT NULL UNIQUE,
  email           VARCHAR(150)  NOT NULL UNIQUE,
  password_hash   VARCHAR(255)  NOT NULL,
  role            ENUM('student','instructor','advisor','admin') NOT NULL,
  department      VARCHAR(100),
  photo_url       VARCHAR(255),
  phone_number    VARCHAR(20),
  status          ENUM('active','inactive','suspended') NOT NULL DEFAULT 'active',
  created_at      TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- 2. student_profile  (Section 6.2.2)
--    Extra academic info for users with role = 'student'.
-- ============================================================
CREATE TABLE student_profile (
  user_id              INT            PRIMARY KEY,
  academic_level       VARCHAR(50),
  programme            VARCHAR(100),
  learning_preferences TEXT,
  advisor_id           INT,                          -- nullable FK
  gpa                  DECIMAL(3,2)   NOT NULL DEFAULT 0.00,
  is_at_risk           BOOLEAN        NOT NULL DEFAULT FALSE,
  FOREIGN KEY (user_id)    REFERENCES user(user_id) ON DELETE CASCADE,
  FOREIGN KEY (advisor_id) REFERENCES user(user_id) ON DELETE SET NULL
);

-- ============================================================
-- 3. instructor_profile  (Section 6.2.3)
--    Extra professional info for users with role = 'instructor'.
-- ============================================================
CREATE TABLE instructor_profile (
  user_id         INT          PRIMARY KEY,
  specialization  VARCHAR(150),
  subjects_taught TEXT,
  office_hours    VARCHAR(255),
  FOREIGN KEY (user_id) REFERENCES user(user_id) ON DELETE CASCADE
);

-- ============================================================
-- 4. course  (Section 6.2.4)
--    A course created and managed by an instructor.
-- ============================================================
CREATE TABLE course (
  course_id      INT           AUTO_INCREMENT PRIMARY KEY,
  instructor_id  INT           NOT NULL,
  title          VARCHAR(200)  NOT NULL,
  description    TEXT,
  status         ENUM('draft','published','archived') NOT NULL DEFAULT 'draft',
  created_at     TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (instructor_id) REFERENCES user(user_id) ON DELETE CASCADE
);

-- ============================================================
-- 5. enrollment  (Section 6.2.5)
--    Records a student enrolling in a course.
-- ============================================================
CREATE TABLE enrollment (
  enrollment_id       INT         AUTO_INCREMENT PRIMARY KEY,
  user_id             INT         NOT NULL,             -- student
  course_id           INT         NOT NULL,
  enrolled_at         TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,
  status              ENUM('active','completed','dropped','suspended') NOT NULL DEFAULT 'active',
  completion_percent  DECIMAL(5,2) NOT NULL DEFAULT 0.00,
  completed_at        TIMESTAMP   NULL DEFAULT NULL,
  FOREIGN KEY (user_id)   REFERENCES user(user_id)     ON DELETE CASCADE,
  FOREIGN KEY (course_id) REFERENCES course(course_id) ON DELETE CASCADE,
  UNIQUE KEY uq_enrollment (user_id, course_id)         -- one enrollment per student per course
);

-- ============================================================
-- 6. module  (Section 6.2.6)
--    Organises lessons and quizzes inside a course.
-- ============================================================
CREATE TABLE module (
  module_id    INT           AUTO_INCREMENT PRIMARY KEY,
  course_id    INT           NOT NULL,
  title        VARCHAR(200)  NOT NULL,
  description  TEXT,
  sort_order   INT           NOT NULL DEFAULT 0,
  FOREIGN KEY (course_id) REFERENCES course(course_id) ON DELETE CASCADE
);

-- ============================================================
-- 7. lesson  (Section 6.2.7)
--    A single piece of learning content inside a module.
-- ============================================================
CREATE TABLE lesson (
  lesson_id        INT          AUTO_INCREMENT PRIMARY KEY,
  module_id        INT          NOT NULL,
  title            VARCHAR(200) NOT NULL,
  content_type     ENUM('video','text','pdf','other') NOT NULL,
  content_url      VARCHAR(500) NULL DEFAULT NULL,   -- nullable
  content_text     LONGTEXT     NULL DEFAULT NULL,   -- nullable
  sort_order       INT          NOT NULL DEFAULT 0,
  duration_minutes INT          NULL DEFAULT NULL,   -- nullable
  status           ENUM('draft','published','archived') NOT NULL DEFAULT 'draft',
  FOREIGN KEY (module_id) REFERENCES module(module_id) ON DELETE CASCADE
);

-- ============================================================
-- 8. quiz  (Section 6.2.8)
--    A quiz or assignment created by an instructor.
-- ============================================================
CREATE TABLE quiz (
  quiz_id                    INT           AUTO_INCREMENT PRIMARY KEY,
  course_id                  INT           NOT NULL,
  module_id                  INT           NULL DEFAULT NULL,   -- nullable
  created_by                 INT           NOT NULL,            -- instructor FK
  title                      VARCHAR(200)  NOT NULL,
  description                TEXT,
  status                     ENUM('draft','published','archived') NOT NULL DEFAULT 'draft',
  due_date                   DATETIME      NULL DEFAULT NULL,   -- nullable
  time_limit_minutes         INT           NULL DEFAULT NULL,   -- nullable
  max_attempts               INT           NOT NULL DEFAULT 1,
  randomize_questions        BOOLEAN       NOT NULL DEFAULT FALSE,
  num_questions_per_attempt  INT           NULL DEFAULT NULL,   -- nullable
  submission_type            ENUM('online_quiz','file_upload','mixed') NOT NULL DEFAULT 'online_quiz',
  created_at                 TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (course_id)  REFERENCES course(course_id)  ON DELETE CASCADE,
  FOREIGN KEY (module_id)  REFERENCES module(module_id)  ON DELETE SET NULL,
  FOREIGN KEY (created_by) REFERENCES user(user_id)      ON DELETE CASCADE
);

-- ============================================================
-- 9. question  (Section 6.2.9)
--    A single question inside a quiz.
-- ============================================================
CREATE TABLE question (
  question_id      INT          AUTO_INCREMENT PRIMARY KEY,
  quiz_id          INT          NOT NULL,
  question_type    ENUM('mcq','fill_blank','short_answer') NOT NULL,
  question_text    TEXT         NOT NULL,
  options          JSON         NULL DEFAULT NULL,   -- MCQ choices, nullable
  correct_answer   TEXT         NOT NULL,
  points           INT          NOT NULL DEFAULT 1,
  improvement_tip  TEXT         NULL DEFAULT NULL,   -- nullable
  sort_order       INT          NOT NULL DEFAULT 0,
  FOREIGN KEY (quiz_id) REFERENCES quiz(quiz_id) ON DELETE CASCADE
);

-- ============================================================
-- 10. quiz_attempt  (Section 6.2.10)
--     One attempt made by a student for a quiz.
-- ============================================================
CREATE TABLE quiz_attempt (
  quiz_attempt_id  INT          AUTO_INCREMENT PRIMARY KEY,
  quiz_id          INT          NOT NULL,
  user_id          INT          NOT NULL,   -- student
  start_time       DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  end_time         DATETIME     NULL DEFAULT NULL,   -- nullable
  score            DECIMAL(6,2) NULL DEFAULT NULL,   -- nullable until graded
  attempt_number   INT          NOT NULL DEFAULT 1,
  status           ENUM('in_progress','submitted','graded','expired') NOT NULL DEFAULT 'in_progress',
  created_at       TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (quiz_id) REFERENCES quiz(quiz_id)   ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES user(user_id)   ON DELETE CASCADE
);

-- ============================================================
-- 11. answer  (Section 6.2.11)
--     A student's response to one question in a quiz attempt.
-- ============================================================
CREATE TABLE answer (
  answer_id          INT           AUTO_INCREMENT PRIMARY KEY,
  quiz_attempt_id    INT           NOT NULL,
  question_id        INT           NOT NULL,
  user_answer        TEXT,
  is_correct         BOOLEAN       NULL DEFAULT NULL,   -- null until graded
  score_awarded      DECIMAL(6,2)  NULL DEFAULT NULL,   -- null until graded
  feedback           TEXT          NULL DEFAULT NULL,   -- nullable
  file_url           VARCHAR(500)  NULL DEFAULT NULL,   -- file-upload submissions
  graded_by_user_id  INT           NULL DEFAULT NULL,   -- nullable (auto or instructor)
  FOREIGN KEY (quiz_attempt_id)   REFERENCES quiz_attempt(quiz_attempt_id) ON DELETE CASCADE,
  FOREIGN KEY (question_id)       REFERENCES question(question_id)         ON DELETE CASCADE,
  FOREIGN KEY (graded_by_user_id) REFERENCES user(user_id)                 ON DELETE SET NULL
);

-- ============================================================
-- 12. module_progress  (Section 6.2.12)
--     Tracks a student's progress within a specific module.
--     Composite PK: (user_id, module_id)
-- ============================================================
CREATE TABLE module_progress (
  user_id               INT           NOT NULL,
  module_id             INT           NOT NULL,
  status                ENUM('not_started','in_progress','completed') NOT NULL DEFAULT 'not_started',
  completion_percentage DECIMAL(5,2)  NOT NULL DEFAULT 0.00,
  last_accessed         DATETIME      NULL DEFAULT NULL,
  completed_at          DATETIME      NULL DEFAULT NULL,   -- nullable
  PRIMARY KEY (user_id, module_id),
  FOREIGN KEY (user_id)   REFERENCES user(user_id)     ON DELETE CASCADE,
  FOREIGN KEY (module_id) REFERENCES module(module_id) ON DELETE CASCADE
);

-- ============================================================
-- 13. activity_log  (Section 6.2.13)
--     Records every tracked user activity for auditing.
-- ============================================================
CREATE TABLE activity_log (
  activity_log_id   INT           AUTO_INCREMENT PRIMARY KEY,
  user_id           INT           NOT NULL,
  activity_type     VARCHAR(100)  NOT NULL,
  description       TEXT,
  related_item_type VARCHAR(100)  NULL DEFAULT NULL,   -- nullable
  related_item_id   INT           NULL DEFAULT NULL,   -- nullable
  created_at        TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES user(user_id) ON DELETE CASCADE
);

-- ============================================================
-- 14. notification  (Section 6.2.14)
--     A notification sent to a user about a system event.
-- ============================================================
CREATE TABLE notification (
  notification_id    INT           AUTO_INCREMENT PRIMARY KEY,
  user_id            INT           NOT NULL,
  title              VARCHAR(200)  NOT NULL,
  message            TEXT          NOT NULL,
  type               VARCHAR(100)  NOT NULL,
  is_read            BOOLEAN       NOT NULL DEFAULT FALSE,
  related_item_type  VARCHAR(100)  NULL DEFAULT NULL,   -- nullable
  related_item_id    INT           NULL DEFAULT NULL,   -- nullable
  target_role        ENUM('student','instructor','advisor','admin') NULL DEFAULT NULL,
  scheduled_at       DATETIME      NULL DEFAULT NULL,   -- nullable
  created_at         TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES user(user_id) ON DELETE CASCADE
);

-- ============================================================
-- 15. quiz_feedback  (Section 6.2.15)
--     Instructor-defined feedback per score range for a quiz.
-- ============================================================
CREATE TABLE quiz_feedback (
  quiz_feedback_id   INT           AUTO_INCREMENT PRIMARY KEY,
  quiz_id            INT           NOT NULL,
  min_score          DECIMAL(5,2)  NOT NULL,
  max_score          DECIMAL(5,2)  NOT NULL,
  feedback_message   TEXT          NOT NULL,
  FOREIGN KEY (quiz_id) REFERENCES quiz(quiz_id) ON DELETE CASCADE
);