----------------------------
-- PRIVILEGE
----------------------------

CREATE TABLE privilege (
  privilege_id SERIAL PRIMARY KEY,
  name TEXT NOT NULL
);
COMMENT ON TABLE privilege IS 'Contains all possible permissions within the application';
COMMENT ON COLUMN privilege.name IS 'The readable value of a privilege';

INSERT INTO TABLE privilege (name)
VALUES
  ('global'),
  ('admin'),
  ('cfi'),
  ('student')
;

----------------------------
-- ENTITY
----------------------------

CREATE TABLE entity (
  entity_id SERIAL PRIMARY KEY,
  name TEXT NOT NULL
);
COMMENT ON TABLE entity IS 'Contains the business information for a parent org or individual';
COMMENT ON COLUMN entity.name IS 'The name of the entity';

INSERT INTO entity (name) VALUES ('Global');

----------------------------
-- USERS
----------------------------

CREATE TABLE users (
  user_id SERIAL PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  passwd TEXT NOT NULL,
  entity_id INTEGER NOT NULL,
  privilege_id INTEGER NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE,
  CONSTRAINT users__entity_id_fk FOREIGN KEY (entity_id) REFERENCES entity (entity_id),
  CONSTRAINT users__privilege_id_fk FOREIGN KEY (privilege_id) REFERENCES privilege (privilege_id),
  CONSTRAINT users__valid_date_ck CHECK start_date < end_date
);
COMMENT ON TABLE users IS 'Contains information regarding users of the application';
COMMENT ON COLUMN users.first_name IS 'The user first name';
COMMENT ON COLUMN users.last_name IS 'The user last name';
COMMENT ON COLUMN users.email IS 'The user contact email';
COMMENT ON COLUMN users.passwd IS 'The user password';
COMMENT ON COLUMN users.entity_id IS 'The entity that the user is associated with';
COMMENT ON COLUMN users.privilege_id IS 'The specific permission or role that a user has within an entity';
COMMENT ON COLUMN users.start_date IS 'The date that the user is part of the entity';
COMMENT ON COLUMN users.end_date IS 'The last day that the user is part of the entity';

----------------------------
-- CFI_MAP
----------------------------

CREATE TABLE cfi_map (
  cfi_map_id SERIAL PRIMARY KEY,
  cfi_id INTEGER NOT NULL,
  student_id INTEGER NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE,
  CONSTRAINT cfi_map__cfi_id_fk FOREIGN KEY (cfi_id) REFERENCES users (user_id),
  CONSTRAINT cfi_map__student_id_fk FOREIGN KEY (student_id) REFERENCES users (user_id);
  CONSTRAINT cfi_map__valid_date_ck CHECK start_date < end_date
);
COMMENT ON TABLE cfi_map IS 'Maps when a CFI is assigned to a student';
COMMENT ON COLUMN cfi_map.cfi_id IS 'The ID of the CFI';
COMMENT ON COLUMN cfi_map.student_id IS 'The ID of the student';
COMMENT ON COLUMN cfi_map.start_date IS 'The date the student starts with the CFI';
COMMENT ON COLUMN cfi_map.end_date IS 'The last day the student is with the CFI';

----------------------------
-- RATING
----------------------------
CREATE TABLE rating (
  rating_id SERIAL PRIMARY KEY,
  name TEXT NOT NULL
);
COMMENT ON TABLE rating IS 'Contains the possible ratings and add-ons a pilot can have';

----------------------------
-- SYLLABUS
----------------------------

CREATE TABLE syllabus (
  syllabus_id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  version NUMERIC NOT NULL,
  entity_id INTEGER NOT NULL,
  rating_id INTEGER NOT NULL,
  add_date DATE NOT NULL,
  CONSTRAINT syllabus__entity_id_fk FOREIGN KEY (entity_id) REFERENCES entity (entity_id),
  CONSTRAINT syllabus__rating_id_fk FOREIGN KEY (rating_id) REFERENCES rating (rating_id)
);
COMMENT ON TABLE syllabus IS 'Contains the umbrella syllabus object';

----------------------------
-- LESSON_TYPE
----------------------------
CREATE TABLE lesson_type (
  lesson_type_id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
);

INSERT INTO lesson_type (name)
VALUES
  ('flight'),
  ('ground')
;

----------------------------
-- LESSON
----------------------------
CREATE TABLE lesson (
  lesson_id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  summary TEXT,
  content TEXT,
  syllabus_id INTEGER NOT NULL,
  lesson_type_id INTEGER NOT NULL,
  CONSTRAINT lesson__syllabus_id FOREIGN KEY (syllabus_id) REFERENCES syllabus (syllabus_id),
  CONSTRAINT lesson__lesson_type_id FOREIGN KEY (lesson_type_id) REFERENCES lesson_type (lesson_type_id)
);
COMMENT ON TABLE lesson IS 'Contains the format of a lesson';


----------------------------
-- STUDENT_LESSON_MAP
----------------------------
CREATE TABLE student_lesson_map (
  student_lesson_map_id SERIAL PRIMARY KEY,
  student_id INTEGER NOT NULL,
  lesson_id INTEGER NOT NULL,
  complete_p BOOLEAN DEFAULT FALSE NOT NULL,
  notes TEXT,
  CONSTRAINT student_lesson_map__student_id FOREIGN KEY (student_id) REFERENCES users (user_id),
  CONSTRAINT student_lesson_map__lesson_id FOREIGN KEY (lesson_id) REFERENCES lesson (lesson_id)
);
COMMENT ON TABLE student_lesson_map IS 'Maps the students progress to individual lessons';
