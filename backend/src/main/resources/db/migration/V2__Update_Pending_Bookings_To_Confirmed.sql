-- First, check if there are any PENDING bookings
-- This is a safe check to prevent unnecessary updates
-- and to help with debugging
SELECT COUNT(*) AS pending_count FROM bookings WHERE status = 'PENDING';

-- Update all PENDING bookings to CONFIRMED
UPDATE bookings SET status = 'CONFIRMED' WHERE status = 'PENDING';

-- Verify the update
SELECT status, COUNT(*) as count FROM bookings GROUP BY status;
