package Delivery_Replication.Delivery_Replication;

import org.springframework.boot.SpringApplication;

public class TestDeliveryReplicationApplication {

	public static void main(String[] args) {
		SpringApplication.from(DeliveryReplicationApplication::main).with(TestcontainersConfiguration.class).run(args);
	}

}
