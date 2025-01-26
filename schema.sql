    START TRANSACTION;
    
    CREATE TABLE IF NOT EXISTS userTypes(
        id int AUTO_INCREMENT,
        name varchar(225), 
        label varchar(225), 
        PRIMARY KEY (id)
    );
    
        
    CREATE TABLE IF NOT EXISTS departments(
        id int AUTO_INCREMENT,
        name varchar(225),
        label varchar(225),
        description TEXT,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (id)
    );

    CREATE TABLE IF NOT EXISTS users(
        id int AUTO_INCREMENT,
        userTypeId int, 
        departmentId int,
        name varchar(225),
        email varchar(225), 
        gender varchar(225),
        phone varchar(225), 
        password varchar(225), 
        openForAppointments tinyint DEFAULT 0, 
        about TEXT, 
        photo varchar(225),
        dob DATETIME,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        FOREIGN KEY (userTypeId) REFERENCES userTypes (id),
        FOREIGN KEY (departmentId) REFERENCES departments (id)
    );
    
    CREATE TABLE IF NOT EXISTS appointments(
        id int AUTO_INCREMENT,
        doctorId int,
        patientId int,
         startTime DATETIME DEFAULT CURRENT_TIMESTAMP,
        description TEXT,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        FOREIGN KEY (doctorId) REFERENCES users (id),
        FOREIGN KEY (patientId) REFERENCES users (id)
    );
    
    COMMIT;
    