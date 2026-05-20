-- ================================================================
-- V3 — Campos para vuelos y escapadas en la tabla trips
-- ================================================================

ALTER TABLE trips ADD COLUMN IF NOT EXISTS type          VARCHAR(20) NOT NULL DEFAULT 'viaje';
ALTER TABLE trips ADD COLUMN IF NOT EXISTS airline       VARCHAR(100);
ALTER TABLE trips ADD COLUMN IF NOT EXISTS flight_number VARCHAR(20);
ALTER TABLE trips ADD COLUMN IF NOT EXISTS cabin_class   VARCHAR(20);
ALTER TABLE trips ADD COLUMN IF NOT EXISTS includes_hotel BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE trips ADD COLUMN IF NOT EXISTS hotel_name   VARCHAR(150);
ALTER TABLE trips ADD COLUMN IF NOT EXISTS hotel_stars  INTEGER;
ALTER TABLE trips ADD COLUMN IF NOT EXISTS meal_plan    VARCHAR(50);
ALTER TABLE trips ADD COLUMN IF NOT EXISTS highlight    VARCHAR(200);

-- Los 12 viajes existentes quedan como type='viaje' por el DEFAULT
-- Índice para filtrar por tipo eficientemente
CREATE INDEX IF NOT EXISTS idx_trips_type ON trips (type);