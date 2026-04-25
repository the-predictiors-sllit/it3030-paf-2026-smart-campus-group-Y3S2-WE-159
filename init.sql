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
    ImageUrl VARCHAR(500),
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
    EndTime TIME NOT NULL,
    CONSTRAINT UQ_ResourceAvailability UNIQUE (ResourceId, DayOfWeek, StartTime, EndTime)
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
    GeneratedFileName VARCHAR(500) NOT NULL,
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
    Type VARCHAR(255) NOT NULL,
    Title VARCHAR(100) NOT NULL,
    Message NVARCHAR(MAX) NOT NULL,
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




-- ============================================================
-- Resources INSERT
-- ============================================================
INSERT INTO Resources (Id, Name, Type, Capacity, Location, Status, Description, ImageUrl, CreatedAt) VALUES 

-- ROOMS
('res_roo_055521', 'Main Auditorium', 'ROOM', 298, 'Block A, 1st Floor, Main Building', 'ACTIVE', 'Large tiered seating hall equipped with dual 4K laser projectors, surround sound, and a dedicated AV control booth.', 'resources/1777096520_069226858504_main_auditorium.jpg', '2026-04-25 05:55:21'),
('res_roo_055950', 'Boardroom Alpha', 'ROOM', 15, 'Admin Block, 2nd Floor, Management Building', 'ACTIVE', 'Executive meeting space featuring an 85-inch interactive smartboard, conference phone, and wide-angle video conferencing setup.', 'resources/1777096790_069226858504_board_alpha.jpg', '2026-04-25 05:59:50'),
('res_roo_061650', 'Smart Classroom B204', 'ROOM', 78, 'Block B, 2nd Floor, New Building', 'ACTIVE', 'Flipped-classroom layout with modular furniture, multiple wireless display casting screens, and collaborative digital whiteboards.', 'resources/1777097810_069226858504_smart_classroom.png', '2026-04-25 06:16:50'),
('res_roo_061908', 'Student Collab Space 1', 'ROOM', 7, 'Library, Ground Floor, New Building', 'ACTIVE', 'Soundproofed glass cubicle designed for small group discussions, featuring power outlets, a display monitor, and whiteboard walls.', 'resources/1777097947_069226858504_collab_phace_1.webp', '2026-04-25 06:19:08'),
('res_roo_062554', 'Seminar Room C101', 'ROOM', 120, 'Block C, Ground Floor', 'ACTIVE', 'Mid-sized seminar room with stepped seating, acoustic paneling, and an automated lighting control system.', 'resources/1777098354_069226858504_meeting_room.jpg', '2026-04-25 06:25:54'),
('res_roo_062926', 'Faculty Conference Space', 'ROOM', 20, 'Admin Block, 3rd Floor', 'ACTIVE', 'Formal meeting room reserved for staff, equipped with a centralized PA system and an interactive presentation screen.', 'resources/1777098566_069226858504_coference_space.jpg', '2026-04-25 06:29:26'),
('res_roo_064309', 'Counseling Room 2', 'ROOM', 4, 'Student Services Center', 'ACTIVE', 'Private, sound-isolated room with comfortable seating designed for student counseling sessions and confidential discussions.', 'resources/1777099389_069226858504_counseling_room.jpeg', '2026-04-25 06:43:09'),
('res_room_01', 'Main Lecture Hall A', 'ROOM', 150, 'Building 1, Floor 2', 'ACTIVE', 'High-tech lecture room with 2 projectors.', 'resources/1777100760_069226858504_main_lecture_hall_a.jpg', '2026-03-20 09:00:00'),
('res_room_02', 'Seminar Room B', 'ROOM', 40, 'Building 1, Floor 3', 'ACTIVE', 'Interactive smart board included.', 'resources/1777100790_069226858504_seminar_room_b.png', '2026-03-20 09:05:00'),
('res_room_03', 'Study Pod 1', 'ROOM', 4, 'Library, Floor 1', 'ACTIVE', 'Soundproof booth.', 'resources/1777100284_069226858504_study_pod_1.jpg', '2026-03-20 09:10:00'),
('res_room_04', 'Study Pod 2', 'ROOM', 4, 'Library, Floor 1', 'OUT_OF_SERVICE', 'Door lock broken.', 'resources/1777100108_069226858504_study_pod_2.png', '2026-03-20 09:15:00'),

