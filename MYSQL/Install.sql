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

-- Create Cars table
CREATE TABLE IF NOT EXISTS Cars (
    carID INT AUTO_INCREMENT PRIMARY KEY,
    userID INT NOT NULL,
    make VARCHAR(40) NOT NULL,
    model VARCHAR(40) NOT NULL,
    Color VARCHAR (20) NOT NULL,
    year INT NOT NULL,
    licensePlate VARCHAR(20) NOT NULL UNIQUE,
    FOREIGN KEY (userID) REFERENCES Users(userID) ON DELETE CASCADE
);

-- Create Reservations table
CREATE TABLE IF NOT EXISTS Reservations (
    reservationID INT AUTO_INCREMENT PRIMARY KEY,
    userID INT NOT NULL,
    spotID INT NOT NULL,
    carID INT NOT NULL,
    startTime DATETIME NOT NULL,
    endTime DATETIME NOT NULL,
    status ENUM('Active', 'Canceled', 'Expired') NOT NULL DEFAULT 'Active',
    FOREIGN KEY (userID) REFERENCES Users(userID) ON DELETE CASCADE,
    FOREIGN KEY (spotID) REFERENCES ParkingSpots(spotID) ON DELETE CASCADE,
    FOREIGN KEY (carID) REFERENCES Cars(carID) ON DELETE CASCADE
);




