package com.xebia.lms.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.parameters.Parameter;
import org.springdoc.core.customizers.OperationCustomizer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("Xebia Enterprise LMS Course Module API")
                        .version("1.0.0")
                        .description("REST API documentation for Xebia LMS Course Module Backend."));
    }

    @Bean
    public OperationCustomizer addGlobalHeaders() {
        return (operation, handlerMethod) -> {
            operation.addParametersItem(new Parameter()
                    .in("header")
                    .name("X-Organization-ID")
                    .description("Organization/Tenant ID (UUID)")
                    .required(true));
            operation.addParametersItem(new Parameter()
                    .in("header")
                    .name("X-User-Id")
                    .description("User ID (UUID or Name)")
                    .required(true));
            operation.addParametersItem(new Parameter()
                    .in("header")
                    .name("X-User-Role")
                    .description("User Role (ADMIN, TRAINER, ORGANISER, STUDENT)")
                    .required(true));
            return operation;
        };
    }
}
