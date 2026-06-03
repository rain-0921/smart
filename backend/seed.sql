-- ============================================================
-- Smart Interactive Learning System — Seed Data
-- Compatible with MySQL / MariaDB
-- ============================================================

SET FOREIGN_KEY_CHECKS = 0;

-- ============================================================
-- 1. USERS
-- ============================================================
-- Passwords are bcrypt hashes of "Password123!"
INSERT INTO user (user_id, username, email, password_hash, role, department, photo_url, phone_number, status, created_at) VALUES
-- Admins
(1,  'admin_alice',   'alice.admin@sils.edu',     '$2b$12$KIX/UzNV3sJ5Vj7OGz9FIuLQzM1eN3kPdVwXyZ0aB4cD6eF8gH2iJ', 'admin',    'IT',               NULL, '+60112345678', 'active', '2025-01-01 08:00:00'),

-- Academic Advisors
(2,  'advisor_bob',   'bob.advisor@sils.edu',     '$2b$12$KIX/UzNV3sJ5Vj7OGz9FIuLQzM1eN3kPdVwXyZ0aB4cD6eF8gH2iJ', 'advisor',  'Computer Science',  NULL, '+60112345679', 'active', '2025-01-02 08:00:00'),
(3,  'advisor_carol', 'carol.advisor@sils.edu',   '$2b$12$KIX/UzNV3sJ5Vj7OGz9FIuLQzM1eN3kPdVwXyZ0aB4cD6eF8gH2iJ', 'advisor',  'Information Tech',  NULL, '+60112345680', 'active', '2025-01-02 08:30:00'),

-- Instructors
(4,  'ins_david',     'david.ins@sils.edu',       '$2b$12$KIX/UzNV3sJ5Vj7OGz9FIuLQzM1eN3kPdVwXyZ0aB4cD6eF8gH2iJ', 'instructor','Computer Science',  NULL, '+60112345681', 'active', '2025-01-03 08:00:00'),
(5,  'ins_eva',       'eva.ins@sils.edu',          '$2b$12$KIX/UzNV3sJ5Vj7OGz9FIuLQzM1eN3kPdVwXyZ0aB4cD6eF8gH2iJ', 'instructor','Information Tech',  NULL, '+60112345682', 'active', '2025-01-03 09:00:00'),
(6,  'ins_frank',     'frank.ins@sils.edu',        '$2b$12$KIX/UzNV3sJ5Vj7OGz9FIuLQzM1eN3kPdVwXyZ0aB4cD6eF8gH2iJ', 'instructor','Mathematics',       NULL, '+60112345683', 'active', '2025-01-03 10:00:00'),

-- Students
(7,  'stu_grace',     'grace.stu@sils.edu',        '$2b$12$KIX/UzNV3sJ5Vj7OGz9FIuLQzM1eN3kPdVwXyZ0aB4cD6eF8gH2iJ', 'student',  'Computer Science',  NULL, '+60112345684', 'active', '2025-01-10 08:00:00'),
(8,  'stu_henry',     'henry.stu@sils.edu',         '$2b$12$KIX/UzNV3sJ5Vj7OGz9FIuLQzM1eN3kPdVwXyZ0aB4cD6eF8gH2iJ', 'student',  'Computer Science',  NULL, '+60112345685', 'active', '2025-01-10 08:30:00'),
(9,  'stu_iris',      'iris.stu@sils.edu',          '$2b$12$KIX/UzNV3sJ5Vj7OGz9FIuLQzM1eN3kPdVwXyZ0aB4cD6eF8gH2iJ', 'student',  'Information Tech',  NULL, '+60112345686', 'active', '2025-01-11 08:00:00'),
(10, 'stu_james',     'james.stu@sils.edu',         '$2b$12$KIX/UzNV3sJ5Vj7OGz9FIuLQzM1eN3kPdVwXyZ0aB4cD6eF8gH2iJ', 'student',  'Information Tech',  NULL, '+60112345687', 'active', '2025-01-11 09:00:00'),
(11, 'stu_karen',     'karen.stu@sils.edu',         '$2b$12$KIX/UzNV3sJ5Vj7OGz9FIuLQzM1eN3kPdVwXyZ0aB4cD6eF8gH2iJ', 'student',  'Mathematics',       NULL, '+60112345688', 'active', '2025-01-12 08:00:00'),
(12, 'stu_leo',       'leo.stu@sils.edu',           '$2b$12$KIX/UzNV3sJ5Vj7OGz9FIuLQzM1eN3kPdVwXyZ0aB4cD6eF8gH2iJ', 'student',  'Mathematics',       NULL, '+60112345689', 'active', '2025-01-12 09:00:00');

