-- Database cleanup script to fix foreign key constraints and schema issues

-- First, drop foreign key constraints to allow cleanup
SET FOREIGN_KEY_CHECKS = 0;

-- Clear all data from tables in correct order
DELETE FROM seats;
DELETE FROM trip_date;
DELETE FROM bookings;
DELETE FROM buses;
DELETE FROM bus_stops;
DELETE FROM stops;
DELETE FROM users;

-- Re-enable foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

-- Drop and recreate tables to fix schema issues
DROP TABLE IF EXISTS seats;
DROP TABLE IF EXISTS trip_date;
DROP TABLE IF EXISTS bookings;
DROP TABLE IF EXISTS buses;
DROP TABLE IF EXISTS bus_stops;
DROP TABLE IF EXISTS stops;
DROP TABLE IF EXISTS users;

-- The application will recreate the tables with correct schema on next startup
