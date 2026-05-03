package com.zarcommerce.logging;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.MDC;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.UUID;

public class CorrelationIdFilter extends OncePerRequestFilter {

	@Override
	protected void doFilterInternal(
			HttpServletRequest request,
			HttpServletResponse response,
			FilterChain filterChain
	) throws ServletException, IOException {
		String existing = request.getHeader(CorrelationIdConstants.HEADER);
		String correlationId = (existing != null && !existing.isBlank()) ? existing.trim()
				: UUID.randomUUID().toString();

		MDC.put(CorrelationIdConstants.MDC_KEY, correlationId);
		response.setHeader(CorrelationIdConstants.HEADER, correlationId);
		try {
			filterChain.doFilter(new CorrelationIdRequestWrapper(request, correlationId), response);
		} finally {
			MDC.remove(CorrelationIdConstants.MDC_KEY);
		}
	}
}
