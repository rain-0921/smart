-- ============================================================
--  Smart Interactive Learning System
--  Seed Data — Development / Testing
--  Group 2 | Version 1.0
--  All passwords: Test@1234
--  bcrypt hash: $2b$10$YourHashHere (replace in production)
-- ============================================================

USE smartdb;

-- ============================================================
-- NOTE: All passwords are: Test@1234
-- bcrypt hash below is for Test@1234 with salt rounds 10
-- ============================================================

SET @pw = '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi';

-- ============================================================
-- 1. USERS
-- ============================================================

INSERT INTO user (institution_id, username, email, password_hash, role, department, phone_number, status) VALUES
-- Admin (already inserted in schema, skip AD001)
('AD002', 'admin2',        'admin2@sils.edu',       @pw, 'admin',      'Administration',   '0123456789', 'active'),

-- Advisors
('A001',  'advisor_ali',   'ali@sils.edu',           @pw, 'advisor',    'Academic Affairs', '0111234567', 'active'),
('A002',  'advisor_siti',  'siti@sils.edu',          @pw, 'advisor',    'Academic Affairs', '0112345678', 'active'),

-- Instructors
('I001',  'dr_rahman',     'rahman@sils.edu',        @pw, 'instructor', 'Computer Science', '0121234567', 'active'),
('I002',  'dr_lim',        'lim@sils.edu',           @pw, 'instructor', 'Computer Science', '0122345678', 'active'),
('I003',  'dr_priya',      'priya@sils.edu',         @pw, 'instructor', 'Information Tech', '0123456780', 'active'),

-- Students
('S001',  'ahmad_student', 'ahmad@student.sils.edu', @pw, 'student',    'Computer Science', '0131234567', 'active'),
('S002',  'mei_student',   'mei@student.sils.edu',   @pw, 'student',    'Computer Science', '0132345678', 'active'),
('S003',  'kumar_student', 'kumar@student.sils.edu', @pw, 'student',    'Information Tech', '0133456789', 'active'),
('S004',  'nurul_student', 'nurul@student.sils.edu', @pw, 'student',    'Computer Science', '0134567890', 'active'),
('S005',  'jason_student', 'jason@student.sils.edu', @pw, 'student',    'Information Tech', '0135678901', 'active');

-- ============================================================
-- 2. ADVISOR PROFILES (no separate table, advisor info in user)
-- ============================================================

-- ============================================================
-- 3. INSTRUCTOR PROFILES
-- ============================================================

INSERT INTO instructor_profile (user_id, specialization, subjects_taught, office_hours) VALUES
((SELECT user_id FROM user WHERE institution_id='I001'), 'Artificial Intelligence',   'Machine Learning, Data Structures',        'Mon/Wed 2pm-4pm'),
((SELECT user_id FROM user WHERE institution_id='I002'), 'Web Development',            'Web Programming, Database Systems',         'Tue/Thu 10am-12pm'),
((SELECT user_id FROM user WHERE institution_id='I003'), 'Cybersecurity',              'Network Security, Operating Systems',       'Mon/Fri 9am-11am');

-- ============================================================
-- 4. STUDENT PROFILES
-- ============================================================

INSERT INTO student_profile (user_id, academic_level, programme, learning_preferences, advisor_id, gpa, is_at_risk) VALUES
((SELECT user_id FROM user WHERE institution_id='S001'), 'Year 2', 'Bachelor of Computer Science', 'Visual',   (SELECT user_id FROM user WHERE institution_id='A001'), 3.50, FALSE),
((SELECT user_id FROM user WHERE institution_id='S002'), 'Year 2', 'Bachelor of Computer Science', 'Reading',  (SELECT user_id FROM user WHERE institution_id='A001'), 3.20, FALSE),
((SELECT user_id FROM user WHERE institution_id='S003'), 'Year 3', 'Bachelor of Information Tech',  'Hands-on', (SELECT user_id FROM user WHERE institution_id='A002'), 2.10, TRUE),
((SELECT user_id FROM user WHERE institution_id='S004'), 'Year 1', 'Bachelor of Computer Science', 'Visual',   (SELECT user_id FROM user WHERE institution_id='A001'), 3.80, FALSE),
((SELECT user_id FROM user WHERE institution_id='S005'), 'Year 3', 'Bachelor of Information Tech',  'Reading',  (SELECT user_id FROM user WHERE institution_id='A002'), 1.90, TRUE);

