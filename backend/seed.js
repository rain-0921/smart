// SMIS Database Seed Script
// Run: node seed.js
// Requires: npm install mysql2 bcryptjs

const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

const DB_CONFIG = {
  host: '127.0.0.1',
  user: 'root',
  password: '',
  database: 'smis',
};

async function seed() {
  const db = await mysql.createConnection(DB_CONFIG);
  console.log('Connected to database.');

  // Disable FK checks during seeding
  await db.execute('SET FOREIGN_KEY_CHECKS = 0');

  try {
    const hash = (pw) => bcrypt.hashSync(pw, 10);

    // ── 1. USER ──────────────────────────────────────────────────────────────
    await db.execute('TRUNCATE TABLE `user`');
    const users = [
      // Admins
      [1, 'admin01',      'admin01@smis.edu',       hash('Admin@123'),    'admin',      'Administration',   null, '+60111000001', 'active', '2025-01-01 08:00:00'],
      // Advisors
      [2, 'advisor01',    'advisor01@smis.edu',     hash('Advisor@123'),  'advisor',    'Student Affairs',  null, '+60111000002', 'active', '2025-01-05 08:00:00'],
      [3, 'advisor02',    'advisor02@smis.edu',     hash('Advisor@123'),  'advisor',    'Student Affairs',  null, '+60111000003', 'active', '2025-01-05 08:30:00'],
      // Instructors
      [4, 'instructor01', 'instructor01@smis.edu',  hash('Instr@123'),    'instructor', 'Computer Science', null, '+60111000004', 'active', '2025-01-10 09:00:00'],
      [5, 'instructor02', 'instructor02@smis.edu',  hash('Instr@123'),    'instructor', 'Mathematics',      null, '+60111000005', 'active', '2025-01-10 09:30:00'],
      [6, 'instructor03', 'instructor03@smis.edu',  hash('Instr@123'),    'instructor', 'Data Science',     null, '+60111000006', 'active', '2025-01-11 09:00:00'],
      // Students
      [7,  'student01',   'student01@smis.edu',     hash('Student@123'),  'student',    'Computer Science', null, '+60111000007', 'active', '2025-02-01 10:00:00'],
      [8,  'student02',   'student02@smis.edu',     hash('Student@123'),  'student',    'Computer Science', null, '+60111000008', 'active', '2025-02-01 10:05:00'],
      [9,  'student03',   'student03@smis.edu',     hash('Student@123'),  'student',    'Mathematics',      null, '+60111000009', 'active', '2025-02-02 10:00:00'],
      [10, 'student04',   'student04@smis.edu',     hash('Student@123'),  'student',    'Mathematics',      null, '+60111000010', 'active', '2025-02-02 10:10:00'],
      [11, 'student05',   'student05@smis.edu',     hash('Student@123'),  'student',    'Data Science',     null, '+60111000011', 'active', '2025-02-03 10:00:00'],
      [12, 'student06',   'student06@smis.edu',     hash('Student@123'),  'student',    'Data Science',     null, '+60111000012', 'active', '2025-02-03 10:15:00'],
    ];
    for (const u of users) {
      await db.execute(
        'INSERT INTO `user` (user_id,username,email,password_hash,role,department,photo_url,phone_number,status,created_at) VALUES (?,?,?,?,?,?,?,?,?,?)',
        u
      );
    }
    console.log('✓ user');

    // ── 2. INSTRUCTOR_PROFILE ────────────────────────────────────────────────
    await db.execute('TRUNCATE TABLE `instructor_profile`');
    const instructorProfiles = [
      [4, 'Software Engineering', 'Web Development, Algorithms, OOP',          'Mon/Wed 10:00-12:00'],
      [5, 'Applied Mathematics',  'Calculus, Linear Algebra, Statistics',       'Tue/Thu 14:00-16:00'],
      [6, 'Machine Learning',     'Data Mining, Deep Learning, Python for DS',  'Wed/Fri 09:00-11:00'],
    ];
    for (const p of instructorProfiles) {
      await db.execute(
        'INSERT INTO `instructor_profile` (user_id,specialization,subjects_taught,office_hours) VALUES (?,?,?,?)',
        p
      );
    }
    console.log('✓ instructor_profile');

    // ── 3. STUDENT_PROFILE ───────────────────────────────────────────────────
    await db.execute('TRUNCATE TABLE `student_profile`');
    const studentProfiles = [
      // user_id, academic_level, programme, learning_preferences, advisor_id, gpa, is_at_risk
      [7,  'Year 2', 'Bachelor of Computer Science', 'Visual learner',   2, 3.50, 0],
      [8,  'Year 1', 'Bachelor of Computer Science', 'Reading/writing',  2, 2.80, 0],
      [9,  'Year 3', 'Bachelor of Mathematics',      'Hands-on practice',3, 3.75, 0],
      [10, 'Year 2', 'Bachelor of Mathematics',      'Visual learner',   3, 1.90, 1],
      [11, 'Year 1', 'Bachelor of Data Science',     'Mixed',            2, 3.20, 0],
      [12, 'Year 3', 'Bachelor of Data Science',     'Reading/writing',  3, 3.60, 0],
    ];
    for (const p of studentProfiles) {
      await db.execute(
        'INSERT INTO `student_profile` (user_id,academic_level,programme,learning_preferences,advisor_id,gpa,is_at_risk) VALUES (?,?,?,?,?,?,?)',
        p
      );
    }
    console.log('✓ student_profile');

    // ── 4. COURSE ────────────────────────────────────────────────────────────
    await db.execute('TRUNCATE TABLE `course`');
    const courses = [
      // course_id, instructor_id, title, description, status, created_at
      [1, 4, 'Web Development Fundamentals',  'HTML, CSS, JS basics for beginners.',           'published', '2025-02-01 08:00:00'],
      [2, 4, 'Object-Oriented Programming',   'OOP principles using Java.',                    'published', '2025-02-05 08:00:00'],
      [3, 5, 'Calculus I',                    'Limits, derivatives, and integrals.',           'published', '2025-02-03 08:00:00'],
      [4, 5, 'Linear Algebra',                'Vectors, matrices, and transformations.',       'draft',     '2025-02-10 08:00:00'],
      [5, 6, 'Introduction to Data Science',  'Python, pandas, and data visualisation.',      'published', '2025-02-07 08:00:00'],
      [6, 6, 'Machine Learning Basics',        'Supervised and unsupervised learning.',        'archived',  '2024-08-01 08:00:00'],
    ];
    for (const c of courses) {
      await db.execute(
        'INSERT INTO `course` (course_id,instructor_id,title,description,status,created_at) VALUES (?,?,?,?,?,?)',
        c
      );
    }
    console.log('✓ course');

    // ── 5. MODULE ────────────────────────────────────────────────────────────
    await db.execute('TRUNCATE TABLE `module`');
    const modules = [
      // module_id, course_id, title, description, sort_order
      [1,  1, 'Getting Started with HTML',      'Tags, elements, and document structure.', 1],
      [2,  1, 'Styling with CSS',               'Selectors, box model, flexbox.',          2],
      [3,  1, 'JavaScript Basics',              'Variables, loops, and functions.',        3],
      [4,  2, 'Classes and Objects',            'Defining and using classes.',             1],
      [5,  2, 'Inheritance and Polymorphism',   'Extending classes and overriding.',       2],
      [6,  3, 'Limits and Continuity',          'Understanding limits.',                  1],
      [7,  3, 'Differentiation',                'Rules and applications of derivatives.', 2],
      [8,  5, 'Python for Data Science',        'NumPy and pandas essentials.',           1],
      [9,  5, 'Data Visualisation',             'Matplotlib and Seaborn.',                2],
      [10, 6, 'Regression Models',              'Linear and logistic regression.',        1],
    ];
    for (const m of modules) {
      await db.execute(
        'INSERT INTO `module` (module_id,course_id,title,description,sort_order) VALUES (?,?,?,?,?)',
        m
      );
    }
    console.log('✓ module');

    // ── 6. LESSON ────────────────────────────────────────────────────────────
    await db.execute('TRUNCATE TABLE `lesson`');
    const lessons = [
      // lesson_id, module_id, title, content_type, content_url, content_text, sort_order, duration_minutes, status
      [1,  1, 'What is HTML?',              'video', 'https://cdn.smis.edu/html-intro.mp4',        null, 1, 10, 'published'],
      [2,  1, 'HTML Document Structure',   'text',  null, 'A basic HTML document starts with <!DOCTYPE html>...', 2, 5, 'published'],
      [3,  2, 'Introduction to CSS',       'video', 'https://cdn.smis.edu/css-intro.mp4',          null, 1, 12, 'published'],
      [4,  2, 'CSS Box Model',             'pdf',   'https://cdn.smis.edu/box-model.pdf',          null, 2, 8,  'published'],
      [5,  3, 'Variables and Data Types',  'video', 'https://cdn.smis.edu/js-vars.mp4',            null, 1, 15, 'published'],
      [6,  4, 'Defining a Class in Java',  'video', 'https://cdn.smis.edu/java-class.mp4',         null, 1, 18, 'published'],
      [7,  5, 'Inheritance in Java',       'text',  null, 'Inheritance lets a child class extend a parent class...', 1, 10, 'published'],
      [8,  6, 'Understanding Limits',      'pdf',   'https://cdn.smis.edu/limits.pdf',             null, 1, 20, 'published'],
      [9,  7, 'Power Rule',                'video', 'https://cdn.smis.edu/power-rule.mp4',         null, 1, 12, 'published'],
      [10, 8, 'Intro to NumPy',            'video', 'https://cdn.smis.edu/numpy.mp4',              null, 1, 20, 'published'],
      [11, 9, 'Matplotlib Basics',         'video', 'https://cdn.smis.edu/matplotlib.mp4',         null, 1, 15, 'published'],
      [12,10, 'Linear Regression',         'text',  null, 'Linear regression models the relationship between variables...', 1, 10, 'draft'],
    ];
    for (const l of lessons) {
      await db.execute(
        'INSERT INTO `lesson` (lesson_id,module_id,title,content_type,content_url,content_text,sort_order,duration_minutes,status) VALUES (?,?,?,?,?,?,?,?,?)',
        l
      );
    }
    console.log('✓ lesson');

    // ── 7. ENROLLMENT ────────────────────────────────────────────────────────
    await db.execute('TRUNCATE TABLE `enrollment`');
    const enrollments = [
      // enrollment_id, user_id, course_id, enrolled_at, status, completion_percent, completed_at
      [1,  7,  1, '2025-02-10 09:00:00', 'active',    75.00, null],
      [2,  7,  2, '2025-02-10 09:05:00', 'active',    40.00, null],
      [3,  8,  1, '2025-02-11 10:00:00', 'active',    20.00, null],
      [4,  9,  3, '2025-02-12 09:00:00', 'completed', 100.00,'2025-05-01 12:00:00'],
      [5,  10, 3, '2025-02-12 09:10:00', 'active',    30.00, null],
      [6,  11, 5, '2025-02-13 10:00:00', 'active',    60.00, null],
      [7,  12, 5, '2025-02-13 10:15:00', 'active',    85.00, null],
      [8,  12, 6, '2024-08-15 09:00:00', 'completed', 100.00,'2024-12-20 10:00:00'],
      [9,  7,  5, '2025-02-14 10:00:00', 'active',    10.00, null],
      [10, 11, 2, '2025-02-15 11:00:00', 'dropped',   5.00,  null],
    ];
    for (const e of enrollments) {
      await db.execute(
        'INSERT INTO `enrollment` (enrollment_id,user_id,course_id,enrolled_at,status,completion_percent,completed_at) VALUES (?,?,?,?,?,?,?)',
        e
      );
    }
    console.log('✓ enrollment');

    // ── 8. MODULE_PROGRESS ───────────────────────────────────────────────────
    await db.execute('TRUNCATE TABLE `module_progress`');
    const moduleProgress = [
      // user_id, module_id, status, completion_percentage, last_accessed, completed_at
      [7,  1, 'completed',   100.00, '2025-03-01 10:00:00', '2025-03-01 10:00:00'],
      [7,  2, 'completed',   100.00, '2025-03-10 11:00:00', '2025-03-10 11:00:00'],
      [7,  3, 'in_progress',  50.00, '2025-03-15 14:00:00', null],
      [8,  1, 'in_progress',  40.00, '2025-03-05 09:00:00', null],
      [9,  6, 'completed',   100.00, '2025-04-01 10:00:00', '2025-04-01 10:00:00'],
      [9,  7, 'completed',   100.00, '2025-04-15 11:00:00', '2025-04-15 11:00:00'],
      [10, 6, 'in_progress',  30.00, '2025-03-20 10:00:00', null],
      [11, 8, 'completed',   100.00, '2025-03-25 09:00:00', '2025-03-25 09:00:00'],
      [11, 9, 'in_progress',  60.00, '2025-04-05 10:00:00', null],
      [12, 8, 'completed',   100.00, '2025-03-20 08:00:00', '2025-03-20 08:00:00'],
      [12, 9, 'completed',   100.00, '2025-04-01 09:00:00', '2025-04-01 09:00:00'],
    ];
    for (const mp of moduleProgress) {
      await db.execute(
        'INSERT INTO `module_progress` (user_id,module_id,status,completion_percentage,last_accessed,completed_at) VALUES (?,?,?,?,?,?)',
        mp
      );
    }
    console.log('✓ module_progress');

    // ── 9. QUIZ ──────────────────────────────────────────────────────────────
    await db.execute('TRUNCATE TABLE `quiz`');
    const quizzes = [
      // quiz_id, course_id, module_id, created_by, title, description, status, due_date, time_limit_minutes, max_attempts, randomize_questions, num_questions_per_attempt, submission_type, created_at
      [1, 1, 1, 4, 'HTML Basics Quiz',           'Test your HTML knowledge.',         'published', '2025-04-01 23:59:00', 20, 2, 0, null, 'online_quiz', '2025-03-01 09:00:00'],
      [2, 1, 2, 4, 'CSS Fundamentals Quiz',      'Test your CSS skills.',             'published', '2025-04-15 23:59:00', 30, 1, 1, 3,   'online_quiz', '2025-03-10 09:00:00'],
      [3, 2, 4, 4, 'OOP Classes Assignment',     'Submit your Java assignment.',       'published', '2025-04-20 23:59:00', null,1, 0, null,'file_upload',  '2025-03-15 09:00:00'],
      [4, 3, 6, 5, 'Limits Quiz',                'Test understanding of limits.',     'published', '2025-04-10 23:59:00', 25, 2, 0, null, 'online_quiz', '2025-03-05 09:00:00'],
      [5, 5, 8, 6, 'NumPy & Pandas Quiz',        'Assess Python data skills.',        'published', '2025-04-25 23:59:00', 30, 1, 1, 4,   'online_quiz', '2025-03-20 09:00:00'],
      [6, 5, 9, 6, 'Data Viz Assignment',        'Submit your chart analysis.',       'archived',  '2025-03-30 23:59:00', null,1, 0, null,'file_upload',  '2025-03-01 09:00:00'],
    ];
    for (const q of quizzes) {
      await db.execute(
        'INSERT INTO `quiz` (quiz_id,course_id,module_id,created_by,title,description,status,due_date,time_limit_minutes,max_attempts,randomize_questions,num_questions_per_attempt,submission_type,created_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)',
        q
      );
    }
    console.log('✓ quiz');

    // ── 10. QUIZ_FEEDBACK ────────────────────────────────────────────────────
    await db.execute('TRUNCATE TABLE `quiz_feedback`');
    const quizFeedback = [
      [1, 1,  0.00, 49.99, 'Keep practising — review the HTML basics module.'],
      [2, 1, 50.00, 74.99, 'Good effort! A few more reviews and you\'ll ace it.'],
      [3, 1, 75.00,100.00, 'Excellent! You have a solid grasp of HTML.'],
      [4, 4,  0.00, 49.99, 'Review the limits chapter before your next attempt.'],
      [5, 4, 50.00,100.00, 'Well done on the limits quiz!'],
      [6, 5,  0.00, 59.99, 'Revisit NumPy and Pandas fundamentals.'],
      [7, 5, 60.00,100.00, 'Great work on the Python data quiz!'],
    ];
    for (const f of quizFeedback) {
      await db.execute(
        'INSERT INTO `quiz_feedback` (quiz_feedback_id,quiz_id,min_score,max_score,feedback_message) VALUES (?,?,?,?,?)',
        f
      );
    }
    console.log('✓ quiz_feedback');

    // ── 11. QUESTION ────────────────────────────────────────────────────────
    await db.execute('TRUNCATE TABLE `question`');
    const questions = [
      // question_id, quiz_id, question_type, question_text, options (JSON), correct_answer, points, improvement_tip, sort_order

      // Quiz 1 – HTML Basics
      [1,  1, 'mcq',          'What does HTML stand for?',
        JSON.stringify(['HyperText Markup Language','HyperText Machine Language','HighText Markup Language','None of the above']),
        'HyperText Markup Language', 2, 'HTML stands for HyperText Markup Language.', 1],
      [2,  1, 'fill_blank',   'The ___ tag is used to define the largest heading in HTML.', null, 'h1', 2, 'Headings go from <h1> (largest) to <h6> (smallest).', 2],
      [3,  1, 'short_answer', 'Explain the purpose of the <!DOCTYPE html> declaration.', null, 'It defines the document type and version of HTML.', 3, 'DOCTYPE tells the browser which version of HTML to use.', 3],

      // Quiz 2 – CSS Fundamentals
      [4,  2, 'mcq',          'Which CSS property controls text size?',
        JSON.stringify(['font-size','text-size','font-weight','text-style']),
        'font-size', 2, 'Use font-size to control text size in CSS.', 1],
      [5,  2, 'mcq',          'What does the CSS box model include?',
        JSON.stringify(['Margin, Border, Padding, Content','Margin, Font, Padding, Content','Border, Font, Margin, Layout','None of the above']),
        'Margin, Border, Padding, Content', 2, 'The box model consists of Margin, Border, Padding, and Content.', 2],
      [6,  2, 'fill_blank',   'To center a block element horizontally, set margin to ___.', null, 'auto', 2, 'Use margin: auto with a defined width to center elements.', 3],

      // Quiz 4 – Limits
      [7,  4, 'mcq',          'What is the limit of f(x) = x² as x → 3?',
        JSON.stringify(['6','9','3','0']),
        '9', 3, 'Substitute x = 3 directly: 3² = 9.', 1],
      [8,  4, 'short_answer', 'Define the concept of a limit in calculus.', null, 'A limit describes the value a function approaches as the input approaches a point.', 3, 'Think of a limit as the expected value, not necessarily the actual value.', 2],
      [9,  4, 'fill_blank',   'A function is continuous at x = a if the limit as x → a equals ___.', null, 'f(a)', 2, 'Continuity requires the limit and function value to match.', 3],

      // Quiz 5 – NumPy & Pandas
      [10, 5, 'mcq',          'Which function creates a NumPy array?',
        JSON.stringify(['np.array()','np.create()','np.make()','np.list()']),
        'np.array()', 2, 'Use np.array() to create arrays in NumPy.', 1],
      [11, 5, 'mcq',          'Which pandas object is used for tabular data?',
        JSON.stringify(['DataFrame','Series','Array','Matrix']),
        'DataFrame', 2, 'DataFrames are 2D labelled data structures in pandas.', 2],
      [12, 5, 'short_answer', 'How do you read a CSV file using pandas?', null, 'pd.read_csv("filename.csv")', 3, 'Use pd.read_csv() to load CSV data into a DataFrame.', 3],
      [13, 5, 'fill_blank',   'To select a column "age" from a DataFrame df, use df[___].', null, '"age"', 2, 'Use df["column_name"] to access a specific column.', 4],

      // Quiz 3 – OOP Classes Assignment (file_upload prompt)
      [14, 3, 'short_answer', 'Upload your completed Java OOP assignment (classes & objects). Attach your source files as a ZIP.', null, 'See attached submission.', 10, 'Make sure your classes compile and follow OOP principles.', 1],

      // Quiz 6 – Data Viz Assignment (file_upload prompt)
      [15, 6, 'short_answer', 'Upload your chart analysis report as a PDF.', null, 'See attached submission.', 10, 'Include clear visualisations and a written interpretation.', 1],
    ];
    for (const q of questions) {
      await db.execute(
        'INSERT INTO `question` (question_id,quiz_id,question_type,question_text,options,correct_answer,points,improvement_tip,sort_order) VALUES (?,?,?,?,?,?,?,?,?)',
        q
      );
    }
    console.log('✓ question');

    // ── 12. QUIZ_ATTEMPT ─────────────────────────────────────────────────────
    await db.execute('TRUNCATE TABLE `quiz_attempt`');
    const attempts = [
      // quiz_attempt_id, quiz_id, user_id, start_time, end_time, score, attempt_number, status, created_at
      [1, 1,  7, '2025-03-20 10:00:00', '2025-03-20 10:18:00', 6.00,  1, 'graded',      '2025-03-20 10:00:00'],
      [2, 1,  7, '2025-03-22 10:00:00', '2025-03-22 10:15:00', 7.00,  2, 'graded',      '2025-03-22 10:00:00'],
      [3, 1,  8, '2025-03-21 11:00:00', '2025-03-21 11:20:00', 4.00,  1, 'graded',      '2025-03-21 11:00:00'],
      [4, 2,  7, '2025-03-25 14:00:00', '2025-03-25 14:28:00', 5.00,  1, 'graded',      '2025-03-25 14:00:00'],
      [5, 4,  9, '2025-03-15 09:00:00', '2025-03-15 09:22:00', 8.00,  1, 'graded',      '2025-03-15 09:00:00'],
      [6, 4, 10, '2025-03-16 09:00:00', '2025-03-16 09:25:00', 3.00,  1, 'graded',      '2025-03-16 09:00:00'],
      [7, 5, 11, '2025-04-10 10:00:00', '2025-04-10 10:27:00', 7.00,  1, 'graded',      '2025-04-10 10:00:00'],
      [8, 5, 12, '2025-04-11 10:00:00', '2025-04-11 10:25:00', 9.00,  1, 'graded',      '2025-04-11 10:00:00'],
      [9, 3,  7, '2025-04-05 13:00:00', null,                  null,  1, 'in_progress', '2025-04-05 13:00:00'],
    ];
    for (const a of attempts) {
      await db.execute(
        'INSERT INTO `quiz_attempt` (quiz_attempt_id,quiz_id,user_id,start_time,end_time,score,attempt_number,status,created_at) VALUES (?,?,?,?,?,?,?,?,?)',
        a
      );
    }
    console.log('✓ quiz_attempt');

    // ── 13. ANSWER ───────────────────────────────────────────────────────────
    await db.execute('TRUNCATE TABLE `answer`');
    const answers = [
      // answer_id, quiz_attempt_id, question_id, user_answer, is_correct, score_awarded, feedback, file_url, graded_by_user_id
      // Attempt 1 (quiz 1, student 7)
      [1,  1, 1, 'HyperText Markup Language', 1, 2.00, 'Correct!',        null, null],
      [2,  1, 2, 'h1',                         1, 2.00, 'Correct!',        null, null],
      [3,  1, 3, 'Sets the document type.',     1, 2.00, 'Mostly correct.', null, 4],
      // Attempt 2 (quiz 1, student 7)
      [4,  2, 1, 'HyperText Markup Language', 1, 2.00, 'Correct!',        null, null],
      [5,  2, 2, 'h1',                         1, 2.00, 'Correct!',        null, null],
      [6,  2, 3, 'Declares document version.',  1, 3.00, 'Well explained.', null, 4],
      // Attempt 3 (quiz 1, student 8)
      [7,  3, 1, 'HyperText Machine Language', 0, 0.00, 'Incorrect.',      null, null],
      [8,  3, 2, 'h2',                          0, 0.00, 'Incorrect — it is h1.', null, null],
      [9,  3, 3, 'Not sure.',                   0, 4.00, 'Needs improvement.', null, 4],
      // Attempt 5 (quiz 4, student 9)
      [10, 5, 7, '9',                           1, 3.00, 'Correct!',        null, null],
      [11, 5, 8, 'A limit is the value a function approaches.', 1, 3.00, 'Great answer.', null, 5],
      [12, 5, 9, 'f(a)',                        1, 2.00, 'Correct!',        null, null],
      // Attempt 6 (quiz 4, student 10)
      [13, 6, 7, '6',                           0, 0.00, 'Incorrect — answer is 9.', null, null],
      [14, 6, 8, 'It is the actual value.',      0, 1.50, 'Partially correct.', null, 5],
      [15, 6, 9, 'f(0)',                         0, 0.00, 'Incorrect.',       null, null],
      // Attempt 7 (quiz 5, student 11)
      [16, 7, 10, 'np.array()',   1, 2.00, 'Correct!',     null, null],
      [17, 7, 11, 'DataFrame',    1, 2.00, 'Correct!',     null, null],
      [18, 7, 12, 'pd.read_csv()',1, 3.00, 'Correct!',     null, null],
      // Attempt 8 (quiz 5, student 12)
      [19, 8, 10, 'np.array()',   1, 2.00, 'Correct!',           null, null],
      [20, 8, 11, 'DataFrame',    1, 2.00, 'Correct!',           null, null],
      [21, 8, 12, 'pd.read_csv("file.csv")', 1, 3.00, 'Perfect.', null, null],
      [22, 8, 13, '"age"',        1, 2.00, 'Correct!',           null, null],
    ];
    for (const a of answers) {
      await db.execute(
        'INSERT INTO `answer` (answer_id,quiz_attempt_id,question_id,user_answer,is_correct,score_awarded,feedback,file_url,graded_by_user_id) VALUES (?,?,?,?,?,?,?,?,?)',
        a
      );
    }
    console.log('✓ answer');

    // ── 14. NOTIFICATION ─────────────────────────────────────────────────────
    await db.execute('TRUNCATE TABLE `notification`');
    const notifications = [
      // notification_id, user_id, title, message, type, is_read, related_item_type, related_item_id, target_role, scheduled_at, created_at
      [1,  7,  'New Quiz Available',      'HTML Basics Quiz is now open.',            'quiz',        0, 'quiz',       1,  'student',    null, '2025-03-01 09:05:00'],
      [2,  8,  'New Quiz Available',      'HTML Basics Quiz is now open.',            'quiz',        0, 'quiz',       1,  'student',    null, '2025-03-01 09:05:00'],
      [3,  9,  'New Quiz Available',      'Limits Quiz is now open.',                 'quiz',        1, 'quiz',       4,  'student',    null, '2025-03-05 09:05:00'],
      [4,  10, 'At-Risk Alert',           'Your GPA has dropped below 2.0.',          'alert',       0, 'student_profile', 10, 'student', null,'2025-03-10 08:00:00'],
      [5,  2,  'Student At Risk',         'student04 is at risk. Please follow up.',  'alert',       0, 'student_profile', 10, 'advisor', null,'2025-03-10 08:01:00'],
      [6,  7,  'Quiz Graded',             'Your HTML Basics Quiz has been graded.',   'quiz_result', 1, 'quiz_attempt', 2,'student',    null, '2025-03-23 10:00:00'],
      [7,  11, 'Course Reminder',         'Complete Module 9 before the deadline.',   'reminder',    0, 'module',     9,  'student',    '2025-04-20 08:00:00', '2025-04-18 08:00:00'],
      [8,  1,  'System Maintenance',      'Scheduled maintenance on Apr 30.',         'system',      0, null,         null,'admin',      null, '2025-04-01 10:00:00'],
    ];
    for (const n of notifications) {
      await db.execute(
        'INSERT INTO `notification` (notification_id,user_id,title,message,type,is_read,related_item_type,related_item_id,target_role,scheduled_at,created_at) VALUES (?,?,?,?,?,?,?,?,?,?,?)',
        n
      );
    }
    console.log('✓ notification');

    // ── 15. ACTIVITY_LOG ─────────────────────────────────────────────────────
    await db.execute('TRUNCATE TABLE `activity_log`');
    const activityLogs = [
      // activity_log_id, user_id, activity_type, description, related_item_type, related_item_id, created_at
      [1,  7,  'login',           'User logged in.',                       null,          null, '2025-03-20 09:55:00'],
      [2,  7,  'quiz_start',      'Started HTML Basics Quiz.',             'quiz',        1,    '2025-03-20 10:00:00'],
      [3,  7,  'quiz_submit',     'Submitted HTML Basics Quiz attempt 1.', 'quiz_attempt',1,    '2025-03-20 10:18:00'],
      [4,  8,  'login',           'User logged in.',                       null,          null, '2025-03-21 10:55:00'],
      [5,  8,  'quiz_start',      'Started HTML Basics Quiz.',             'quiz',        1,    '2025-03-21 11:00:00'],
      [6,  8,  'quiz_submit',     'Submitted HTML Basics Quiz.',           'quiz_attempt',3,    '2025-03-21 11:20:00'],
      [7,  9,  'login',           'User logged in.',                       null,          null, '2025-03-15 08:50:00'],
      [8,  9,  'quiz_start',      'Started Limits Quiz.',                  'quiz',        4,    '2025-03-15 09:00:00'],
      [9,  9,  'quiz_submit',     'Submitted Limits Quiz.',                'quiz_attempt',5,    '2025-03-15 09:22:00'],
      [10, 4,  'course_create',   'Created course: Web Development.',      'course',      1,    '2025-02-01 08:10:00'],
      [11, 4,  'quiz_create',     'Created HTML Basics Quiz.',             'quiz',        1,    '2025-03-01 09:00:00'],
      [12, 11, 'lesson_view',     'Viewed lesson: Intro to NumPy.',        'lesson',      10,   '2025-03-25 09:10:00'],
      [13, 12, 'lesson_view',     'Viewed lesson: Matplotlib Basics.',     'lesson',      11,   '2025-04-01 08:30:00'],
      [14, 1,  'user_create',     'Admin created user student06.',         'user',        12,   '2025-02-03 10:20:00'],
      [15, 10, 'enrollment',      'Enrolled in Calculus I.',               'course',      3,    '2025-02-12 09:10:00'],
    ];
    for (const l of activityLogs) {
      await db.execute(
        'INSERT INTO `activity_log` (activity_log_id,user_id,activity_type,description,related_item_type,related_item_id,created_at) VALUES (?,?,?,?,?,?,?)',
        l
      );
    }
    console.log('✓ activity_log');

    await db.execute('SET FOREIGN_KEY_CHECKS = 1');
    console.log('\n✅ Seeding complete! All 15 tables populated.');

  } catch (err) {
    await db.execute('SET FOREIGN_KEY_CHECKS = 1');
    console.error('❌ Seeding failed:', err.message);
    throw err;
  } finally {
    await db.end();
  }
}

seed();