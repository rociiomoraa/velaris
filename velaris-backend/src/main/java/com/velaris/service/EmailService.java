package com.velaris.service;

import com.velaris.model.Booking;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

import jakarta.mail.internet.MimeMessage;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender  mailSender;
    private final TemplateEngine  templateEngine;

    public void sendBookingConfirmation(Booking booking) {
        try {
            Context ctx = new Context();
            ctx.setVariable("booking",   booking);
            ctx.setVariable("userName",  booking.getUser().getName());
            ctx.setVariable("tripTitle", booking.getTrip().getTitle());
            ctx.setVariable("destination", booking.getTrip().getDestination());
            ctx.setVariable("departure",   booking.getTrip().getDepartureDate());
            ctx.setVariable("numTravelers", booking.getNumTravelers());
            ctx.setVariable("totalPrice",  booking.getTotalPrice());
            ctx.setVariable("bookingId",   booking.getId());

            String html = templateEngine.process("booking-confirmation", ctx);
            send(booking.getUser().getEmail(), "✈️ Confirmación de reserva — Velaris", html);
        } catch (Exception e) {
            log.warn("No se pudo enviar el email de confirmación de reserva: {}", e.getMessage());
        }
    }

    public void sendWelcome(String email, String name) {
        try {
            Context ctx = new Context();
            ctx.setVariable("name", name);

            String html = templateEngine.process("welcome", ctx);
            send(email, "🌺 ¡Bienvenido/a a Velaris!", html);
        } catch (Exception e) {
            log.warn("No se pudo enviar el email de bienvenida: {}", e.getMessage());
        }
    }

    public void sendBookingCancellation(Booking booking) {
        try {
            Context ctx = new Context();
            ctx.setVariable("userName",  booking.getUser().getName());
            ctx.setVariable("tripTitle", booking.getTrip().getTitle());
            ctx.setVariable("bookingId", booking.getId());

            String html = templateEngine.process("booking-cancellation", ctx);
            send(booking.getUser().getEmail(), "Cancelación de reserva — Velaris", html);
        } catch (Exception e) {
            log.warn("No se pudo enviar el email de cancelación: {}", e.getMessage());
        }
    }

    private void send(String to, String subject, String html) throws Exception {
        MimeMessage msg = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(msg, true, "UTF-8");
        helper.setFrom("velaris@gmail.com");
        helper.setTo(to);
        helper.setSubject(subject);
        helper.setText(html, true);
        mailSender.send(msg);
    }
}