-- ============================================================
-- 5. COURSES
-- ============================================================

INSERT INTO course (instructor_id, title, description, status) VALUES
((SELECT user_id FROM user WHERE institution_id='I001'), 'Introduction to Machine Learning',  'Fundamentals of ML algorithms and applications.',          'published'),
((SELECT user_id FROM user WHERE institution_id='I001'), 'Data Structures and Algorithms',    'Core data structures: arrays, trees, graphs, and sorting.', 'published'),
((SELECT user_id FROM user WHERE institution_id='I002'), 'Web Programming',                   'HTML, CSS, JavaScript and modern frameworks.',             'published'),
((SELECT user_id FROM user WHERE institution_id='I002'), 'Database Systems',                  'Relational databases, SQL, and normalization.',            'published'),
((SELECT user_id FROM user WHERE institution_id='I003'), 'Network Security Fundamentals',     'Concepts in network security and ethical hacking.',        'published'),
((SELECT user_id FROM user WHERE institution_id='I003'), 'Operating Systems',                 'Process management, memory, and file systems.',            'draft');

-- ============================================================
-- 6. ENROLLMENTS
-- ============================================================

INSERT INTO enrollment (user_id, course_id, status, completion_percent) VALUES
-- Ahmad (S001) enrolled in ML and Web Programming
((SELECT user_id FROM user WHERE institution_id='S001'), 1, 'active',    65.00),
((SELECT user_id FROM user WHERE institution_id='S001'), 3, 'active',    40.00),

-- Mei (S002) enrolled in DSA and Database
((SELECT user_id FROM user WHERE institution_id='S002'), 2, 'active',    80.00),
((SELECT user_id FROM user WHERE institution_id='S002'), 4, 'active',    55.00),

-- Kumar (S003) enrolled in Network Security
((SELECT user_id FROM user WHERE institution_id='S003'), 5, 'active',    20.00),
((SELECT user_id FROM user WHERE institution_id='S003'), 3, 'active',    10.00),

-- Nurul (S004) enrolled in ML and DSA
((SELECT user_id FROM user WHERE institution_id='S004'), 1, 'active',    90.00),
((SELECT user_id FROM user WHERE institution_id='S004'), 2, 'completed', 100.00),

-- Jason (S005) enrolled in Network Security
((SELECT user_id FROM user WHERE institution_id='S005'), 5, 'active',    15.00);

-- ============================================================
-- 7. MODULES
-- ============================================================

-- Course 1: Introduction to Machine Learning
INSERT INTO module (course_id, title, description, sort_order) VALUES
(1, 'Introduction to ML Concepts',   'Overview of machine learning and its types.',       1),
(1, 'Supervised Learning',           'Regression and classification algorithms.',         2),
(1, 'Unsupervised Learning',         'Clustering and dimensionality reduction.',          3);

-- Course 2: Data Structures and Algorithms
INSERT INTO module (course_id, title, description, sort_order) VALUES
(2, 'Arrays and Linked Lists',       'Linear data structures and operations.',            1),
(2, 'Trees and Graphs',              'Hierarchical and network data structures.',         2);

-- Course 3: Web Programming
INSERT INTO module (course_id, title, description, sort_order) VALUES
(3, 'HTML & CSS Basics',             'Structure and styling of web pages.',               1),
(3, 'JavaScript Fundamentals',       'Core JS concepts and DOM manipulation.',            2);

-- Course 4: Database Systems
INSERT INTO module (course_id, title, description, sort_order) VALUES
(4, 'Relational Model & SQL',        'Tables, keys, and basic SQL queries.',              1),
(4, 'Normalization',                 '1NF, 2NF, 3NF and BCNF.',                          2);

