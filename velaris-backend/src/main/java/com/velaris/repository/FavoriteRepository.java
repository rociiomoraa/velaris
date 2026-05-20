package com.velaris.repository;

import com.velaris.model.Favorite;
import com.velaris.model.Trip;
import com.velaris.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface FavoriteRepository extends JpaRepository<Favorite, Long> {

    List<Favorite> findByUser(User user);

    Optional<Favorite> findByUserAndTrip(User user, Trip trip);

    boolean existsByUserAndTrip(User user, Trip trip);
}