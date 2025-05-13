package Delivery_driverService;

import org.springframework.boot.SpringApplication;

public class TestDeliveryDriverApplication {

	public static void main(String[] args) {
		SpringApplication.from(DeliveryDriverApplication::main).with(TestcontainersConfiguration.class).run(args);
	}

}