-- Course 5: Network Security
INSERT INTO module (course_id, title, description, sort_order) VALUES
(5, 'Network Basics',                'OSI model, protocols, and network types.',          1),
(5, 'Threats and Vulnerabilities',   'Common attacks and defence mechanisms.',            2);

-- ============================================================
-- 8. LESSONS
-- ============================================================

INSERT INTO lesson (module_id, title, content_type, content_text, sort_order, duration_minutes, status) VALUES
-- Module 1 (ML Intro)
(1, 'What is Machine Learning?',     'text', 'Machine learning is a subset of AI that enables systems to learn from data.', 1, 10, 'published'),
(1, 'Types of ML',                   'text', 'Supervised, unsupervised, and reinforcement learning explained.',              2, 15, 'published'),
-- Module 2 (Supervised)
(2, 'Linear Regression',             'text', 'Predicting continuous values using a linear model.',                          1, 20, 'published'),
(2, 'Classification with KNN',       'text', 'K-Nearest Neighbours algorithm for classification tasks.',                   2, 20, 'published'),
-- Module 4 (Arrays)
(4, 'Arrays in Memory',              'text', 'How arrays are stored and accessed in memory.',                               1, 10, 'published'),
(4, 'Linked List Operations',        'text', 'Insert, delete, and traverse operations on linked lists.',                   2, 15, 'published'),
-- Module 6 (HTML CSS)
(6, 'HTML Structure',                'text', 'Tags, attributes, and the DOM structure.',                                   1, 10, 'published'),
(6, 'CSS Selectors and Box Model',   'text', 'Styling elements using CSS selectors and understanding the box model.',      2, 15, 'published');

-- ============================================================
-- 9. QUIZZES
-- ============================================================

INSERT INTO quiz (course_id, module_id, created_by, title, description, status, due_date, time_limit_minutes, max_attempts, randomize_questions, submission_type) VALUES
-- Course 1 quizzes
(1, 1, (SELECT user_id FROM user WHERE institution_id='I001'), 'ML Basics Quiz',          'Test your understanding of ML fundamentals.', 'published', DATE_ADD(NOW(), INTERVAL 7 DAY),  30, 2, TRUE,  'online_quiz'),
(1, 2, (SELECT user_id FROM user WHERE institution_id='I001'), 'Supervised Learning Quiz','Questions on regression and classification.',  'published', DATE_ADD(NOW(), INTERVAL 14 DAY), 30, 2, FALSE, 'online_quiz'),
-- Course 2 quizzes
(2, 4, (SELECT user_id FROM user WHERE institution_id='I001'), 'Arrays & Lists Quiz',     'Test on linear data structures.',             'published', DATE_ADD(NOW(), INTERVAL 5 DAY),  20, 1, FALSE, 'online_quiz'),
-- Course 3 quizzes
(3, 6, (SELECT user_id FROM user WHERE institution_id='I002'), 'HTML & CSS Quiz',         'Basic web structure and styling quiz.',        'published', DATE_ADD(NOW(), INTERVAL 10 DAY), 25, 2, TRUE,  'online_quiz'),
-- Course 5 quizzes
(5, 10,(SELECT user_id FROM user WHERE institution_id='I003'), 'Network Security Quiz',   'Quiz on threats and network defence.',         'published', DATE_ADD(NOW(), INTERVAL 3 DAY),  20, 1, FALSE, 'online_quiz');

-- ============================================================
-- 10. QUESTIONS
-- ============================================================

-- Quiz 1: ML Basics
INSERT INTO question (quiz_id, question_type, question_text, options, correct_answer, points, improvement_tip, sort_order) VALUES
(1, 'mcq',          'What does ML stand for?',
 '["Machine Learning","Manual Logic","Modular Language","Mechanical Logic"]',
 'Machine Learning', 1, 'Review the introduction to ML topic.', 1),

(1, 'mcq',          'Which type of ML uses labelled data?',
 '["Unsupervised","Reinforcement","Supervised","Semi-supervised"]',
 'Supervised', 1, 'Review the types of ML lesson.', 2),