-- LABS
('res_lab_055711', 'Advanced Computing Lab', 'LAB', 57, 'Computing Faculty, 3rd Floor, New Building', 'ACTIVE', 'High-performance workstations featuring dual monitors and pre-installed environments for data science and AI/ML development.', 'resources/1777096631_069226858504_computer_lab.jpg', '2026-04-25 05:57:11'),
('res_lab_061509', 'IoT Hardware Lab', 'LAB', 40, 'Engineering Block, 1st Floor', 'ACTIVE', 'Specialized workspace featuring soldering stations, microcontrollers, oscilloscopes, and 3D printers for hardware prototyping.', 'resources/1777097708_069226858504_board_alpha.jpg', '2026-04-25 06:15:09'),
('res_lab_062722', 'Chemical Analysis Lab', 'LAB', 30, 'Science Faculty, 2nd Floor', 'ACTIVE', 'Fully equipped wet lab featuring fume hoods, emergency wash stations, and chemical-resistant workstations.', 'resources/1777098442_069226858504_analytical-chemistry.jpg', '2026-04-25 06:27:22'),
('res_lab_063303', 'Green Screen Studio', 'LAB', 15, 'Media Faculty, Ground Floor', 'ACTIVE', 'Soundproof video production studio featuring a full curved green screen cyclorama and overhead DMX-controlled lighting grids.', 'resources/1777098783_069226858504_green_screen_lab.jpg', '2026-04-25 06:33:03'),
('res_lab_064145', 'Architecture Design Studio', 'LAB', 49, 'Design Block, 4th Floor', 'ACTIVE', 'Open-plan studio with large drafting tables, abundant natural light, and a dedicated plotting/printing area.', 'resources/1777099305_069226858504_architecture.jpg', '2026-04-25 06:41:45'),
('res_lab_01', 'Chemistry Lab 3', 'LAB', 30, 'Building 2, Floor 1', 'ACTIVE', 'Fume hoods, acid resistant tables.', 'resources/1777100502_069226858504_chemistry_lab.jpg', '2026-03-20 09:20:00'),
('res_lab_02', 'Physics Lab Intro', 'LAB', 25, 'Building 2, Floor 2', 'ACTIVE', 'Standard physics experimental kits.', NULL, '2026-03-20 09:25:00'),

-- EQUIPMENT
('res_equ_060211', 'Portable 4K Projector (P-01)', 'EQUIPMENT', NULL, 'IT Support Desk', 'ACTIVE', 'Ultra-short throw portable projector available for checkout, ideal for temporary setups or outdoor presentations.', 'resources/1777096931_069226858504_portable_4k_projector.jpg', '2026-04-25 06:02:11'),
('res_equ_060354', 'PTZ Streaming Camera (C-01)', 'EQUIPMENT', NULL, 'IT Support Desk', 'ACTIVE', 'Pan-tilt-zoom camera with automated tracking, used for live-streaming guest lectures and special campus events.', 'resources/1777097034_069226858504_streaming_camera.jpeg', '2026-04-25 06:03:54'),
('res_equ_062152', 'Meta Quest 3 (VR-01)', 'EQUIPMENT', NULL, 'Media Lab', 'ACTIVE', 'Virtual reality headset available for immersive learning simulations, 3D modeling, and spatial design projects.', 'resources/1777098112_069226858504_meta_quest.jpg', '2026-04-25 06:21:52'),
('res_equ_062358', 'Wireless Mic Kit (M-01)', 'EQUIPMENT', NULL, 'IT Support Desk', 'ACTIVE', 'Dual wireless lavalier microphone system with noise cancellation, perfect for lecture recordings and panel discussions.', 'resources/1777098238_069226858504_dual_mic.jpg', '2026-04-25 06:23:58'),
('res_equ_063103', 'Mobile Charging Cart', 'EQUIPMENT', NULL, 'Library Help Desk', 'ACTIVE', 'Secured, wheeled cart capable of charging up to 30 laptops and tablets simultaneously, available for booking by lecturers.', 'resources/1777098663_069226858504_mobile_charging_cart.jpg', '2026-04-25 06:31:03'),
('res_equ_063650', 'Smart Digital Podium (DP-02)', 'EQUIPMENT', NULL, 'IT Support Desk', 'ACTIVE', 'Movable lectern with a built-in touch display, gooseneck microphone, and integrated PC for flexible lecture setups.', 'resources/1777099010_069226858504_smart_digital_podium.jpg', '2026-04-25 06:36:50'),
('res_equ_063941', 'Surveying Drone (D-01)', 'EQUIPMENT', NULL, 'Engineering Faculty Vault', 'ACTIVE', 'Enterprise-grade quadcopter with RTK and thermal imaging, strictly for civil engineering and spatial mapping projects.', 'resources/1777099181_069226858504_drone.jpg', '2026-04-25 06:39:41'),
('res_equ_064510', 'Portable 3D Scanner (S-01)', 'EQUIPMENT', NULL, 'IT Support Desk', 'ACTIVE', 'Handheld structured-light 3D scanner used for digitizing physical objects for AR/VR development and reverse engineering.', 'resources/1777099510_069226858504_3d_scanner.webp', '2026-04-25 06:45:10'),
('res_equip_01', 'Mobile Projector X1', 'EQUIPMENT', NULL, 'IT Storage Desk', 'ACTIVE', '1080p portable projector.', 'resources/sample_projector_x1.jpg', '2026-03-20 09:35:00'),
('res_equip_03', 'DSLR Camera Kit', 'EQUIPMENT', NULL, 'Media Room 4', 'OUT_OF_SERVICE', 'Lens cracked, under repair.', 'resources/1777099873_069226858504_dslr_camera_kit.jpg', '2026-03-20 09:45:00');