-- ============================================================
-- 2. STUDENT PROFILES
-- ============================================================
INSERT INTO student_profile (user_id, academic_level, programme, learning_preferences, advisor_id, gpa, is_at_risk) VALUES
(7,  'Year 2', 'Bachelor of Computer Science',      'Visual',  2, 3.50, FALSE),
(8,  'Year 2', 'Bachelor of Computer Science',      'Reading', 2, 2.10, TRUE),
(9,  'Year 1', 'Bachelor of Information Technology','Video',   3, 3.80, FALSE),
(10, 'Year 1', 'Bachelor of Information Technology','Mixed',   3, 2.95, FALSE),
(11, 'Year 3', 'Bachelor of Mathematics',           'Reading', 2, 3.20, FALSE),
(12, 'Year 3', 'Bachelor of Mathematics',           'Visual',  3, 1.80, TRUE);

-- ============================================================
-- 3. INSTRUCTOR PROFILES
-- ============================================================
INSERT INTO instructor_profile (user_id, specialization, subjects_taught, office_hours) VALUES
(4, 'Software Engineering',    'Software Engineering, Database Systems',      'Mon 9am–12pm, Wed 2pm–4pm'),
(5, 'Network & Security',      'Network Fundamentals, Cybersecurity',         'Tue 10am–12pm, Thu 1pm–3pm'),
(6, 'Applied Mathematics',     'Discrete Mathematics, Linear Algebra',        'Mon 2pm–4pm, Fri 9am–11am');

-- ============================================================
-- 4. COURSES
-- ============================================================
INSERT INTO course (course_id, title, status, description, instructor_id, created_at) VALUES
(1, 'Software Engineering Fundamentals', 'published', 'Covers SDLC, requirements, design patterns, and testing.', 4, '2025-01-15 09:00:00'),
(2, 'Database Systems',                  'published', 'Relational databases, SQL, normalization, and transactions.', 4, '2025-01-15 09:30:00'),
(3, 'Network Fundamentals',              'published', 'OSI model, TCP/IP, routing and switching basics.', 5, '2025-01-16 09:00:00'),
(4, 'Cybersecurity Essentials',          'published', 'Threats, cryptography, firewalls, and incident response.', 5, '2025-01-16 10:00:00'),
(5, 'Discrete Mathematics',              'published', 'Logic, sets, relations, graph theory, and combinatorics.', 6, '2025-01-17 09:00:00'),
(6, 'Introduction to Web Development',   'draft',     'HTML, CSS, JavaScript fundamentals for beginners.', 4, '2025-02-01 10:00:00');

-- ============================================================
-- 5. ENROLLMENTS
-- ============================================================
INSERT INTO enrollment (enrollment_id, user_id, course_id, enrolled_at, status, completion_percent, completed_at) VALUES
-- Grace (student 7)
(1,  7, 1, '2025-01-20 10:00:00', 'active',    65.00, NULL),
(2,  7, 2, '2025-01-20 10:05:00', 'active',    40.00, NULL),
-- Henry (student 8)
(3,  8, 1, '2025-01-21 09:00:00', 'active',    20.00, NULL),
(4,  8, 3, '2025-01-21 09:05:00', 'active',    15.00, NULL),
-- Iris (student 9)
(5,  9, 3, '2025-01-22 11:00:00', 'active',    80.00, NULL),
(6,  9, 4, '2025-01-22 11:05:00', 'active',    55.00, NULL),
-- James (student 10)
(7,  10, 3, '2025-01-23 10:00:00', 'active',   30.00, NULL),
(8,  10, 4, '2025-01-23 10:05:00', 'active',   25.00, NULL),
-- Karen (student 11)
(9,  11, 5, '2025-01-24 08:00:00', 'completed', 100.00, '2025-04-30 17:00:00'),
(10, 11, 2, '2025-01-24 08:05:00', 'active',    70.00, NULL),
-- Leo (student 12)
(11, 12, 5, '2025-01-25 09:00:00', 'active',   10.00, NULL),
(12, 12, 1, '2025-01-25 09:05:00', 'active',    5.00, NULL);

