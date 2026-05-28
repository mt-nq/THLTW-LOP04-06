package com.btl.clubborrow;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class ClubBorrowApplication {
    public static void main(String[] args) {
        SpringApplication.run(ClubBorrowApplication.class, args);
    }
}
