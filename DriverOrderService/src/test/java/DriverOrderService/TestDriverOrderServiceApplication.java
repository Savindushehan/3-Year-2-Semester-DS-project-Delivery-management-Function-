package DriverOrderService;

import org.springframework.boot.SpringApplication;

public class TestDriverOrderServiceApplication {

	public static void main(String[] args) {
		SpringApplication.from(DriverOrderServiceApplication::main).with(TestcontainersConfiguration.class).run(args);
	}

}
