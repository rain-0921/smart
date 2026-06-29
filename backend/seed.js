const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

let pool;
try {
  const dbModule = require('./config/db');

  pool = dbModule && typeof dbModule.query === 'function' ? dbModule : dbModule.pool;
  if (!pool || typeof pool.query !== 'function') throw new Error('invalid pool');
} catch {

  pool = mysql.createPool({
    host: '127.0.0.1',
    user: 'root',
    password: '',
    database: 'smis',
    waitForConnections: true,
    connectionLimit: 4,
  });
}

const T0 = new Date('2026-06-01T09:00:00');

const pad = (x) => String(x).padStart(2, '0');
const fmt = (d) =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:00`;


const D = (n, h = 9, m = 0) => {
  const d = new Date(T0);
  d.setDate(d.getDate() - n);
  d.setHours(h, m, 0, 0);
  return fmt(d);
};


const startAt = (n, h = 9, m = 0) => {
  const d = new Date(T0);
  d.setDate(d.getDate() - n);
  d.setHours(h, m, 0, 0);
  return d;
};
const addMin = (d, m) => {
  const nd = new Date(d);
  nd.setMinutes(nd.getMinutes() + m);
  return nd;
};


async function insertRows(table, rows, columns) {
  if (!rows.length) return;
  const placeholders = rows
    .map(() => `(${columns.map(() => '?').join(', ')})`)
    .join(', ');
  const sql = `INSERT INTO \`${table}\` (${columns.join(', ')}) VALUES ${placeholders}`;
  const params = rows.flatMap((r) => columns.map((c) => r[c] ?? null));
  await pool.query(sql, params);
}

