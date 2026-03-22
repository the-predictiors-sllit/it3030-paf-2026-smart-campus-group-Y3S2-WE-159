-- Create the database if it doesn't exist

IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = 'smart_campus_v1')
BEGIN
    CREATE DATABASE smart_campus_v1;
END
GO

-- Switch to the database
USE smart_campus_v1;
GO

-- ==========================================
-- 1. Users Table
-- ==========================================
CREATE TABLE Users (
    Id VARCHAR(50) PRIMARY KEY,
    Name VARCHAR(100) NOT NULL,
    Email VARCHAR(100) NOT NULL UNIQUE,
    Role VARCHAR(20) NOT NULL CHECK (Role IN ('USER', 'ADMIN', 'TECHNICIAN')),
    CreatedAt DATETIME DEFAULT GETDATE()
);

-- ==========================================
-- 2. Resources Table
-- ==========================================
CREATE TABLE Resources (
    Id VARCHAR(50) PRIMARY KEY,
    Name VARCHAR(100) NOT NULL,
    Type VARCHAR(20) NOT NULL CHECK (Type IN ('ROOM', 'LAB', 'EQUIPMENT')),
    Capacity INT,
    Location VARCHAR(150),
    Status VARCHAR(20) NOT NULL CHECK (Status IN ('ACTIVE', 'OUT_OF_SERVICE')),
    Description TEXT,
    CreatedAt DATETIME DEFAULT GETDATE()
);

-- ==========================================
-- 3. ResourceAvailability Table
-- ==========================================
CREATE TABLE ResourceAvailability (
    Id INT PRIMARY KEY IDENTITY(1,1),
    ResourceId VARCHAR(50) NOT NULL FOREIGN KEY REFERENCES Resources(Id),
    DayOfWeek VARCHAR(10) NOT NULL CHECK (DayOfWeek IN ('MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY')),
    StartTime TIME NOT NULL,
    EndTime TIME NOT NULL
);

-- ==========================================
-- 4. Bookings Table
-- ==========================================
CREATE TABLE Bookings (
    Id VARCHAR(50) PRIMARY KEY,
    ResourceId VARCHAR(50) NOT NULL FOREIGN KEY REFERENCES Resources(Id),
    UserId VARCHAR(50) NOT NULL FOREIGN KEY REFERENCES Users(Id),
    StartTime DATETIME NOT NULL,
    EndTime DATETIME NOT NULL,
    Purpose VARCHAR(255) NOT NULL,
    ExpectedAttendees INT,
    Status VARCHAR(20) NOT NULL CHECK (Status IN ('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED')),
    Reason VARCHAR(255),
    CreatedAt DATETIME DEFAULT GETDATE(),
    UpdatedAt DATETIME DEFAULT GETDATE()
);

