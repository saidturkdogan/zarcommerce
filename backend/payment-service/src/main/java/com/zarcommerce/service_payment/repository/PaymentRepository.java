package com.zarcommerce.service_payment.repository;

import com.zarcommerce.service_payment.entity.Payment;
import com.zarcommerce.service_payment.enums.PaymentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {

    Optional<Payment> findByToken(String token);

    Optional<Payment> findByConversationId(String conversationId);

    List<Payment> findByStatus(PaymentStatus status);

    List<Payment> findByBuyerEmailOrderByCreatedAtDesc(String buyerEmail);

    List<Payment> findAllByOrderByCreatedAtDesc();
}
