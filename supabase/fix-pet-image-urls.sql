-- Fix Pet Image URLs
-- The pet image_url was stored as 'images/pets/...' but should be '/pets/...'
-- to match the equipment format and work with the URL construction in the app.

UPDATE pets SET image_url = '/pets/baby_cow.png' WHERE id = 'baby_cow';
UPDATE pets SET image_url = '/pets/baby_rabbit.png' WHERE id = 'baby_rabbit';
UPDATE pets SET image_url = '/pets/wolf_pup.png' WHERE id = 'wolf_pup';
UPDATE pets SET image_url = '/pets/kitten.png' WHERE id = 'kitten';
UPDATE pets SET image_url = '/pets/fox_kit.png' WHERE id = 'fox_kit';
UPDATE pets SET image_url = '/pets/parrot_chick.png' WHERE id = 'parrot_chick';

-- Also update any existing pets that may have the wrong format
UPDATE pets
SET image_url = REPLACE(image_url, 'images/pets/', '/pets/')
WHERE image_url LIKE 'images/pets/%';