-- ============================================================
-- ResourceAvailability INSERT
-- ============================================================
INSERT INTO ResourceAvailability (ResourceId, DayOfWeek, StartTime, EndTime) VALUES

-- Main Auditorium (res_roo_055521) — Mon–Fri 08:00–21:00, Sat 09:00–17:00
('res_roo_055521', 'MONDAY',    '08:00:00', '21:00:00'),
('res_roo_055521', 'TUESDAY',   '08:00:00', '21:00:00'),
('res_roo_055521', 'WEDNESDAY', '08:00:00', '21:00:00'),
('res_roo_055521', 'THURSDAY',  '08:00:00', '21:00:00'),
('res_roo_055521', 'FRIDAY',    '08:00:00', '18:00:00'),
('res_roo_055521', 'SATURDAY',  '09:00:00', '17:00:00'),

-- Boardroom Alpha (res_roo_055950) — Mon–Fri 08:00–18:00 (admin hours)
('res_roo_055950', 'MONDAY',    '08:00:00', '18:00:00'),
('res_roo_055950', 'TUESDAY',   '08:00:00', '18:00:00'),
('res_roo_055950', 'WEDNESDAY', '08:00:00', '18:00:00'),
('res_roo_055950', 'THURSDAY',  '08:00:00', '18:00:00'),
('res_roo_055950', 'FRIDAY',    '08:00:00', '17:00:00'),

-- Smart Classroom B204 (res_roo_061650) — Mon–Sat 07:30–21:00
('res_roo_061650', 'MONDAY',    '07:30:00', '21:00:00'),
('res_roo_061650', 'TUESDAY',   '07:30:00', '21:00:00'),
('res_roo_061650', 'WEDNESDAY', '07:30:00', '21:00:00'),
('res_roo_061650', 'THURSDAY',  '07:30:00', '21:00:00'),
('res_roo_061650', 'FRIDAY',    '07:30:00', '18:00:00'),
('res_roo_061650', 'SATURDAY',  '08:00:00', '14:00:00'),

-- Student Collab Space 1 (res_roo_061908) — Mon–Sun 08:00–22:00 (library hours)
('res_roo_061908', 'MONDAY',    '08:00:00', '22:00:00'),
('res_roo_061908', 'TUESDAY',   '08:00:00', '22:00:00'),
('res_roo_061908', 'WEDNESDAY', '08:00:00', '22:00:00'),
('res_roo_061908', 'THURSDAY',  '08:00:00', '22:00:00'),
('res_roo_061908', 'FRIDAY',    '08:00:00', '22:00:00'),
('res_roo_061908', 'SATURDAY',  '09:00:00', '18:00:00'),
('res_roo_061908', 'SUNDAY',    '10:00:00', '18:00:00'),

-- Seminar Room C101 (res_roo_062554) — Mon–Fri 08:00–21:00, Sat 09:00–17:00
('res_roo_062554', 'MONDAY',    '08:00:00', '21:00:00'),
('res_roo_062554', 'TUESDAY',   '08:00:00', '21:00:00'),
('res_roo_062554', 'WEDNESDAY', '08:00:00', '21:00:00'),
('res_roo_062554', 'THURSDAY',  '08:00:00', '21:00:00'),
('res_roo_062554', 'FRIDAY',    '08:00:00', '18:00:00'),
('res_roo_062554', 'SATURDAY',  '09:00:00', '17:00:00'),

