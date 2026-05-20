-- ============================================================
-- Velaris — V2: Datos de ejemplo
-- Contraseñas BCrypt:
--   Admin1234! → $2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy
--   User1234!  → $2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.
-- ============================================================

-- ============================================================
-- USUARIOS
-- ============================================================
INSERT INTO users (name, email, password, phone, role, enabled) VALUES
                                                                    ('Admin Velaris',  'admin@velaris.es',    '$2a$10$JF3SrpHLD2tRJVu8FqQE8OqTa2vip3Zewe50hHR25H6uYTeQL7tCm', '+34 600 000 001', 'ADMIN', TRUE),
                                                                    ('Usuario Demo',   'user@velaris.es',     '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.', '+34 600 000 002', 'USER',  TRUE),
                                                                    ('Carlos Martínez','carlos@example.es',   '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.', '+34 611 222 333', 'USER',  TRUE),
                                                                    ('Ana González',   'ana@example.es',      '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.', '+34 622 333 444', 'USER',  TRUE)
    ON CONFLICT (email) DO NOTHING;

-- ============================================================
-- VIAJES (12)
-- imageUrl: 2-3 URLs de Unsplash separadas por coma
-- ============================================================
INSERT INTO trips (title, description, destination, origin, price, departure_date, return_date, duration_days, available_seats, image_url, category) VALUES

-- 1. Bali
('Paraíso en Bali',
 'Descubre los templos sagrados, las terrazas de arroz de Ubud y las playas paradisíacas de Seminyak. Una experiencia espiritual y sensorial única en la Isla de los Dioses.',
 'Bali, Indonesia', 'Madrid', 1299.00, '2025-07-10', '2025-07-24', 14, 18,
 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800,https://images.unsplash.com/photo-1555400038-63f5ba517a47?w=800,https://images.unsplash.com/photo-1573790387438-4da905039392?w=800',
 'playa'),

-- 2. Kenia
('Safari en Kenia',
 'Vive la experiencia del Gran Safari en el Parque Nacional de Masái Mara. Contempla la gran migración, los Big Five y la majestuosa naturaleza africana.',
 'Nairobi, Kenia', 'Madrid', 2499.00, '2025-08-05', '2025-08-17', 12, 8,
 'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=800,https://images.unsplash.com/photo-1516426122078-c23e76319801?w=800',
 'aventura'),

-- 3. Japón
('Japón: Tradición y Modernidad',
 'Un viaje de Tokio a Kioto pasando por Osaka. Templos milenarios, tecnología de vanguardia, gastronomía excepcional y la magia de los cerezos en flor.',
 'Tokio, Japón', 'Madrid', 2199.00, '2025-04-01', '2025-04-14', 13, 12,
 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800,https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=800,https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=800',
 'cultura'),

-- 4. Toscana
('La Toscana en Profundidad',
 'Florencia, Siena y los viñedos del Chianti. Arte renacentista, gastronomía italiana y el romanticismo de la campiña toscana en toda su esplendor.',
 'Florencia, Italia', 'Madrid', 899.00, '2025-09-15', '2025-09-22', 7, 20,
 'https://images.unsplash.com/photo-1533165104798-46e7c6474040?w=800,https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=800',
 'cultura'),

-- 5. Maldivas
('Maldivas: Agua Cristalina',
 'Bungalows sobre el agua en el Océano Índico. Arrecifes de coral vírgenes, atardeceres de ensueño y el lujo de la total desconexión en el paraíso.',
 'Malé, Maldivas', 'Madrid', 3299.00, '2025-06-20', '2025-06-30', 10, 4,
 'https://images.unsplash.com/photo-1544550581-5f7ceaf7f992?w=800,https://images.unsplash.com/photo-1559128010-7c1ad6e1b6a5?w=800,https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=800',
 'playa'),

-- 6. Nueva York
('Nueva York Imprescindible',
 'La Gran Manzana en toda su intensidad. Broadway, Central Park, los museos de clase mundial, la gastronomía multicultural y el skyline más icónico del mundo.',
 'Nueva York, EE.UU.', 'Madrid', 1599.00, '2025-10-10', '2025-10-19', 9, 15,
 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800,https://images.unsplash.com/photo-1522083165195-3424ed129620?w=800',
 'ciudad'),

-- 7. Suiza
('Los Alpes Suizos',
 'Interlaken, Zermatt y el Matterhorn. Senderismo de alta montaña, trenes panorámicos espectaculares y la tranquilidad de los valles alpinos.',
 'Zúrich, Suiza', 'Madrid', 1899.00, '2025-07-28', '2025-08-06', 9, 10,
 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800,https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=800',
 'aventura'),

