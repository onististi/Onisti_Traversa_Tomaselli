package org.example.javaserver;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class JavaServerApplication {

    public static void main(String[] args) {
        SpringApplication.run(JavaServerApplication.class, args);
        System.out.println("!!!!!!!!!!!!Server started!!!!!!!!!!!!!!!!!");
    }

}
