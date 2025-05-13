package com.foodDelivery.apiGateway;

import org.springframework.boot.Banner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.core.env.Environment;

import java.io.PrintStream;

@SpringBootApplication
public class ApiGatewayApplication {

	public static void main(String[] args) {
		SpringApplication app = new SpringApplication(ApiGatewayApplication.class);
		app.setBanner(new Banner() {
			@Override
			public void printBanner(Environment environment, Class<?> sourceClass, PrintStream out) {
				out.println("===============================================");
				out.println("  _____              _   ____       _ _                   ");
				out.println(" |  ___|___   ___  _| | |  _ \\  ___| (_)_   _____ _ __ _   _ ");
				out.println(" | |_ / _ \\ / _ \\| | | | | | |/ _ \\ | \\ \\ / / _ \\ '__| | | |");
				out.println(" |  _| (_) | (_) | | | | |_| |  __/ | |\\ V /  __/ |  | |_| |");
				out.println(" |_|  \\___/ \\___// |_| |____/ \\___|_|_| \\_/ \\___|_|   \\__, |");
				out.println("               |__/                                    |___/ ");
				out.println("  API Gateway Service");
				out.println("===============================================");
			}
		});
		app.run(args);
	}
}