-- Faculty Conference Space (res_roo_062926) — Mon–Fri 08:00–18:00 (staff only)
('res_roo_062926', 'MONDAY',    '08:00:00', '18:00:00'),
('res_roo_062926', 'TUESDAY',   '08:00:00', '18:00:00'),
('res_roo_062926', 'WEDNESDAY', '08:00:00', '18:00:00'),
('res_roo_062926', 'THURSDAY',  '08:00:00', '18:00:00'),
('res_roo_062926', 'FRIDAY',    '08:00:00', '17:00:00'),

-- Counseling Room 2 (res_roo_064309) — Mon–Fri 09:00–17:00 (appointment hours)
('res_roo_064309', 'MONDAY',    '09:00:00', '17:00:00'),
('res_roo_064309', 'TUESDAY',   '09:00:00', '17:00:00'),
('res_roo_064309', 'WEDNESDAY', '09:00:00', '17:00:00'),
('res_roo_064309', 'THURSDAY',  '09:00:00', '17:00:00'),
('res_roo_064309', 'FRIDAY',    '09:00:00', '17:00:00'),

-- Main Lecture Hall A (res_room_01) — Mon–Fri 08:00–21:00
('res_room_01', 'MONDAY',    '08:00:00', '21:00:00'),
('res_room_01', 'TUESDAY',   '08:00:00', '21:00:00'),
('res_room_01', 'WEDNESDAY', '08:00:00', '21:00:00'),
('res_room_01', 'THURSDAY',  '08:00:00', '21:00:00'),
('res_room_01', 'FRIDAY',    '08:00:00', '18:00:00'),

-- Seminar Room B (res_room_02) — Mon–Sat 08:00–21:00
('res_room_02', 'MONDAY',    '08:00:00', '21:00:00'),
('res_room_02', 'TUESDAY',   '08:00:00', '21:00:00'),
('res_room_02', 'WEDNESDAY', '08:00:00', '21:00:00'),
('res_room_02', 'THURSDAY',  '08:00:00', '21:00:00'),
('res_room_02', 'FRIDAY',    '08:00:00', '18:00:00'),
('res_room_02', 'SATURDAY',  '09:00:00', '17:00:00'),

-- Study Pod 1 (res_room_03) — Mon–Sun 08:00–22:00 (library)
('res_room_03', 'MONDAY',    '08:00:00', '22:00:00'),
('res_room_03', 'TUESDAY',   '08:00:00', '22:00:00'),
('res_room_03', 'WEDNESDAY', '08:00:00', '22:00:00'),
('res_room_03', 'THURSDAY',  '08:00:00', '22:00:00'),
('res_room_03', 'FRIDAY',    '08:00:00', '22:00:00'),
('res_room_03', 'SATURDAY',  '09:00:00', '18:00:00'),
('res_room_03', 'SUNDAY',    '10:00:00', '18:00:00'),

-- Study Pod 2 (res_room_04) — OUT_OF_SERVICE, no availability rows

-- Advanced Computing Lab (res_lab_055711) — Mon–Sat 07:30–22:00
('res_lab_055711', 'MONDAY',    '07:30:00', '22:00:00'),
('res_lab_055711', 'TUESDAY',   '07:30:00', '22:00:00'),
('res_lab_055711', 'WEDNESDAY', '07:30:00', '22:00:00'),
('res_lab_055711', 'THURSDAY',  '07:30:00', '22:00:00'),
('res_lab_055711', 'FRIDAY',    '07:30:00', '20:00:00'),
('res_lab_055711', 'SATURDAY',  '09:00:00', '17:00:00'),

-- IoT Hardware Lab (res_lab_061509) — Mon–Fri 08:00–20:00
('res_lab_061509', 'MONDAY',    '08:00:00', '20:00:00'),
('res_lab_061509', 'TUESDAY',   '08:00:00', '20:00:00'),
('res_lab_061509', 'WEDNESDAY', '08:00:00', '20:00:00'),
('res_lab_061509', 'THURSDAY',  '08:00:00', '20:00:00'),
('res_lab_061509', 'FRIDAY',    '08:00:00', '17:00:00'),

