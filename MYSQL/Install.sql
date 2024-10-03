-- parking_lot_schema.sql

-- Create the database
CREATE DATABASE IF NOT EXISTS ParkingLotDB;
USE ParkingLotDB;

-- Create Users table
CREATE TABLE Users (
    userID INT AUTO_INCREMENT PRIMARY KEY,
    firstName VARCHAR(50) NOT NULL,
    lastName VARCHAR(50) NOT NULL,
    mNumber CHAR(8) NOT NULL UNIQUE
);

-- Create ParkingSpots table with status field
CREATE TABLE ParkingSpots (
    spotID INT AUTO_INCREMENT PRIMARY KEY,
    status ENUM('Available', 'Reserved', 'Occupied') NOT NULL DEFAULT 'Available'
);

-- Insert 15 available parking spots
INSERT INTO ParkingSpots (status) VALUES
('Available'), ('Available'), ('Available'), ('Available'), ('Available'),
('Available'), ('Available'), ('Available'), ('Available'), ('Available'),
('Available'), ('Available'), ('Available'), ('Available'), ('Available');

-- Create Reservations table with status field
CREATE TABLE Reservations (
    reservationID INT AUTO_INCREMENT PRIMARY KEY,
    userID INT NOT NULL,
    spotID INT NOT NULL,
    startTime DATETIME NOT NULL,
    endTime DATETIME NOT NULL,
    status ENUM('Active', 'Canceled', 'Expired') NOT NULL DEFAULT 'Active',
    FOREIGN KEY (userID) REFERENCES Users(userID),
    FOREIGN KEY (spotID) REFERENCES ParkingSpots(spotID)
);
