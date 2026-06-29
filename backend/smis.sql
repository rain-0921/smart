SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

CREATE TABLE `activity_log` (
  `activity_log_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `activity_type` varchar(50) NOT NULL,
  `description` text DEFAULT NULL,
  `related_item_type` varchar(50) DEFAULT NULL,
  `related_item_id` int(11) DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `answer` (
  `answer_id` int(11) NOT NULL,
  `quiz_attempt_id` int(11) NOT NULL,
  `question_id` int(11) NOT NULL,
  `user_answer` text DEFAULT NULL,
  `is_correct` tinyint(1) DEFAULT NULL,
  `score_awarded` decimal(6,2) DEFAULT NULL,
  `feedback` text DEFAULT NULL,
  `file_url` varchar(255) DEFAULT NULL,
  `graded_by_user_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `course` (
  `course_id` int(11) NOT NULL,
  `instructor_id` int(11) NOT NULL,
  `title` varchar(150) NOT NULL,
  `description` text DEFAULT NULL,
  `status` enum('draft','published','archived') NOT NULL DEFAULT 'draft',
  `created_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `enrollment` (
  `enrollment_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `course_id` int(11) NOT NULL,
  `enrolled_at` datetime NOT NULL DEFAULT current_timestamp(),
  `status` enum('active','completed','dropped','suspended') NOT NULL DEFAULT 'active',
  `completion_percent` decimal(5,2) NOT NULL DEFAULT 0.00,
  `completed_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `instructor_profile` (
  `user_id` int(11) NOT NULL,
  `specialization` varchar(100) DEFAULT NULL,
  `subjects_taught` text DEFAULT NULL,
  `office_hours` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `lesson` (
  `lesson_id` int(11) NOT NULL,
  `module_id` int(11) NOT NULL,
  `title` varchar(150) NOT NULL,
  `content_type` enum('video','text','pdf','other') NOT NULL,
  `content_url` varchar(255) DEFAULT NULL,
  `content_text` longtext DEFAULT NULL,
  `sort_order` int(11) NOT NULL DEFAULT 0,
  `duration_minutes` int(11) DEFAULT NULL,
  `status` enum('draft','published','archived') NOT NULL DEFAULT 'draft'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `module` (
  `module_id` int(11) NOT NULL,
  `course_id` int(11) NOT NULL,
  `title` varchar(150) NOT NULL,
  `description` text DEFAULT NULL,
  `sort_order` int(11) NOT NULL DEFAULT 0,
  `status` enum('draft','published','archived') NOT NULL DEFAULT 'published'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `module_progress` (
  `user_id` int(11) NOT NULL,
  `module_id` int(11) NOT NULL,
  `status` enum('not_started','in_progress','completed') NOT NULL DEFAULT 'not_started',
  `completion_percentage` decimal(5,2) NOT NULL DEFAULT 0.00,
  `last_accessed` datetime DEFAULT NULL,
  `completed_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `notification` (
  `notification_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `title` varchar(150) NOT NULL,
  `message` text NOT NULL,
  `type` varchar(50) NOT NULL,
  `is_read` tinyint(1) NOT NULL DEFAULT 0,
  `related_item_type` varchar(50) DEFAULT NULL,
  `related_item_id` int(11) DEFAULT NULL,
  `target_role` enum('student','instructor','advisor','admin') DEFAULT NULL,
  `scheduled_at` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `question` (
  `question_id` int(11) NOT NULL,
  `quiz_id` int(11) NOT NULL,
  `question_type` enum('mcq','fill_blank','short_answer') NOT NULL,
  `question_text` text NOT NULL,
  `options` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`options`)),
  `correct_answer` text NOT NULL,
  `points` int(11) NOT NULL DEFAULT 1,
  `improvement_tip` text DEFAULT NULL,
  `sort_order` int(11) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `quiz` (
  `quiz_id` int(11) NOT NULL,
  `course_id` int(11) NOT NULL,
  `module_id` int(11) DEFAULT NULL,
  `created_by` int(11) NOT NULL,
  `title` varchar(150) NOT NULL,
  `description` text DEFAULT NULL,
  `status` enum('draft','published','archived') NOT NULL DEFAULT 'draft',
  `due_date` datetime DEFAULT NULL,
  `time_limit_minutes` int(11) DEFAULT NULL,
  `max_attempts` int(11) NOT NULL DEFAULT 1,
  `randomize_questions` tinyint(1) NOT NULL DEFAULT 0,
  `num_questions_per_attempt` int(11) DEFAULT NULL,
  `submission_type` enum('online_quiz','file_upload','mixed') NOT NULL DEFAULT 'online_quiz',
  `accepted_file_types` varchar(255) DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `quiz_attempt` (
  `quiz_attempt_id` int(11) NOT NULL,
  `quiz_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `start_time` datetime NOT NULL DEFAULT current_timestamp(),
  `end_time` datetime DEFAULT NULL,
  `score` decimal(6,2) DEFAULT NULL,
  `attempt_number` int(11) NOT NULL DEFAULT 1,
  `status` enum('in_progress','submitted','graded','expired') NOT NULL DEFAULT 'in_progress',
  `created_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `quiz_feedback` (
  `quiz_feedback_id` int(11) NOT NULL,
  `quiz_id` int(11) NOT NULL,
  `min_score` decimal(5,2) NOT NULL,
  `max_score` decimal(5,2) NOT NULL,
  `feedback_message` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `student_profile` (
  `user_id` int(11) NOT NULL,
  `academic_level` varchar(50) DEFAULT NULL,
  `programme` varchar(100) DEFAULT NULL,
  `learning_preferences` text DEFAULT NULL,
  `advisor_id` int(11) DEFAULT NULL,
  `average_score` decimal(5,2) DEFAULT 0.00,
  `is_at_risk` tinyint(1) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `user` (
  `user_id` int(11) NOT NULL,
  `username` varchar(50) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `role` enum('student','instructor','advisor','admin') NOT NULL,
  `department` varchar(100) DEFAULT NULL,
  `photo_url` varchar(255) DEFAULT NULL,
  `phone_number` varchar(20) DEFAULT NULL,
  `status` enum('active','inactive','suspended') NOT NULL DEFAULT 'active',
  `created_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

ALTER TABLE `activity_log`
  ADD PRIMARY KEY (`activity_log_id`),
  ADD KEY `fk_log_user` (`user_id`);

ALTER TABLE `answer`
  ADD PRIMARY KEY (`answer_id`),
  ADD KEY `fk_answer_attempt` (`quiz_attempt_id`),
  ADD KEY `fk_answer_question` (`question_id`),
  ADD KEY `fk_answer_grader` (`graded_by_user_id`);

ALTER TABLE `course`
  ADD PRIMARY KEY (`course_id`),
  ADD KEY `fk_course_instructor` (`instructor_id`);

ALTER TABLE `enrollment`
  ADD PRIMARY KEY (`enrollment_id`),
  ADD UNIQUE KEY `uq_enrollment` (`user_id`,`course_id`),
  ADD KEY `fk_enroll_course` (`course_id`);

ALTER TABLE `instructor_profile`
  ADD PRIMARY KEY (`user_id`);

ALTER TABLE `lesson`
  ADD PRIMARY KEY (`lesson_id`),
  ADD KEY `fk_lesson_module` (`module_id`);

ALTER TABLE `module`
  ADD PRIMARY KEY (`module_id`),
  ADD KEY `fk_module_course` (`course_id`);

ALTER TABLE `module_progress`
  ADD PRIMARY KEY (`user_id`,`module_id`),
  ADD KEY `fk_mp_module` (`module_id`);

ALTER TABLE `notification`
  ADD PRIMARY KEY (`notification_id`),
  ADD KEY `fk_notif_user` (`user_id`);

ALTER TABLE `question`
  ADD PRIMARY KEY (`question_id`),
  ADD KEY `fk_question_quiz` (`quiz_id`);

ALTER TABLE `quiz`
  ADD PRIMARY KEY (`quiz_id`),
  ADD KEY `fk_quiz_course` (`course_id`),
  ADD KEY `fk_quiz_module` (`module_id`),
  ADD KEY `fk_quiz_creator` (`created_by`);

ALTER TABLE `quiz_attempt`
  ADD PRIMARY KEY (`quiz_attempt_id`),
  ADD KEY `fk_attempt_quiz` (`quiz_id`),
  ADD KEY `fk_attempt_student` (`user_id`);

ALTER TABLE `quiz_feedback`
  ADD PRIMARY KEY (`quiz_feedback_id`),
  ADD KEY `fk_qf_quiz` (`quiz_id`);

ALTER TABLE `student_profile`
  ADD PRIMARY KEY (`user_id`),
  ADD KEY `fk_sp_advisor` (`advisor_id`);

ALTER TABLE `user`
  ADD PRIMARY KEY (`user_id`),
  ADD UNIQUE KEY `username` (`username`),
  ADD UNIQUE KEY `email` (`email`);

ALTER TABLE `activity_log`
  MODIFY `activity_log_id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `answer`
  MODIFY `answer_id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `course`
  MODIFY `course_id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `enrollment`
  MODIFY `enrollment_id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `lesson`
  MODIFY `lesson_id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `module`
  MODIFY `module_id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `notification`
  MODIFY `notification_id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `question`
  MODIFY `question_id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `quiz`
  MODIFY `quiz_id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `quiz_attempt`
  MODIFY `quiz_attempt_id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `quiz_feedback`
  MODIFY `quiz_feedback_id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `user`
  MODIFY `user_id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `activity_log`
  ADD CONSTRAINT `fk_log_user` FOREIGN KEY (`user_id`) REFERENCES `user` (`user_id`) ON DELETE CASCADE;

ALTER TABLE `answer`
  ADD CONSTRAINT `fk_answer_attempt` FOREIGN KEY (`quiz_attempt_id`) REFERENCES `quiz_attempt` (`quiz_attempt_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_answer_grader` FOREIGN KEY (`graded_by_user_id`) REFERENCES `user` (`user_id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_answer_question` FOREIGN KEY (`question_id`) REFERENCES `question` (`question_id`) ON DELETE CASCADE;

ALTER TABLE `course`
  ADD CONSTRAINT `fk_course_instructor` FOREIGN KEY (`instructor_id`) REFERENCES `user` (`user_id`);

ALTER TABLE `enrollment`
  ADD CONSTRAINT `fk_enroll_course` FOREIGN KEY (`course_id`) REFERENCES `course` (`course_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_enroll_student` FOREIGN KEY (`user_id`) REFERENCES `user` (`user_id`) ON DELETE CASCADE;

ALTER TABLE `instructor_profile`
  ADD CONSTRAINT `fk_ip_user` FOREIGN KEY (`user_id`) REFERENCES `user` (`user_id`) ON DELETE CASCADE;

ALTER TABLE `lesson`
  ADD CONSTRAINT `fk_lesson_module` FOREIGN KEY (`module_id`) REFERENCES `module` (`module_id`) ON DELETE CASCADE;

ALTER TABLE `module`
  ADD CONSTRAINT `fk_module_course` FOREIGN KEY (`course_id`) REFERENCES `course` (`course_id`) ON DELETE CASCADE;

ALTER TABLE `module_progress`
  ADD CONSTRAINT `fk_mp_module` FOREIGN KEY (`module_id`) REFERENCES `module` (`module_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_mp_student` FOREIGN KEY (`user_id`) REFERENCES `user` (`user_id`) ON DELETE CASCADE;

ALTER TABLE `notification`
  ADD CONSTRAINT `fk_notif_user` FOREIGN KEY (`user_id`) REFERENCES `user` (`user_id`) ON DELETE CASCADE;

ALTER TABLE `question`
  ADD CONSTRAINT `fk_question_quiz` FOREIGN KEY (`quiz_id`) REFERENCES `quiz` (`quiz_id`) ON DELETE CASCADE;

ALTER TABLE `quiz`
  ADD CONSTRAINT `fk_quiz_course` FOREIGN KEY (`course_id`) REFERENCES `course` (`course_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_quiz_creator` FOREIGN KEY (`created_by`) REFERENCES `user` (`user_id`),
  ADD CONSTRAINT `fk_quiz_module` FOREIGN KEY (`module_id`) REFERENCES `module` (`module_id`) ON DELETE SET NULL;

ALTER TABLE `quiz_attempt`
  ADD CONSTRAINT `fk_attempt_quiz` FOREIGN KEY (`quiz_id`) REFERENCES `quiz` (`quiz_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_attempt_student` FOREIGN KEY (`user_id`) REFERENCES `user` (`user_id`) ON DELETE CASCADE;

ALTER TABLE `quiz_feedback`
  ADD CONSTRAINT `fk_qf_quiz` FOREIGN KEY (`quiz_id`) REFERENCES `quiz` (`quiz_id`) ON DELETE CASCADE;

ALTER TABLE `student_profile`
  ADD CONSTRAINT `fk_sp_advisor` FOREIGN KEY (`advisor_id`) REFERENCES `user` (`user_id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_sp_user` FOREIGN KEY (`user_id`) REFERENCES `user` (`user_id`) ON DELETE CASCADE;

COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;