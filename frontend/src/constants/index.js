export const ROLES = {
  STUDENT:    'student',
  INSTRUCTOR: 'instructor',
  ADMIN:      'admin',
  ADVISOR:    'advisor',
};

export const COURSE_STATUS = {
  DRAFT:     'draft',
  PUBLISHED: 'published',
  ARCHIVED:  'archived',
};

export const ENROLLMENT_STATUS = {
  ACTIVE:    'active',
  COMPLETED: 'completed',
  DROPPED:   'dropped',
};

export const QUIZ_STATUS = {
  DRAFT:     'draft',
  PUBLISHED: 'published',
  ARCHIVED:  'archived',
};

export const QUIZ_ATTEMPT_STATUS = {
  IN_PROGRESS: 'in_progress',
  SUBMITTED:   'submitted',
  GRADED:      'graded',
};

export const SUBMISSION_TYPES = {
  ONLINE_QUIZ: 'online_quiz',
  FILE_UPLOAD: 'file_upload',
  MIXED:       'mixed',
};

export const NOTIFICATION_TYPES = {
  COURSE_PUBLISHED: 'course_published',
  QUIZ_PUBLISHED:   'quiz_published',
  GRADE:            'grade',
  PROFILE_UPDATE:   'profile_update',
};

export const ACTIVITY_TYPES = {
  PROFILE_UPDATE: 'profile_update',
  COURSE_CREATE:  'course_create',
};
