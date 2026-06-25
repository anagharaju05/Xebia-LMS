package com.xebia.lms;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@SpringBootApplication
@EnableJpaAuditing
public class LmsCourseApplication {
    public static void main(String[] args) {
        SpringApplication.run(LmsCourseApplication.class, args);
    }
}
