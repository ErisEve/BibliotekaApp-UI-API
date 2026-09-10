# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Context

University project for learning microservice architecture and Kubernetes. A Spring Boot / Spring Cloud library-management system (books, loans, seat reservations, users). The stated direction is to **dockerize every module and move to k8s**; assume changes should push toward containerization rather than the current localhost-bound setup.

## Repository layout

Six **independent** Maven projects — there is no aggregator/parent POM at the root. Each is built and run separately.

| Directory | `spring.application.name` | Port | Notes |
| --- | --- | --- | --- |
| `eureka-discovery-server` | `eureka-server` | 8761 | Service registry. Boot **4.0.5** / Spring Cloud 2025.1.1 (everything else is Boot 3.2.5 / SC 2023.0.0) |
| `LibGateway` | `gateway-service` | 8080 | Spring Cloud Gateway (WebFlux), Resilience4j circuit breakers, `/fallback/*` |
| `user-service` | `user-service` | 8082 | Issues JWTs; the only owner of the `users` table |
| `library-management-service` | `library-management-service` | 8081 | Books; fetches metadata from Open Library |
| `loan-management-service` | `loan-management-service` | 8083 | Lending records |
| `seat-reservation-service` | **`seat-management-service`** | 8084 | Directory name ≠ service name |
| `BibliotekaUI` | `ui-service` | 8017 | Thymeleaf UI. Still present despite the "Remove UI module" commit — that commit removed its stray *Gradle* build, not the module |

Maven `artifactId`s do not match directory names (`loan-service`, `seat-service`, `gateway-service`, `backend`). Jar names follow the artifactId — matters when writing Dockerfiles and k8s manifests.

## Build & run

**This machine has Docker but no JDK and no Maven on `PATH`.** Any build must run inside a container (or the user builds in IntelliJ). Don't assume `mvn`/`java` work.

Each module except `BibliotekaUI` carries a Maven wrapper (`./mvnw`, Maven 3.9.14, Java 17). `BibliotekaUI` has no wrapper — it needs a system Maven.

```bash
cd user-service
./mvnw clean package            # build jar into target/
./mvnw spring-boot:run          # run
./mvnw test                     # run tests
./mvnw test -Dtest=UserServiceApplicationTests#contextLoads   # single test
```

**Startup order matters:** `eureka-discovery-server` → `LibGateway` → all other services. Services and Feign clients target the gateway, so nothing inter-service works until 8761 and 8080 are up. Check registrations at http://localhost:8761/, use the app at http://localhost:8080/.

Every service's tests are only `@SpringBootTest` `contextLoads()` stubs — they boot the full context, so they need PostgreSQL and Eureka reachable and will fail without them. There is no real test coverage; treat "tests pass" as "the context started".

`BibliotekaUI/pom.xml` pulls Azure Application Insights from a custom `pkgs.dev.azure.com` repository — expect that module to be slow or to fail on a network-restricted build.

## Database

All four data services share **one** PostgreSQL database, `library_metadata` (defaults `postgres` / `1` on `localhost:5432`), with `ddl-auto: update`. Schema is created by Hibernate, not migrations.

`library-db-mkfile.sql` is a **data-only** dump (has `CREATE DATABASE` + `INSERT`s, no `CREATE TABLE`s). Bootstrap order:
1. Run the `CREATE DATABASE library_metadata …` statement.
2. Start the services once so Hibernate creates `books`, `lending`, `seats`, `users`.
3. Load the rest of the dump.

Test data: 8 users with roles `USER` / `LIBRARIAN`; every password is bcrypt-hashed `123`.

## Architecture notes that aren't obvious from one file

**Everything routes through the gateway, including service-to-service calls.** Feign clients are declared as `@FeignClient(name = "gateway-service", url = "http://localhost:8080")` (e.g. `loan-management-service/.../feign_client/BookClient.java`, `library-management-service/.../feign_client/UserClient.java`), so `loan → book` goes service → gateway → service. The gateway's last route is a catch-all `Path=/**` → `lb://ui-service`; any path that doesn't match `/api/{users,auth,books,lendings,seats}/**` lands on the UI service.

**Shared tables, duplicated entities.** `User` is an `@Entity` mapped to `users` in *four* modules, and `Book` is mapped to `books` in two. Only `user-service` reads `users` through a repository; the others resolve users over Feign (`CustomUserDetailsService` calls `UserClient.findUserByEmail`) but still contribute the entity to Hibernate's `ddl-auto: update`. Changing a shared entity in one module changes the schema for all of them.

**Auth.** `user-service` `AuthController` issues an HS256 JWT with a `roles` claim. Every other service validates it with its own copy of `JwtUtil`/`JwtFilter`/`SecurityConfig` using the *same* `jwt.secret` — if `JWT_SECRET` differs between services, tokens silently fail to validate everywhere but the issuer. Roles are stored bare (`USER`, `LIBRARIAN`) and get the `ROLE_` prefix added in code; watch for double-prefixing when touching authority handling.

Authorization is inconsistent and partly disabled: `loan-management-service` and `seat-reservation-service` `permitAll()` their whole API, `library-management-service` enforces `LIBRARIAN`/`USER`, and its `JwtFilter` falls through unauthenticated when no `Authorization` header is present. Don't assume an endpoint is protected — read its `SecurityConfig`.

**Book availability is derived, not stored.** The `books.available` column is never maintained; `BookService` recomputes it from the `lending` table on every read via native queries in `BookRepository` (`findLoanedBookIds`, `isBookLoaned`, `findAllAvailable`). Those queries cross the service boundary at the SQL level — `library-management-service` reads `loan-management-service`'s table directly.

**Configuration is hardcoded to localhost** in several places beyond `application.yml`: Feign `url = "http://localhost:8080"`, CORS allowlists in every `SecurityConfig` and in `LibGateway/.../config/CorsConfig.java`, `eureka.instance.hostname: localhost`, and `library-management-service/.../config/EurekaDebugConfig.java`, which builds an `EurekaClientConfigBean` with the Eureka URL hardcoded — it overrides the YAML. All of this needs to become environment-driven for Docker/k8s.

**Env vars already supported** (defaults in each `application.yml`): `DB_URL`, `DB_USERNAME`, `DB_PASSWORD`, `JWT_SECRET`, `JWT_EXPIRATION_MS`.

**Logging noise.** Filters and services `System.out.println` request paths, JWTs and password hashes on every request, and gateway/Eureka logging is at DEBUG. Expect very verbose output; consider this when adding container logging.

**External dependency.** `POST /api/books/fetch` calls `https://openlibrary.org/api/volumes/brief/isbn/{isbn}.json` via a bare `RestTemplate` (no timeouts configured).

## API surface

Gateway paths: `/api/auth/**` and `/api/users/**` → user-service, `/api/books/**` → library, `/api/lendings/**` → loan, `/api/seats/**` → seat, everything else → UI. Swagger UI is available per service at `/swagger-ui.html` on its own port (springdoc 2.3.0, `bearerAuth` scheme).
