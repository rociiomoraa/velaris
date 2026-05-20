-- ============================================================
-- Velaris — V1: Esquema inicial de base de datos
-- ============================================================

-- Extensión para UUID (opcional, usamos BIGSERIAL)
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- ============================================================
-- TABLA: users
-- ============================================================
CREATE TABLE users (
                       id           BIGSERIAL PRIMARY KEY,
                       name         VARCHAR(100)        NOT NULL,
                       email        VARCHAR(150)        NOT NULL UNIQUE,
                       password     VARCHAR(255)        NOT NULL,
                       phone        VARCHAR(20),
                       avatar_url   VARCHAR(500),
                       role         VARCHAR(20)         NOT NULL DEFAULT 'USER'
                           CHECK (role IN ('USER', 'ADMIN')),
                       enabled      BOOLEAN             NOT NULL DEFAULT TRUE,
                       created_at   TIMESTAMP           NOT NULL DEFAULT NOW(),
                       updated_at   TIMESTAMP           NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users (email);
CREATE INDEX idx_users_role  ON users (role);

-- ============================================================
-- TABLA: trips
-- ============================================================
CREATE TABLE trips (
                       id               BIGSERIAL PRIMARY KEY,
                       title            VARCHAR(200)        NOT NULL,
                       description      TEXT,
                       destination      VARCHAR(150)        NOT NULL,
                       origin           VARCHAR(150)        NOT NULL DEFAULT 'Madrid',
                       price            NUMERIC(10, 2)      NOT NULL CHECK (price >= 0),
                       departure_date   DATE                NOT NULL,
                       return_date      DATE                NOT NULL,
                       duration_days    INT                 NOT NULL CHECK (duration_days > 0),
                       available_seats  INT                 NOT NULL DEFAULT 0 CHECK (available_seats >= 0),
                       image_url        TEXT,
                       category         VARCHAR(50)         NOT NULL DEFAULT 'otros',
                       active           BOOLEAN             NOT NULL DEFAULT TRUE,
                       created_at       TIMESTAMP           NOT NULL DEFAULT NOW(),
                       updated_at       TIMESTAMP           NOT NULL DEFAULT NOW(),
                       CONSTRAINT chk_dates CHECK (return_date >= departure_date)
);

CREATE INDEX idx_trips_destination  ON trips (destination);
CREATE INDEX idx_trips_category     ON trips (category);
CREATE INDEX idx_trips_active       ON trips (active);
CREATE INDEX idx_trips_price        ON trips (price);
CREATE INDEX idx_trips_departure    ON trips (departure_date);

-- Búsqueda de texto parcial en destino
CREATE INDEX idx_trips_destination_trgm ON trips USING gin (destination gin_trgm_ops);

-- ============================================================
-- TABLA: bookings
-- ============================================================
CREATE TABLE bookings (
                          id             BIGSERIAL PRIMARY KEY,
                          user_id        BIGINT              NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                          trip_id        BIGINT              NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
                          num_travelers  INT                 NOT NULL DEFAULT 1 CHECK (num_travelers > 0),
                          total_price    NUMERIC(10, 2)      NOT NULL CHECK (total_price >= 0),
                          status         VARCHAR(20)         NOT NULL DEFAULT 'PENDING'
                              CHECK (status IN ('PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED')),
                          notes          TEXT,
                          booked_at      TIMESTAMP           NOT NULL DEFAULT NOW(),
                          updated_at     TIMESTAMP           NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_bookings_user_id   ON bookings (user_id);
CREATE INDEX idx_bookings_trip_id   ON bookings (trip_id);
CREATE INDEX idx_bookings_status    ON bookings (status);

-- ============================================================
-- TABLA: favorites
-- ============================================================
CREATE TABLE favorites (
                           id        BIGSERIAL PRIMARY KEY,
                           user_id   BIGINT    NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                           trip_id   BIGINT    NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
                           added_at  TIMESTAMP NOT NULL DEFAULT NOW(),
                           CONSTRAINT uq_favorites UNIQUE (user_id, trip_id)
);

CREATE INDEX idx_favorites_user_id ON favorites (user_id);

-- ============================================================
-- TABLA: reviews
-- ============================================================
CREATE TABLE reviews (
                         id         BIGSERIAL PRIMARY KEY,
                         user_id    BIGINT       NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                         trip_id    BIGINT       NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
                         rating     INT          NOT NULL CHECK (rating BETWEEN 1 AND 5),
                         comment    TEXT,
                         sentiment  VARCHAR(20)  DEFAULT 'NEUTRAL'
                             CHECK (sentiment IN ('POSITIVE', 'NEUTRAL', 'NEGATIVE')),
                         created_at TIMESTAMP    NOT NULL DEFAULT NOW(),
                         CONSTRAINT uq_reviews UNIQUE (user_id, trip_id)
);

CREATE INDEX idx_reviews_trip_id ON reviews (trip_id);
CREATE INDEX idx_reviews_user_id ON reviews (user_id);

-- ============================================================
-- TABLA: ai_conversations
-- ============================================================
CREATE TABLE ai_conversations (
                                  id         BIGSERIAL PRIMARY KEY,
                                  user_id    BIGINT      NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                                  role       VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant')),
                                  content    TEXT        NOT NULL,
                                  created_at TIMESTAMP   NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_ai_conversations_user_id    ON ai_conversations (user_id);
CREATE INDEX idx_ai_conversations_created_at ON ai_conversations (created_at);