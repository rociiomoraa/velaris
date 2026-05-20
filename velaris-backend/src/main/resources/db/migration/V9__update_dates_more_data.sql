-- ================================================================
-- V9 — Actualizar fechas a 2026 + más reservas, reseñas y favoritos
-- ================================================================

-- ============================================================
-- ACTUALIZAR FECHAS DE VIAJES (V2) A 2026
-- ============================================================
UPDATE trips SET departure_date = '2026-07-10', return_date = '2026-07-24' WHERE title = 'Paraíso en Bali';
UPDATE trips SET departure_date = '2026-08-05', return_date = '2026-08-17' WHERE title = 'Safari en Kenia';
UPDATE trips SET departure_date = '2026-04-01', return_date = '2026-04-14' WHERE title = 'Japón: Tradición y Modernidad';
UPDATE trips SET departure_date = '2026-09-15', return_date = '2026-09-22' WHERE title = 'La Toscana en Profundidad';
UPDATE trips SET departure_date = '2026-06-20', return_date = '2026-06-30' WHERE title = 'Maldivas: Agua Cristalina';
UPDATE trips SET departure_date = '2026-10-10', return_date = '2026-10-19' WHERE title = 'Nueva York Imprescindible';
UPDATE trips SET departure_date = '2026-07-28', return_date = '2026-08-06' WHERE title = 'Los Alpes Suizos';
UPDATE trips SET departure_date = '2026-08-20', return_date = '2026-08-29' WHERE title = 'Crucero por el Mediterráneo';
UPDATE trips SET departure_date = '2026-11-05', return_date = '2026-11-12' WHERE title = 'Maravillas de Marruecos';
UPDATE trips SET departure_date = '2026-12-26', return_date = '2027-01-07' WHERE title = 'Costa Rica: Pura Vida';
UPDATE trips SET departure_date = '2026-11-20', return_date = '2026-11-29' WHERE title = 'Islandia: Fuego y Hielo';
UPDATE trips SET departure_date = '2027-01-10', return_date = '2027-01-22' WHERE title = 'Cancún y Riviera Maya';

-- ============================================================
-- ACTUALIZAR FECHAS DE VUELOS (V4) A 2026
-- ============================================================
UPDATE trips SET departure_date = '2026-07-15', return_date = '2026-07-15' WHERE title = 'Madrid → Roma · Vuelo directo';
UPDATE trips SET departure_date = '2026-08-01', return_date = '2026-08-01' WHERE title = 'Madrid → París · Tarifa flexible';
UPDATE trips SET departure_date = '2026-09-10', return_date = '2026-09-10' WHERE title = 'Madrid → Tokio · Business Class';
UPDATE trips SET departure_date = '2026-12-20', return_date = '2026-12-27' WHERE title = 'Madrid → Cancún · Vuelo + Hotel';
UPDATE trips SET departure_date = '2026-07-20', return_date = '2026-07-20' WHERE title = 'Madrid → Bali · Conexión Dubai';
UPDATE trips SET departure_date = '2026-10-05', return_date = '2026-10-05' WHERE title = 'Barcelona → Londres · Low Cost';

-- ============================================================
-- ACTUALIZAR FECHAS DE ESCAPADAS (V4) A 2026
-- ============================================================
UPDATE trips SET departure_date = '2026-07-25', return_date = '2026-07-27' WHERE title = 'Escapada romántica a Sevilla';
UPDATE trips SET departure_date = '2026-08-08', return_date = '2026-08-11' WHERE title = 'Fin de semana en la Costa Brava';
UPDATE trips SET departure_date = '2026-09-19', return_date = '2026-09-22' WHERE title = 'Lisboa en 3 días';
UPDATE trips SET departure_date = '2026-10-03', return_date = '2026-10-05' WHERE title = 'Spa & Relax en los Pirineos';

-- ============================================================
-- MÁS RESERVAS (viajes, vuelos y escapadas)
-- ============================================================
INSERT INTO bookings (user_id, trip_id, num_travelers, total_price, status, notes, booked_at) VALUES

-- Viajes
(2,  4,  2, 1798.00, 'CONFIRMED', 'Vegetarianos, por favor indicar menú',    '2026-01-05 10:00:00'),
(3,  7,  2, 3798.00, 'CONFIRMED', 'Primera vez en los Alpes',                '2026-01-12 11:00:00'),
(4,  2,  1, 2499.00, 'CONFIRMED', NULL,                                       '2026-01-20 09:30:00'),
(5,  9,  3, 2247.00, 'CONFIRMED', 'Grupo familiar',                           '2026-02-01 10:00:00'),
(6,  11, 2, 3998.00, 'PENDING',   'Quieren ver aurora boreal sí o sí',        '2026-02-10 12:00:00'),
(7,  4,  2, 1798.00, 'PENDING',   NULL,                                       '2026-02-18 15:00:00'),
(8,  6,  2, 3198.00, 'PENDING',   'Aniversario de boda',                      '2026-03-01 09:00:00'),
(9,  1,  1, 1299.00, 'PENDING',   NULL,                                       '2026-03-05 11:00:00'),
(5,  8,  3, 3597.00, 'CANCELLED', 'Cancelado por enfermedad',                 '2026-01-08 10:00:00'),
(6,  2,  2, 4998.00, 'CANCELLED', NULL,                                       '2026-02-15 14:00:00'),

