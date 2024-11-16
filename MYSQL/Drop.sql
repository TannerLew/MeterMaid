-- drop.sql

-- Use the ParkingLotDB database
USE ParkingLotDB;

-- Disable foreign key checks to avoid issues when dropping tables with foreign key constraints
SET FOREIGN_KEY_CHECKS = 0;

-- Drop the Reservations table first since it has foreign keys referencing Users and ParkingSpots
DROP TABLE IF EXISTS Reservations;

-- Drop the ParkingSpots table
DROP TABLE IF EXISTS ParkingSpots;

-- Drop the Users table
DROP TABLE IF EXISTS Users;

-- Drop the cars table
DROP TABLE IF EXISTS Cars;

-- Re-enable foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

