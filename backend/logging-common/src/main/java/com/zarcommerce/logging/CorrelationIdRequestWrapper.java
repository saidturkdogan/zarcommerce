package com.zarcommerce.logging;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletRequestWrapper;

import java.util.ArrayList;
import java.util.Collections;
import java.util.Enumeration;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;

/**
 * Ensures {@link CorrelationIdConstants#HEADER} is visible to downstream code (e.g. API Gateway proxy)
 * even when the filter generates a new id.
 */
public class CorrelationIdRequestWrapper extends HttpServletRequestWrapper {

	private final String correlationId;

	public CorrelationIdRequestWrapper(HttpServletRequest request, String correlationId) {
		super(request);
		this.correlationId = correlationId;
	}

	@Override
	public String getHeader(String name) {
		if (CorrelationIdConstants.HEADER.equalsIgnoreCase(name)) {
			return correlationId;
		}
		return super.getHeader(name);
	}

	@Override
	public Enumeration<String> getHeaders(String name) {
		if (CorrelationIdConstants.HEADER.equalsIgnoreCase(name)) {
			return Collections.enumeration(List.of(correlationId));
		}
		return super.getHeaders(name);
	}

	@Override
	public Enumeration<String> getHeaderNames() {
		Set<String> names = new LinkedHashSet<>();
		Enumeration<String> original = super.getHeaderNames();
		while (original.hasMoreElements()) {
			names.add(original.nextElement());
		}
		names.add(CorrelationIdConstants.HEADER);
		return Collections.enumeration(new ArrayList<>(names));
	}
}