-- Chemical Analysis Lab (res_lab_062722) — Mon–Fri 08:00–18:00 (safety supervised)
('res_lab_062722', 'MONDAY',    '08:00:00', '18:00:00'),
('res_lab_062722', 'TUESDAY',   '08:00:00', '18:00:00'),
('res_lab_062722', 'WEDNESDAY', '08:00:00', '18:00:00'),
('res_lab_062722', 'THURSDAY',  '08:00:00', '18:00:00'),
('res_lab_062722', 'FRIDAY',    '08:00:00', '16:00:00'),

-- Green Screen Studio (res_lab_063303) — Mon–Sat 08:00–21:00
('res_lab_063303', 'MONDAY',    '08:00:00', '21:00:00'),
('res_lab_063303', 'TUESDAY',   '08:00:00', '21:00:00'),
('res_lab_063303', 'WEDNESDAY', '08:00:00', '21:00:00'),
('res_lab_063303', 'THURSDAY',  '08:00:00', '21:00:00'),
('res_lab_063303', 'FRIDAY',    '08:00:00', '21:00:00'),
('res_lab_063303', 'SATURDAY',  '09:00:00', '18:00:00'),

-- Architecture Design Studio (res_lab_064145) — Mon–Sat 07:00–22:00
('res_lab_064145', 'MONDAY',    '07:00:00', '22:00:00'),
('res_lab_064145', 'TUESDAY',   '07:00:00', '22:00:00'),
('res_lab_064145', 'WEDNESDAY', '07:00:00', '22:00:00'),
('res_lab_064145', 'THURSDAY',  '07:00:00', '22:00:00'),
('res_lab_064145', 'FRIDAY',    '07:00:00', '20:00:00'),
('res_lab_064145', 'SATURDAY',  '08:00:00', '18:00:00'),

-- Chemistry Lab 3 (res_lab_01) — Mon–Fri 08:00–18:00
('res_lab_01', 'MONDAY',    '08:00:00', '18:00:00'),
('res_lab_01', 'TUESDAY',   '08:00:00', '18:00:00'),
('res_lab_01', 'WEDNESDAY', '08:00:00', '18:00:00'),
('res_lab_01', 'THURSDAY',  '08:00:00', '18:00:00'),
('res_lab_01', 'FRIDAY',    '08:00:00', '16:00:00'),

-- Physics Lab Intro (res_lab_02) — Mon–Fri 08:00–18:00
('res_lab_02', 'MONDAY',    '08:00:00', '18:00:00'),
('res_lab_02', 'TUESDAY',   '08:00:00', '18:00:00'),
('res_lab_02', 'WEDNESDAY', '08:00:00', '18:00:00'),
('res_lab_02', 'THURSDAY',  '08:00:00', '18:00:00'),
('res_lab_02', 'FRIDAY',    '08:00:00', '16:00:00'),

-- Equipment — available Mon–Sat from IT/Library desks (08:00–17:00 pickup window)
-- Portable 4K Projector (res_equ_060211)
('res_equ_060211', 'MONDAY',    '08:00:00', '17:00:00'),
('res_equ_060211', 'TUESDAY',   '08:00:00', '17:00:00'),
('res_equ_060211', 'WEDNESDAY', '08:00:00', '17:00:00'),
('res_equ_060211', 'THURSDAY',  '08:00:00', '17:00:00'),
('res_equ_060211', 'FRIDAY',    '08:00:00', '17:00:00'),
('res_equ_060211', 'SATURDAY',  '09:00:00', '13:00:00'),

-- PTZ Streaming Camera (res_equ_060354)
('res_equ_060354', 'MONDAY',    '08:00:00', '17:00:00'),
('res_equ_060354', 'TUESDAY',   '08:00:00', '17:00:00'),
('res_equ_060354', 'WEDNESDAY', '08:00:00', '17:00:00'),
('res_equ_060354', 'THURSDAY',  '08:00:00', '17:00:00'),
('res_equ_060354', 'FRIDAY',    '08:00:00', '17:00:00'),
('res_equ_060354', 'SATURDAY',  '09:00:00', '13:00:00'),

-- Meta Quest 3 (res_equ_062152)
('res_equ_062152', 'MONDAY',    '08:00:00', '17:00:00'),
('res_equ_062152', 'TUESDAY',   '08:00:00', '17:00:00'),
('res_equ_062152', 'WEDNESDAY', '08:00:00', '17:00:00'),
('res_equ_062152', 'THURSDAY',  '08:00:00', '17:00:00'),
('res_equ_062152', 'FRIDAY',    '08:00:00', '17:00:00'),
('res_equ_062152', 'SATURDAY',  '09:00:00', '13:00:00'),

