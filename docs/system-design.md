
# High-Level Architecture

The Online Course Platform follows a modern web-based client–server architecture.

### Frontend (Next.js)

* Built using **Next.js**
* Responsible for user interface and user experience
* Handles:

  * User registration and login
  * Course listing and course details
  * Lesson viewing
  * Progress tracking
* Communicates with the backend API via HTTP requests (REST)

---

### Backend API (Next.js API Routes)

* Implemented using **Next.js API routes**
* Acts as the application’s business logic layer
* Responsibilities:

  * User authentication and authorization
  * Course, lesson, and enrollment management
  * Progress tracking logic
* Connects securely to the database (Supabase)

---

### Database (Supabase)

* Uses **PostgreSQL** (via Supabase)
* Stores all system data:

  * Users and roles
  * Courses and lessons
  * Enrollments and progress
* Provides authentication and role-based access support

---

## 2. Database Design (ER Diagram – Description)

### Required Tables and Relationships

#### users

* Stores registered users
* Fields:

  * id (PK)
  * name
  * email
  * password
  * role_id (FK)
  * created_at

#### roles

* Defines user roles
* Fields:

  * id (PK)
  * role_name (Admin, Customer)

**Relationship:**

* One role → many users

---

#### courses

* Stores available courses
* Fields:

  * id (PK)
  * title
  * description
  * created_by (FK → users)
  * created_at

**Relationship:**

* One admin → many courses

---

#### lessons

* Stores lessons under each course
* Fields:

  * id (PK)
  * course_id (FK)
  * title
  * content
  * order_number

**Relationship:**

* One course → many lessons

---

#### enrollments

* Tracks which users are enrolled in which courses
* Fields:

  * id (PK)
  * user_id (FK)
  * course_id (FK)
  * enrolled_at

**Relationship:**

* Many users ↔ many courses

---

#### progress

* Tracks lesson completion per user
* Fields:

  * id (PK)
  * user_id (FK)
  * lesson_id (FK)
  * completed (boolean)
  * completed_at

**Relationship:**

* One user → many lesson progress records

---

## 3. API List

### User & Authentication APIs

| Endpoint             | HTTP Method | Purpose                    |
| -------------------- | ----------- | -------------------------- |
| `/api/auth/register` | POST        | Register a new user        |
| `/api/auth/login`    | POST        | Login user                 |
| `/api/users/profile` | GET         | Get logged-in user profile |

---

### Course APIs

| Endpoint           | HTTP Method | Purpose                            |
| ------------------ | ----------- | ---------------------------------- |
| `/api/courses`     | GET         | Retrieve all available courses     |
| `/api/courses`     | POST        | Create a new course (Admin only)   |
| `/api/courses/:id` | GET         | Get course details                 |
| `/api/courses/:id` | PUT         | Update course details (Admin only) |
| `/api/courses/:id` | DELETE      | Delete a course (Admin only)       |

---

### Lesson APIs

| Endpoint                   | HTTP Method | Purpose                  |
| -------------------------- | ----------- | ------------------------ |
| `/api/courses/:id/lessons` | GET         | Get lessons for a course |
| `/api/courses/:id/lessons` | POST        | Add a lesson to a course |
| `/api/lessons/:id`         | PUT         | Update a lesson          |
| `/api/lessons/:id`         | DELETE      | Delete a lesson          |

---

### Enrollment APIs

| Endpoint           | HTTP Method | Purpose                      |
| ------------------ | ----------- | ---------------------------- |
| `/api/enrollments` | POST        | Enroll user in a course      |
| `/api/enrollments` | GET         | View user’s enrolled courses |

---

### Progress APIs

| Endpoint                  | HTTP Method | Purpose                    |
| ------------------------- | ----------- | -------------------------- |
| `/api/progress`           | POST        | Mark lesson as completed   |
| `/api/progress/:courseId` | GET         | View progress for a course |


