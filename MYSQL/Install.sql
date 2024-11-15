-- Create the database
CREATE DATABASE IF NOT EXISTS ParkingLotDB;
USE ParkingLotDB;

-- Create Users table
CREATE TABLE IF NOT EXISTS Users (
    userID INT AUTO_INCREMENT PRIMARY KEY,
    firstName VARCHAR(50) NOT NULL,
    lastName VARCHAR(50) NOT NULL,
    mNumber CHAR(8) NOT NULL UNIQUE,
    password VARCHAR(250) NOT NULL
);

-- Create ParkingSpots table
CREATE TABLE IF NOT EXISTS ParkingSpots (
    spotID INT AUTO_INCREMENT PRIMARY KEY
 
);

-- Insert 15 parking spots
INSERT INTO ParkingSpots () VALUES
(), (), (), (), (),
(), (), (), (), (),
(), (), (), (), ();

-- Create Reservations table
CREATE TABLE IF NOT EXISTS Reservations (
    reservationID INT AUTO_INCREMENT PRIMARY KEY,
    userID INT NOT NULL,
    spotID INT NOT NULL,
    startTime DATETIME NOT NULL,
    endTime DATETIME NOT NULL,
    status ENUM('Active', 'Canceled', 'Expired') NOT NULL DEFAULT 'Active',
    FOREIGN KEY (userID) REFERENCES Users(userID),
    FOREIGN KEY (spotID) REFERENCES ParkingSpots(spotID)
);

CREATE TABLE IF NOT EXISTS CARS (
    CarID INT AUTO_INCREMENT PRIMARY KEY,
    UserID INT NOT NULL,
    MAKE VARCHAR 40 NOT NULL,
    MODEL VARCHAR 40 NOT NULL,
    #COLOR VARCHAR 
    YEAR INT NOT NULL,
    FOREIGN KEY (UserID) REFERENCES Users(userID),
);