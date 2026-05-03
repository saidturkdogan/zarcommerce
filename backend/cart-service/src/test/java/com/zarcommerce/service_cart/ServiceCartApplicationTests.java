package com.zarcommerce.service_cart;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.ApplicationContext;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
class ServiceCartApplicationTests {

	@Autowired
	private ApplicationContext applicationContext;

	@Test
	void contextLoads() {
		assertThat(applicationContext).isNotNull();
	}

	@Test
	void applicationStartsWithExpectedName() {
		String name = applicationContext.getEnvironment().getProperty("spring.application.name");
		assertThat(name).isEqualTo("service-cart");
	}
}
