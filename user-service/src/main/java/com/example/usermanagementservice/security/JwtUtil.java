package com.example.usermanagementservice.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;
import java.util.List;
import java.util.function.Function;

@Component
public class JwtUtil {

    // Use a strong secret key (at least 256 bits for HS256) for HMAC-SHA algorithms
    private final String SECRET_KEY = "this_is_a_secret_key_for_jwt_library_api_12345";

    // Token validity (10 hours)
    private final long EXPIRATION_TIME = 1000 * 60 * 60 * 10;

    private Key getSigningKey() {
        return Keys.hmacShaKeyFor(SECRET_KEY.getBytes());
    }

    // Generate token
    public String generateToken(UserDetails userDetails) {
        List<String> roles = userDetails.getAuthorities().stream()
                // Strip "ROLE_"
                .map(auth -> auth.getAuthority()
                        .replace("ROLE_", "")).toList();

        return Jwts.builder()
                .setSubject(userDetails.getUsername())
                // store List<String>, e.g. ["ADMIN"]
                .claim("roles", roles)
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(new Date(System.currentTimeMillis() + EXPIRATION_TIME))
                .signWith(getSigningKey(), SignatureAlgorithm.HS256)
                .compact();
    }
//    public String generateToken(User user) {
//        Map<String, Object> claims = new HashMap<>();
//        claims.put("userId", user.getId());  // ← ADD USER ID
//        claims.put("email", user.getEmail());
//        claims.put("roles", List.of(user.getRole()));
//
//        return Jwts.builder()
//                .setClaims(claims)
//                .setSubject(user.getEmail())
//                .setIssuedAt(new Date())
//                .setExpiration(new Date(System.currentTimeMillis() + 86400000))
//                .signWith(getSigningKey())
//                .compact();
//    }
    public Long extractUserId(String token) {
        Claims claims = extractAllClaims(token);
        return claims.get("userId", Long.class);
    }
    // Extract username from token
    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    // Validate Token - Ensures the username in the token matches the user
    // Also checks the token is not expired
    public boolean validateToken(String token, UserDetails userDetails) {
        final String username = extractUsername(token);
        return (username.equals(userDetails.getUsername()) && !isTokenExpired(token));
    }

    // Token Expiration Logic
    private boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }

    // Grabs the expiration date from the token and compares it to current time
    private Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    // Extracting Roles from Token
    @SuppressWarnings("unchecked")
    public List<String> extractRoles(String token) {
        Claims claims = extractAllClaims(token);
        return (List<String>) claims.get("roles");
    }

    // Extract claim using a generic claim extractor
    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    //  Helper function to decode all Claims
    private Claims extractAllClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getSigningKey()) // Provide secret key
                .build()
                .parseClaimsJws(token) // Parse the signed token
                .getBody(); // Extract payload (claims)
    }


}