-- 8. Mediterráneo
('Crucero por el Mediterráneo',
 'Barcelona, Marsella, Roma, Atenas y Mykonos en un crucero de lujo. El mejor modo de descubrir la costa mediterránea con comodidad y estilo.',
 'Barcelona, España', 'Madrid', 1199.00, '2025-08-20', '2025-08-29', 9, 30,
 'https://images.unsplash.com/photo-1548574505-5e239809ee19?w=800,https://images.unsplash.com/photo-1533105079780-92b9be482077?w=800,https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=800',
 'playa'),

-- 9. Marruecos
('Maravillas de Marruecos',
 'Marrakech, Fez, el desierto del Sáhara y Chefchaouen. Zócalos bulliciosos, riads históricos, dunas doradas y la hospitalidad del pueblo bereber.',
 'Marrakech, Marruecos', 'Madrid', 749.00, '2025-11-05', '2025-11-12', 7, 16,
 'https://images.unsplash.com/photo-1489493585363-d69421e0edd3?w=800,https://images.unsplash.com/photo-1548019979-4d5c11d40a5e?w=800',
 'cultura'),

-- 10. Costa Rica
('Costa Rica: Pura Vida',
 'Selvas tropicales, volcanes activos, playas del Pacífico y el Caribe. Avistamiento de quetzales, canopy, surf y toda la biodiversidad de Centroamérica.',
 'San José, Costa Rica', 'Madrid', 1799.00, '2025-12-26', '2026-01-07', 12, 14,
 'https://images.unsplash.com/photo-1518259102261-b40117eabbc9?w=800,https://images.unsplash.com/photo-1566888596782-c7f41cc184c5?w=800,https://images.unsplash.com/photo-1501854140801-50d01698950b?w=800',
 'aventura'),

-- 11. Islandia
('Islandia: Fuego y Hielo',
 'La aurora boreal, el Círculo Dorado, las cascadas de Skógafoss y Seljalandsfoss, y los imponentes glaciares. Un paisaje de otro mundo en el extremo norte.',
 'Reikiavik, Islandia', 'Madrid', 1999.00, '2025-11-20', '2025-11-29', 9, 10,
 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=800,https://images.unsplash.com/photo-1539635278303-d4002c07eae3?w=800',
 'aventura'),

-- 12. Cancún
('Cancún y Riviera Maya',
 'Las playas de arena blanca del Caribe mexicano, las ruinas mayas de Chichén Itzá y Tulum, la Laguna Bacalar y la vibrante vida nocturna de Cancún.',
 'Cancún, México', 'Madrid', 1349.00, '2026-01-10', '2026-01-22', 12, 22,
 'https://images.unsplash.com/photo-1510097467424-192d713fd8b2?w=800,https://images.unsplash.com/photo-1552074284-5e88ef1aef18?w=800,https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800',
 'playa');

-- ============================================================
-- RESERVAS (5)
-- ============================================================
INSERT INTO bookings (user_id, trip_id, num_travelers, total_price, status, notes) VALUES
                                                                                       (2, 1,  2, 2598.00, 'CONFIRMED',  'Habitación con vista al mar si es posible'),
                                                                                       (2, 6,  1,  1599.00, 'COMPLETED',  NULL),
                                                                                       (3, 3,  2, 4398.00, 'PENDING',    'Celebramos nuestro aniversario'),
                                                                                       (3, 10, 3, 5397.00, 'CANCELLED',  NULL),
                                                                                       (4, 8,  2, 2398.00, 'CONFIRMED',  'Veganos, por favor indicar opciones de menú');

-- ============================================================
-- FAVORITOS (7)
-- ============================================================
INSERT INTO favorites (user_id, trip_id) VALUES
                                             (2, 3),
                                             (2, 5),
                                             (2, 10),
                                             (3, 1),
                                             (3, 6),
                                             (4, 5),
                                             (4, 12);

-- ============================================================
-- RESEÑAS (3)
-- ============================================================
INSERT INTO reviews (user_id, trip_id, rating, comment, sentiment) VALUES
                                                                       (2, 6, 5,
                                                                        'Nueva York superó todas mis expectativas. El hotel era excelente y la organización perfecta. ¡Repetiría sin dudarlo!',
                                                                        'POSITIVE'),
                                                                       (3, 3, 4,
                                                                        'Japón fue mágico. La ruta estaba muy bien planificada. Solo le quito una estrella porque el vuelo de regreso tuvo retraso, pero eso no es culpa de Velaris.',
                                                                        'POSITIVE'),
                                                                       (4, 8, 3,
                                                                        'El crucero estuvo bien pero las escalas eran muy cortas para ver todo. La experiencia a bordo fue buena.',
                                                                        'NEUTRAL');