-- Wireless Mic Kit (res_equ_062358)
('res_equ_062358', 'MONDAY',    '08:00:00', '17:00:00'),
('res_equ_062358', 'TUESDAY',   '08:00:00', '17:00:00'),
('res_equ_062358', 'WEDNESDAY', '08:00:00', '17:00:00'),
('res_equ_062358', 'THURSDAY',  '08:00:00', '17:00:00'),
('res_equ_062358', 'FRIDAY',    '08:00:00', '17:00:00'),
('res_equ_062358', 'SATURDAY',  '09:00:00', '13:00:00'),

-- Mobile Charging Cart (res_equ_063103)
('res_equ_063103', 'MONDAY',    '08:00:00', '17:00:00'),
('res_equ_063103', 'TUESDAY',   '08:00:00', '17:00:00'),
('res_equ_063103', 'WEDNESDAY', '08:00:00', '17:00:00'),
('res_equ_063103', 'THURSDAY',  '08:00:00', '17:00:00'),
('res_equ_063103', 'FRIDAY',    '08:00:00', '17:00:00'),
('res_equ_063103', 'SATURDAY',  '09:00:00', '13:00:00'),

-- Smart Digital Podium (res_equ_063650)
('res_equ_063650', 'MONDAY',    '08:00:00', '17:00:00'),
('res_equ_063650', 'TUESDAY',   '08:00:00', '17:00:00'),
('res_equ_063650', 'WEDNESDAY', '08:00:00', '17:00:00'),
('res_equ_063650', 'THURSDAY',  '08:00:00', '17:00:00'),
('res_equ_063650', 'FRIDAY',    '08:00:00', '17:00:00'),

-- Surveying Drone (res_equ_063941) — restricted, weekdays only, supervised
('res_equ_063941', 'MONDAY',    '08:00:00', '16:00:00'),
('res_equ_063941', 'TUESDAY',   '08:00:00', '16:00:00'),
('res_equ_063941', 'WEDNESDAY', '08:00:00', '16:00:00'),
('res_equ_063941', 'THURSDAY',  '08:00:00', '16:00:00'),
('res_equ_063941', 'FRIDAY',    '08:00:00', '14:00:00'),

-- Portable 3D Scanner (res_equ_064510)
('res_equ_064510', 'MONDAY',    '08:00:00', '17:00:00'),
('res_equ_064510', 'TUESDAY',   '08:00:00', '17:00:00'),
('res_equ_064510', 'WEDNESDAY', '08:00:00', '17:00:00'),
('res_equ_064510', 'THURSDAY',  '08:00:00', '17:00:00'),
('res_equ_064510', 'FRIDAY',    '08:00:00', '17:00:00'),
('res_equ_064510', 'SATURDAY',  '09:00:00', '13:00:00'),

-- Mobile Projector X1 (res_equip_01)
('res_equip_01', 'MONDAY',    '08:00:00', '17:00:00'),
('res_equip_01', 'TUESDAY',   '08:00:00', '17:00:00'),
('res_equip_01', 'WEDNESDAY', '08:00:00', '17:00:00'),
('res_equip_01', 'THURSDAY',  '08:00:00', '17:00:00'),
('res_equip_01', 'FRIDAY',    '08:00:00', '17:00:00');

-- NOTE: res_room_04 (Study Pod 2) and res_equip_03 (DSLR Camera Kit)
-- are OUT_OF_SERVICE — no availability rows inserted.











