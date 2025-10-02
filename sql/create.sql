-----------------------------------
-- PRIVILEGE
-----------------------------------
CREATE TABLE privilege (
    privilege_id INT UNSIGNED NOT NULL AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL COMMENT 'The readable value of a privilege',
    PRIMARY KEY (privilege_id)
)
COMMENT='Contains all possible permissions within the application';

INSERT INTO privilege (name) VALUES
('global'),
('admin'),
('cfi'),
('student');

-----------------------------------
-- SUBSCRIPTION
-----------------------------------
CREATE TABLE subscription (
    subscription_id INT UNSIGNED NOT NULL AUTO_INCREMENT,
    subscription_key VARCHAR(50) NOT NULL UNIQUE COMMENT 'Machine-readable key (e.g., trial, single, school, enterprise)',
    label VARCHAR(100) NOT NULL COMMENT 'Human-readable label for display',
    summary TEXT NULL COMMENT 'Description/summary of the subscription',
    price DECIMAL(10,2) NULL COMMENT 'Monthly price, NULL if requires sales contact',
    requires_sales TINYINT(1) NOT NULL DEFAULT 0 COMMENT 'True if requires sales contact',
    features JSON NOT NULL COMMENT 'Array of feature strings',
    PRIMARY KEY (subscription_id)
)
COMMENT='All possible subscriptions that can be signed up for';

INSERT INTO subscription (plan_key, label, summary, price, requires_sales, features)
VALUES
    ('trial', 'Free Trial', 'Try RightSeat as a CFI for 14 days.', 0.00, 0, JSON_ARRAY('14 day free trial', 'No credit card required', 'Solo CFI plan')),
    ('single', 'CFI', 'Manage your syllabuses, add students, and track their progress.', 9.00, 0, JSON_ARRAY('1 instructor', 'Up to 10 students', 'Lesson Logging', 'Printable progress')),
    ('school', 'Flight School', 'Manage multiple CFI''s and Students', 49.00, 0, JSON_ARRAY('Up to 10 CFI''s', 'Unlimited students', 'Syllabus versioning', 'Pass/Fail analytics')),
    ('enterprise', 'Enterprise', 'Manage multiple schools and their employees and students', NULL, 1, JSON_ARRAY('Audit exports', 'Priority support', 'Onboarding help'))
;

-----------------------------------
-- ENTITY
-----------------------------------
CREATE TABLE entity (
    entity_id INT UNSIGNED NOT NULL AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL COMMENT 'The name of the entity',
    subscription_id INT UNSIGNED NOT NULL COMMENT 'The level of subscription the entity has',
    PRIMARY KEY (entity_id),
    CONSTRAINT entity__subscription_id_fk FOREIGN KEY (subscription_id) REFERENCES subscription (subscription_id)
)
COMMENT='Contains the business information for a parent org or individual';

    INSERT INTO entity (name) VALUES ('Global');

-----------------------------------
-- RATING
-----------------------------------
CREATE TABLE rating (
    rating_id INT UNSIGNED NOT NULL AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    PRIMARY KEY (rating_id)
)
COMMENT='Contains the possible ratings and add-ons a pilot can have';

-----------------------------------
-- LESSON_TYPE
-----------------------------------
CREATE TABLE lesson_type (
    lesson_type_id INT UNSIGNED NOT NULL AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    PRIMARY KEY (lesson_type_id)
);

INSERT INTO lesson_type (name) VALUES
    ('flight'),
    ('ground');

-----------------------------------
-- USERS
-----------------------------------
CREATE TABLE users (
    user_id INT UNSIGNED NOT NULL AUTO_INCREMENT,
    first_name VARCHAR(100) NOT NULL COMMENT 'The user first name',
    last_name  VARCHAR(100) NOT NULL COMMENT 'The user last name',
    email      VARCHAR(320) NOT NULL COMMENT 'The user contact email',
    passwd     VARCHAR(255) NOT NULL COMMENT 'The user password',
    entity_id  INT UNSIGNED NOT NULL COMMENT 'The entity that the user is associated with',
    privilege_id INT UNSIGNED NOT NULL COMMENT 'The specific permission or role that a user has within an entity',
    start_date DATE NOT NULL COMMENT 'The date that the user is part of the entity',
    end_date   DATE NULL COMMENT 'The last day that the user is part of the entity',
    phone      INT UNSIGNED COMMENT 'The users phone number',
    PRIMARY KEY (user_id),
    KEY idx_users_entity_id (entity_id),
    KEY idx_users_privilege_id (privilege_id),
    CONSTRAINT users__entity_id_fk FOREIGN KEY (entity_id) REFERENCES entity (entity_id),
    CONSTRAINT users__privilege_id_fk FOREIGN KEY (privilege_id) REFERENCES privilege (privilege_id),
    CONSTRAINT users__valid_date_ck
        CHECK (end_date IS NULL OR start_date < end_date)
)
COMMENT='Contains information regarding users of the application';