-- ==========================================
-- 5. Tickets Table
-- ==========================================
CREATE TABLE Tickets (
    Id VARCHAR(50) PRIMARY KEY,
    ResourceId VARCHAR(50) FOREIGN KEY REFERENCES Resources(Id),
    Location VARCHAR(150),
    Category VARCHAR(30) NOT NULL CHECK (Category IN ('HARDWARE', 'PLUMBING', 'ELECTRICAL', 'SOFTWARE', 'OTHER')),
    Priority VARCHAR(20) NOT NULL CHECK (Priority IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
    Status VARCHAR(20) NOT NULL CHECK (Status IN ('OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED', 'REJECTED')),
    Description TEXT NOT NULL,
    ContactPhone VARCHAR(20),
    CreatedBy VARCHAR(50) NOT NULL FOREIGN KEY REFERENCES Users(Id),
    AssignedTo VARCHAR(50) FOREIGN KEY REFERENCES Users(Id),
    ResolutionNotes TEXT,
    CreatedAt DATETIME DEFAULT GETDATE(),
    UpdatedAt DATETIME DEFAULT GETDATE()
);

-- ==========================================
-- 6. TicketAttachments Table
-- ==========================================
CREATE TABLE TicketAttachments (
    Id INT PRIMARY KEY IDENTITY(1,1),
    TicketId VARCHAR(50) NOT NULL FOREIGN KEY REFERENCES Tickets(Id),
    GeneratedFileName VARCHAR(255) NOT NULL,
    UploadedAt DATETIME DEFAULT GETDATE()
);

-- ==========================================
-- 7. TicketComments Table
-- ==========================================
CREATE TABLE TicketComments (
    Id VARCHAR(50) PRIMARY KEY,
    TicketId VARCHAR(50) NOT NULL FOREIGN KEY REFERENCES Tickets(Id),
    AuthorId VARCHAR(50) NOT NULL FOREIGN KEY REFERENCES Users(Id),
    Text TEXT NOT NULL,
    CreatedAt DATETIME DEFAULT GETDATE(),
    UpdatedAt DATETIME DEFAULT GETDATE()
);

-- ==========================================
-- 8. Notifications Table
-- ==========================================
CREATE TABLE Notifications (
    Id VARCHAR(50) PRIMARY KEY,
    UserId VARCHAR(50) NOT NULL FOREIGN KEY REFERENCES Users(Id),
    Type VARCHAR(30) NOT NULL CHECK (Type IN ('BOOKING_APPROVED', 'BOOKING_REJECTED', 'TICKET_UPDATED', 'NEW_COMMENT')),
    Title VARCHAR(100) NOT NULL,
    Message VARCHAR(255) NOT NULL,
    ReferenceId VARCHAR(50),
    IsRead BIT DEFAULT 0,
    CreatedAt DATETIME DEFAULT GETDATE()
);
GO

-- ==========================================
-- EXTENDED SAMPLE DATA INSERTS
-- ==========================================

-- 1. Insert Users (Students, Staff, Faculty, Admins, Technicians)
INSERT INTO Users (Id, Name, Email, Role, CreatedAt) VALUES 
('usr_1001', 'Alice Johnson', 'alice.j@university.edu', 'USER', '2026-03-20 09:00:00'),
('usr_1002', 'Tom Davis', 'tom.davis@university.edu', 'USER', '2026-03-20 09:10:00'),
('usr_1003', 'Dr. Sarah Lee', 'sarah.lee@university.edu', 'USER', '2026-03-20 09:20:00'),
('usr_1004', 'James Smith', 'jsmith@university.edu', 'USER', '2026-03-20 09:25:00'),
('usr_1005', 'Emily Chen', 'echen@university.edu', 'USER', '2026-03-20 09:30:00'),
('usr_2001', 'Carol Admin', 'admin.carol@university.edu', 'ADMIN', '2026-03-20 09:05:00'),
('usr_2002', 'Richard Manager', 'rmanager@university.edu', 'ADMIN', '2026-03-20 09:06:00'),
('usr_9001', 'Bob Builder', 'tech.bob@university.edu', 'TECHNICIAN', '2026-03-20 09:10:00'),
('usr_9002', 'Lucy Mechanic', 'tech.lucy@university.edu', 'TECHNICIAN', '2026-03-20 09:15:00');

-- 2. Insert Resources (Rooms, Labs, Equipment)
INSERT INTO Resources (Id, Name, Type, Capacity, Location, Status, Description, CreatedAt) VALUES 
-- Rooms
('res_room_01', 'Main Lecture Hall A', 'ROOM', 150, 'Building 1, Floor 2', 'ACTIVE', 'High-tech lecture room with 2 projectors.', '2026-03-20 09:00:00'),
('res_room_02', 'Seminar Room B', 'ROOM', 40, 'Building 1, Floor 3', 'ACTIVE', 'Interactive smart board included.', '2026-03-20 09:05:00'),
('res_room_03', 'Study Pod 1', 'ROOM', 4, 'Library, Floor 1', 'ACTIVE', 'Soundproof booth.', '2026-03-20 09:10:00'),
('res_room_04', 'Study Pod 2', 'ROOM', 4, 'Library, Floor 1', 'OUT_OF_SERVICE', 'Door lock broken.', '2026-03-20 09:15:00'),
-- Labs
('res_lab_01', 'Chemistry Lab 3', 'LAB', 30, 'Building 2, Floor 1', 'ACTIVE', 'Fume hoods, acid resistant tables.', '2026-03-20 09:20:00'),
('res_lab_02', 'Physics Lab Intro', 'LAB', 25, 'Building 2, Floor 2', 'ACTIVE', 'Standard physics experimental kits.', '2026-03-20 09:25:00'),
('res_lab_03', 'Advanced Robotics', 'LAB', 15, 'Building 4, Basement', 'ACTIVE', 'High-voltage tools available.', '2026-03-20 09:30:00'),
-- Equipment
('res_equip_01', 'Mobile Projector X1', 'EQUIPMENT', NULL, 'IT Storage Desk', 'ACTIVE', '1080p portable projector.', '2026-03-20 09:35:00'),
('res_equip_02', 'Wireless Mic Array A', 'EQUIPMENT', NULL, 'IT Storage Desk', 'ACTIVE', '2 handheld mics & receiver.', '2026-03-20 09:40:00'),
('res_equip_03', 'DSLR Camera Kit', 'EQUIPMENT', NULL, 'Media Room 4', 'OUT_OF_SERVICE', 'Lens cracked, under repair.', '2026-03-20 09:45:00');

-- 3. Insert ResourceAvailability (Hours)
INSERT INTO ResourceAvailability (ResourceId, DayOfWeek, StartTime, EndTime) VALUES 
-- Main Lecture Hall A
('res_room_01', 'MONDAY', '08:00:00', '21:00:00'),
('res_room_01', 'TUESDAY', '08:00:00', '21:00:00'),
('res_room_01', 'WEDNESDAY', '08:00:00', '21:00:00'),
('res_room_01', 'THURSDAY', '08:00:00', '21:00:00'),
('res_room_01', 'FRIDAY', '08:00:00', '18:00:00'),
-- Seminar Room B
('res_room_02', 'MONDAY', '09:00:00', '17:00:00'),
('res_room_02', 'WEDNESDAY', '09:00:00', '17:00:00'),
-- Chemistry Lab 3
('res_lab_01', 'MONDAY', '08:00:00', '16:00:00'),
('res_lab_01', 'TUESDAY', '08:00:00', '16:00:00'),
('res_lab_01', 'THURSDAY', '08:00:00', '16:00:00'),
-- Mobile Projector X1
('res_equip_01', 'MONDAY', '07:30:00', '19:30:00'),
('res_equip_01', 'TUESDAY', '07:30:00', '19:30:00'),
('res_equip_01', 'WEDNESDAY', '07:30:00', '19:30:00');

-- 4. Insert Bookings
INSERT INTO Bookings (Id, ResourceId, UserId, StartTime, EndTime, Purpose, ExpectedAttendees, Status, Reason, CreatedAt) VALUES 
('bkg_001', 'res_room_01', 'usr_1003', '2026-04-10 10:00:00', '2026-04-10 12:00:00', 'CS101 Midterm', 120, 'APPROVED', NULL, '2026-03-21 10:00:00'),
('bkg_002', 'res_lab_01', 'usr_1001', '2026-04-10 13:00:00', '2026-04-10 15:00:00', 'Biology Review', 20, 'PENDING', NULL, '2026-03-21 11:00:00'),
('bkg_003', 'res_room_02', 'usr_1004', '2026-04-12 14:00:00', '2026-04-12 16:00:00', 'Club Meeting', 15, 'REJECTED', 'Room reserved for faculty meeting', '2026-03-21 14:30:00'),
('bkg_004', 'res_room_03', 'usr_1002', '2026-04-13 09:00:00', '2026-04-13 11:00:00', 'Group Study', 3, 'APPROVED', NULL, '2026-03-21 15:00:00'),
('bkg_005', 'res_equip_01', 'usr_1005', '2026-04-15 10:00:00', '2026-04-15 12:00:00', 'Guest Lecture Display', NULL, 'APPROVED', NULL, '2026-03-21 16:00:00');

-- 5. Insert Tickets
INSERT INTO Tickets (Id, ResourceId, Location, Category, Priority, Status, Description, ContactPhone, CreatedBy, AssignedTo, ResolutionNotes, CreatedAt) VALUES 
('tck_001', 'res_room_01', NULL, 'HARDWARE', 'HIGH', 'IN_PROGRESS', 'Main projector bulb is flickering constantly.', '555-0101', 'usr_1003', 'usr_9001', 'Need to order a replacement lamp.', '2026-03-21 12:00:00'),
('tck_002', NULL, 'Cafeteria, Zone A', 'PLUMBING', 'MEDIUM', 'OPEN', 'Water cooler is leaking onto the floor.', '555-0102', 'usr_1002', NULL, NULL, '2026-03-21 12:15:00'),
('tck_003', 'res_lab_01', NULL, 'SOFTWARE', 'LOW', 'RESOLVED', 'Lab PC 12 cannot connect to the internet.', '555-0103', 'usr_1001', 'usr_9002', 'Reconfigured network DNS settings. Fixed.', '2026-03-21 13:00:00'),
('tck_004', 'res_room_04', NULL, 'HARDWARE', 'CRITICAL', 'OPEN', 'Door lock jammed, stuck inside.', '555-0104', 'usr_1004', NULL, NULL, '2026-03-21 14:00:00'),
('tck_005', 'res_equip_03', NULL, 'OTHER', 'MEDIUM', 'CLOSED', 'Found a crack on the lens body.', '555-0105', 'usr_1005', 'usr_9001', 'Sent back to manufacturer for warranty replacement.', '2026-03-21 15:30:00');

-- 6. Insert TicketAttachments
INSERT INTO TicketAttachments (TicketId, GeneratedFileName, UploadedAt) VALUES 
('tck_001', '1711025800_usr1003_flicker1.jpg', '2026-03-21 12:02:00'),
('tck_002', '1711025810_usr1002_leak.png', '2026-03-21 12:16:00'),
('tck_005', '1711025820_usr1005_crack.jpg', '2026-03-21 15:31:00'),
('tck_005', '1711025825_usr1005_crack_macro.jpg', '2026-03-21 15:31:30');

-- 7. Insert TicketComments
INSERT INTO TicketComments (Id, TicketId, AuthorId, Text, CreatedAt) VALUES 
('cmt_001', 'tck_001', 'usr_9001', 'I will check the connection, but it looks like a bulb issue.', '2026-03-21 12:30:00'),
('cmt_002', 'tck_001', 'usr_1003', 'Okay, please hurry, midterm is coming up!', '2026-03-21 12:35:00'),
('cmt_003', 'tck_003', 'usr_9002', 'Checking the router logs now.', '2026-03-21 13:10:00'),
('cmt_004', 'tck_003', 'usr_1001', 'It works now, thanks.', '2026-03-21 13:45:00'),
('cmt_005', 'tck_005', 'usr_9001', 'This is definitely physical damage. Filing warranty claim.', '2026-03-21 15:40:00');

-- 8. Insert Notifications
INSERT INTO Notifications (Id, UserId, Type, Title, Message, ReferenceId, IsRead, CreatedAt) VALUES 
('notif_001', 'usr_1003', 'BOOKING_APPROVED', 'Booking Approved', 'CS101 Midterm exam booking passed', 'bkg_001', 1, '2026-03-21 11:00:00'),
('notif_002', 'usr_1003', 'NEW_COMMENT', 'Ticket Updated', 'Bob Builder commented on your projector ticket.', 'tck_001', 0, '2026-03-21 12:30:00'),
('notif_003', 'usr_1004', 'BOOKING_REJECTED', 'Booking Rejected', 'Your booking for Seminar Room B was rejected.', 'bkg_003', 0, '2026-03-21 14:35:00'),
('notif_004', 'usr_1001', 'TICKET_UPDATED', 'Ticket Resolved', 'Your internet issue ticket has been marked RESOLVED.', 'tck_003', 1, '2026-03-21 13:40:00'),
('notif_005', 'usr_1005', 'BOOKING_APPROVED', 'Booking Approved', 'Equipment checkout for Mobile Projector X1 is ready.', 'bkg_005', 0, '2026-03-21 16:05:00');
GO