-- Vuelos (trip_id de vuelos: los 6 insertados en V4, ids 13-18 aprox)
(2,  13, 2,  178.00, 'CONFIRMED', 'Asientos juntos por favor',                '2026-01-03 10:00:00'),
(3,  14, 1,  119.00, 'CONFIRMED', NULL,                                       '2026-01-15 11:00:00'),
(4,  16, 2, 2398.00, 'CONFIRMED', 'Traslado desde aeropuerto incluido',       '2026-02-05 09:00:00'),
(5,  17, 1,  680.00, 'PENDING',   NULL,                                       '2026-02-20 10:00:00'),
(6,  18, 3,  165.00, 'PENDING',   'Equipaje facturado añadido',               '2026-03-10 12:00:00'),
(7,  15, 1, 2850.00, 'CONFIRMED', 'Business class, solicitar menú especial',  '2026-01-25 08:00:00'),

-- Escapadas (trip_id de escapadas: ids 19-24 aprox)
(8,  19, 2,  378.00, 'CONFIRMED', 'Escapada de cumpleaños',                   '2026-01-10 10:00:00'),
(9,  20, 2,  640.00, 'CONFIRMED', NULL,                                       '2026-01-22 11:00:00'),
(5,  21, 1,  245.00, 'CONFIRMED', 'Primera vez en Lisboa',                    '2026-02-08 09:00:00'),
(6,  22, 2,  698.00, 'PENDING',   'Masaje incluido confirmar',                '2026-02-25 10:00:00'),
(7,  19, 2,  378.00, 'PENDING',   NULL,                                       '2026-03-05 12:00:00'),
(8,  21, 2,  490.00, 'CANCELLED', 'Trabajo imprevisto',                       '2026-01-18 15:00:00');

-- ============================================================
-- MÁS RESEÑAS
-- ============================================================
INSERT INTO reviews (user_id, trip_id, rating, comment, sentiment) VALUES

-- Viajes
(2,  4,  5, 'La Toscana es un sueño hecho realidad. Los viñedos del Chianti y Florencia son impresionantes. Repetiría sin dudarlo.', 'POSITIVE'),
(3,  7,  4, 'El Matterhorn desde Zermatt es de las vistas más impresionantes que he visto en mi vida. El tren panorámico, espectacular.', 'POSITIVE'),
(4,  2,  5, 'El safari en el Masái Mara fue una experiencia que cambia la perspectiva de todo. Ver la gran migración en vivo no tiene precio.', 'POSITIVE'),
(5,  9,  4, 'Marruecos te engancha desde el primer momento. El Sahara de noche con el cielo estrellado fue lo mejor del viaje.', 'POSITIVE'),
(6,  11, 5, 'Islandia en noviembre es mágica. Vimos la aurora boreal tres noches seguidas. El equipo de Velaris lo organizó todo perfectamente.', 'POSITIVE'),
(7,  1,  4, 'Bali superó mis expectativas. Ubud es increíble, aunque el tráfico en Seminyak puede ser agotador. En general un viaje 10.', 'POSITIVE'),
(8,  6,  5, 'Nueva York tiene una energía que no se encuentra en ningún otro sitio. Los museos, Broadway y Central Park son imprescindibles.', 'POSITIVE'),
(9,  8,  4, 'El crucero por el Mediterráneo fue una experiencia única. Cada puerto una sorpresa. Mykonos fue lo que más me gustó.', 'POSITIVE'),
(5,  3,  5, 'Japón es el destino perfecto. La combinación de Tokio, Kioto y Osaka es imbatible. Los cerezos en flor son una maravilla.', 'POSITIVE'),
(6,  5,  5, 'Las Maldivas son el lugar más bonito que he visitado en mi vida. El bungalow sobre el agua fue puro lujo y tranquilidad.', 'POSITIVE'),
(7,  9,  3, 'Marruecos está bien pero el calor en agosto es excesivo. Los zocos de Marrakech son agobiantes si no te gustan las multitudes.', 'NEUTRAL'),
(8,  7,  4, 'Suiza es carísima pero merece la pena. Los paisajes alpinos son de película y el tren del Glaciar fue lo mejor del viaje.', 'POSITIVE'),

-- Escapadas
(2,  19, 5, 'Sevilla en verano tiene una magia especial. El Hotel Alfonso XIII es una pasada y la Giralda desde la habitación, impresionante.', 'POSITIVE'),
(3,  20, 4, 'La Costa Brava es preciosa. Cadaqués es un pueblo de cuento. El hotel con piscina infinita sobre el mar, brutal.', 'POSITIVE'),
(4,  21, 5, 'Lisboa me enamoró completamente. El fado en Alfama, los pasteles de Belém y el tranvía histórico. Una ciudad perfecta.', 'POSITIVE'),
(5,  22, 4, 'El spa en los Pirineos fue exactamente lo que necesitaba. Aguas termales y masaje incluido. Desconexión total, muy recomendable.', 'POSITIVE');

-- ============================================================
-- MÁS FAVORITOS
-- ============================================================
INSERT INTO favorites (user_id, trip_id) VALUES
-- Viajes
(2,  7),  (2,  9),  (2,  11),
(3,  2),  (3,  4),  (3,  8),
(4,  1),  (4,  7),  (4,  11),
(5,  3),  (5,  6),  (5,  8),
(6,  2),  (6,  7),  (6,  10),
(7,  4),  (7,  6),  (7,  9),
(8,  3),  (8,  6),  (8,  11),
(9,  1),  (9,  5),  (9,  8),
-- Vuelos
(2,  13), (3,  15), (4,  17),
(5,  14), (6,  16), (7,  18),
-- Escapadas
(2,  20), (3,  21), (4,  22),
(5,  19), (6,  20), (7,  21),
(8,  19), (9,  22);