async function seed() {
  console.log('🌱 SMIS seed starting…');
  console.log(`   timeline anchor T0 = ${fmt(T0)}`);

  const fkOrder = [
    ['activity_log'],
    ['notification'],
    ['answer'],
    ['quiz_attempt'],
    ['quiz_feedback'],
    ['question'],
    ['quiz'],
    ['module_progress'],
    ['lesson'],
    ['module'],
    ['enrollment'],
    ['course'],
    ['instructor_profile'],
    ['student_profile'],
    ['user'],
  ];

  console.log('🧹 clearing existing rows (child → parent)…');
  await pool.query('SET FOREIGN_KEY_CHECKS = 0');
  for (const [t] of fkOrder) {
    await pool.query(`DELETE FROM \`${t}\``);
  }
  await pool.query('SET FOREIGN_KEY_CHECKS = 1');

  try {
    await seedUsers();
    await seedInstructorProfiles();
    await seedStudentProfiles();
    await seedCourses();
    await seedModules();
    await seedLessons();
    await seedEnrollments();
    await seedModuleProgress();
    await seedQuizzes();
    await seedQuizFeedback();
    await seedQuestions();
    await seedQuizAttempts();
    await seedAnswers();
    await seedNotifications();
    await seedActivityLog();

    await deriveStudentRiskFlags();

    console.log('\n✅  Seed complete. Demo accounts:');
    console.log('    admin01 / admin01@smis.edu       (password: Admin@123)');
    console.log('    advisor01, advisor02             (Advisor@123)');
    console.log('    instructor01, 02, 03             (Instr@123)');
    console.log('    student01 … student10            (Student@123)');
  } catch (err) {
    console.error('\n❌  Seed failed:', err.message);
    console.error(err);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

async function seedUsers() {
  const rows = [
    { user_id: 1, username: 'admin01',      email: 'admin01@smis.edu',      password_hash: bcrypt.hashSync('Admin@123', 10),      role: 'admin',      department: 'Administration',   phone_number: '+60111000001', status: 'active', created_at: D(150, 8)  },
    { user_id: 2, username: 'advisor01',    email: 'advisor01@smis.edu',    password_hash: bcrypt.hashSync('Advisor@123', 10),    role: 'advisor',    department: 'Student Affairs',  phone_number: '+60111000002', status: 'active', created_at: D(145, 8)  },
    { user_id: 3, username: 'advisor02',    email: 'advisor02@smis.edu',    password_hash: bcrypt.hashSync('Advisor@123', 10),    role: 'advisor',    department: 'Student Affairs',  phone_number: '+60111000003', status: 'active', created_at: D(145, 9)  },
    { user_id: 4, username: 'instructor01', email: 'instructor01@smis.edu', password_hash: bcrypt.hashSync('Instr@123', 10),  role: 'instructor', department: 'Computer Science', phone_number: '+60111000004', status: 'active', created_at: D(140, 9)  },
    { user_id: 5, username: 'instructor02', email: 'instructor02@smis.edu', password_hash: bcrypt.hashSync('Instr@123', 10),  role: 'instructor', department: 'Mathematics',      phone_number: '+60111000005', status: 'active', created_at: D(140, 10) },
    { user_id: 6, username: 'instructor03', email: 'instructor03@smis.edu', password_hash: bcrypt.hashSync('Instr@123', 10),  role: 'instructor', department: 'Data Science',     phone_number: '+60111000006', status: 'active', created_at: D(138, 9)  },
    { user_id: 7,  username: 'student01',  email: 'student01@smis.edu',  password_hash: bcrypt.hashSync('Student@123', 10), role: 'student', department: 'Computer Science', phone_number: '+60111000007', status: 'active', created_at: D(120, 10) },
    { user_id: 8,  username: 'student02',  email: 'student02@smis.edu',  password_hash: bcrypt.hashSync('Student@123', 10), role: 'student', department: 'Computer Science', phone_number: '+60111000008', status: 'active', created_at: D(120, 10) },
    { user_id: 9,  username: 'student03',  email: 'student03@smis.edu',  password_hash: bcrypt.hashSync('Student@123', 10), role: 'student', department: 'Mathematics',      phone_number: '+60111000009', status: 'active', created_at: D(119, 11) },
    { user_id: 10, username: 'student04',  email: 'student04@smis.edu',  password_hash: bcrypt.hashSync('Student@123', 10), role: 'student', department: 'Mathematics',      phone_number: '+60111000010', status: 'active', created_at: D(119, 12) },
    { user_id: 11, username: 'student05',  email: 'student05@smis.edu',  password_hash: bcrypt.hashSync('Student@123', 10), role: 'student', department: 'Data Science',     phone_number: '+60111000011', status: 'active', created_at: D(118, 10) },
    { user_id: 12, username: 'student06',  email: 'student06@smis.edu',  password_hash: bcrypt.hashSync('Student@123', 10), role: 'student', department: 'Data Science',     phone_number: '+60111000012', status: 'active', created_at: D(118, 11) },
    { user_id: 13, username: 'student07',  email: 'student07@smis.edu',  password_hash: bcrypt.hashSync('Student@123', 10), role: 'student', department: 'Computer Science', phone_number: '+60111000013', status: 'active', created_at: D(118, 12) },
    { user_id: 14, username: 'student08',  email: 'student08@smis.edu',  password_hash: bcrypt.hashSync('Student@123', 10), role: 'student', department: 'Mathematics',      phone_number: '+60111000014', status: 'active', created_at: D(117, 10) },
    { user_id: 15, username: 'student09',  email: 'student09@smis.edu',  password_hash: bcrypt.hashSync('Student@123', 10), role: 'student', department: 'Data Science',     phone_number: '+60111000015', status: 'active', created_at: D(117, 11) },
    { user_id: 16, username: 'student10',  email: 'student10@smis.edu',  password_hash: bcrypt.hashSync('Student@123', 10), role: 'student', department: 'Computer Science', phone_number: '+60111000016', status: 'active', created_at: D(116, 10) },
  ];
  await insertRows('user', rows, [
    'user_id','username','email','password_hash','role','department','phone_number','status','created_at',
  ]);
  console.log(`   ✓ user             (${rows.length} rows)`);
}

async function seedInstructorProfiles() {
  const rows = [
    { user_id: 4, specialization: 'Software Engineering',     subjects_taught: 'Web Development, Algorithms, OOP, Databases',          office_hours: 'Mon/Wed 10:00-12:00, Fri 14:00-16:00' },
    { user_id: 5, specialization: 'Applied Mathematics',      subjects_taught: 'Calculus, Linear Algebra, Statistics, Discrete Math',   office_hours: 'Tue/Thu 14:00-16:00' },
    { user_id: 6, specialization: 'Machine Learning',         subjects_taught: 'Python for DS, Data Mining, Deep Learning, MLOps',     office_hours: 'Wed/Fri 09:00-11:00' },
  ];
  await insertRows('instructor_profile', rows, ['user_id','specialization','subjects_taught','office_hours']);
  console.log(`   ✓ instructor_profile (${rows.length} rows)`);
}

async function seedStudentProfiles() {
  const rows = [
    { user_id: 7,  academic_level: 'Year 2', programme: 'Bachelor of Computer Science', learning_preferences: 'Visual learner; prefers video walkthroughs',       advisor_id: 2 },
    { user_id: 8,  academic_level: 'Year 1', programme: 'Bachelor of Computer Science', learning_preferences: 'Reading/writing; likes long-form notes',           advisor_id: 2 },
    { user_id: 9,  academic_level: 'Year 3', programme: 'Bachelor of Mathematics',      learning_preferences: 'Hands-on practice; works through proofs',          advisor_id: 3 },
    { user_id: 10, academic_level: 'Year 2', programme: 'Bachelor of Mathematics',      learning_preferences: 'Visual learner; struggles with abstract concepts', advisor_id: 3 },
    { user_id: 11, academic_level: 'Year 1', programme: 'Bachelor of Data Science',     learning_preferences: 'Mixed; project-based',                             advisor_id: 2 },
    { user_id: 12, academic_level: 'Year 3', programme: 'Bachelor of Data Science',     learning_preferences: 'Reading/writing; note-taking',                     advisor_id: 3 },
    { user_id: 13, academic_level: 'Year 2', programme: 'Bachelor of Computer Science', learning_preferences: 'Hands-on practice; build-first learner',           advisor_id: 2 },
    { user_id: 14, academic_level: 'Year 3', programme: 'Bachelor of Mathematics',      learning_preferences: 'Visual learner; uses diagrams and flowcharts',     advisor_id: 3 },
    { user_id: 15, academic_level: 'Year 1', programme: 'Bachelor of Data Science',     learning_preferences: 'Mixed; enjoys group work',                         advisor_id: 2 },
    { user_id: 16, academic_level: 'Year 2', programme: 'Bachelor of Computer Science', learning_preferences: 'Reading/writing; thorough but slow',               advisor_id: 2 },
  ];
  await insertRows('student_profile', rows, ['user_id','academic_level','programme','learning_preferences','advisor_id']);
  console.log(`   ✓ student_profile  (${rows.length} rows)`);
}

async function seedCourses() {
  const rows = [
    { course_id: 1, instructor_id: 4, title: 'Web Development Fundamentals', description: 'HTML, CSS, and JavaScript basics for beginners.',                              status: 'published', created_at: D(110, 8) },
    { course_id: 2, instructor_id: 4, title: 'Object-Oriented Programming',   description: 'OOP principles using Java with a capstone mini-project.',                       status: 'published', created_at: D(108, 9) },
    { course_id: 3, instructor_id: 5, title: 'Calculus I',                    description: 'Limits, derivatives, and integrals with applications.',                        status: 'published', created_at: D(110, 10) },
    { course_id: 4, instructor_id: 5, title: 'Linear Algebra',                description: 'Vectors, matrices, eigenvalues, and transformations.',                         status: 'draft',     created_at: D(105, 11) },
    { course_id: 5, instructor_id: 6, title: 'Introduction to Data Science',  description: 'Python, pandas, NumPy, and data visualisation foundations.',                    status: 'published', created_at: D(109, 8) },
    { course_id: 6, instructor_id: 6, title: 'Machine Learning Basics',       description: 'Supervised vs unsupervised learning, model evaluation, and deployment basics.', status: 'archived',  created_at: D(280, 8) },
    { course_id: 7, instructor_id: 4, title: 'Databases & SQL',               description: 'Relational modelling, SQL, indexes, and transactions.',                        status: 'published', created_at: D(95, 9) },
  ];
  await insertRows('course', rows, ['course_id','instructor_id','title','description','status','created_at']);
  console.log(`   ✓ course           (${rows.length} rows)`);
}

async function seedModules() {
  const rows = [
    { module_id: 1,  course_id: 1, title: 'Getting Started with HTML',    description: 'Tags, elements, and document structure.',              sort_order: 1, status: 'published' },
    { module_id: 2,  course_id: 1, title: 'Styling with CSS',             description: 'Selectors, the box model, and flexbox basics.',         sort_order: 2, status: 'published' },
    { module_id: 3,  course_id: 1, title: 'JavaScript Basics',            description: 'Variables, control flow, and functions.',              sort_order: 3, status: 'published' },
    { module_id: 4,  course_id: 1, title: 'Responsive Layouts',           description: 'Media queries and modern CSS layout.',                 sort_order: 4, status: 'published' },
    { module_id: 5,  course_id: 2, title: 'Classes and Objects',          description: 'Defining and using classes in Java.',                   sort_order: 1, status: 'published' },
    { module_id: 6,  course_id: 2, title: 'Inheritance and Polymorphism', description: 'Extending classes and method overriding.',              sort_order: 2, status: 'published' },
    { module_id: 7,  course_id: 2, title: 'Interfaces and SOLID',         description: 'Designing extensible OOP systems.',                    sort_order: 3, status: 'published' },
    { module_id: 8,  course_id: 3, title: 'Limits and Continuity',        description: 'Understanding limits intuitively and formally.',        sort_order: 1, status: 'published' },
    { module_id: 9,  course_id: 3, title: 'Differentiation',              description: 'Rules and applications of derivatives.',               sort_order: 2, status: 'published' },
    { module_id: 10, course_id: 3, title: 'Integration Basics',           description: 'Antiderivatives and the fundamental theorem of calculus.', sort_order: 3, status: 'published' },
    { module_id: 11, course_id: 5, title: 'Python for Data Science',      description: 'NumPy and pandas essentials.',                          sort_order: 1, status: 'published' },
    { module_id: 12, course_id: 5, title: 'Data Visualisation',           description: 'Matplotlib and Seaborn charts.',                        sort_order: 2, status: 'published' },
    { module_id: 13, course_id: 5, title: 'Exploratory Data Analysis',    description: 'Cleaning, profiling, and summarising datasets.',        sort_order: 3, status: 'published' },
    { module_id: 14, course_id: 6, title: 'Regression Models',            description: 'Linear and logistic regression.',                       sort_order: 1, status: 'published' },
    { module_id: 15, course_id: 6, title: 'Classification Basics',        description: 'kNN, decision trees, and evaluation metrics.',          sort_order: 2, status: 'archived' },
    { module_id: 16, course_id: 7, title: 'Relational Foundations',       description: 'Tables, keys, and basic normalisation.',                sort_order: 1, status: 'published' },
    { module_id: 17, course_id: 7, title: 'Writing SQL Queries',          description: 'SELECT, joins, grouping, and aggregation.',             sort_order: 2, status: 'published' },
  ];
  await insertRows('module', rows, ['module_id','course_id','title','description','sort_order','status']);
  console.log(`   ✓ module           (${rows.length} rows)`);
}

async function seedLessons() {
  const rows = [
    { lesson_id: 1,  module_id: 1,  title: 'What is HTML?',                              content_type: 'video', content_url: 'https://www.youtube.com/watch?v=qz0aGYrrlhU', content_text: null, sort_order: 1, duration_minutes: 10, status: 'published' },
    { lesson_id: 2,  module_id: 1,  title: 'HTML Document Structure',                    content_type: 'text',  content_url: null, content_text: 'An HTML document begins with <!DOCTYPE html> which tells the browser this is an HTML5 document.\n\nThe basic structure:\n• <html> — the root element that wraps all content\n• <head> — contains meta info (title, charset, links to CSS)\n• <body> — contains all visible page content\n\nKey points:\n1. Tags are case-insensitive but lowercase is the convention.\n2. Most tags come in pairs: an opening tag and a closing tag.\n3. Self-closing tags like <br> and <img> do not need a closing tag.', sort_order: 2, duration_minutes: 5, status: 'published' },

    { lesson_id: 3,  module_id: 2,  title: 'Introduction to CSS',                        content_type: 'video', content_url: 'https://www.youtube.com/watch?v=OXGznpKZ_sA', content_text: null, sort_order: 1, duration_minutes: 12, status: 'published' },
    { lesson_id: 4,  module_id: 2,  title: 'CSS Box Model',                              content_type: 'pdf',   content_url: 'https://www.w3.org/TR/CSS2/box.html',          content_text: null, sort_order: 2, duration_minutes: 8,  status: 'published' },

    { lesson_id: 5,  module_id: 3,  title: 'Variables and Data Types',                   content_type: 'video', content_url: 'https://www.youtube.com/watch?v=W6NZfCO5SIk', content_text: null, sort_order: 1, duration_minutes: 15, status: 'published' },
    { lesson_id: 6,  module_id: 3,  title: 'Control Flow',                               content_type: 'text',  content_url: null, content_text: 'JavaScript offers standard control-flow primitives: `if/else`, `switch`, `for`, `while`, `do/while`, and the modern `for…of` loop for iterables.\n\nTruthiness rules:\n• `0`, `""`, `null`, `undefined`, `NaN`, and `false` are falsy.\n• Everything else is truthy — including non-empty arrays and objects.', sort_order: 2, duration_minutes: 10, status: 'published' },

    { lesson_id: 7,  module_id: 4,  title: 'Media Queries',                              content_type: 'video', content_url: 'https://www.youtube.com/watch?v=srvUrASNj0s', content_text: null, sort_order: 1, duration_minutes: 9,  status: 'published' },

    { lesson_id: 8,  module_id: 5,  title: 'Defining a Class in Java',                   content_type: 'video', content_url: 'https://www.youtube.com/watch?v=IUqKuGNasdM', content_text: null, sort_order: 1, duration_minutes: 18, status: 'published' },

    { lesson_id: 9,  module_id: 6,  title: 'Inheritance in Java',                        content_type: 'text',  content_url: null, content_text: 'Inheritance allows a child class to acquire the properties and methods of a parent class using the `extends` keyword.\n\nExample:\npublic class Animal {\n    String name;\n    public void speak() {\n        System.out.println("Some sound");\n    }\n}\n\npublic class Dog extends Animal {\n    @Override\n    public void speak() {\n        System.out.println("Woof!");\n    }\n}\n\nKey concepts:\n• `super` keyword — calls the parent class constructor or method\n• `@Override` annotation — signals that a method is overriding a parent method\n• Polymorphism — a Dog object can be referred to as an Animal reference\n\nAnimal myDog = new Dog();\nmyDog.speak(); // prints "Woof!" — runtime polymorphism in action', sort_order: 1, duration_minutes: 10, status: 'published' },

    { lesson_id: 10, module_id: 7,  title: 'SOLID Principles Overview',                  content_type: 'text',  content_url: null, content_text: 'SOLID is a mnemonic for five OOP design principles:\n• S — Single Responsibility\n• O — Open/Closed\n• L — Liskov Substitution\n• I — Interface Segregation\n• D — Dependency Inversion\n\nTogether they encourage code that is easier to test, extend, and refactor.', sort_order: 1, duration_minutes: 8, status: 'published' },

    { lesson_id: 11, module_id: 8,  title: 'Understanding Limits',                       content_type: 'pdf',   content_url: 'https://tutorial.math.lamar.edu/pdf/Calculus_Cheat_Sheet_Limits.pdf', content_text: null, sort_order: 1, duration_minutes: 20, status: 'published' },

    { lesson_id: 12, module_id: 9,  title: 'Power Rule',                                 content_type: 'video', content_url: 'https://www.youtube.com/watch?v=IvLpN1G1Ncg', content_text: null, sort_order: 1, duration_minutes: 12, status: 'published' },

    { lesson_id: 13, module_id: 10, title: 'Fundamental Theorem of Calculus',            content_type: 'text',  content_url: null, content_text: 'The Fundamental Theorem of Calculus connects differentiation and integration:\n• Part I: If F(x) = ∫ₐˣ f(t) dt, then F′(x) = f(x).\n• Part II: ∫ₐᵇ f(x) dx = F(b) − F(a) where F is any antiderivative of f.', sort_order: 1, duration_minutes: 14, status: 'published' },

    { lesson_id: 14, module_id: 11, title: 'Intro to NumPy',                             content_type: 'video', content_url: 'https://www.youtube.com/watch?v=QUT1VHiLmmI', content_text: null, sort_order: 1, duration_minutes: 20, status: 'published' },

    { lesson_id: 15, module_id: 12, title: 'Matplotlib Basics',                          content_type: 'video', content_url: 'https://www.youtube.com/watch?v=3Xc3CA655Y4', content_text: null, sort_order: 1, duration_minutes: 15, status: 'published' },

    { lesson_id: 16, module_id: 13, title: 'Profiling a Dataset',                        content_type: 'text',  content_url: null, content_text: 'EDA workflow:\n1. Inspect shape, dtypes, and missing values with `df.info()` and `df.describe()`.\n2. Visualise distributions per column (histograms, box plots).\n3. Cross-tabulate categorical variables.\n4. Investigate correlations with a heatmap before modelling.', sort_order: 1, duration_minutes: 11, status: 'published' },

    { lesson_id: 17, module_id: 14, title: 'Linear Regression',                          content_type: 'text',  content_url: null, content_text: 'Linear regression models the linear relationship between a dependent variable y and one or more independent variables x.\n\nSimple form: y = mx + b\n\nIn Python:\nfrom sklearn.linear_model import LinearRegression\nmodel = LinearRegression().fit(X, y)\n\nKey metrics: R², MSE, RMSE.', sort_order: 1, duration_minutes: 10, status: 'draft' },

    { lesson_id: 18, module_id: 16, title: 'Primary vs Foreign Keys',                    content_type: 'text',  content_url: null, content_text: 'A primary key uniquely identifies a row in a table. A foreign key is a column (or set of columns) that references the primary key of another table — enforcing referential integrity at the database layer.', sort_order: 1, duration_minutes: 7, status: 'published' },

    { lesson_id: 19, module_id: 17, title: 'Joins: INNER, LEFT, RIGHT, FULL',             content_type: 'video', content_url: 'https://youtu.be/YfTDBA45PHk?si=WtePbpeNkpdPFSXl', content_text: null, sort_order: 1, duration_minutes: 13, status: 'published' },
  ];
  await insertRows('lesson', rows, ['lesson_id','module_id','title','content_type','content_url','content_text','sort_order','duration_minutes','status']);
  console.log(`   ✓ lesson           (${rows.length} rows)`);
}


async function seedEnrollments() {
  const rows = [
    { enrollment_id: 1,  user_id: 7,  course_id: 1, enrolled_at: D(95, 9),  status: 'active',    completion_percent: 75.00, completed_at: null },
    { enrollment_id: 2,  user_id: 7,  course_id: 2, enrolled_at: D(95, 10), status: 'active',    completion_percent: 40.00, completed_at: null },
    { enrollment_id: 3,  user_id: 7,  course_id: 5, enrolled_at: D(94, 11), status: 'active',    completion_percent: 10.00, completed_at: null },
    { enrollment_id: 4,  user_id: 8,  course_id: 1, enrolled_at: D(93, 10), status: 'active',    completion_percent: 20.00, completed_at: null },
    { enrollment_id: 5,  user_id: 8,  course_id: 7, enrolled_at: D(85, 9),  status: 'active',    completion_percent: 50.00, completed_at: null },
    { enrollment_id: 6,  user_id: 9,  course_id: 3, enrolled_at: D(90, 9),  status: 'completed', completion_percent: 100.00, completed_at: D(45, 12) },
    { enrollment_id: 7,  user_id: 9,  course_id: 4, enrolled_at: D(80, 10), status: 'active',    completion_percent: 30.00, completed_at: null },
    { enrollment_id: 8,  user_id: 10, course_id: 3, enrolled_at: D(88, 9),  status: 'active',    completion_percent: 25.00, completed_at: null },
    { enrollment_id: 9,  user_id: 11, course_id: 5, enrolled_at: D(85, 10), status: 'active',    completion_percent: 60.00, completed_at: null },
    { enrollment_id: 10, user_id: 11, course_id: 2, enrolled_at: D(82, 11), status: 'dropped',   completion_percent: 5.00,  completed_at: null },
    { enrollment_id: 11, user_id: 12, course_id: 5, enrolled_at: D(85, 11), status: 'active',    completion_percent: 85.00, completed_at: null },
    { enrollment_id: 12, user_id: 12, course_id: 6, enrolled_at: D(280, 9), status: 'completed', completion_percent: 100.00, completed_at: D(180, 10) },
    { enrollment_id: 13, user_id: 13, course_id: 2, enrolled_at: D(80, 9),  status: 'active',    completion_percent: 55.00, completed_at: null },
    { enrollment_id: 14, user_id: 14, course_id: 3, enrolled_at: D(78, 10), status: 'active',    completion_percent: 70.00, completed_at: null },
    { enrollment_id: 15, user_id: 14, course_id: 4, enrolled_at: D(70, 11), status: 'active',    completion_percent: 20.00, completed_at: null },
    { enrollment_id: 16, user_id: 15, course_id: 5, enrolled_at: D(75, 10), status: 'active',    completion_percent: 45.00, completed_at: null },
    { enrollment_id: 17, user_id: 16, course_id: 1, enrolled_at: D(70, 9),  status: 'active',    completion_percent: 60.00, completed_at: null },
    { enrollment_id: 18, user_id: 16, course_id: 7, enrolled_at: D(65, 11), status: 'active',    completion_percent: 30.00, completed_at: null },
  ];
  await insertRows('enrollment', rows, ['enrollment_id','user_id','course_id','enrolled_at','status','completion_percent','completed_at']);
  console.log(`   ✓ enrollment       (${rows.length} rows)`);
}

async function seedModuleProgress() {
  const make = (user_id, module_id, status, lastAccessedDay, completedDay = null) => ({
    user_id, module_id, status,
    completion_percentage: status === 'completed' ? 100.00 : status === 'in_progress' ? 50.00 : 0.00,
    last_accessed: D(lastAccessedDay),
    completed_at: completedDay == null ? null : D(completedDay),
  });

  const rows = [
    make(7, 1, 'completed',   80, 80),
    make(7, 2, 'completed',   70, 70),
    make(7, 3, 'in_progress', 60),
    make(7, 5, 'completed',   65, 65),
    make(7, 6, 'in_progress', 55),

    make(8, 1, 'in_progress', 40),
    make(8, 16, 'completed', 35, 35),
    make(8, 17, 'in_progress', 25),

    make(9, 8, 'completed', 60, 60),
    make(9, 9, 'completed', 55, 55),
    make(9, 10, 'completed', 50, 50),

    make(10, 8, 'in_progress', 30),

    make(11, 11, 'completed', 45, 45),
    make(11, 12, 'in_progress', 30),

    make(12, 11, 'completed', 50, 50),
    make(12, 12, 'completed', 40, 40),
    make(12, 13, 'in_progress', 25),

    make(13, 5, 'completed', 40, 40),
    make(13, 6, 'in_progress', 30),

    make(14, 8, 'completed', 35, 35),
    make(14, 9, 'in_progress', 25),

    make(15, 11, 'in_progress', 30),

    make(16, 1, 'completed', 45, 45),
    make(16, 2, 'completed', 40, 40),
    make(16, 3, 'in_progress', 30),
    make(16, 16, 'in_progress', 25),
  ];
  await insertRows('module_progress', rows, ['user_id','module_id','status','completion_percentage','last_accessed','completed_at']);
  console.log(`   ✓ module_progress  (${rows.length} rows)`);
}

async function seedQuizzes() {
  const rows = [
    { quiz_id: 1, course_id: 1, module_id: 1,  created_by: 4, title: 'HTML Basics Quiz',          description: 'Test your HTML knowledge.',                status: 'published', due_date: D(30, 23, 59), time_limit_minutes: 20, max_attempts: 2, randomize_questions: 0, num_questions_per_attempt: null, submission_type: 'online_quiz', accepted_file_types: null,          created_at: D(60, 9) },
    { quiz_id: 2, course_id: 1, module_id: 2,  created_by: 4, title: 'CSS Fundamentals Quiz',     description: 'Test your CSS skills (randomised pool).', status: 'published', due_date: D(20, 23, 59), time_limit_minutes: 30, max_attempts: 1, randomize_questions: 1, num_questions_per_attempt: 3,    submission_type: 'online_quiz', accepted_file_types: null,          created_at: D(55, 9) },
    { quiz_id: 3, course_id: 2, module_id: 5,  created_by: 4, title: 'OOP Classes Assignment',    description: 'Submit your Java OOP mini-project.',      status: 'published', due_date: D(15, 23, 59), time_limit_minutes: null, max_attempts: 1, randomize_questions: 0, num_questions_per_attempt: null, submission_type: 'file_upload', accepted_file_types: '.zip,.java,.pdf', created_at: D(50, 9) },
    { quiz_id: 4, course_id: 3, module_id: 8,  created_by: 5, title: 'Limits Quiz',               description: 'Test understanding of limits.',           status: 'published', due_date: D(25, 23, 59), time_limit_minutes: 25, max_attempts: 2, randomize_questions: 0, num_questions_per_attempt: null, submission_type: 'online_quiz', accepted_file_types: null,          created_at: D(58, 9) },
    { quiz_id: 5, course_id: 3, module_id: 9,  created_by: 5, title: 'Differentiation Practice',  description: 'Mixed differentiation problems.',         status: 'draft',     due_date: D(5, 23, 59),  time_limit_minutes: 45, max_attempts: 1, randomize_questions: 1, num_questions_per_attempt: 4,    submission_type: 'online_quiz', accepted_file_types: null,          created_at: D(40, 9) },
    { quiz_id: 6, course_id: 5, module_id: 11, created_by: 6, title: 'NumPy & Pandas Quiz',       description: 'Assess your Python data skills.',         status: 'published', due_date: D(18, 23, 59), time_limit_minutes: 30, max_attempts: 1, randomize_questions: 1, num_questions_per_attempt: 4,    submission_type: 'online_quiz', accepted_file_types: null,          created_at: D(45, 9) },
    { quiz_id: 7, course_id: 5, module_id: 12, created_by: 6, title: 'Data Viz Assignment',       description: 'Submit your chart analysis (PDF/PNG).',   status: 'archived',  due_date: D(70, 23, 59), time_limit_minutes: null, max_attempts: 1, randomize_questions: 0, num_questions_per_attempt: null, submission_type: 'file_upload', accepted_file_types: '.pdf,.png,.ipynb', created_at: D(75, 9) },
    { quiz_id: 8, course_id: 6, module_id: 14, created_by: 6, title: 'Linear Regression Quiz',    description: 'Foundations of linear modelling.',        status: 'archived',  due_date: D(220, 23, 59), time_limit_minutes: 30, max_attempts: 1, randomize_questions: 0, num_questions_per_attempt: null, submission_type: 'online_quiz', accepted_file_types: null,         created_at: D(260, 9) },
    { quiz_id: 9, course_id: 7, module_id: 17, created_by: 4, title: 'SQL Joins Quiz',            description: 'Practise INNER/LEFT/RIGHT joins.',        status: 'published', due_date: D(10, 23, 59), time_limit_minutes: 25, max_attempts: 2, randomize_questions: 0, num_questions_per_attempt: null, submission_type: 'online_quiz', accepted_file_types: null,          created_at: D(35, 9) },
  ];
  await insertRows('quiz', rows, ['quiz_id','course_id','module_id','created_by','title','description','status','due_date','time_limit_minutes','max_attempts','randomize_questions','num_questions_per_attempt','submission_type','accepted_file_types','created_at']);
  console.log(`   ✓ quiz             (${rows.length} rows)`);
}


async function seedQuizFeedback() {
  const rows = [
    { quiz_feedback_id: 1,  quiz_id: 1, min_score:   0.00, max_score:  49.99, feedback_message: 'Keep practising — review the HTML basics module.' },
    { quiz_feedback_id: 2,  quiz_id: 1, min_score:  50.00, max_score:  74.99, feedback_message: "Good effort! A few more reviews and you'll ace it." },
    { quiz_feedback_id: 3,  quiz_id: 1, min_score:  75.00, max_score: 100.00, feedback_message: 'Excellent! You have a solid grasp of HTML.' },

    { quiz_feedback_id: 4,  quiz_id: 2, min_score:   0.00, max_score:  59.99, feedback_message: 'Revisit selectors and the box model.' },
    { quiz_feedback_id: 5,  quiz_id: 2, min_score:  60.00, max_score: 100.00, feedback_message: 'Great CSS work — try flexbox challenges next.' },

    { quiz_feedback_id: 6,  quiz_id: 4, min_score:   0.00, max_score:  49.99, feedback_message: 'Review the limits chapter before your next attempt.' },
    { quiz_feedback_id: 7,  quiz_id: 4, min_score:  50.00, max_score: 100.00, feedback_message: 'Well done on the limits quiz!' },

    { quiz_feedback_id: 8,  quiz_id: 6, min_score:   0.00, max_score:  59.99, feedback_message: 'Revisit NumPy and Pandas fundamentals.' },
    { quiz_feedback_id: 9,  quiz_id: 6, min_score:  60.00, max_score: 100.00, feedback_message: 'Great work on the Python data quiz!' },

    { quiz_feedback_id: 10, quiz_id: 9, min_score:   0.00, max_score:  49.99, feedback_message: 'Practice joins on a sample dataset.' },
    { quiz_feedback_id: 11, quiz_id: 9, min_score:  50.00, max_score:  79.99, feedback_message: 'Solid understanding — keep practising outer joins.' },
    { quiz_feedback_id: 12, quiz_id: 9, min_score:  80.00, max_score: 100.00, feedback_message: 'Excellent join skills!' },
  ];
  await insertRows('quiz_feedback', rows, ['quiz_feedback_id','quiz_id','min_score','max_score','feedback_message']);
  console.log(`   ✓ quiz_feedback    (${rows.length} rows)`);
}


async function seedQuestions() {
  const rows = [
    { question_id: 1,  quiz_id: 1, question_type: 'mcq',          question_text: 'What does HTML stand for?', options: JSON.stringify(['HyperText Markup Language','HyperText Machine Language','HighText Markup Language','None of the above']), correct_answer: 'HyperText Markup Language', points: 2, improvement_tip: 'HTML stands for HyperText Markup Language.', sort_order: 1 },
    { question_id: 2,  quiz_id: 1, question_type: 'fill_blank',   question_text: 'The ___ tag is used to define the largest heading in HTML.', options: null, correct_answer: 'h1', points: 2, improvement_tip: 'Headings go from <h1> (largest) to <h6> (smallest).', sort_order: 2 },
    { question_id: 3,  quiz_id: 1, question_type: 'short_answer', question_text: 'Explain the purpose of the <!DOCTYPE html> declaration.', options: null, correct_answer: 'It defines the document type and version of HTML.', points: 3, improvement_tip: 'DOCTYPE tells the browser which version of HTML to use.', sort_order: 3 },

    { question_id: 4,  quiz_id: 2, question_type: 'mcq',          question_text: 'Which CSS property controls text size?', options: JSON.stringify(['font-size','text-size','font-weight','text-style']), correct_answer: 'font-size', points: 2, improvement_tip: 'Use font-size to control text size in CSS.', sort_order: 1 },
    { question_id: 5,  quiz_id: 2, question_type: 'mcq',          question_text: 'What does the CSS box model include?', options: JSON.stringify(['Margin, Border, Padding, Content','Margin, Font, Padding, Content','Border, Font, Margin, Layout','None of the above']), correct_answer: 'Margin, Border, Padding, Content', points: 2, improvement_tip: 'The box model consists of Margin, Border, Padding, and Content.', sort_order: 2 },
    { question_id: 6,  quiz_id: 2, question_type: 'fill_blank',   question_text: 'To center a block element horizontally, set margin to ___.', options: null, correct_answer: 'auto', points: 2, improvement_tip: 'Use `margin: auto` with a defined width to center elements.', sort_order: 3 },
    { question_id: 7,  quiz_id: 2, question_type: 'mcq',          question_text: 'Which unit is relative to the root element font size?', options: JSON.stringify(['em','rem','px','%']), correct_answer: 'rem', points: 2, improvement_tip: '`rem` is relative to the root, `em` is relative to the parent.', sort_order: 4 },

    { question_id: 8,  quiz_id: 3, question_type: 'short_answer', question_text: 'Upload your completed Java OOP mini-project. Attach your source files (and/or a brief write-up) as a ZIP or PDF.', options: null, correct_answer: 'See attached submission.', points: 10, improvement_tip: 'Make sure your classes compile and follow OOP principles.', sort_order: 1 },

    { question_id: 9,  quiz_id: 4, question_type: 'mcq',          question_text: 'What is the limit of f(x) = x² as x → 3?', options: JSON.stringify(['6','9','3','0']), correct_answer: '9', points: 3, improvement_tip: 'Substitute x = 3 directly: 3² = 9.', sort_order: 1 },
    { question_id: 10, quiz_id: 4, question_type: 'short_answer', question_text: 'Define the concept of a limit in calculus.', options: null, correct_answer: 'A limit describes the value a function approaches as the input approaches a point.', points: 3, improvement_tip: 'Think of a limit as the expected value, not necessarily the actual value.', sort_order: 2 },
    { question_id: 11, quiz_id: 4, question_type: 'fill_blank',   question_text: 'A function is continuous at x = a if the limit as x → a equals ___.', options: null, correct_answer: 'f(a)', points: 2, improvement_tip: 'Continuity requires the limit and function value to match.', sort_order: 3 },

    { question_id: 12, quiz_id: 6, question_type: 'mcq',          question_text: 'Which function creates a NumPy array?', options: JSON.stringify(['np.array()','np.create()','np.make()','np.list()']), correct_answer: 'np.array()', points: 2, improvement_tip: 'Use `np.array()` to create arrays in NumPy.', sort_order: 1 },
    { question_id: 13, quiz_id: 6, question_type: 'mcq',          question_text: 'Which pandas object is used for tabular data?', options: JSON.stringify(['DataFrame','Series','Array','Matrix']), correct_answer: 'DataFrame', points: 2, improvement_tip: 'DataFrames are 2D labelled data structures in pandas.', sort_order: 2 },
    { question_id: 14, quiz_id: 6, question_type: 'short_answer', question_text: 'How do you read a CSV file using pandas?', options: null, correct_answer: 'pd.read_csv("filename.csv")', points: 3, improvement_tip: 'Use `pd.read_csv()` to load CSV data into a DataFrame.', sort_order: 3 },
    { question_id: 15, quiz_id: 6, question_type: 'fill_blank',   question_text: 'To select a column "age" from a DataFrame df, use df[___].', options: null, correct_answer: '"age"', points: 2, improvement_tip: 'Use `df["column_name"]` to access a specific column.', sort_order: 4 },

    { question_id: 16, quiz_id: 7, question_type: 'short_answer', question_text: 'Upload your chart analysis report as a PDF (or attach an .ipynb notebook).', options: null, correct_answer: 'See attached submission.', points: 10, improvement_tip: 'Include clear visualisations and a written interpretation.', sort_order: 1 },

    { question_id: 17, quiz_id: 9, question_type: 'mcq',          question_text: 'Which join returns only rows with matches in both tables?', options: JSON.stringify(['INNER JOIN','LEFT JOIN','RIGHT JOIN','FULL OUTER JOIN']), correct_answer: 'INNER JOIN', points: 2, improvement_tip: 'INNER JOIN keeps only matching rows.', sort_order: 1 },
    { question_id: 18, quiz_id: 9, question_type: 'mcq',          question_text: 'Which join keeps all rows from the left table, filling missing matches with NULL?', options: JSON.stringify(['LEFT JOIN','RIGHT JOIN','INNER JOIN','CROSS JOIN']), correct_answer: 'LEFT JOIN', points: 2, improvement_tip: 'LEFT JOIN preserves every row on the left.', sort_order: 2 },
    { question_id: 19, quiz_id: 9, question_type: 'fill_blank',   question_text: 'The keyword to alias a column in SELECT is ___.', options: null, correct_answer: 'AS', points: 2, improvement_tip: '`column AS alias` renames output columns.', sort_order: 3 },
    { question_id: 20, quiz_id: 9, question_type: 'short_answer', question_text: 'Explain the difference between INNER JOIN and LEFT JOIN in one sentence.', options: null, correct_answer: 'INNER JOIN returns only matching rows; LEFT JOIN returns all left-table rows plus matches (NULL where no match).', points: 4, improvement_tip: 'Focus on row preservation: LEFT keeps every left row; INNER keeps only matches.', sort_order: 4 },
  ];
  await insertRows('question', rows, ['question_id','quiz_id','question_type','question_text','options','correct_answer','points','improvement_tip','sort_order']);
  console.log(`   ✓ question         (${rows.length} rows)`);
}


async function seedQuizAttempts() {
  const attemptAt = (dayOffset, hour, durationMinutes) => {
    const start = startAt(dayOffset, hour);
    return {
      start_time: fmt(start),
      end_time: durationMinutes == null ? null : fmt(addMin(start, durationMinutes)),
    };
  };

  const rows = [];

  const mk = (id, quiz_id, user_id, dayOffset, hour, durationMinutes, score, status, attemptNumber) => {
    const { start_time, end_time } = attemptAt(dayOffset, hour, durationMinutes);
    rows.push({
      quiz_attempt_id: id, quiz_id, user_id,
      start_time, end_time,
      score, attempt_number: attemptNumber, status,
      created_at: fmt(startAt(dayOffset, hour)),
    });
  };

  mk(1,  1, 7,  48, 10, 18,  85.71, 'graded', 1);
  mk(2,  1, 7,  46, 10, 15, 100.00, 'graded', 2);
  mk(3,  2, 7,  42, 14, 28,  83.33, 'graded', 1);

  mk(4,  1, 8,  45, 11, 20,  42.86, 'graded', 1);
  mk(5,  1, 8,  43, 11, 18,  71.43, 'graded', 2);

  mk(6,  4, 9,  50, 9, 22, 100.00, 'graded', 1);

  mk(7,  4, 10, 48, 9, 25,  12.50, 'graded', 1);
  mk(8,  4, 10, 46, 10, 25, 25.00, 'graded', 2);

  mk(9,  6, 11, 36, 10, 27, 55.00, 'graded', 1);

  mk(10, 6, 12, 35, 10, 25, 90.00, 'graded', 1);
  mk(11, 8, 12, 200, 10, 25, 78.00, 'graded', 1);

  mk(12, 3, 13, 20, 13, null, null, 'in_progress', 1);
  mk(13, 9, 13, 18, 9, 22, 70.00, 'graded', 1);

  mk(14, 4, 14, 28, 10, 22, 87.50, 'graded', 1);

  mk(15, 1, 16, 40, 14, 20, 57.14, 'graded', 1);

  await insertRows('quiz_attempt', rows, ['quiz_attempt_id','quiz_id','user_id','start_time','end_time','score','attempt_number','status','created_at']);
  console.log(`   ✓ quiz_attempt     (${rows.length} rows)`);
}

async function seedAnswers() {
  const rows = [
    { answer_id: 1,  quiz_attempt_id: 1, question_id: 1,  user_answer: 'HyperText Markup Language', is_correct: 1, score_awarded: 2.00, feedback: 'Correct!',                                  file_url: null, graded_by_user_id: null },
    { answer_id: 2,  quiz_attempt_id: 1, question_id: 2,  user_answer: 'h1',                         is_correct: 1, score_awarded: 2.00, feedback: 'Correct!',                                  file_url: null, graded_by_user_id: null },
    { answer_id: 3,  quiz_attempt_id: 1, question_id: 3,  user_answer: 'Sets the document type.',   is_correct: 1, score_awarded: 3.00, feedback: 'Mostly correct.',                           file_url: null, graded_by_user_id: 4 },

    { answer_id: 4,  quiz_attempt_id: 2, question_id: 1,  user_answer: 'HyperText Markup Language', is_correct: 1, score_awarded: 2.00, feedback: 'Correct!',                                  file_url: null, graded_by_user_id: null },
    { answer_id: 5,  quiz_attempt_id: 2, question_id: 2,  user_answer: 'h1',                         is_correct: 1, score_awarded: 2.00, feedback: 'Correct!',                                  file_url: null, graded_by_user_id: null },
    { answer_id: 6,  quiz_attempt_id: 2, question_id: 3,  user_answer: 'Declares document version.', is_correct: 1, score_awarded: 3.00, feedback: 'Well explained.',                           file_url: null, graded_by_user_id: 4 },

    { answer_id: 7,  quiz_attempt_id: 3, question_id: 4,  user_answer: 'font-size',                       is_correct: 1, score_awarded: 2.00, feedback: 'Correct!',           file_url: null, graded_by_user_id: null },
    { answer_id: 8,  quiz_attempt_id: 3, question_id: 5,  user_answer: 'Margin, Border, Padding, Content', is_correct: 1, score_awarded: 2.00, feedback: 'Correct!',           file_url: null, graded_by_user_id: null },
    { answer_id: 9,  quiz_attempt_id: 3, question_id: 6,  user_answer: 'auto',                            is_correct: 1, score_awarded: 2.00, feedback: 'Correct!',           file_url: null, graded_by_user_id: null },

    { answer_id: 10, quiz_attempt_id: 4, question_id: 1,  user_answer: 'HyperText Machine Language', is_correct: 0, score_awarded: 0.00, feedback: 'Incorrect.',                              file_url: null, graded_by_user_id: null },
    { answer_id: 11, quiz_attempt_id: 4, question_id: 2,  user_answer: 'h2',                         is_correct: 0, score_awarded: 0.00, feedback: 'Incorrect — it is h1.',                   file_url: null, graded_by_user_id: null },
    { answer_id: 12, quiz_attempt_id: 4, question_id: 3,  user_answer: 'Not sure.',                  is_correct: 0, score_awarded: 0.00, feedback: 'Needs improvement.',                      file_url: null, graded_by_user_id: 4 },

    { answer_id: 13, quiz_attempt_id: 5, question_id: 1,  user_answer: 'HyperText Markup Language', is_correct: 1, score_awarded: 2.00, feedback: 'Correct!',                                  file_url: null, graded_by_user_id: null },
    { answer_id: 14, quiz_attempt_id: 5, question_id: 2,  user_answer: 'h1',                         is_correct: 1, score_awarded: 2.00, feedback: 'Correct!',                                  file_url: null, graded_by_user_id: null },
    { answer_id: 15, quiz_attempt_id: 5, question_id: 3,  user_answer: 'Declares document version.', is_correct: 1, score_awarded: 3.00, feedback: 'Well explained.',                           file_url: null, graded_by_user_id: 4 },

    { answer_id: 16, quiz_attempt_id: 6, question_id: 9,  user_answer: '9',                                                          is_correct: 1, score_awarded: 3.00, feedback: 'Correct!',     file_url: null, graded_by_user_id: null },
    { answer_id: 17, quiz_attempt_id: 6, question_id: 10, user_answer: 'A limit is the value a function approaches as the input approaches a point.', is_correct: 1, score_awarded: 3.00, feedback: 'Great answer.', file_url: null, graded_by_user_id: 5 },
    { answer_id: 18, quiz_attempt_id: 6, question_id: 11, user_answer: 'f(a)',                                                       is_correct: 1, score_awarded: 2.00, feedback: 'Correct!',     file_url: null, graded_by_user_id: null },

    { answer_id: 19, quiz_attempt_id: 7, question_id: 9,  user_answer: '6',                                                          is_correct: 0, score_awarded: 0.00, feedback: 'Incorrect — the answer is 9.',         file_url: null, graded_by_user_id: null },
    { answer_id: 20, quiz_attempt_id: 7, question_id: 10, user_answer: 'It is the actual value at the point.',                      is_correct: 0, score_awarded: 1.50, feedback: 'Partially correct.',                  file_url: null, graded_by_user_id: 5 },
    { answer_id: 21, quiz_attempt_id: 7, question_id: 11, user_answer: 'f(0)',                                                       is_correct: 0, score_awarded: 0.00, feedback: 'Incorrect.',                          file_url: null, graded_by_user_id: null },

    { answer_id: 22, quiz_attempt_id: 8, question_id: 9,  user_answer: '9',                                                          is_correct: 1, score_awarded: 3.00, feedback: 'Correct!',     file_url: null, graded_by_user_id: null },
    { answer_id: 23, quiz_attempt_id: 8, question_id: 10, user_answer: 'It tells us what value the function approaches.',           is_correct: 0, score_awarded: 2.00, feedback: 'Better, but missing the formal definition.', file_url: null, graded_by_user_id: 5 },
    { answer_id: 24, quiz_attempt_id: 8, question_id: 11, user_answer: 'f(a)',                                                       is_correct: 1, score_awarded: 2.00, feedback: 'Correct!',     file_url: null, graded_by_user_id: null },

    { answer_id: 25, quiz_attempt_id: 9, question_id: 12, user_answer: 'np.array()',     is_correct: 1, score_awarded: 2.00, feedback: 'Correct!',                                              file_url: null, graded_by_user_id: null },
    { answer_id: 26, quiz_attempt_id: 9, question_id: 13, user_answer: 'DataFrame',      is_correct: 1, score_awarded: 2.00, feedback: 'Correct!',                                              file_url: null, graded_by_user_id: null },
    { answer_id: 27, quiz_attempt_id: 9, question_id: 14, user_answer: 'pd.read_csv()',  is_correct: 1, score_awarded: 3.00, feedback: 'Correct!',                                              file_url: null, graded_by_user_id: null },
    { answer_id: 28, quiz_attempt_id: 9, question_id: 15, user_answer: 'age',            is_correct: 0, score_awarded: 0.00, feedback: 'Almost — include quotes around the column name.',       file_url: null, graded_by_user_id: null },

    { answer_id: 29, quiz_attempt_id: 10, question_id: 12, user_answer: 'np.array()',               is_correct: 1, score_awarded: 2.00, feedback: 'Correct!', file_url: null, graded_by_user_id: null },
    { answer_id: 30, quiz_attempt_id: 10, question_id: 13, user_answer: 'DataFrame',                is_correct: 1, score_awarded: 2.00, feedback: 'Correct!', file_url: null, graded_by_user_id: null },
    { answer_id: 31, quiz_attempt_id: 10, question_id: 14, user_answer: 'pd.read_csv("file.csv")',  is_correct: 1, score_awarded: 3.00, feedback: 'Perfect.', file_url: null, graded_by_user_id: null },
    { answer_id: 32, quiz_attempt_id: 10, question_id: 15, user_answer: '"age"',                    is_correct: 1, score_awarded: 2.00, feedback: 'Correct!', file_url: null, graded_by_user_id: null },

    { answer_id: 33, quiz_attempt_id: 11, question_id: 12, user_answer: 'np.array()',                is_correct: 1, score_awarded: 2.00, feedback: 'Correct!', file_url: null, graded_by_user_id: null },
    { answer_id: 34, quiz_attempt_id: 11, question_id: 13, user_answer: 'DataFrame',                 is_correct: 1, score_awarded: 2.00, feedback: 'Correct!', file_url: null, graded_by_user_id: null },
    { answer_id: 35, quiz_attempt_id: 11, question_id: 14, user_answer: 'pd.read_csv("data.csv")',   is_correct: 1, score_awarded: 3.00, feedback: 'Correct!', file_url: null, graded_by_user_id: null },
    { answer_id: 36, quiz_attempt_id: 11, question_id: 15, user_answer: '"age"',                     is_correct: 1, score_awarded: 2.00, feedback: 'Correct!', file_url: null, graded_by_user_id: null },

    { answer_id: 37, quiz_attempt_id: 12, question_id: 8,  user_answer: 'Working on it — submitting tomorrow.', is_correct: null, score_awarded: 0.00, feedback: 'Awaiting instructor review', file_url: null, graded_by_user_id: null },

    { answer_id: 38, quiz_attempt_id: 13, question_id: 17, user_answer: 'INNER JOIN',          is_correct: 1, score_awarded: 2.00, feedback: 'Correct!',               file_url: null, graded_by_user_id: null },
    { answer_id: 39, quiz_attempt_id: 13, question_id: 18, user_answer: 'LEFT JOIN',           is_correct: 1, score_awarded: 2.00, feedback: 'Correct!',               file_url: null, graded_by_user_id: null },
    { answer_id: 40, quiz_attempt_id: 13, question_id: 19, user_answer: 'AS',                  is_correct: 1, score_awarded: 2.00, feedback: 'Correct!',               file_url: null, graded_by_user_id: null },
    { answer_id: 41, quiz_attempt_id: 13, question_id: 20, user_answer: 'INNER returns matching rows only; LEFT keeps all left rows plus matches.', is_correct: 1, score_awarded: 4.00, feedback: 'Clear and complete.', file_url: null, graded_by_user_id: 4 },

    { answer_id: 42, quiz_attempt_id: 14, question_id: 9,  user_answer: '9',                            is_correct: 1, score_awarded: 3.00, feedback: 'Correct!',     file_url: null, graded_by_user_id: null },
    { answer_id: 43, quiz_attempt_id: 14, question_id: 10, user_answer: 'A limit is the value a function approaches.', is_correct: 1, score_awarded: 3.00, feedback: 'Great answer.', file_url: null, graded_by_user_id: 5 },
    { answer_id: 44, quiz_attempt_id: 14, question_id: 11, user_answer: 'f(a)',                         is_correct: 1, score_awarded: 2.00, feedback: 'Correct!',     file_url: null, graded_by_user_id: null },

    { answer_id: 45, quiz_attempt_id: 15, question_id: 1,  user_answer: 'HyperText Markup Language', is_correct: 1, score_awarded: 2.00, feedback: 'Correct!',         file_url: null, graded_by_user_id: null },
    { answer_id: 46, quiz_attempt_id: 15, question_id: 2,  user_answer: 'h1',                         is_correct: 1, score_awarded: 2.00, feedback: 'Correct!',         file_url: null, graded_by_user_id: null },
    { answer_id: 47, quiz_attempt_id: 15, question_id: 3,  user_answer: 'Sets the document version.', is_correct: 1, score_awarded: 3.00, feedback: 'Well explained.',  file_url: null, graded_by_user_id: 4 },

    { answer_id: 48, quiz_attempt_id: 12, question_id: 8,  user_answer: 'Draft Java OOP project — v1', is_correct: null, score_awarded: 0.00, feedback: 'Awaiting instructor review', file_url: '/uploads/student07_oop_draft.zip', graded_by_user_id: null },
  ];

  await insertRows('answer', rows, ['answer_id','quiz_attempt_id','question_id','user_answer','is_correct','score_awarded','feedback','file_url','graded_by_user_id']);
  console.log(`   ✓ answer           (${rows.length} rows)`);
}


async function seedNotifications() {
  const rows = [
    { notification_id: 1,  user_id: 7,  title: 'New Quiz Available',        message: 'HTML Basics Quiz is now open.',                                       type: 'quiz',         is_read: 0, related_item_type: 'quiz',           related_item_id: 1,  target_role: null, scheduled_at: null, created_at: D(60, 9) },
    { notification_id: 2,  user_id: 8,  title: 'New Quiz Available',        message: 'HTML Basics Quiz is now open.',                                       type: 'quiz',         is_read: 0, related_item_type: 'quiz',           related_item_id: 1,  target_role: null, scheduled_at: null, created_at: D(60, 9) },
    { notification_id: 3,  user_id: 9,  title: 'New Quiz Available',        message: 'Limits Quiz is now open.',                                            type: 'quiz',         is_read: 1, related_item_type: 'quiz',           related_item_id: 4,  target_role: null, scheduled_at: null, created_at: D(58, 9) },
    { notification_id: 4,  user_id: 10, title: 'At-Risk Alert',             message: 'Your average quiz score has dropped below 50%.',                     type: 'alert',        is_read: 0, related_item_type: 'student_profile', related_item_id: 10, target_role: null, scheduled_at: null, created_at: D(48, 8, 1) },
    { notification_id: 5,  user_id: 3,  title: 'Student At Risk',           message: 'student04 is at risk — please follow up.',                           type: 'alert',        is_read: 0, related_item_type: 'student_profile', related_item_id: 10, target_role: null, scheduled_at: null, created_at: D(48, 8, 2) },
    { notification_id: 6,  user_id: 7,  title: 'Quiz Graded',               message: 'Your HTML Basics Quiz (attempt 2) has been graded — 100%.',          type: 'quiz_result',  is_read: 1, related_item_type: 'quiz_attempt',   related_item_id: 2,  target_role: null, scheduled_at: null, created_at: D(46, 10, 5) },
    { notification_id: 7,  user_id: 11, title: 'Course Reminder',           message: 'Complete Module 12 before the deadline.',                            type: 'reminder',     is_read: 0, related_item_type: 'module',         related_item_id: 12, target_role: null, scheduled_at: D(18, 8), created_at: D(20, 8) },
    { notification_id: 8,  user_id: 1,  title: 'System Maintenance',        message: 'Scheduled maintenance on the 30th.',                                   type: 'system',       is_read: 0, related_item_type: null,              related_item_id: null, target_role: null, scheduled_at: null, created_at: D(30, 10) },
    { notification_id: 9,  user_id: 4,  title: 'New Submission',            message: 'A student submitted the OOP Classes Assignment.',                     type: 'submission',   is_read: 0, related_item_type: 'quiz_attempt',   related_item_id: 12, target_role: null, scheduled_at: null, created_at: D(20, 14) },
    { notification_id: 10, user_id: 13, title: 'Submission Confirmed',      message: 'Your submission for "OOP Classes Assignment" has been received.',    type: 'submission_confirm', is_read: 0, related_item_type: 'quiz_attempt', related_item_id: 12, target_role: null, scheduled_at: null, created_at: D(20, 14, 5) },
    { notification_id: 11, user_id: 2,  title: 'New Advisee',               message: 'student07 was added to your advisee list.',                           type: 'info',         is_read: 1, related_item_type: 'user',            related_item_id: 13, target_role: null, scheduled_at: null, created_at: D(80, 9) },

    { notification_id: 12, user_id: 1,  title: 'Welcome to SMIS!',          message: 'The semester catalogue is now live — explore your dashboard.',         type: 'announcement', is_read: 0, related_item_type: null, related_item_id: null, target_role: 'student', scheduled_at: null, created_at: D(100, 9) },
    { notification_id: 13, user_id: 1,  title: 'Library Maintenance',       message: 'Library resources will be offline on Saturday 02:00–06:00.',           type: 'announcement', is_read: 0, related_item_type: null, related_item_id: null, target_role: 'student', scheduled_at: D(45, 2), created_at: D(55, 10) },
  ];
  await insertRows('notification', rows, ['notification_id','user_id','title','message','type','is_read','related_item_type','related_item_id','target_role','scheduled_at','created_at']);
  console.log(`   ✓ notification     (${rows.length} rows)`);
}


async function seedActivityLog() {
  const rows = [
    { activity_log_id: 1,  user_id: 7,  activity_type: 'login',             description: 'User logged in.',                              related_item_type: null,         related_item_id: null, created_at: D(48, 9, 55) },
    { activity_log_id: 2,  user_id: 7,  activity_type: 'quiz_start',        description: 'Started HTML Basics Quiz.',                    related_item_type: 'quiz',        related_item_id: 1,    created_at: D(48, 10) },
    { activity_log_id: 3,  user_id: 7,  activity_type: 'quiz_submit',       description: 'Submitted HTML Basics Quiz attempt 1.',       related_item_type: 'quiz_attempt', related_item_id: 1,    created_at: D(48, 10, 18) },
    { activity_log_id: 4,  user_id: 8,  activity_type: 'login',             description: 'User logged in.',                              related_item_type: null,         related_item_id: null, created_at: D(45, 10, 55) },
    { activity_log_id: 5,  user_id: 8,  activity_type: 'quiz_start',        description: 'Started HTML Basics Quiz.',                    related_item_type: 'quiz',        related_item_id: 1,    created_at: D(45, 11) },
    { activity_log_id: 6,  user_id: 8,  activity_type: 'quiz_submit',       description: 'Submitted HTML Basics Quiz.',                  related_item_type: 'quiz_attempt', related_item_id: 4,    created_at: D(45, 11, 20) },
    { activity_log_id: 7,  user_id: 9,  activity_type: 'login',             description: 'User logged in.',                              related_item_type: null,         related_item_id: null, created_at: D(50, 8, 50) },
    { activity_log_id: 8,  user_id: 9,  activity_type: 'quiz_start',        description: 'Started Limits Quiz.',                         related_item_type: 'quiz',        related_item_id: 4,    created_at: D(50, 9) },
    { activity_log_id: 9,  user_id: 9,  activity_type: 'quiz_submit',       description: 'Submitted Limits Quiz.',                       related_item_type: 'quiz_attempt', related_item_id: 6,    created_at: D(50, 9, 22) },
    { activity_log_id: 10, user_id: 4,  activity_type: 'course_create',     description: 'Created course: Web Development Fundamentals.', related_item_type: 'course',     related_item_id: 1,    created_at: D(110, 8, 10) },
    { activity_log_id: 11, user_id: 4,  activity_type: 'quiz_create',       description: 'Created HTML Basics Quiz.',                    related_item_type: 'quiz',        related_item_id: 1,    created_at: D(60, 9) },
    { activity_log_id: 12, user_id: 11, activity_type: 'lesson_view',       description: 'Viewed lesson: Intro to NumPy.',               related_item_type: 'lesson',      related_item_id: 14,   created_at: D(36, 9, 10) },
    { activity_log_id: 13, user_id: 12, activity_type: 'lesson_view',       description: 'Viewed lesson: Matplotlib Basics.',            related_item_type: 'lesson',      related_item_id: 15,   created_at: D(35, 8, 30) },
    { activity_log_id: 14, user_id: 1,  activity_type: 'user_create',       description: 'Admin created user student10.',                related_item_type: 'user',        related_item_id: 16,   created_at: D(116, 10, 20) },
    { activity_log_id: 15, user_id: 10, activity_type: 'enrollment',        description: 'Enrolled in Calculus I.',                      related_item_type: 'course',      related_item_id: 3,    created_at: D(88, 9, 10) },
    { activity_log_id: 16, user_id: 7,  activity_type: 'page_visit',        description: 'Viewed course: Web Development Fundamentals.',  related_item_type: 'course',      related_item_id: 1,    created_at: D(48, 9) },
    { activity_log_id: 17, user_id: 7,  activity_type: 'video_watch',       description: 'Watched video: Intro to HTML.',                related_item_type: 'lesson',      related_item_id: 1,    created_at: D(48, 9, 5) },
    { activity_log_id: 18, user_id: 8,  activity_type: 'page_visit',        description: 'Viewed course: Databases & SQL.',              related_item_type: 'course',      related_item_id: 7,    created_at: D(45, 10) },
    { activity_log_id: 19, user_id: 13, activity_type: 'assignment_submit', description: 'Submitted OOP Classes Assignment draft.',      related_item_type: 'quiz_attempt', related_item_id: 12,   created_at: D(20, 14) },
    { activity_log_id: 20, user_id: 2,  activity_type: 'profile_update',    description: 'Advisor updated their profile',                related_item_type: null,         related_item_id: null, created_at: D(7, 11) },
  ];
  await insertRows('activity_log', rows, ['activity_log_id','user_id','activity_type','description','related_item_type','related_item_id','created_at']);
  console.log(`   ✓ activity_log     (${rows.length} rows)`);
}


async function deriveStudentRiskFlags() {
  await pool.query(`
    UPDATE student_profile sp
    LEFT JOIN (
      SELECT user_id, AVG(score) AS avg_score
      FROM quiz_attempt
      WHERE status = 'graded' AND score IS NOT NULL
      GROUP BY user_id
    ) qa ON qa.user_id = sp.user_id
    SET sp.average_score = COALESCE(ROUND(qa.avg_score, 2), 0),
        sp.is_at_risk    = CASE WHEN qa.avg_score < 50 THEN 1 ELSE 0 END
  `);
  console.log('   ✓ derived (average_score, is_at_risk) from quiz_attempt');
}

seed();
