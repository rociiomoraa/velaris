-- ================================================================
-- V5 — Más reservas, reseñas y usuarios para poblar el dashboard
-- ================================================================

-- Usuarios adicionales
INSERT INTO users (name, email, password, phone, role, enabled) VALUES
                                                                    ('Laura Sánchez',   'laura@example.es',  '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.', '+34 633 111 222', 'USER', TRUE),
                                                                    ('Pedro Jiménez',   'pedro@example.es',  '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.', '+34 644 222 333', 'USER', TRUE),
                                                                    ('María López',     'maria@example.es',  '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.', '+34 655 333 444', 'USER', TRUE),
                                                                    ('Javier Ruiz',     'javier@example.es', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.', '+34 666 444 555', 'USER', TRUE),
                                                                    ('Sofía Martínez',  'sofia@example.es',  '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.', '+34 677 555 666', 'USER', TRUE),
                                                                    ('Diego Fernández', 'diego@example.es',  '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.', '+34 688 666 777', 'USER', TRUE)
    ON CONFLICT (email) DO NOTHING;

-- Reservas adicionales (variedad de estados y meses)
INSERT INTO bookings (user_id, trip_id, num_travelers, total_price, status, notes, booked_at) VALUES
                                                                                                  (5,  6,  2, 3198.00, 'COMPLETED', NULL,                            '2025-01-10 10:00:00'),
                                                                                                  (6,  4,  1,  899.00, 'COMPLETED', 'Primera vez en Italia',         '2025-01-18 11:30:00'),
                                                                                                  (7,  5,  2, 6598.00, 'COMPLETED', 'Luna de miel',                  '2025-02-05 09:00:00'),
                                                                                                  (8,  9,  3, 2247.00, 'COMPLETED', NULL,                            '2025-02-14 14:00:00'),
                                                                                                  (9,  3,  2, 4398.00, 'COMPLETED', 'Viaje de aniversario',          '2025-03-01 10:00:00'),
                                                                                                  (5,  7,  1, 1899.00, 'COMPLETED', NULL,                            '2025-03-15 16:00:00'),
                                                                                                  (6,  1,  3, 3897.00, 'COMPLETED', NULL,                            '2025-04-02 12:00:00'),
                                                                                                  (7,  11, 2, 3998.00, 'COMPLETED', 'Aurora boreal, sueño cumplido', '2025-04-20 08:00:00'),
                                                                                                  (8,  2,  2, 4998.00, 'CONFIRMED', NULL,                            '2025-05-05 10:00:00'),
                                                                                                  (9,  6,  1, 1599.00, 'CONFIRMED', 'Trabajo + turismo',             '2025-05-12 11:00:00'),
                                                                                                  (5,  12, 2, 2698.00, 'CONFIRMED', NULL,                            '2025-06-01 09:00:00'),
                                                                                                  (6,  8,  4, 4796.00, 'CONFIRMED', 'Grupo de amigos',               '2025-06-18 15:00:00'),
                                                                                                  (7,  1,  2, 2598.00, 'PENDING',   NULL,                            '2025-07-01 10:00:00'),
                                                                                                  (8,  5,  1, 3299.00, 'PENDING',   'Habitación con vista al mar',   '2025-07-10 13:00:00'),
                                                                                                  (9,  10, 2, 3598.00, 'PENDING',   NULL,                            '2025-07-15 09:00:00'),
                                                                                                  (5,  2,  1, 2499.00, 'CANCELLED', NULL,                            '2025-03-20 10:00:00'),
                                                                                                  (6,  7,  2, 3798.00, 'CANCELLED', 'Cambio de planes',              '2025-04-10 11:00:00');

-- Más reseñas
INSERT INTO reviews (user_id, trip_id, rating, comment, sentiment) VALUES
                                                                       (5,  6,  5, 'Nueva York es increíble, volveré sin duda. La organización fue perfecta y el hotel excepcional.', 'POSITIVE'),
                                                                       (6,  4,  4, 'La Toscana es preciosa. Los viñedos y la gastronomía son de otro nivel. Solo mejoraría el transporte.', 'POSITIVE'),
                                                                       (7,  5,  5, 'Las Maldivas superaron todas las expectativas. El bungalow sobre el agua fue mágico. 100% recomendable.', 'POSITIVE'),
                                                                       (8,  9,  4, 'Marruecos es un destino único. El desierto del Sahara fue la experiencia de mi vida.', 'POSITIVE'),
                                                                       (9,  3,  5, 'Japón es un país fascinante. La mezcla de tradición y modernidad es única. Volveré seguro.', 'POSITIVE'),
                                                                       (5,  7,  3, 'Los Alpes son espectaculares pero el viaje fue caro para lo que ofrecía. Aun así una experiencia bonita.', 'NEUTRAL'),
                                                                       (6,  1,  5, 'Bali es el paraíso en la tierra. Los templos, la comida, la gente... todo perfecto.', 'POSITIVE'),
                                                                       (7,  11, 5, 'Ver la aurora boreal fue el momento más impresionante de mi vida. Velaris lo organizó todo a la perfección.', 'POSITIVE');

-- Favoritos adicionales
INSERT INTO favorites (user_id, trip_id) VALUES
                                             (5, 1), (5, 5),  (5, 11),
                                             (6, 3), (6, 9),  (6, 12),
                                             (7, 2), (7, 5),  (7, 7),
                                             (8, 1), (8, 4),  (8, 10),
                                             (9, 3), (9, 6),  (9, 11);