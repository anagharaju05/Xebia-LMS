package com.xebia.lms.security;

import com.xebia.lms.security.dto.AuthRequest;
import com.xebia.lms.security.dto.AuthResponse;
import com.xebia.lms.student.Student;
import com.xebia.lms.student.StudentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.CrossOrigin;

import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@CrossOrigin(origins = "*", maxAge = 3600)
public class AuthController {

    private final StudentRepository studentRepository;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody AuthRequest request) {
        String role = request.getRole() != null ? request.getRole().toLowerCase() : "student";
        String email = request.getEmail();
        String password = request.getPassword();

        if ("admin".equals(role) && "admin@xebia.com".equalsIgnoreCase(email)) {
            if ("Admin@123".equals(password)) {
                return ResponseEntity.ok(new AuthResponse(
                        "admin-1",
                        "Admin User",
                        "admin@xebia.com",
                        "admin",
                        null,
                        "123e4567-e89b-12d3-a456-426614174000"
                ));
            }
        } else if ("student".equals(role)) {
            Optional<Student> studentOpt = studentRepository.findByEmail(email);
            if (studentOpt.isPresent()) {
                Student student = studentOpt.get();
                // Simple plain-text check as requested
                if (password != null && password.equals(student.getPassword())) {
                    return ResponseEntity.ok(new AuthResponse(
                            student.getId().toString(),
                            student.getName(),
                            student.getEmail(),
                            "student",
                            student.getId().toString(),
                            student.getOrganizationId().toString()
                    ));
                }
            }
        }

        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid credentials");
    }
}
