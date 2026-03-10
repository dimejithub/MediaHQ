-- TEN MediaHQ - Updated Checklist Data
-- Run this in Supabase SQL Editor to update checklists with the correct 29-item checklist
-- This matches the Media_Team_Service_Checklist.docx

-- Delete old checklist data
DELETE FROM checklists;

-- Add title column if not exists
ALTER TABLE checklists ADD COLUMN IF NOT EXISTS title TEXT;

-- Insert updated checklist with 29 items in 5 sections
INSERT INTO checklists (service_id, team_id, title, items) VALUES
    ('svc_sun_mar08', 'envoy_nation', 'Sunday Service Checklist', '[
{"id":"chk_1","text":"Ensure all team members are present","checked":false,"section":"PRE-SERVICE SETUP"},
{"id":"chk_2","text":"Check the rota to ensure all unit members officiating are present, if yes tick and if no have reached out?","checked":false,"section":"PRE-SERVICE SETUP"},
{"id":"chk_3","text":"Assign specific roles and responsibilities","checked":false,"section":"PRE-SERVICE SETUP"},
{"id":"chk_4","text":"Turn on all sockets, media appliances, screens including LED screen","checked":false,"section":"PRE-SERVICE SETUP"},
{"id":"chk_5","text":"Inspect that all equipments are properly connected","checked":false,"section":"PRE-SERVICE SETUP"},
{"id":"chk_6","text":"Verify cameras, switchers, and monitors","checked":false,"section":"PRE-SERVICE SETUP"},
{"id":"chk_7","text":"Confirm HDMI cables are working","checked":false,"section":"PRE-SERVICE SETUP"},
{"id":"chk_8","text":"Check battery levels and replace if needed","checked":false,"section":"PRE-SERVICE SETUP"},
{"id":"chk_9","text":"Ensure proper camera angles and framing","checked":false,"section":"PRE-SERVICE SETUP"},
{"id":"chk_10","text":"Confirm pulpit camera is properly placed","checked":false,"section":"PRE-SERVICE SETUP"},
{"id":"chk_11","text":"Check communication headsets for clear audio","checked":false,"section":"TECHNICAL RUN-THROUGH"},
{"id":"chk_12","text":"Ensure livestream feed audio is clear","checked":false,"section":"TECHNICAL RUN-THROUGH"},
{"id":"chk_13","text":"Set up laptop/system for projection and livestream","checked":false,"section":"TECHNICAL RUN-THROUGH"},
{"id":"chk_14","text":"Download images/videos/lyrics from WhatsApp or Drive","checked":false,"section":"TECHNICAL RUN-THROUGH"},
{"id":"chk_15","text":"Verify slides, lyrics, and video cues","checked":false,"section":"TECHNICAL RUN-THROUGH"},
{"id":"chk_16","text":"Run short cue test for smooth transitions","checked":false,"section":"TECHNICAL RUN-THROUGH"},
{"id":"chk_17","text":"Start streaming 5 mins before service start time","checked":false,"section":"TECHNICAL RUN-THROUGH"},
{"id":"chk_18","text":"Confirm overlays/lower-thirds are working","checked":false,"section":"TECHNICAL RUN-THROUGH"},
{"id":"chk_19","text":"Ensure smooth camera switching and transitions","checked":false,"section":"LIVE PRODUCTION MONITORING"},
{"id":"chk_20","text":"Monitor video quality and adjust as needed","checked":false,"section":"LIVE PRODUCTION MONITORING"},
{"id":"chk_21","text":"Stay in sync with presentation and sound teams","checked":false,"section":"LIVE PRODUCTION MONITORING"},
{"id":"chk_22","text":"Be ready to troubleshoot issues quickly","checked":false,"section":"LIVE PRODUCTION MONITORING"},
{"id":"chk_23","text":"Document conflicts/challenges faced during service","checked":false,"section":"LIVE PRODUCTION MONITORING"},
{"id":"chk_24","text":"List all equipment collected after first service","checked":false,"section":"EQUIPMENT HANDOVER"},
{"id":"chk_25","text":"Ensure proper handover to second service team","checked":false,"section":"EQUIPMENT HANDOVER"},
{"id":"chk_26","text":"Second Service Lead signs off confirming equipment is intact","checked":false,"section":"EQUIPMENT HANDOVER"},
{"id":"chk_27","text":"Discuss what went well and issues faced","checked":false,"section":"DEBRIEF & FEEDBACK"},
{"id":"chk_28","text":"Note any equipment needing maintenance (to be done by sub unit head)","checked":false,"section":"DEBRIEF & FEEDBACK"},
{"id":"chk_29","text":"Plan improvements for the next service [during weekly standup]","checked":false,"section":"DEBRIEF & FEEDBACK"}
]'::jsonb);
