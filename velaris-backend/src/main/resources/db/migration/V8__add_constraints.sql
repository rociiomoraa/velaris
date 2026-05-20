-- ================================================================
-- V8 — Constraints de integridad y limpieza
-- ================================================================

-- Check constraint en trips.type (añadido en V3 sin constraint)
ALTER TABLE trips
    ADD CONSTRAINT chk_trips_type
        CHECK (type IN ('viaje', 'vuelo', 'escapada'));

-- Check constraint en trips.category
ALTER TABLE trips
    ADD CONSTRAINT chk_trips_category
        CHECK (category IN ('playa', 'ciudad', 'aventura', 'cultura', 'naturaleza', 'otros'));