(1, 'fill_blank',   'The three main types of ML are supervised, unsupervised, and ______.',
 NULL, 'reinforcement', 2, 'Refer to the Types of ML lesson.', 3);

-- Quiz 2: Supervised Learning
INSERT INTO question (quiz_id, question_type, question_text, options, correct_answer, points, improvement_tip, sort_order) VALUES
(2, 'mcq',          'Linear regression is used to predict ______ values.',
 '["Categorical","Continuous","Binary","Nominal"]',
 'Continuous', 1, 'Review the Linear Regression lesson.', 1),

(2, 'mcq',          'KNN stands for?',
 '["K-Nearest Neighbours","K-Neural Networks","K-Node Networks","K-Null Nodes"]',
 'K-Nearest Neighbours', 1, 'Review the KNN lesson.', 2);

-- Quiz 3: Arrays & Lists
INSERT INTO question (quiz_id, question_type, question_text, options, correct_answer, points, improvement_tip, sort_order) VALUES
(3, 'mcq',          'What is the time complexity of accessing an array element by index?',
 '["O(n)","O(log n)","O(1)","O(n^2)"]',
 'O(1)', 2, 'Review array memory access.', 1),

(3, 'fill_blank',   'A linked list node contains data and a ______ to the next node.',
 NULL, 'pointer', 1, 'Review linked list structure.', 2);

-- Quiz 4: HTML & CSS
INSERT INTO question (quiz_id, question_type, question_text, options, correct_answer, points, improvement_tip, sort_order) VALUES
(4, 'mcq',          'Which HTML tag defines the largest heading?',
 '["<h6>","<h1>","<head>","<header>"]',
 '<h1>', 1, 'Review HTML structure lesson.', 1),

(4, 'mcq',          'Which CSS property changes text colour?',
 '["font-color","text-color","color","foreground"]',
 'color', 1, 'Review CSS selectors lesson.', 2);

-- Quiz 5: Network Security
INSERT INTO question (quiz_id, question_type, question_text, options, correct_answer, points, improvement_tip, sort_order) VALUES
(5, 'mcq',          'How many layers does the OSI model have?',
 '["5","6","7","8"]',
 '7', 1, 'Review the Network Basics lesson.', 1),

(5, 'mcq',          'Which attack overwhelms a server with traffic?',
 '["Phishing","DDoS","SQL Injection","Man-in-the-Middle"]',
 'DDoS', 2, 'Review the Threats and Vulnerabilities lesson.', 2);

-- ============================================================
-- 11. QUIZ ATTEMPTS (some completed attempts for students)
-- ============================================================

INSERT INTO quiz_attempt (quiz_id, user_id, start_time, end_time, score, attempt_number, status) VALUES
-- Ahmad (S001) attempted ML Basics Quiz
(1, (SELECT user_id FROM user WHERE institution_id='S001'), DATE_SUB(NOW(), INTERVAL 2 DAY), DATE_SUB(NOW(), INTERVAL 2 DAY), 75.00, 1, 'graded'),
-- Mei (S002) attempted Arrays Quiz
(3, (SELECT user_id FROM user WHERE institution_id='S002'), DATE_SUB(NOW(), INTERVAL 1 DAY), DATE_SUB(NOW(), INTERVAL 1 DAY), 100.00, 1, 'graded'),
-- Nurul (S004) attempted ML Basics Quiz
(1, (SELECT user_id FROM user WHERE institution_id='S004'), DATE_SUB(NOW(), INTERVAL 3 DAY), DATE_SUB(NOW(), INTERVAL 3 DAY), 100.00, 1, 'graded'),
-- Kumar (S003) attempted Network Security Quiz
(5, (SELECT user_id FROM user WHERE institution_id='S003'), DATE_SUB(NOW(), INTERVAL 1 DAY), DATE_SUB(NOW(), INTERVAL 1 DAY), 50.00,  1, 'graded');

-- ============================================================
-- 12. MODULE PROGRESS
-- ============================================================