-- -- 2. Insert Resources (Rooms, Labs, Equipment)
-- INSERT INTO Resources (Id, Name, Type, Capacity, Location, Status, Description, ImageUrl, CreatedAt) VALUES 
-- -- Rooms
-- ('res_room_01', 'Main Lecture Hall A', 'ROOM', 150, 'Building 1, Floor 2', 'ACTIVE', 'High-tech lecture room with 2 projectors.', 'resources/sample_main_lecture_hall_a.jpg', '2026-03-20 09:00:00'),
-- ('res_room_02', 'Seminar Room B', 'ROOM', 40, 'Building 1, Floor 3', 'ACTIVE', 'Interactive smart board included.', 'resources/sample_seminar_room_b.jpg', '2026-03-20 09:05:00'),
-- ('res_room_03', 'Study Pod 1', 'ROOM', 4, 'Library, Floor 1', 'ACTIVE', 'Soundproof booth.', NULL, '2026-03-20 09:10:00'),
-- ('res_room_04', 'Study Pod 2', 'ROOM', 4, 'Library, Floor 1', 'OUT_OF_SERVICE', 'Door lock broken.', NULL, '2026-03-20 09:15:00'),
-- -- Labs
-- ('res_lab_01', 'Chemistry Lab 3', 'LAB', 30, 'Building 2, Floor 1', 'ACTIVE', 'Fume hoods, acid resistant tables.', 'resources/sample_chem_lab_3.jpg', '2026-03-20 09:20:00'),
-- ('res_lab_02', 'Physics Lab Intro', 'LAB', 25, 'Building 2, Floor 2', 'ACTIVE', 'Standard physics experimental kits.', NULL, '2026-03-20 09:25:00'),
-- ('res_lab_03', 'Advanced Robotics', 'LAB', 15, 'Building 4, Basement', 'ACTIVE', 'High-voltage tools available.', NULL, '2026-03-20 09:30:00'),
-- -- Equipment
-- ('res_equip_01', 'Mobile Projector X1', 'EQUIPMENT', NULL, 'IT Storage Desk', 'ACTIVE', '1080p portable projector.', 'resources/sample_projector_x1.jpg', '2026-03-20 09:35:00'),
-- ('res_equip_02', 'Wireless Mic Array A', 'EQUIPMENT', NULL, 'IT Storage Desk', 'ACTIVE', '2 handheld mics & receiver.', NULL, '2026-03-20 09:40:00'),
-- ('res_equip_03', 'DSLR Camera Kit', 'EQUIPMENT', NULL, 'Media Room 4', 'OUT_OF_SERVICE', 'Lens cracked, under repair.', NULL, '2026-03-20 09:45:00');

-- -- 3. Insert ResourceAvailability (Hours)
-- INSERT INTO ResourceAvailability (ResourceId, DayOfWeek, StartTime, EndTime) VALUES 
-- -- Main Lecture Hall A
-- ('res_room_01', 'MONDAY', '08:00:00', '21:00:00'),
-- ('res_room_01', 'TUESDAY', '08:00:00', '21:00:00'),
-- ('res_room_01', 'WEDNESDAY', '08:00:00', '21:00:00'),
-- ('res_room_01', 'THURSDAY', '08:00:00', '21:00:00'),
-- ('res_room_01', 'FRIDAY', '08:00:00', '18:00:00'),
-- -- Seminar Room B
-- ('res_room_02', 'MONDAY', '09:00:00', '17:00:00'),
-- ('res_room_02', 'WEDNESDAY', '09:00:00', '17:00:00'),
-- -- Chemistry Lab 3
-- ('res_lab_01', 'MONDAY', '08:00:00', '16:00:00'),
-- ('res_lab_01', 'TUESDAY', '08:00:00', '16:00:00'),
-- ('res_lab_01', 'THURSDAY', '08:00:00', '16:00:00'),
-- -- Mobile Projector X1
-- ('res_equip_01', 'MONDAY', '07:30:00', '19:30:00'),
-- ('res_equip_01', 'TUESDAY', '07:30:00', '19:30:00'),
-- ('res_equip_01', 'WEDNESDAY', '07:30:00', '19:30:00');

-- -- 4. Insert Bookings
-- INSERT INTO Bookings (Id, ResourceId, UserId, StartTime, EndTime, Purpose, ExpectedAttendees, Status, Reason, CreatedAt) VALUES 
-- ('bkg_001', 'res_room_01', 'usr_1003', '2026-04-10 10:00:00', '2026-04-10 12:00:00', 'CS101 Midterm', 120, 'APPROVED', NULL, '2026-03-21 10:00:00'),
-- ('bkg_002', 'res_lab_01', 'usr_1001', '2026-04-10 13:00:00', '2026-04-10 15:00:00', 'Biology Review', 20, 'PENDING', NULL, '2026-03-21 11:00:00'),
-- ('bkg_003', 'res_room_02', 'usr_1004', '2026-04-12 14:00:00', '2026-04-12 16:00:00', 'Club Meeting', 15, 'REJECTED', 'Room reserved for faculty meeting', '2026-03-21 14:30:00'),
-- ('bkg_004', 'res_room_03', 'usr_1002', '2026-04-13 09:00:00', '2026-04-13 11:00:00', 'Group Study', 3, 'APPROVED', NULL, '2026-03-21 15:00:00'),
-- ('bkg_005', 'res_equip_01', 'usr_1005', '2026-04-15 10:00:00', '2026-04-15 12:00:00', 'Guest Lecture Display', NULL, 'APPROVED', NULL, '2026-03-21 16:00:00');