-- ============================================================
-- 6. MODULES
-- ============================================================
INSERT INTO module (module_id, course_id, title, description, sort_order) VALUES
-- Course 1: Software Engineering Fundamentals
(1,  1, 'Introduction to Software Engineering', 'Overview of SDLC and methodologies.', 1),
(2,  1, 'Requirements Engineering',              'Functional and non-functional requirements.', 2),
(3,  1, 'Software Design',                       'Design patterns, UML, and architecture.', 3),
(4,  1, 'Testing & Quality Assurance',           'Unit, integration, and system testing.', 4),
-- Course 2: Database Systems
(5,  2, 'Relational Model & SQL Basics',         'Tables, keys, and basic SQL queries.', 1),
(6,  2, 'Advanced SQL & Normalization',          'Joins, subqueries, and normal forms.', 2),
(7,  2, 'Transactions & Concurrency',            'ACID properties and locking mechanisms.', 3),
-- Course 3: Network Fundamentals
(8,  3, 'OSI & TCP/IP Models',                   'Layers, protocols, and encapsulation.', 1),
(9,  3, 'IP Addressing & Subnetting',            'IPv4/IPv6, CIDR, and subnetting.', 2),
(10, 3, 'Routing & Switching',                   'Static/dynamic routing, VLANs.', 3),
-- Course 4: Cybersecurity Essentials
(11, 4, 'Threats & Vulnerabilities',             'Common attack vectors and CVEs.', 1),
(12, 4, 'Cryptography',                          'Symmetric, asymmetric, and hashing.', 2),
-- Course 5: Discrete Mathematics
(13, 5, 'Logic & Proofs',                        'Propositional and predicate logic.', 1),
(14, 5, 'Sets, Relations & Functions',           'Set operations, relations, mappings.', 2),
(15, 5, 'Graph Theory',                          'Graphs, trees, and traversal algorithms.', 3);

-- ============================================================
-- 7. LESSONS
-- ============================================================
INSERT INTO lesson (lesson_id, module_id, title, content_type, content_url, content_text, sort_order, duration_minutes, status) VALUES
-- Module 1
(1,  1, 'What is Software Engineering?', 'video',  'https://youtu.be/example_se_intro',      NULL,                                               1, 10, 'published'),
(2,  1, 'SDLC Models Overview',          'pdf',    'https://cdn.sils.edu/sdlc_models.pdf',   NULL,                                               2, 20, 'published'),
(3,  1, 'Agile vs Waterfall',            'text',   NULL,  'Agile emphasises iterative delivery; Waterfall follows strict sequential phases.',     3, 15, 'published'),
-- Module 2
(4,  2, 'Functional Requirements',       'video',  'https://youtu.be/example_func_req',      NULL,                                               1, 12, 'published'),
(5,  2, 'Non-Functional Requirements',   'pdf',    'https://cdn.sils.edu/nfr_guide.pdf',     NULL,                                               2, 18, 'published'),
(6,  2, 'Use Case Writing',              'text',   NULL,  'A use case describes an interaction between an actor and the system.',                3, 10, 'published'),
-- Module 5
(7,  5, 'Introduction to SQL',           'video',  'https://youtu.be/example_sql_intro',     NULL,                                               1, 15, 'published'),
(8,  5, 'SELECT Statements',             'pdf',    'https://cdn.sils.edu/sql_select.pdf',    NULL,                                               2, 20, 'published'),
-- Module 8
(9,  8, 'The OSI Model',                 'video',  'https://youtu.be/example_osi',           NULL,                                               1, 14, 'published'),
(10, 8, 'TCP/IP Protocol Suite',         'pdf',    'https://cdn.sils.edu/tcpip.pdf',         NULL,                                               2, 20, 'published'),
-- Module 13
(11, 13, 'Propositional Logic',          'video',  'https://youtu.be/example_logic',         NULL,                                               1, 16, 'published'),
(12, 13, 'Proof Techniques',             'pdf',    'https://cdn.sils.edu/proofs.pdf',        NULL,                                               2, 22, 'published');

