drop database if exists hackaton13edicion;
create database if not exists hackaton13edicion;

use hackaton13edicion;

CREATE TABLE users(
	user_id BIGINT AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    lastname VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    curp VARCHAR(255) NOT NULL UNIQUE,
    rfc VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    salt VARCHAR(255) NOT NULL,
    PRIMARY KEY (user_id)
);

CREATE TABLE hospitals(
	hospital_id BIGINT AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    address VARCHAR(255) NOT NULL,
    PRIMARY KEY (hospital_id)
);

CREATE TABLE statuses(
	status_id BIGINT AUTO_INCREMENT,
    name VARCHAR(50) NOT NULL,
    PRIMARY KEY (status_id)
);

INSERT INTO statuses (name) VALUES ('Pendiente'),('Finalizado');
INSERT INTO hospitals (name, address) VALUES ('Hospital Patito', 'Calle 123');

CREATE TABLE appointments(
	appointment_id BIGINT AUTO_INCREMENT,
    estimated_date DATETIME,
    fk_user BIGINT NOT NULL,
    fk_hospital BIGINT NOT NULL,
    fk_status BIGINT NOT NULL,
    description TEXT NOT NULL,
    PRIMARY KEY (appointment_id),
    FOREIGN KEY (fk_user) REFERENCES users(user_id),
    FOREIGN KEY (fk_hospital) REFERENCES hospitals(hospital_id),
    FOREIGN KEY (fk_status) references statuses (status_id)
);

select * from appointments;

select * from appointments INNER JOIN statuses;
select * from hospitals;