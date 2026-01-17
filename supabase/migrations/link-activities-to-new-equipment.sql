-- Migration: Link activities to new equipment based on theme/unit
-- This updates activity equipment_reward_id to use the new equipment IDs

-- First, let's identify themes by order_index (which corresponds to unit number)
-- Theme order_index 3 = Unit 4, order_index 4 = Unit 5, etc. (0-indexed)

-- Create a temporary function to map activity position to equipment
DO $$
DECLARE
  v_theme RECORD;
  v_activity RECORD;
  v_unit_number INT;
  v_activity_index INT;
  v_new_equipment_id UUID;
  v_slots TEXT[] := ARRAY['helmet', 'chestplate', 'leggings', 'boots', 'weapon', 'tool', 'ranged', 'shield'];
  v_slot TEXT;
BEGIN
  -- Loop through themes (each theme is a unit)
  FOR v_theme IN
    SELECT t.id, t.order_index, t.name_en
    FROM themes t
    ORDER BY t.order_index
  LOOP
    -- Unit number is order_index + 1
    v_unit_number := v_theme.order_index + 1;

    RAISE NOTICE 'Processing theme: % (Unit %)', v_theme.name_en, v_unit_number;

    -- Only process units 1-9 (we have equipment for these)
    IF v_unit_number <= 9 THEN
      v_activity_index := 0;

      -- Loop through activities in this theme
      FOR v_activity IN
        SELECT a.id, a.title_en
        FROM activities a
        WHERE a.theme_id = v_theme.id
        ORDER BY a.order_index
      LOOP
        -- Map activity index to equipment slot (cycle through slots)
        v_slot := v_slots[(v_activity_index % 7) + 1];

        -- Find the corresponding new equipment
        SELECT e.id INTO v_new_equipment_id
        FROM equipment e
        WHERE e.unit_number = v_unit_number
          AND e.slot = v_slot
        LIMIT 1;

        IF v_new_equipment_id IS NOT NULL THEN
          -- Update the activity
          UPDATE activities
          SET equipment_reward_id = v_new_equipment_id
          WHERE id = v_activity.id;

          RAISE NOTICE '  Activity "%": linked to equipment %', v_activity.title_en, v_new_equipment_id;
        ELSE
          RAISE NOTICE '  Activity "%": no equipment found for unit % slot %', v_activity.title_en, v_unit_number, v_slot;
        END IF;

        v_activity_index := v_activity_index + 1;
      END LOOP;
    END IF;
  END LOOP;
END $$;

-- Verify the updates
SELECT
  t.name_en as theme,
  t.order_index + 1 as unit_number,
  a.title_en as activity,
  e.name as equipment,
  e.tier,
  e.slot,
  e.image_url
FROM themes t
JOIN activities a ON a.theme_id = t.id
LEFT JOIN equipment e ON e.id = a.equipment_reward_id
WHERE t.order_index + 1 <= 9
ORDER BY t.order_index, a.order_index
LIMIT 50;
