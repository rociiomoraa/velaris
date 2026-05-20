package com.velaris.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Slf4j
@Service
@RequiredArgsConstructor
public class GeocodingService {

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper = new ObjectMapper();

    private static final String NOMINATIM_URL =
            "https://nominatim.openstreetmap.org/search?q={query}&format=json&limit=1";

    public double[] getCoordinates(String destination) {
        if (destination == null || destination.isBlank()) return null;
        try {
            // Limpiar el destino — quitar "ciudad, país" → solo "ciudad"
            String query = destination.split(",")[0].trim();

            HttpHeaders headers = new HttpHeaders();
            // Nominatim requiere un User-Agent
            headers.set("User-Agent", "Velaris-TFG/1.0");
            HttpEntity<Void> entity = new HttpEntity<>(headers);

            ResponseEntity<String> resp = restTemplate.exchange(
                    NOMINATIM_URL, HttpMethod.GET, entity, String.class, query
            );

            if (resp.getStatusCode().is2xxSuccessful() && resp.getBody() != null) {
                JsonNode root = objectMapper.readTree(resp.getBody());
                if (root.isArray() && root.size() > 0) {
                    JsonNode first = root.get(0);
                    double lat = first.path("lat").asDouble();
                    double lon = first.path("lon").asDouble();
                    log.info("Coordenadas para '{}': {}, {}", destination, lat, lon);
                    return new double[]{lat, lon};
                }
            }
        } catch (Exception e) {
            log.warn("No se pudieron obtener coordenadas para '{}': {}", destination, e.getMessage());
        }
        return null;
    }
}