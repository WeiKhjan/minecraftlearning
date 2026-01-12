-- Fix Unit 1, 2, 3 Pet Assignments
-- These units were missing pet rewards

-- First, ensure pet image URLs are in correct format
UPDATE pets SET image_url = '/pets/chicken.png' WHERE id = 'chicken';
UPDATE pets SET image_url = '/pets/pig.png' WHERE id = 'pig';
UPDATE pets SET image_url = '/pets/sheep.png' WHERE id = 'sheep';

-- Assign pets to Units 1, 2, 3
UPDATE themes SET pet_reward = 'chicken' WHERE code = 'tema_1_unit_1';
UPDATE themes SET pet_reward = 'pig' WHERE code = 'tema_1_unit_2';
UPDATE themes SET pet_reward = 'sheep' WHERE code = 'tema_1_unit_3';

-- Verify the updates
SELECT code, name_en, pet_reward FROM themes WHERE code LIKE 'tema_1%' ORDER BY code;