-- ============================================================
-- 8. QUIZZES
-- ============================================================
INSERT INTO quiz (quiz_id, course_id, module_id, title, status, description, due_date, time_limit_minutes, max_attempts, randomize_questions, num_questions_per_attempt, submission_type, created_by, created_at) VALUES
(1, 1, 2,  'Requirements Engineering Quiz',     'published', 'Tests knowledge of functional and non-functional requirements.', '2025-03-01 23:59:00', 20, 2, TRUE,  5,  'online_quiz', 4, '2025-01-25 10:00:00'),
(2, 1, 4,  'Testing Concepts Quiz',             'published', 'Covers unit testing, TDD, and quality assurance.',               '2025-03-15 23:59:00', 15, 2, TRUE,  4,  'online_quiz', 4, '2025-01-25 11:00:00'),
(3, 2, 5,  'SQL Basics Quiz',                   'published', 'Tests basic SELECT, INSERT, UPDATE, DELETE knowledge.',          '2025-03-05 23:59:00', 20, 3, TRUE,  5,  'online_quiz', 4, '2025-01-26 09:00:00'),
(4, 3, 8,  'OSI Model Quiz',                    'published', 'Tests understanding of the 7 layers of the OSI model.',         '2025-03-10 23:59:00', 15, 2, FALSE, 5,  'online_quiz', 5, '2025-01-27 09:00:00'),
(5, 5, 13, 'Logic & Proofs Quiz',               'published', 'Covers truth tables, tautologies, and direct proofs.',          '2025-03-20 23:59:00', 25, 2, TRUE,  5,  'online_quiz', 6, '2025-01-28 10:00:00'),
(6, 1, NULL,'Software Engineering Assignment',  'published', 'Submit a 2-page report on an SDLC model of your choice.',       '2025-04-01 23:59:00', NULL, 1, FALSE, NULL, 'file_upload', 4, '2025-01-30 10:00:00');

-- ============================================================
-- 9. QUESTIONS
-- ============================================================
INSERT INTO question (question_id, quiz_id, question_type, question_text, options, correct_answer, points, improvement_tip, sort_order) VALUES
-- Quiz 1: Requirements Engineering
(1,  1, 'mcq',          'Which of the following is a non-functional requirement?',
  '["Performance","User login","Generate report","Search courses"]',
  'Performance', 2, 'Non-functional requirements define system qualities like performance, security, and usability — not specific behaviours.', 1),
(2,  1, 'mcq',          'A use case describes an interaction between:',
  '["Two databases","An actor and the system","Two instructors","A module and a lesson"]',
  'An actor and the system', 2, 'A use case always involves at least one actor who interacts with the system to achieve a goal.', 2),
(3,  1, 'fill_blank',   'The ________ describes what the system should do.',
  NULL, 'functional requirement', 2, 'Functional requirements define the specific behaviours and features the system must provide.', 3),
(4,  1, 'short_answer', 'Briefly explain the difference between a functional and a non-functional requirement.',
  NULL, NULL, 4, 'Think about: functional = what the system does; non-functional = how well it does it.', 4),
(5,  1, 'mcq',          'Which diagram is commonly used to represent use cases?',
  '["Class diagram","Use Case diagram","ER diagram","Sequence diagram"]',
  'Use Case diagram', 2, 'Use case diagrams show actors, use cases, and the relationships between them.', 5),

-- Quiz 2: Testing Concepts
(6,  2, 'mcq',          'Which testing type verifies individual units of code in isolation?',
  '["System testing","Integration testing","Unit testing","Acceptance testing"]',
  'Unit testing', 2, 'Unit testing focuses on individual functions or methods, isolating them from external dependencies.', 1),
(7,  2, 'mcq',          'TDD stands for:',
  '["Test-Driven Design","Test-Driven Development","Technical Data Definition","Testing & Design Document"]',
  'Test-Driven Development', 2, 'In TDD, tests are written before the code to define desired behaviour.', 2),
(8,  2, 'fill_blank',   'Testing that checks the system as a whole is called ________ testing.',
  NULL, 'system', 2, 'System testing validates the entire integrated application against specified requirements.', 3),
