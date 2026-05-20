package com.velaris.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.velaris.dto.ai.AiChatRequest;
import com.velaris.dto.ai.AiChatResponse;
import com.velaris.dto.ai.MessageHistory;
import com.velaris.dto.ai.RecommendationResponse;
import com.velaris.dto.trip.TripResponse;
import com.velaris.exception.ResourceNotFoundException;
import com.velaris.model.AiConversation;
import com.velaris.model.User;
import com.velaris.repository.AiConversationRepository;
import com.velaris.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class AiAssistantService {

    private final RestTemplate             restTemplate;
    private final CacheService             cacheService;
    private final AiConversationRepository conversationRepository;
    private final UserRepository           userRepository;
    private final ObjectMapper             objectMapper = new ObjectMapper();

    @Value("${ai.anthropic.api-key:}")
    private String apiKey;

    @Value("${ai.anthropic.max-tokens:1024}")
    private int maxTokens;

    private static final String API_URL = "https://api.groq.com/openai/v1/chat/completions";
    private static final String MODEL   = "llama-3.3-70b-versatile";

    private static final int MAX_CONTENT_CHARS = 200;
    private static final int MAX_HISTORY_MSGS  = 6;

    private static final List<String> EASTER_EGG_KEYWORDS = List.of(
            "eres una ia", "eres real", "eres humana", "quien eres", "quién eres"
    );

    private static final String MSG_NO_API =
            "El asistente de Vera no está disponible en este momento. " +
                    "Puedes explorar nuestros destinos, vuelos y escapadas desde el menú. ¡Volvemos enseguida!";

    private static final String MSG_ERROR_CONEXION =
            "Hay un problema de conexión con Vera en este momento. Por favor, inténtalo de nuevo en unos segundos.";

    // ────────────────────────────────────────────────────────────────

    public AiChatResponse chat(AiChatRequest req) {
        if (apiKey == null || apiKey.isBlank()) return new AiChatResponse(MSG_NO_API);
        String msgLower = req.getMessage().toLowerCase();
        if (isEasterEgg(msgLower)) return new AiChatResponse(getEasterEggResponse());

        List<Map<String, String>> messages = buildMessages(req.getHistory(), req.getMessage());
        return new AiChatResponse(callGroq(buildSystemPrompt(), messages));
    }

    @Transactional
    public AiChatResponse chatWithHistory(AiChatRequest req, String email) {
        if (apiKey == null || apiKey.isBlank()) return new AiChatResponse(MSG_NO_API);

        User user = findUser(email);
        String msgLower = req.getMessage().toLowerCase();

        if (isEasterEgg(msgLower)) {
            String reply = getEasterEggResponse();
            saveMessage(user, "user",      req.getMessage());
            saveMessage(user, "assistant", reply);
            return new AiChatResponse(reply);
        }

        List<AiConversation> history = conversationRepository
                .findByUserOrderByCreatedAtDesc(user, PageRequest.of(0, MAX_HISTORY_MSGS));
        Collections.reverse(history);

        List<Map<String, String>> messages = new ArrayList<>();
        for (AiConversation c : history) {
            messages.add(Map.of("role", c.getRole(), "content", truncate(c.getContent(), MAX_CONTENT_CHARS)));
        }
        messages.add(Map.of("role", "user", "content", req.getMessage()));

        String response = callGroq(buildSystemPrompt(), messages);
        saveMessage(user, "user",      req.getMessage());
        saveMessage(user, "assistant", response);
        return new AiChatResponse(response);
    }

    public RecommendationResponse getRecommendations(String email) {
        if (apiKey == null || apiKey.isBlank()) {
            List<TripResponse> sample = cacheService.getCachedActiveTrips()
                    .stream().limit(3).collect(Collectors.toList());
            return new RecommendationResponse(
                    "Vera no está disponible ahora mismo, pero aquí tienes algunos de nuestros productos más populares.",
                    sample);
        }

        User user = findUser(email);
        List<AiConversation> history = conversationRepository
                .findByUserOrderByCreatedAtDesc(user, PageRequest.of(0, 4));

        String historyContext = history.isEmpty() ? "Sin historial previo." :
                history.stream()
                        .map(c -> c.getRole() + ": " + truncate(c.getContent(), 100))
                        .collect(Collectors.joining("\n"));

        List<TripResponse> trips = cacheService.getCachedActiveTrips();
        String tripsContext = buildTripsContext(trips);

        String prompt = String.format(
                "Historial usuario:\n%s\n\nProductos Velaris:\n%s\n\n" +
                        "Basándote en el historial, recomienda 2-3 productos. " +
                        "En tu respuesta interna usa ref:X para identificarlos (donde X es el número de línea del catálogo, empezando en 1). " +
                        "Responde en español, de forma breve y sin mostrar etiquetas técnicas al usuario.",
                historyContext, tripsContext);

        String aiMessage = callGroq(buildSystemPrompt(), List.of(Map.of("role", "user", "content", prompt)));

        List<TripResponse> recommended = trips.stream()
                .filter(t -> aiMessage.toLowerCase().contains(t.getTitle().toLowerCase().substring(0, Math.min(10, t.getTitle().length()))))
                .limit(3)
                .collect(Collectors.toList());
        if (recommended.isEmpty()) recommended = trips.stream().limit(3).collect(Collectors.toList());

        return new RecommendationResponse(aiMessage, recommended);
    }

    @Transactional
    public void clearHistory(String email) {
        conversationRepository.deleteByUser(findUser(email));
    }

    public String analyzeSentiment(String comment) {
        if (comment == null || comment.isBlank() || apiKey == null || apiKey.isBlank()) return "NEUTRAL";
        try {
            String prompt = "Sentimiento del comentario (responde solo POSITIVE, NEUTRAL o NEGATIVE):\n"
                    + truncate(comment, 300);
            String result = callGroq(
                    "Eres un analizador de sentimientos. Responde solo con POSITIVE, NEUTRAL o NEGATIVE.",
                    List.of(Map.of("role", "user", "content", prompt))
            ).trim().toUpperCase();
            if (result.contains("POSITIVE")) return "POSITIVE";
            if (result.contains("NEGATIVE")) return "NEGATIVE";
            return "NEUTRAL";
        } catch (Exception e) {
            log.warn("No se pudo analizar el sentimiento: {}", e.getMessage());
            return "NEUTRAL";
        }
    }

    // ── System prompt ────────────────────────────────────────────────

    private String buildSystemPrompt() {
        List<TripResponse> all = cacheService.getCachedActiveTrips();

        String catalogo = all.stream()
                .map(t -> String.format("- %s (%s) | Desde %s | Destino: %s | Precio: €%.0f | %d días | %d plazas disponibles",
                        t.getTitle(),
                        t.getType() != null ? t.getType() : "viaje",
                        t.getOrigin()        != null ? t.getOrigin()        : "España",
                        t.getDestination(),
                        t.getPrice(),
                        t.getDurationDays()   != null ? t.getDurationDays()   : 0,
                        t.getAvailableSeats() != null ? t.getAvailableSeats() : 0))
                .collect(Collectors.joining("\n"));

        return "Eres Vera, asistente de viajes de Velaris. Respondes siempre en español.\n\n"

                + "FORMATO DE RESPUESTA (obligatorio):\n"
                + "- Respuestas cortas: 2-4 frases directas, sin títulos ni markdown.\n"
                + "- Cuando recomiendes varios productos: SIEMPRE pon cada uno en su propia línea, comenzando con un guion (-). Nunca los pongas seguidos en el mismo párrafo.\n"  // ← MODIFICADO
                + "- Cada producto recomendado en su propia línea con: nombre, precio, duración y plazas disponibles.\n"  // ← NUEVO
                + "- Cuando des un itinerario: usa el formato 'Día 1:', 'Día 2:', etc., cada día en una línea nueva.\n"
                + "- Nunca uses emojis. Nunca uses markdown (sin **, sin ##, sin ---).\n"
                + "- Nunca incluyas etiquetas técnicas como [ID:X], [VIAJE ID:X] o similares en tu respuesta.\n"
                + "- Tono cercano y profesional, como un agente de viajes experto.\n\n"

                + "CATÁLOGO VELARIS (solo para tu referencia interna, no lo copies en tu respuesta):\n" + catalogo + "\n\n"

                + "REGLAS DE NEGOCIO:\n"
                + "- Menciona los productos por su nombre completo tal como aparecen en el catálogo.\n"
                + "- VERIFICA SIEMPRE el precio exacto del catálogo antes de recomendar. Si el usuario indica un presupuesto máximo, solo recomienda productos cuyo precio sea estrictamente menor o igual a ese presupuesto. Nunca recomiendes un producto que supere el presupuesto indicado.\n"  // ← NUEVO
                + "- No inventes productos que no estén en el catálogo.\n"
                + "- Si un producto tiene 0 plazas disponibles, indícalo claramente.\n"
                + "- Si el usuario pregunta por algo que no tenemos, sugiérele lo más parecido del catálogo que sí esté dentro del presupuesto.";  // ← MODIFICADO
    }

    private String buildTripsContext(List<TripResponse> trips) {
        return trips.stream()
                .map(t -> String.format("- %s (%s) | Desde %s | Destino: %s | €%.0f | %d plazas",
                        t.getTitle(),
                        t.getType() != null ? t.getType() : "viaje",
                        t.getOrigin() != null ? t.getOrigin() : "España",
                        t.getDestination(),
                        t.getPrice(),
                        t.getAvailableSeats() != null ? t.getAvailableSeats() : 0))
                .collect(Collectors.joining("\n"));
    }

    // ── Helpers ──────────────────────────────────────────────────────

    private String truncate(String text, int maxChars) {
        if (text == null) return "";
        return text.length() <= maxChars ? text : text.substring(0, maxChars) + "…";
    }

    private String callGroq(String systemPrompt, List<Map<String, String>> messages) {
        try {
            ObjectNode body = objectMapper.createObjectNode();
            body.put("model",      MODEL);
            body.put("max_tokens", maxTokens);

            ArrayNode msgs = objectMapper.createArrayNode();

            ObjectNode sysMsg = objectMapper.createObjectNode();
            sysMsg.put("role",    "system");
            sysMsg.put("content", systemPrompt);
            msgs.add(sysMsg);

            for (Map<String, String> m : messages) {
                ObjectNode msg = objectMapper.createObjectNode();
                msg.put("role",    m.get("role"));
                msg.put("content", m.get("content"));
                msgs.add(msg);
            }
            body.set("messages", msgs);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(apiKey);

            HttpEntity<String> entity = new HttpEntity<>(objectMapper.writeValueAsString(body), headers);
            ResponseEntity<String> resp = restTemplate.postForEntity(API_URL, entity, String.class);

            if (resp.getStatusCode().is2xxSuccessful() && resp.getBody() != null) {
                JsonNode root = objectMapper.readTree(resp.getBody());
                return root.path("choices").get(0).path("message").path("content").asText();
            }
            return "Lo siento, no pude procesar tu mensaje en este momento. Por favor, inténtalo de nuevo.";
        } catch (Exception e) {
            log.error("Error al llamar a Groq: {}", e.getMessage());
            return MSG_ERROR_CONEXION;
        }
    }

    private List<Map<String, String>> buildMessages(List<MessageHistory> history, String message) {
        List<Map<String, String>> messages = new ArrayList<>();
        if (history != null) {
            List<MessageHistory> limited = history.size() > MAX_HISTORY_MSGS
                    ? history.subList(history.size() - MAX_HISTORY_MSGS, history.size())
                    : history;
            for (MessageHistory h : limited) {
                messages.add(Map.of("role", h.getRole(), "content", truncate(h.getContent(), MAX_CONTENT_CHARS)));
            }
        }
        messages.add(Map.of("role", "user", "content", message));
        return messages;
    }

    private void saveMessage(User user, String role, String content) {
        AiConversation conv = AiConversation.builder()
                .user(user).role(role).content(content).build();
        conversationRepository.save(conv);
    }

    private boolean isEasterEgg(String msg) {
        return EASTER_EGG_KEYWORDS.stream().anyMatch(msg::contains);
    }

    private String getEasterEggResponse() {
        return "Técnicamente soy una IA integrada en Velaris, pero prefiero pensar que soy tu consejera de viajes personal. " +
                "No se lo cuentes a nadie. Ahora dime, ¿te busco un vuelo, una escapada o el viaje de tu vida?";
    }

    private User findUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));
    }
}