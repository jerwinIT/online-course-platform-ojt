# Problem Statement

# What problem does this system solve?
* Many learners want to take online courses but struggle with tracking their enrollment and learning progress in one place. Meanwhile, administrators need an organized way to manage courses, lessons, and users. This system provides a centralized online platform where users can enroll in courses, access lessons, and track their progress, while admins can manage course content and users efficiently. 

# User Personas
1. Admin
    * Manages users and assigns roles
    * Creates, updates, and deletes courses and lessons
    * Monitors user enrollments and progress
2. Customer (Students)
    * Registers and logs into the system
    * Enrolls in available courses
    * Views lessons and tracks learning progress

# User Stories (minimum 6)
1. As an admin, I want to create and manage courses so users can enroll in updated learning content.
2. As an admin, I want to add lessons to courses so students can learn step by step.
3. As a customer, I want to register and log in so I can access the platform securely.
4. As a customer, I want to view available courses so I can choose what I want to learn.
5. As a customer, I want to enroll in a course so I can start learning.
6. As a customer, I want to track my progress so I know how much of the course I have completed.
7. As an admin, I want to view user enrollments so I can monitor course usage.

# Acceptance Criteria
1. User Story 4 * View Available Courses 
	As a customer, I want to view available courses so I can choose what I want to learn.
    # Acceptance Criteria:
    * User must be logged in
    * The system displays a list of available courses
    * Each course shows a title and brief description
    * The user can select a course to view its details
    # Done when the course list loads successfully and course details can be viewed without errors.
2. User Story 5 * Enroll in a Course
	As a customer, I want to enroll in a course so I can start learning.
    # Acceptance Criteria:
    * User must be logged in
    * The selected course exists
    * The system allows the user to enroll with one action
    * Enrollment is saved in the enrollments table
    # Done when the course list load successfully and course details can be viewed without errors
