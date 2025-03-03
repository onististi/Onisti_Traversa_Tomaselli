package org.example.javaserver;

import org.springframework.web.bind.annotation.*;
@CrossOrigin(origins = "http://localhost:3000") //da modificare con la porta del "secondo server express"
@RestController
@RequestMapping("/api")
public class ProvaController {

    @GetMapping("/message")
    public String getMessage() {
        return "Ciao dal server Java!";
    }
}