(9,  2, 'short_answer', 'What is regression testing and why is it important?',
  NULL, NULL, 4, 'Regression testing ensures that new changes have not broken previously working functionality.', 4),

-- Quiz 3: SQL Basics
(10, 3, 'mcq',          'Which SQL clause is used to filter rows?',
  '["ORDER BY","GROUP BY","WHERE","HAVING"]',
  'WHERE', 2, 'WHERE filters rows before any grouping; HAVING filters after GROUP BY.', 1),
(11, 3, 'mcq',          'Which statement is used to add a new row to a table?',
  '["UPDATE","INSERT INTO","ALTER TABLE","CREATE"]',
  'INSERT INTO', 2, 'INSERT INTO adds new records; UPDATE modifies existing ones.', 2),
(12, 3, 'fill_blank',   'The ________ keyword removes duplicate rows from a SELECT result.',
  NULL, 'DISTINCT', 2, 'SELECT DISTINCT returns only unique values in the result set.', 3),
(13, 3, 'mcq',          'Which join returns all rows from both tables, with NULLs where there is no match?',
  '["INNER JOIN","LEFT JOIN","RIGHT JOIN","FULL OUTER JOIN"]',
  'FULL OUTER JOIN', 2, 'FULL OUTER JOIN includes all rows from both tables, filling unmatched sides with NULL.', 4),
(14, 3, 'short_answer', 'Write a SQL query to retrieve all students with a GPA above 3.0.',
  NULL, NULL, 4, 'Use SELECT with a WHERE clause filtering the gpa column.', 5),

-- Quiz 4: OSI Model
(15, 4, 'mcq',          'How many layers does the OSI model have?',
  '["4","5","7","8"]',
  '7', 2, 'The OSI model has 7 layers: Physical, Data Link, Network, Transport, Session, Presentation, Application.', 1),
(16, 4, 'mcq',          'Which layer is responsible for routing packets between networks?',
  '["Data Link","Transport","Network","Application"]',
  'Network', 2, 'The Network layer (Layer 3) handles logical addressing and routing via IP.', 2),
(17, 4, 'fill_blank',   'The Transport layer protocol that provides reliable, ordered delivery is ________.',
  NULL, 'TCP', 2, 'TCP (Transmission Control Protocol) ensures reliable, ordered, and error-checked delivery.', 3),
(18, 4, 'mcq',          'Which layer handles physical transmission of raw bits?',
  '["Data Link","Network","Physical","Session"]',
  'Physical', 2, 'The Physical layer (Layer 1) deals with the transmission of raw bits over a medium.', 4),
(19, 4, 'mcq',          'HTTPS operates at which OSI layer?',
  '["Transport","Session","Presentation","Application"]',
  'Application', 2, 'HTTP/HTTPS operates at Layer 7 (Application), the topmost layer of the OSI model.', 5),

-- Quiz 5: Logic & Proofs
(20, 5, 'mcq',          'A tautology is a statement that is:',
  '["Always false","Sometimes true","Always true","Unprovable"]',
  'Always true', 2, 'A tautology is a propositional formula that is true under every possible truth assignment.', 1),
(21, 5, 'mcq',          'The negation of "P AND Q" is equivalent to:',
  '["NOT P AND NOT Q","NOT P OR NOT Q","P OR Q","NOT P AND Q"]',
  'NOT P OR NOT Q', 2, 'By De Morgan''s Law: NOT(P AND Q) ≡ NOT P OR NOT Q.', 2),
(22, 5, 'fill_blank',   'A proof by ________ assumes the negation of the conclusion and derives a contradiction.',
  NULL, 'contradiction', 2, 'Proof by contradiction (reductio ad absurdum) starts by assuming the opposite of what you want to prove.', 3),
(23, 5, 'mcq',          'Which symbol represents logical implication?',
  '["∧","∨","→","↔"]',
  '→', 2, 'The symbol → denotes "if P then Q" (implication). ↔ means "if and only if".', 4),
(24, 5, 'short_answer', 'Prove that the sum of two even integers is always even.',
  NULL, NULL, 4, 'Let a = 2m and b = 2n for integers m, n. Then a+b = 2(m+n), which is divisible by 2.', 5);

