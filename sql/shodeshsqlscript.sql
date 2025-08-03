CREATE DATABASE shodesh;
USE shodesh;

CREATE TABLE donations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  amount DECIMAL(10,2) NOT NULL
);


SELECT * FROM donations;
