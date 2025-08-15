-- Update download limit from 5 to 20
UPDATE orders SET max_downloads = 20 WHERE max_downloads = 5;