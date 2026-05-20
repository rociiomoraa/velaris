package com.velaris.service;

import com.velaris.dto.trip.TripResponse;
import com.velaris.exception.ApiException;
import com.velaris.exception.ResourceNotFoundException;
import com.velaris.model.Favorite;
import com.velaris.model.Trip;
import com.velaris.model.User;
import com.velaris.repository.FavoriteRepository;
import com.velaris.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FavoriteService {

    private final FavoriteRepository favoriteRepository;
    private final UserRepository     userRepository;
    private final TripService        tripService;

    public List<TripResponse> getFavorites(String email) {
        User user = findUser(email);
        return favoriteRepository.findByUser(user).stream()
                .map(f -> tripService.toResponse(f.getTrip()))
                .collect(Collectors.toList());
    }

    @Transactional
    public void addFavorite(String email, Long tripId) {
        User user = findUser(email);
        Trip trip = tripService.getTrip(tripId);
        if (favoriteRepository.existsByUserAndTrip(user, trip)) {
            throw new ApiException("El viaje ya está en favoritos", HttpStatus.CONFLICT);
        }
        Favorite fav = Favorite.builder().user(user).trip(trip).build();
        favoriteRepository.save(fav);
    }

    @Transactional
    public void removeFavorite(String email, Long tripId) {
        User user = findUser(email);
        Trip trip = tripService.getTrip(tripId);
        Favorite fav = favoriteRepository.findByUserAndTrip(user, trip)
                .orElseThrow(() -> new ResourceNotFoundException("Favorito no encontrado"));
        favoriteRepository.delete(fav);
    }

    private User findUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));
    }
}