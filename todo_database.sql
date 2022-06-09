-- This script shows the SQL command used to setup database

CREATE DATABASE TODO_DATABASE;

CREATE TABLE TODO_USER(
    u_id SERIAL PRIMARY KEY,
    u_email VARCHAR(255) NOT NULL,
    u_password VARCHAR(255) NOT NULL,
    u_role VARCHAR(10) NOT NULL DEFAULT 'normal'
);

CREATE TABLE TODO_ITEM(
    t_id SERIAL PRIMARY KEY,
    t_title VARCHAR(255) NOT NULL,
    t_desc VARCHAR(255),
    t_date DATE DEFAULT current_date,
    t_isCompleted BOOLEAN DEFAULT FALSE,
    t_user_id SERIAL NOT NULL,
    CONSTRAINT todo_user_fk
        FOREIGN KEY (t_user_id)
        REFERENCES TODO_USER(u_id)
		ON DELETE CASCADE
);