INSERT INTO module_progress (user_id, module_id, status, completion_percentage, last_accessed, completed_at) VALUES
-- Ahmad
((SELECT user_id FROM user WHERE institution_id='S001'), 1, 'completed',   100.00, NOW(), NOW()),
((SELECT user_id FROM user WHERE institution_id='S001'), 2, 'in_progress',  50.00, NOW(), NULL),
-- Mei
((SELECT user_id FROM user WHERE institution_id='S002'), 4, 'completed',   100.00, NOW(), NOW()),
((SELECT user_id FROM user WHERE institution_id='S002'), 5, 'in_progress',  30.00, NOW(), NULL),
-- Nurul
((SELECT user_id FROM user WHERE institution_id='S004'), 1, 'completed',   100.00, NOW(), NOW()),
((SELECT user_id FROM user WHERE institution_id='S004'), 2, 'completed',   100.00, NOW(), NOW()),
-- Kumar
((SELECT user_id FROM user WHERE institution_id='S003'), 10,'in_progress',  20.00, NOW(), NULL);

-- ============================================================
-- 13. NOTIFICATIONS
-- ============================================================

INSERT INTO notification (user_id, title, message, type, is_read, target_role) VALUES
((SELECT user_id FROM user WHERE institution_id='S001'), 'New Quiz Available',    'ML Basics Quiz is now available. Good luck!',             'quiz',    FALSE, 'student'),
((SELECT user_id FROM user WHERE institution_id='S003'), 'At-Risk Alert',         'Your progress is below the passing threshold.',           'alert',   FALSE, 'student'),
((SELECT user_id FROM user WHERE institution_id='S005'), 'At-Risk Alert',         'Your GPA is below 2.0. Please contact your advisor.',     'alert',   FALSE, 'student'),
((SELECT user_id FROM user WHERE institution_id='A001'), 'Student At-Risk',       'Kumar and Jason are flagged as at-risk students.',        'alert',   FALSE, 'advisor'),
((SELECT user_id FROM user WHERE institution_id='I001'), 'Pending Submissions',   'You have pending quiz submissions to review.',            'reminder',FALSE, 'instructor');

-- ============================================================
-- 14. QUIZ FEEDBACK
-- ============================================================

INSERT INTO quiz_feedback (quiz_id, min_score, max_score, feedback_message) VALUES
(1,  0.00,  49.99, 'Needs improvement. Please revisit the ML introduction materials.'),
(1, 50.00,  74.99, 'Good effort! Review the areas you missed to strengthen your understanding.'),
(1, 75.00, 100.00, 'Excellent work! You have a strong grasp of ML basics.'),
(3,  0.00,  49.99, 'Review linear data structures before moving on.'),
(3, 50.00, 100.00, 'Well done! You understand arrays and linked lists.');

-- ============================================================
-- 15. ACTIVITY LOGS
-- ============================================================

INSERT INTO activity_log (user_id, activity_type, description, related_item_type, related_item_id) VALUES
((SELECT user_id FROM user WHERE institution_id='S001'), 'login',          'User ahmad_student logged in',                    NULL,           NULL),
((SELECT user_id FROM user WHERE institution_id='S001'), 'enroll',         'Student enrolled in a course',                    'course',       1),
((SELECT user_id FROM user WHERE institution_id='S001'), 'lesson_complete','Student completed a lesson',                      'module',       1),
((SELECT user_id FROM user WHERE institution_id='S001'), 'quiz_submit',    'Student submitted quiz. Score: 75.0%',            'quiz_attempt', 1),
((SELECT user_id FROM user WHERE institution_id='S002'), 'login',          'User mei_student logged in',                      NULL,           NULL),
((SELECT user_id FROM user WHERE institution_id='S002'), 'quiz_submit',    'Student submitted quiz. Score: 100.0%',           'quiz_attempt', 2),
((SELECT user_id FROM user WHERE institution_id='S004'), 'quiz_submit',    'Student submitted quiz. Score: 100.0%',           'quiz_attempt', 3),
((SELECT user_id FROM user WHERE institution_id='I001'), 'login',          'User dr_rahman logged in',                        NULL,           NULL),
((SELECT user_id FROM user WHERE institution_id='A001'), 'login',          'User advisor_ali logged in',                      NULL,           NULL);