-----------------------------------
-- SYLLABUS
-----------------------------------
CREATE TABLE syllabus (
    syllabus_id INT UNSIGNED NOT NULL AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    version DECIMAL(5,2) NOT NULL,
    entity_id INT UNSIGNED NOT NULL,
    rating_id INT UNSIGNED NOT NULL,
    add_date DATE NOT NULL,
    PRIMARY KEY (syllabus_id),
    KEY idx_syllabus_entity_id (entity_id),
    KEY idx_syllabus_rating_id (rating_id),
    CONSTRAINT syllabus__entity_id_fk FOREIGN KEY (entity_id) REFERENCES entity (entity_id),
    CONSTRAINT syllabus__rating_id_fk FOREIGN KEY (rating_id) REFERENCES rating (rating_id),
)
COMMENT='Contains the umbrella syllabus object';

-----------------------------------
-- LESSON
-----------------------------------
CREATE TABLE lesson (
    lesson_id INT UNSIGNED NOT NULL AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    summary TEXT NULL,
    content MEDIUMTEXT NULL,
    syllabus_id INT UNSIGNED NOT NULL,
    lesson_type_id INT UNSIGNED NOT NULL,
    PRIMARY KEY (lesson_id),
    KEY idx_lesson_syllabus_id (syllabus_id),
    KEY idx_lesson_lesson_type_id (lesson_type_id),
    CONSTRAINT lesson__syllabus_id FOREIGN KEY (syllabus_id) REFERENCES syllabus (syllabus_id),
    CONSTRAINT lesson__lesson_type_id FOREIGN KEY (lesson_type_id) REFERENCES lesson_type (lesson_type_id),
)
COMMENT='Contains the format of a lesson';

-----------------------------------
-- CFI_MAP
-----------------------------------
CREATE TABLE cfi_map (
    cfi_map_id INT UNSIGNED NOT NULL AUTO_INCREMENT,
    cfi_id INT UNSIGNED NOT NULL COMMENT 'The ID of the CFI',
    student_id INT UNSIGNED NOT NULL COMMENT 'The ID of the student',
    start_date DATE NOT NULL COMMENT 'The date the student starts with the CFI',
    end_date DATE NULL COMMENT 'The last day the student is with the CFI',
    PRIMARY KEY (cfi_map_id),
    KEY idx_cfi_map_cfi_id (cfi_id),
    KEY idx_cfi_map_student_id (student_id),
    CONSTRAINT cfi_map__cfi_id_fk FOREIGN KEY (cfi_id) REFERENCES users (user_id),
    CONSTRAINT cfi_map__student_id_fk FOREIGN KEY (student_id) REFERENCES users (user_id),
    CONSTRAINT cfi_map__valid_date_ck
        CHECK (end_date IS NULL OR start_date < end_date)
)
COMMENT='Maps when a CFI is assigned to a student';

-----------------------------------
-- STUDENT_LESSON_MAP
-----------------------------------
CREATE TABLE student_lesson_map (
    student_lesson_map_id INT UNSIGNED NOT NULL AUTO_INCREMENT,
    student_id INT UNSIGNED NOT NULL,
    lesson_id INT UNSIGNED NOT NULL,
    complete_p TINYINT(1) NOT NULL DEFAULT 0,
    notes TEXT NULL,
    PRIMARY KEY (student_lesson_map_id),
    UNIQUE KEY uq_student_lesson (student_id, lesson_id),
    KEY idx_slm_student_id (student_id),
    KEY idx_slm_lesson_id (lesson_id),
    CONSTRAINT student_lesson_map__student_id FOREIGN KEY (student_id) REFERENCES users (user_id),
    CONSTRAINT student_lesson_map__lesson_id FOREIGN KEY (lesson_id) REFERENCES lesson (lesson_id),
)
COMMENT='Maps the students progress to individual lessons';
