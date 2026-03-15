-- TEN MediaHQ - 2026 Envoy Nation Program Calendar
-- Run this in Supabase SQL Editor
-- Adds venue, responsible_lead columns and inserts 58 events

-- Add new columns if they don't exist
ALTER TABLE services ADD COLUMN IF NOT EXISTS venue TEXT;
ALTER TABLE services ADD COLUMN IF NOT EXISTS responsible_lead TEXT;
ALTER TABLE services ADD COLUMN IF NOT EXISTS end_date DATE;
ALTER TABLE services ADD COLUMN IF NOT EXISTS end_time TIME;
ALTER TABLE services ADD COLUMN IF NOT EXISTS unit TEXT;
ALTER TABLE services ADD COLUMN IF NOT EXISTS frequency TEXT;
ALTER TABLE services ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'Planned';
ALTER TABLE services ADD COLUMN IF NOT EXISTS notes TEXT;

-- Clear old demo/seed services for envoy_nation
DELETE FROM services WHERE team_id = 'envoy_nation';

-- Insert 2026 Envoy Nation Calendar
INSERT INTO services (service_id, title, date, time, end_date, end_time, type, team_id, venue, responsible_lead, unit, frequency, status, notes) VALUES
('en_2026_001', 'Workers Appreciation Dinner', '2026-02-22', '01:00', '2026-02-22', '04:00', 'program', 'envoy_nation', 'The Envoy Nation', 'Olamide', 'Events & Planning', 'One-time', 'Confirmed', NULL),
('en_2026_002', 'Social Media Strategy Meeting', '2026-01-03', '17:00', '2026-01-03', '19:00', 'training', 'envoy_nation', 'Envoy Nation', 'Folayemi', 'Social Media', 'One-time', 'Confirmed', 'Meeting was held online to set the tone for 2026.'),
('en_2026_003', 'Partners Breakfast Meeting', '2026-01-17', '18:00', '2026-01-17', '08:00', 'program', 'envoy_nation', 'The Envoy Nation', 'Olamide', 'Events & Planning', 'One-time', 'Confirmed', NULL),
('en_2026_004', 'Leadership & Workforce Retreat', '2026-03-21', '17:00', '2026-03-21', '23:00', 'workers_retreat', 'envoy_nation', 'Church Auditorium', 'Director Chinwe', 'Directorate', 'Quarterly', 'Confirmed', NULL),
('en_2026_005', 'Leadership Retreat with PD', '2026-06-05', '19:00', '2026-06-07', '17:00', 'director_retreat', 'envoy_nation', 'Retreat Location (TBC)', 'Director Alero', 'Directorate', 'Quarterly', 'Confirmed', NULL),
('en_2026_006', 'Capacity Building Training', '2026-04-25', '03:00', '2026-04-25', '04:00', 'training', 'envoy_nation', NULL, 'Adedoyin', 'Pastoral Team', 'Quarterly', 'Planned', NULL),
('en_2026_007', 'Covenant Cleaners Training', '2026-03-07', '19:00', '2026-03-07', '22:00', 'training', 'envoy_nation', 'Envoy Nation Building', 'Clementina Beya', 'Covenant Cleaners', 'Quarterly', 'Planned', NULL),
('en_2026_008', 'Love like Wine 26', '2026-03-14', '19:00', '2026-03-14', '21:00', 'program', 'envoy_nation', 'Envoy Nation', 'Mr Alfred', 'Creatives', 'Yearly', 'Planned', NULL),
('en_2026_009', 'Team Fire Mashal Training', '2026-05-02', '19:00', '2026-05-02', '21:00', 'training', 'envoy_nation', 'Church Auditorium', 'Bro Wealth', 'Security', NULL, 'Planned', 'Yet to be confirmed'),
('en_2026_010', 'Leadership & Team Retreat with PD (Music)', '2026-01-10', '08:00', '2026-01-11', '00:00', 'workers_retreat', 'envoy_nation', 'The Envoy Nation Main Auditorium', 'Dr ADEDEJI', 'Music Team', 'Quarterly', 'Planned', 'For all choir members - Musicians and Vocalists'),
('en_2026_011', 'Training/Music Conference', '2026-03-21', '07:00', '2026-03-21', '23:00', 'training', 'envoy_nation', 'The Envoy Building', 'Dr ADEDEJI', 'Music Team', 'Quarterly', 'Planned', NULL),
('en_2026_012', 'Worship Meeting', '2026-05-17', '18:00', '2026-05-17', '20:00', 'service', 'envoy_nation', 'The Envoy Nation', 'Dr ADEDEJI', 'Music Team', 'One-time', 'Planned', NULL),
('en_2026_013', 'Christmas Carol', '2026-12-12', '23:00', '2026-12-13', '04:00', 'program', 'envoy_nation', 'The Envoy Nation', 'Dr ADEDEJI', 'Music Team', 'One-time', 'Planned', NULL),
('en_2026_014', 'Music Concert', '2026-07-04', '23:00', '2026-07-05', '03:00', 'program', 'envoy_nation', 'The Envoy Nation', 'Dr ADEDEJI', 'Music Team', 'One-time', 'Planned', NULL),
('en_2026_015', 'Capacity Building Training (Protocol)', '2026-04-25', '03:00', '2026-04-25', '04:00', 'training', 'envoy_nation', 'Church', 'Remi', 'Protocol', 'Quarterly', 'Planned', NULL),
('en_2026_016', 'Publicity Presentation', '2026-01-11', '19:15', '2026-01-11', '19:18', 'program', 'envoy_nation', 'Church', 'Ayo Onafeso', 'Publicity', 'Quarterly', 'Planned', 'A short presentation to facilitate social media presence'),
('en_2026_017', 'Publicity In-House Retreat', '2026-02-28', '21:00', '2026-02-28', '23:00', 'workers_retreat', 'envoy_nation', 'Church', 'Ayo Onafeso', 'Publicity', 'One-time', 'Planned', NULL),
('en_2026_018', 'Publicity Virtual Team Training', '2026-05-23', '03:00', '2026-05-23', '04:00', 'training', 'envoy_nation', 'Virtual', 'Ayo Onafeso', 'Publicity', 'Quarterly', 'Planned', 'This is for publicity team members only'),
('en_2026_019', 'Team-Building Meeting (Guest Relations)', '2026-04-25', '19:00', '2026-04-26', '01:00', 'training', 'envoy_nation', 'TBA', 'Olaolu', 'Guest Relations', 'Quarterly', 'Planned', NULL),
('en_2026_020', 'Team Retreat (Guest Relations)', '2026-06-06', '16:00', '2026-06-07', '01:00', 'workers_retreat', 'envoy_nation', 'TBC', 'Olaolu', 'Guest Relations', 'Yearly', 'Planned', NULL),
('en_2026_021', 'E-Base Leaders Training', '2026-01-25', '00:00', '2026-01-25', '03:00', 'training', 'envoy_nation', 'TBC', 'D.G', 'Expressions', 'Quarterly', 'Planned', NULL),
('en_2026_022', 'E-base Leaders Retreat', '2026-06-27', '16:00', '2026-06-28', '01:00', 'workers_retreat', 'envoy_nation', 'TBC', 'D.G', 'Expressions', 'Yearly', 'Planned', NULL),
('en_2026_023', 'Couples Conference/Seminar', '2026-02-14', '18:00', '2026-02-15', '22:00', 'program', 'envoy_nation', 'Envoy Nation main Church', 'Abiola Oluwole', 'Expressions', 'Quarterly', 'Planned', NULL),
('en_2026_024', 'Singles Retreat', '2026-02-07', '03:00', '2026-02-07', '18:00', 'program', 'envoy_nation', NULL, 'Oluwatobi Obayelu', 'Expressions', 'One-time', 'Planned', NULL),
('en_2026_025', 'Ushering Team Training', '2026-01-31', '08:00', '2026-01-31', '08:00', 'training', 'envoy_nation', 'Envoy Nation', 'HOD / Director in charge', 'Ushering', 'Quarterly', 'Planned', NULL),
('en_2026_026', 'Easter Picnic', '2026-04-04', '07:00', '2026-04-04', '07:00', 'fellowship', 'envoy_nation', 'Public park', 'Event', 'Events & Planning', 'One-time', 'Planned', NULL),
('en_2026_027', 'PD Birthday', '2026-03-26', '07:00', '2026-03-26', '07:00', 'service', 'envoy_nation', 'Church', 'Event', 'Events & Planning', 'Yearly', 'Planned', NULL),
('en_2026_028', 'Virtual Prayer Meeting - Prayer Squad', '2026-01-31', '18:00', '2026-01-31', '08:00', 'workers_retreat', 'envoy_nation', 'Envoy Nation', 'HOD', 'Expressions', 'Weekly', 'Confirmed', 'Also having a physical prayer meeting once a month'),
('en_2026_029', 'Envoy Charity Match', '2026-07-04', '17:00', '2026-07-04', '21:00', 'outreach', 'envoy_nation', 'YMCA Leicestershire', 'Niko', 'Expressions', 'Yearly', 'Planned', NULL),
('en_2026_030', 'Media Flex (Easter)', '2026-04-04', '19:00', '2026-04-05', '00:03', 'program', 'envoy_nation', 'Church', 'Adeola', 'Media', 'One-time', 'Planned', 'Free easter and Christmas pictures for all families on envoy.'),
('en_2026_031', 'Media Flex (Christmas)', '2026-12-19', '20:00', '2026-12-19', '21:00', 'program', 'envoy_nation', 'Church', 'Adeola', 'Media', 'One-time', 'Planned', 'Free easter and Christmas pictures for all families on envoy.'),
('en_2026_032', 'Media Open Day', '2026-02-21', '18:00', '2026-02-21', '21:01', 'training', 'envoy_nation', NULL, 'Adeola', 'Media', 'Quarterly', 'Planned', 'Showcase event for recruiting new members'),
('en_2026_033', 'Media Bootcamp', '2026-02-28', '18:00', '2026-02-28', '21:00', 'training', 'envoy_nation', 'Church', 'Adeola', 'Media', 'One-time', 'Planned', 'Training for existing members and new recruits.'),
('en_2026_034', 'Hands of Help Day', '2026-06-14', '20:00', NULL, NULL, 'outreach', 'envoy_nation', 'Church', 'Adenike Olushola', 'Helping Hands', 'One-time', 'Planned', NULL),
('en_2026_035', 'Envoy Student Conference (ECS)', '2026-03-07', '02:00', '2026-03-09', '00:00', 'service', 'envoy_nation', 'The Envoy Nation, 66 Burleys way, LE13BD', 'Pst David Achudume', 'Expressions', 'One-time', 'Planned', NULL),
('en_2026_036', 'Forge Leadership Conference (Fri)', '2026-02-28', '01:00', '2026-02-28', '06:00', 'service', 'envoy_nation', 'Church Main Hall', 'Opeyemi Olusanya', NULL, 'One-time', 'Planned', NULL),
('en_2026_037', 'Forge Leadership Conference (Sat)', '2026-03-01', '01:00', '2026-03-01', '06:00', 'service', 'envoy_nation', 'Church Main Hall', 'Opeyemi Olusanya', NULL, 'One-time', 'Planned', NULL),
('en_2026_038', 'Leadership & Team Retreat (Children Church)', '2026-01-03', '20:00', '2026-01-03', '22:00', 'workers_retreat', 'envoy_nation', 'Church Auditorium, Envoy Nation', 'Director Tomi', 'Expressions', 'One-time', 'Confirmed', NULL),
('en_2026_039', 'Leadership & Team Retreat (Guest Relations)', '2026-01-04', '00:00', '2026-01-04', '02:00', 'workers_retreat', 'envoy_nation', 'Church Auditorium', 'Olaolu', 'Guest Relations', 'One-time', 'Confirmed', NULL),
('en_2026_040', 'Evangelism & Outreach Retreat', '2026-02-07', '08:00', '2026-02-07', '11:00', 'training', 'envoy_nation', '7_10 Class', 'Yemi Ayoola', NULL, 'Yearly', 'Planned', NULL),
('en_2026_041', 'The Valentine Day Connect', '2026-02-14', '08:00', '2026-02-14', '21:00', 'program', 'envoy_nation', 'The Envoy Nation Church Auditorium', 'Priscilla Phillips', 'Expressions', 'Yearly', 'Planned', 'Program for youth celebrating love and understanding Gods love as young Christians'),
('en_2026_042', 'ebase Campaign Sunday', '2026-01-25', '19:00', '2026-01-25', '21:00', 'outreach', 'envoy_nation', 'Church Auditorium', 'Director Alero', 'Expressions', 'Quarterly', 'Planned', NULL),
('en_2026_043', 'Leadership & Team Retreat (Catalyst Church)', '2026-01-24', '20:00', '2026-01-24', '22:00', 'workers_retreat', 'envoy_nation', 'The Envoy Nation Childrens Church Ground Floor', 'Priscilla Phillips', NULL, 'Quarterly', 'Planned', NULL),
('en_2026_044', 'Catalyst Church Career Bootcamp and Open Day', '2026-03-28', '19:00', '2026-03-28', '21:00', 'program', 'envoy_nation', 'The Envoy Nation Main Auditorium', 'Priscilla Phillips', NULL, 'Quarterly', 'Planned', NULL),
('en_2026_045', 'Sound Team Training', '2026-03-28', '19:00', '2026-03-28', '22:00', 'training', 'envoy_nation', 'Main Auditorium', 'Director Stephen', 'Sound & Technical', 'Quarterly', 'Planned', NULL),
('en_2026_046', 'Membership Class Q1', '2026-02-25', '02:00', '2026-02-25', '04:00', 'training', 'envoy_nation', 'Online', 'Director Chinwe', 'Directorate', NULL, 'Planned', NULL),
('en_2026_047', 'Membership Class Q2', '2026-06-17', '01:00', '2026-07-30', '07:00', 'training', 'envoy_nation', 'Online', 'Director Chinwe', 'Directorate', 'Quarterly', 'Planned', NULL),
('en_2026_048', 'A Celebration of Life, Praise & Thanksgiving', '2026-07-11', '00:00', '2026-07-11', '06:00', 'program', 'envoy_nation', 'Church Auditorium', 'Director Alero', 'Expressions', 'One-time', 'Confirmed', NULL),
('en_2026_049', 'Thrive Summit 2026', '2026-08-29', '17:00', '2026-08-29', '22:00', 'program', 'envoy_nation', 'Church Auditorium', 'Dir Alero', 'Expressions', 'One-time', 'Planned', NULL),
('en_2026_050', 'Walk for your Heart - Winter Edition', '2026-02-28', '15:30', '2026-02-28', '17:00', 'program', 'envoy_nation', 'Church to Abbey Park', 'Dr Adesewa', NULL, NULL, 'Planned', NULL),
('en_2026_051', 'Love that Feels like Home', '2026-02-15', '19:00', '2026-02-15', '21:00', 'outreach', 'envoy_nation', 'Church', 'Adenike/Olubunmi', 'Helping Hands', 'One-time', 'Planned', NULL),
('en_2026_052', 'Taste of our Tribe', '2026-04-16', '20:00', '2026-04-06', '23:00', 'program', 'envoy_nation', NULL, 'Adenike', 'Helping Hands', NULL, 'Planned', NULL),
('en_2026_053', 'Enterprise Sunday', '2026-05-01', '07:00', '2026-05-31', '22:00', 'service', 'envoy_nation', 'Envoy Nation main auditorium', 'Timothy Sonaike', 'Expressions', 'One-time', 'Confirmed', 'Enterprise month - all through May'),
('en_2026_054', 'Conference/Seminar (Couples)', '2026-05-09', '17:00', '2026-05-10', '20:00', 'program', 'envoy_nation', '66 Burleys way', 'Abiola Oluwole', NULL, 'Yearly', 'Planned', NULL),
('en_2026_055', 'Leadership & Team Retreat (Protocol)', '2026-01-18', '00:00', '2026-01-18', '02:00', 'workers_retreat', 'envoy_nation', 'The Envoy Nation, Meeting Room Downstairs', 'Sis Remi', 'Protocol', NULL, 'Planned', NULL),
('en_2026_056', 'Mothers Day', '2026-03-15', '18:00', '2026-03-15', '20:30', 'service', 'envoy_nation', '66 Burleys way, Leicester', 'Mrs Owoseni', NULL, 'Yearly', 'Planned', NULL),
('en_2026_057', 'Hand Maidens', '2026-08-22', '07:00', '2026-08-23', '00:00', 'program', 'envoy_nation', 'The Envoy Nation', 'Debby Owoseni', 'Expressions', 'Yearly', 'Confirmed', NULL),
('en_2026_058', 'Afro-Naija Food Festival', '2026-05-02', '18:00', '2026-05-03', '00:00', 'program', 'envoy_nation', 'Envoy Nation main auditorium', 'Timothy Sonaike', 'Expressions', 'One-time', 'Confirmed', NULL),
('en_2026_059', 'Volunteering Sunday', '2026-03-22', '18:00', '2026-03-22', '20:00', 'service', 'envoy_nation', NULL, 'Olubunmi Akande', 'Helping Hands', NULL, 'Confirmed', NULL),
('en_2026_060', 'Summer Bootcamp (Children)', '2026-07-27', '07:00', '2026-08-01', '01:00', 'program', 'envoy_nation', 'All rooms', 'Tomilayo Aremu', 'Expressions', 'Yearly', 'Confirmed', 'In collaboration with Catalyst Church'),
('en_2026_061', 'Summer Bootcamp (Catalyst)', '2026-07-27', '07:00', '2026-08-01', '01:00', 'program', 'envoy_nation', 'Church - all rooms', 'Priscilla Phillips', 'Expressions', 'Yearly', 'Confirmed', NULL);
