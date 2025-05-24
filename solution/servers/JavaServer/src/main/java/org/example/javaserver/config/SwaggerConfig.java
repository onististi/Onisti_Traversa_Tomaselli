package org.example.javaserver.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.servers.Server;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
public class SwaggerConfig {

    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("Cineverse API - JavaServer")
                        .version("1.0.0")
                        .description("Documentazione completa delle API REST per l'accesso ai dati cinematografici"))
                .servers(List.of(
                        new Server()
                                .url("http://localhost:8080")
                                .description("Server di sviluppo locale")
                ));
    }
}