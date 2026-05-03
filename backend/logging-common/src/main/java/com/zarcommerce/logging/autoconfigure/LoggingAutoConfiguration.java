package com.zarcommerce.logging.autoconfigure;

import com.zarcommerce.logging.CorrelationIdFilter;
import com.zarcommerce.logging.HttpRequestLoggingFilter;
import org.springframework.boot.autoconfigure.AutoConfiguration;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.boot.autoconfigure.condition.ConditionalOnWebApplication;
import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.core.Ordered;

import jakarta.servlet.DispatcherType;
import java.util.EnumSet;

@AutoConfiguration
@ConditionalOnWebApplication(type = ConditionalOnWebApplication.Type.SERVLET)
public class LoggingAutoConfiguration {

	@Bean
	public FilterRegistrationBean<CorrelationIdFilter> correlationIdFilterRegistration() {
		FilterRegistrationBean<CorrelationIdFilter> reg = new FilterRegistrationBean<>(new CorrelationIdFilter());
		reg.setOrder(Ordered.HIGHEST_PRECEDENCE);
		reg.addUrlPatterns("/*");
		reg.setDispatcherTypes(EnumSet.allOf(DispatcherType.class));
		return reg;
	}

	@Bean
	@ConditionalOnProperty(prefix = "zarcommerce.logging", name = "http-requests", havingValue = "true")
	public FilterRegistrationBean<HttpRequestLoggingFilter> httpRequestLoggingFilterRegistration() {
		FilterRegistrationBean<HttpRequestLoggingFilter> reg =
				new FilterRegistrationBean<>(new HttpRequestLoggingFilter());
		reg.setOrder(Ordered.HIGHEST_PRECEDENCE + 100);
		reg.addUrlPatterns("/*");
		reg.setDispatcherTypes(EnumSet.allOf(DispatcherType.class));
		return reg;
	}
}