-- ============================================================
-- 10. QUIZ FEEDBACK (score ranges)
-- ============================================================
INSERT INTO quiz_feedback (quiz_feedback_id, quiz_id, min_score, max_score, feedback_message) VALUES
(1,  1, 80, 100, 'Excellent! You have a strong grasp of requirements engineering concepts.'),
(2,  1, 60,  79, 'Good effort. Review the differences between functional and non-functional requirements.'),
(3,  1,  0,  59, 'Needs improvement. Revisit the lecture materials and try the practice exercises.'),
(4,  3, 80, 100, 'Well done! Your SQL fundamentals are solid.'),
(5,  3, 60,  79, 'Good start. Practice more SELECT queries with different clauses.'),
(6,  3,  0,  59, 'Review the SQL basics lessons and attempt the exercises again.'),
(7,  4, 80, 100, 'Great understanding of the OSI model!'),
(8,  4,  0,  79, 'Revisit the OSI layer functions and protocol examples.'),
(9,  5, 80, 100, 'Excellent logical reasoning skills!'),
(10, 5,  0,  79, 'Practice truth tables and De Morgan''s Laws to strengthen your understanding.');

-- ============================================================
-- 11. QUIZ ATTEMPTS
-- ============================================================
INSERT INTO quiz_attempt (quiz_attempt_id, quiz_id, user_id, start_time, end_time, score, attempt_number, status, created_at) VALUES
-- Grace on Quiz 1
(1,  1, 7,  '2025-02-20 10:00:00', '2025-02-20 10:18:00', 8,  1, 'completed', '2025-02-20 10:00:00'),
-- Grace on Quiz 3
(2,  3, 7,  '2025-02-22 11:00:00', '2025-02-22 11:16:00', 10, 1, 'completed', '2025-02-22 11:00:00'),
-- Henry on Quiz 1
(3,  1, 8,  '2025-02-21 14:00:00', '2025-02-21 14:20:00', 4,  1, 'completed', '2025-02-21 14:00:00'),
-- Iris on Quiz 4
(4,  4, 9,  '2025-02-25 09:00:00', '2025-02-25 09:14:00', 9,  1, 'completed', '2025-02-25 09:00:00'),
-- James on Quiz 4
(5,  4, 10, '2025-02-26 10:00:00', '2025-02-26 10:15:00', 6,  1, 'completed', '2025-02-26 10:00:00'),
-- Karen on Quiz 5 (completed course)
(6,  5, 11, '2025-03-01 08:00:00', '2025-03-01 08:22:00', 12, 1, 'completed', '2025-03-01 08:00:00'),
-- Leo on Quiz 5 (at-risk)
(7,  5, 12, '2025-03-02 09:00:00', '2025-03-02 09:25:00', 4,  1, 'completed', '2025-03-02 09:00:00');

-- ============================================================
-- 12. ANSWERS (sample for Quiz 1, Attempt 1 — Grace)
-- ============================================================
INSERT INTO answer (answer_id, quiz_attempt_id, question_id, user_answer, is_correct, score_awarded, feedback, file_url, graded_by_user_id) VALUES
(1, 1, 1, 'Performance',            TRUE,  2, 'Correct! Performance is a non-functional requirement.',            NULL, NULL),
(2, 1, 2, 'An actor and the system',TRUE,  2, 'Correct!',                                                          NULL, NULL),
(3, 1, 3, 'functional requirement', TRUE,  2, 'Correct!',                                                          NULL, NULL),
(4, 1, 4, 'Functional requirements specify what the system should do; non-functional define how well it does it.', TRUE, 3, 'Good answer. Could also mention measurability of NFRs.', NULL, 4),
(5, 1, 5, 'ER diagram',             FALSE, 0, 'Incorrect. Use Case diagrams are used to model use cases, not ER diagrams which model data.', NULL, NULL),

-- Answers for Quiz 1, Attempt 3 — Henry (poor performance)
(6, 3, 1, 'User login',             FALSE, 0, 'User login is a functional requirement. Non-functional requirements describe system qualities.', NULL, NULL),
(7, 3, 2, 'Two databases',          FALSE, 0, 'A use case involves an actor and the system, not two databases.',  NULL, NULL),
(8, 3, 3, 'system requirement',     FALSE, 0, 'The correct answer is "functional requirement".',                  NULL, NULL),
(9, 3, 4, 'Not sure about this.',   FALSE, 1, 'Revisit the requirements module. Functional = what; Non-functional = how well.', NULL, 4),

