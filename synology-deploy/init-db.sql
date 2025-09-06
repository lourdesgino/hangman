-- Database initialization script for Hangman Game
-- This script will be executed when the PostgreSQL container starts

-- Create the database schema (tables will be created by Drizzle migrations)
-- The application will handle table creation through Drizzle ORM

-- Enable UUID extension for generating random UUIDs
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create indexes for better performance
-- These will be created after tables are set up by the application