-- ================================================================
-- V4 — Datos de ejemplo: vuelos y escapadas
-- ================================================================

-- ============================================================
-- VUELOS (6)
-- ============================================================
INSERT INTO trips (title, description, destination, origin, price, departure_date, return_date,
                   duration_days, available_seats, image_url, category, type,
                   airline, flight_number, cabin_class, includes_hotel)
VALUES
    ('Madrid → Roma · Vuelo directo',
     'Vuelo directo de Iberia entre Madrid-Barajas y Roma Fiumicino. Ideal para escapadas de fin de semana o conexión con tu paquete vacacional en Italia.',
     'Roma, Italia', 'Madrid', 89.00, '2025-07-15', '2025-07-15', 1, 120,
     'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=800',
     'ciudad', 'vuelo', 'Iberia', 'IB3547', 'turista', false),

    ('Madrid → París · Tarifa flexible',
     'Vuelo Madrid-CDG con Air France. Tarifa flexible con cambio gratuito. Perfecto para viajes de empresa o escapadas de última hora a la Ciudad de la Luz.',
     'París, Francia', 'Madrid', 119.00, '2025-08-01', '2025-08-01', 1, 80,
     'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800',
     'ciudad', 'vuelo', 'Air France', 'AF1801', 'turista', false),

    ('Madrid → Tokio · Business Class',
     'Vuelo de larga distancia con Japan Airlines en clase Business. Asientos cama, gastronomía premium y entretenimiento a bordo en el viaje más cómodo de tu vida.',
     'Tokio, Japón', 'Madrid', 2850.00, '2025-09-10', '2025-09-10', 1, 20,
     'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800',
     'cultura', 'vuelo', 'Japan Airlines', 'JL045', 'business', false),

    ('Madrid → Cancún · Vuelo + Hotel',
     'Vuelo directo con Iberia a Cancún incluyendo 7 noches en el Hotel Barceló Maya Grand Resort 5★. Todo incluido. La combinación perfecta al mejor precio.',
     'Cancún, México', 'Madrid', 1199.00, '2025-12-20', '2025-12-27', 7, 40,
     'https://images.unsplash.com/photo-1510097467424-192d713fd8b2?w=800',
     'playa', 'vuelo', 'Iberia', 'IB6403', 'turista', true),

    ('Madrid → Bali · Conexión Dubai',
     'Vuelo Madrid-Bali con Emirates vía Dubai. Conexión cómoda de 4 horas en el aeropuerto más moderno del mundo. Clase turista premium con gran espacio.',
     'Bali, Indonesia', 'Madrid', 680.00, '2025-07-20', '2025-07-20', 1, 60,
     'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800',
     'playa', 'vuelo', 'Emirates', 'EK141', 'turista', false),

    ('Barcelona → Londres · Low Cost',
     'Vuelo económico de Vueling entre El Prat y Heathrow. Equipaje de mano incluido. La opción más inteligente para visitar la capital británica sin arruinarte.',
     'Londres, Reino Unido', 'Barcelona', 55.00, '2025-10-05', '2025-10-05', 1, 180,
     'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800',
     'ciudad', 'vuelo', 'Vueling', 'VY7822', 'turista', false);

-- ============================================================
-- ESCAPADAS (6)
-- ============================================================
INSERT INTO trips (title, description, destination, origin, price, departure_date, return_date,
                   duration_days, available_seats, image_url, category, type,
                   hotel_name, hotel_stars, meal_plan, highlight)
VALUES
    ('Escapada romántica a Sevilla',
     'Dos noches en el corazón de Sevilla con desayuno incluido. Visita la Giralda, el Alcázar y el barrio de Santa Cruz. La ciudad más apasionada de España te espera.',
     'Sevilla, España', 'Madrid', 189.00, '2025-07-25', '2025-07-27', 2, 12,
     'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800',
     'ciudad', 'escapada', 'Hotel Alfonso XIII', 5, 'desayuno', 'Vista a la Giralda incluida'),

    ('Fin de semana en la Costa Brava',
     'Tres noches en Cadaqués, el pueblo más bonito de la Costa Brava. Hotel boutique frente al mar, piscina infinita y gastronomía mediterránea de primer nivel.',
     'Cadaqués, España', 'Barcelona', 320.00, '2025-08-08', '2025-08-11', 3, 8,
     'https://images.unsplash.com/photo-1571406255743-07e3f43e1434?w=800',
     'playa', 'escapada', 'Hotel Playa Sol', 4, 'media_pension', 'Piscina infinita con vistas al mar'),

    ('Lisboa en 3 días',
     'Escapada perfecta a la capital portuguesa. Hotel en el barrio de Alfama, tranvía histórico, pasteles de Belém y el mejor fado que hayas escuchado.',
     'Lisboa, Portugal', 'Madrid', 245.00, '2025-09-19', '2025-09-22', 3, 16,
     'https://images.unsplash.com/photo-1555881400-74d7acaacd8b?w=800',
     'ciudad', 'escapada', 'Bairro Alto Hotel', 5, 'desayuno', 'Incluye tour en tranvía histórico'),

    ('Spa & Relax en los Pirineos',
     'Dos noches en un hotel balneario en el corazón de los Pirineos aragoneses. Acceso ilimitado al spa termal, circuito de aguas y masaje incluido. Desconexión total.',
     'Benasque, España', 'Zaragoza', 280.00, '2025-10-17', '2025-10-19', 2, 10,
     'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800',
     'aventura', 'escapada', 'Hotel Aneto Balneario', 4, 'media_pension', 'Masaje de 60 min incluido'),

    ('Granada y la Alhambra',
     'Dos noches en Granada con visita guiada a la Alhambra y el Generalife. Hotel en el barrio del Albaicín con vistas al monumento más visitado de España.',
     'Granada, España', 'Sevilla', 175.00, '2025-11-14', '2025-11-16', 2, 14,
     'https://images.unsplash.com/photo-1543783207-ec64e4d95325?w=800',
     'cultura', 'escapada', 'Parador de Granada', 4, 'desayuno', 'Entrada a la Alhambra incluida'),

    ('Noche en el Parador de Sigüenza',
     'Una noche mágica en un castillo medieval del siglo XII convertido en Parador Nacional. Cena de gala, bodega propia y un amanecer sobre la Castilla eterna.',
     'Sigüenza, España', 'Madrid', 195.00, '2025-12-06', '2025-12-07', 1, 6,
     'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800',
     'cultura', 'escapada', 'Parador de Sigüenza', 4, 'todo_incluido', 'Cena de gala en castillo medieval');