-- Answers for Quiz 4, Attempt 1 — Iris (OSI quiz)
(10, 4, 15, '7',       TRUE,  2, 'Correct!',                                                                      NULL, NULL),
(11, 4, 16, 'Network', TRUE,  2, 'Correct!',                                                                      NULL, NULL),
(12, 4, 17, 'TCP',     TRUE,  2, 'Correct!',                                                                      NULL, NULL),
(13, 4, 18, 'Physical',TRUE,  2, 'Correct!',                                                                      NULL, NULL),
(14, 4, 19, 'Application', TRUE, 1, 'Correct!',                                                                   NULL, NULL);

-- ============================================================
-- 13. MODULE PROGRESS
-- ============================================================
INSERT INTO module_progress (user_id, module_id, status, completion_percentage, last_accessed, completed_at) VALUES
-- Grace — Course 1
(7, 1, 'completed',  100.00, '2025-02-10 10:00:00', '2025-02-10 10:45:00'),
(7, 2, 'completed',  100.00, '2025-02-15 11:00:00', '2025-02-15 12:00:00'),
(7, 3, 'in_progress', 50.00, '2025-02-28 09:00:00', NULL),
(7, 4, 'not_started',  0.00, NULL, NULL),
-- Grace — Course 2
(7, 5, 'completed',  100.00, '2025-02-18 14:00:00', '2025-02-18 15:30:00'),
(7, 6, 'in_progress', 30.00, '2025-03-01 10:00:00', NULL),
-- Henry — Course 1
(8, 1, 'completed',  100.00, '2025-02-12 09:00:00', '2025-02-12 10:00:00'),
(8, 2, 'in_progress', 20.00, '2025-02-20 14:00:00', NULL),
-- Iris — Course 3
(9, 8, 'completed',  100.00, '2025-02-05 10:00:00', '2025-02-05 11:00:00'),
(9, 9, 'completed',  100.00, '2025-02-12 10:00:00', '2025-02-12 11:30:00'),
(9, 10,'in_progress', 60.00, '2025-03-02 09:00:00', NULL),
-- Karen — Course 5 (completed)
(11,13,'completed',  100.00, '2025-03-10 08:00:00', '2025-03-10 09:00:00'),
(11,14,'completed',  100.00, '2025-03-20 08:00:00', '2025-03-20 09:00:00'),
(11,15,'completed',  100.00, '2025-04-01 08:00:00', '2025-04-01 09:30:00'),
-- Leo — at-risk, barely started
(12,13,'in_progress', 10.00, '2025-03-03 09:00:00', NULL);

-- ============================================================
-- 14. ACTIVITY LOGS
-- ============================================================
INSERT INTO activity_log (activity_log_id, user_id, activity_type, description, related_item_type, related_item_id, created_at) VALUES
(1,  7,  'login',           'Student Grace logged in.',                     NULL,      NULL, '2025-02-10 09:55:00'),
(2,  7,  'lesson_viewed',   'Viewed lesson: What is Software Engineering?', 'lesson',  1,    '2025-02-10 10:00:00'),
(3,  7,  'lesson_viewed',   'Viewed lesson: SDLC Models Overview.',         'lesson',  2,    '2025-02-10 10:15:00'),
(4,  7,  'quiz_attempted',  'Attempted Requirements Engineering Quiz.',     'quiz',    1,    '2025-02-20 10:00:00'),
(5,  8,  'login',           'Student Henry logged in.',                     NULL,      NULL, '2025-02-21 13:55:00'),
(6,  8,  'quiz_attempted',  'Attempted Requirements Engineering Quiz.',     'quiz',    1,    '2025-02-21 14:00:00'),
(7,  9,  'login',           'Student Iris logged in.',                      NULL,      NULL, '2025-02-25 08:50:00'),
(8,  9,  'lesson_viewed',   'Viewed lesson: The OSI Model.',                'lesson',  9,    '2025-02-05 10:00:00'),
(9,  9,  'quiz_attempted',  'Attempted OSI Model Quiz.',                    'quiz',    4,    '2025-02-25 09:00:00'),
(10, 4,  'course_published','Instructor David published: Software Engineering Fundamentals.', 'course', 1, '2025-01-15 09:00:00'),
(11, 4,  'quiz_created',    'Instructor David created: Requirements Engineering Quiz.',       'quiz',   1, '2025-01-25 10:00:00'),
(12, 1,  'user_created',    'Admin Alice created user account for Grace.',  'user',    7,    '2025-01-10 08:00:00'),
(13, 12, 'login',           'Student Leo logged in.',                       NULL,      NULL, '2025-03-02 08:55:00'),
(14, 12, 'quiz_attempted',  'Attempted Logic & Proofs Quiz.',               'quiz',    5,    '2025-03-02 09:00:00');