-- -- 5. Insert Tickets
-- INSERT INTO Tickets (Id, ResourceId, Location, Category, Priority, Status, Description, ContactPhone, CreatedBy, AssignedTo, ResolutionNotes, CreatedAt) VALUES 
-- ('tck_001', 'res_room_01', NULL, 'HARDWARE', 'HIGH', 'IN_PROGRESS', 'Main projector bulb is flickering constantly.', '555-0101', 'usr_1003', 'usr_9001', 'Need to order a replacement lamp.', '2026-03-21 12:00:00'),
-- ('tck_002', NULL, 'Cafeteria, Zone A', 'PLUMBING', 'MEDIUM', 'OPEN', 'Water cooler is leaking onto the floor.', '555-0102', 'usr_1002', NULL, NULL, '2026-03-21 12:15:00'),
-- ('tck_003', 'res_lab_01', NULL, 'SOFTWARE', 'LOW', 'RESOLVED', 'Lab PC 12 cannot connect to the internet.', '555-0103', 'usr_1001', 'usr_9002', 'Reconfigured network DNS settings. Fixed.', '2026-03-21 13:00:00'),
-- ('tck_004', 'res_room_04', NULL, 'HARDWARE', 'CRITICAL', 'OPEN', 'Door lock jammed, stuck inside.', '555-0104', 'usr_1004', NULL, NULL, '2026-03-21 14:00:00'),
-- ('tck_005', 'res_equip_03', NULL, 'OTHER', 'MEDIUM', 'CLOSED', 'Found a crack on the lens body.', '555-0105', 'usr_1005', 'usr_9001', 'Sent back to manufacturer for warranty replacement.', '2026-03-21 15:30:00');

-- -- 6. Insert TicketAttachments
-- INSERT INTO TicketAttachments (TicketId, GeneratedFileName, UploadedAt) VALUES 
-- ('tck_001', '1711025800_usr1003_flicker1.jpg', '2026-03-21 12:02:00'),
-- ('tck_002', '1711025810_usr1002_leak.png', '2026-03-21 12:16:00'),
-- ('tck_005', '1711025820_usr1005_crack.jpg', '2026-03-21 15:31:00'),
-- ('tck_005', '1711025825_usr1005_crack_macro.jpg', '2026-03-21 15:31:30');

-- -- 7. Insert TicketComments
-- INSERT INTO TicketComments (Id, TicketId, AuthorId, Text, CreatedAt) VALUES 
-- ('cmt_001', 'tck_001', 'usr_9001', 'I will check the connection, but it looks like a bulb issue.', '2026-03-21 12:30:00'),
-- ('cmt_002', 'tck_001', 'usr_1003', 'Okay, please hurry, midterm is coming up!', '2026-03-21 12:35:00'),
-- ('cmt_003', 'tck_003', 'usr_9002', 'Checking the router logs now.', '2026-03-21 13:10:00'),
-- ('cmt_004', 'tck_003', 'usr_1001', 'It works now, thanks.', '2026-03-21 13:45:00'),
-- ('cmt_005', 'tck_005', 'usr_9001', 'This is definitely physical damage. Filing warranty claim.', '2026-03-21 15:40:00');

-- -- 8. Insert Notifications
-- INSERT INTO Notifications (Id, UserId, Type, Title, Message, ReferenceId, IsRead, CreatedAt) VALUES 
-- ('notif_001', 'usr_1003', 'BOOKING_APPROVED', 'Booking Approved', 'CS101 Midterm exam booking passed', 'bkg_001', 1, '2026-03-21 11:00:00'),
-- ('notif_002', 'usr_1003', 'NEW_COMMENT', 'Ticket Updated', 'Bob Builder commented on your projector ticket.', 'tck_001', 0, '2026-03-21 12:30:00'),
-- ('notif_003', 'usr_1004', 'BOOKING_REJECTED', 'Booking Rejected', 'Your booking for Seminar Room B was rejected.', 'bkg_003', 0, '2026-03-21 14:35:00'),
-- ('notif_004', 'usr_1001', 'TICKET_UPDATED', 'Ticket Resolved', 'Your internet issue ticket has been marked RESOLVED.', 'tck_003', 1, '2026-03-21 13:40:00'),
-- ('notif_005', 'usr_1005', 'BOOKING_APPROVED', 'Booking Approved', 'Equipment checkout for Mobile Projector X1 is ready.', 'bkg_005', 0, '2026-03-21 16:05:00');
-- GO