-- ============================================================
-- 15. NOTIFICATIONS
-- ============================================================
INSERT INTO notification (notification_id, user_id, title, message, type, is_read, related_item_type, related_item_id, created_at, target_role, scheduled_at) VALUES
-- To students
(1,  7,  'New Quiz Available',         'Requirements Engineering Quiz is now open. Due 01 Mar 2025.', 'quiz_available',    FALSE, 'quiz',   1, '2025-01-25 10:05:00', 'student', NULL),
(2,  7,  'Quiz Graded',                'Your Requirements Engineering Quiz has been graded. Score: 8/12.', 'quiz_graded',  TRUE,  'quiz',   1, '2025-02-20 10:20:00', 'student', NULL),
(3,  8,  'New Quiz Available',         'Requirements Engineering Quiz is now open. Due 01 Mar 2025.', 'quiz_available',    FALSE, 'quiz',   1, '2025-01-25 10:05:00', 'student', NULL),
(4,  8,  'Academic Alert',             'Your academic advisor has flagged your progress. Please schedule a meeting.', 'at_risk_alert', FALSE, NULL, NULL, '2025-02-22 09:00:00', 'student', NULL),
(5,  9,  'Quiz Graded',                'Your OSI Model Quiz has been graded. Score: 9/10.',           'quiz_graded',       TRUE,  'quiz',   4, '2025-02-25 09:20:00', 'student', NULL),
(6,  12, 'Performance Warning',        'Your progress in Discrete Mathematics is below expectations. Seek help early.', 'at_risk_alert', FALSE, 'course', 5, '2025-03-03 10:00:00', 'student', NULL),

-- To instructors
(7,  4,  'Assignment Submitted',       'Grace has submitted the Software Engineering Assignment.',    'assignment_submitted', FALSE, 'quiz', 6, '2025-03-15 14:00:00', 'instructor', NULL),
(8,  4,  'New Enrollment',             '2 new students enrolled in Software Engineering Fundamentals.', 'enrollment',    TRUE,  'course', 1, '2025-01-21 09:10:00', 'instructor', NULL),

-- To advisors
(9,  2,  'Student At Risk',            'Henry (stu_henry) has been flagged as academically at risk.', 'at_risk_flag',     FALSE, 'user',   8, '2025-02-22 09:00:00', 'advisor', NULL),
(10, 3,  'Student At Risk',            'Leo (stu_leo) has been flagged as academically at risk.',     'at_risk_flag',     FALSE, 'user',  12, '2025-03-03 10:00:00', 'advisor', NULL),

-- System-wide announcement from admin
(11, 7,  'System Maintenance',         'Scheduled maintenance on 15 Apr 2025, 2am–4am. Save your work beforehand.', 'announcement', TRUE, NULL, NULL, '2025-04-10 08:00:00', 'student', '2025-04-10 08:00:00'),
(12, 8,  'System Maintenance',         'Scheduled maintenance on 15 Apr 2025, 2am–4am. Save your work beforehand.', 'announcement', FALSE, NULL, NULL, '2025-04-10 08:00:00', 'student', '2025-04-10 08:00:00'),
(13, 9,  'System Maintenance',         'Scheduled maintenance on 15 Apr 2025, 2am–4am. Save your work beforehand.', 'announcement', FALSE, NULL, NULL, '2025-04-10 08:00:00', 'student', '2025-04-10 08:00:00');

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================
-- END OF SEED
-- ============================================================
