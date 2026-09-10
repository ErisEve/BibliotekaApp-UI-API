# BibliotekaApp-UI-API
*Aplikacija pravljena za biblioteku, koristeci springboot / App made for a library, using springboot*

This is an application intended for librarians and library members. It is designed primarily to be used during a librarian's working day, when someone comes in to borrow a book, but the application can also function as a platform on which any member can reserve a book for themselves in advance, and see which books in the library have already been borrowed, along with the time they are scheduled to be returned.

## Running the application
The application has to be started in parts. Here are the complete instructions for running it:

### 1. Create and start the PostgreSQL database
This application does not work without a Postgres database, so you have to start that first. Postgres 17 was used, and the local development credentials are `postgres` / `1`.

The repository contains `library-db-mkfile.sql`, which creates the `library_metadata` database and fills it with test data. Note that it is a **data-only** dump: it contains the `CREATE DATABASE` statement and the `INSERT`s, but no `CREATE TABLE`s, because the tables are created by Hibernate (`ddl-auto: update`). So the order is:

1. Run the `CREATE DATABASE library_metadata ...` line from the dump (or create the database by hand).
2. Start the services once, so that Hibernate creates the `books`, `lending`, `seats` and `users` tables.
3. Run the rest of the dump against `library_metadata` to load the test data.

#### Configuration
Nothing has to be configured for a local run — every setting below has a working default. Override them with environment variables when the defaults do not fit, and always override `JWT_SECRET` outside of local development:

| Variable | Default | Meaning |
| --- | --- | --- |
| `DB_URL` | `jdbc:postgresql://localhost:5432/library_metadata` | JDBC URL of the database |
| `DB_USERNAME` | `postgres` | Database user |
| `DB_PASSWORD` | `1` | Database password |
| `JWT_SECRET` | a clearly-marked development value | HMAC-SHA signing key. **All services must use the same value**, otherwise tokens issued by the user service will not validate anywhere else |
| `JWT_EXPIRATION_MS` | `36000000` (10 hours) | Token lifetime |

### 2. Start the Eureka and Gateway services
Before starting the whole application, it is important to first start the Eureka Discovery Server (the folder of the same name) and then LibGateway (the corresponding gateway service for this application), in exactly that order.

Every module is a Maven project on Java 17 and Spring Boot 3.2.5 (the Eureka server uses a newer parent), so they can all be opened in a single IntelliJ window. An earlier version of this repository also carried a stray Gradle build inside the UI module that declared a different Spring Boot version; it has been removed, since it was what made a single-window setup fail.
### 3. Start all the other services in exactly the same way
Nothing special — just open them all in IntelliJ and check whether they register with the Eureka server, which runs on port/link http://localhost:8761/ .
The application itself will be available on the gateway port http://localhost:8080/ .

![eureka pic](https://github.com/ericges/BibliotekaApp-UI-API/blob/main/Pasted%20image%2020260622040136.png)

## Application features
### Existing services
This application consists of 5 separate services:
- *UI Service* - **port 8017** - which provides the user with a visual aid for navigating the application
- *Library Management Service* - **port 8081** - which deals exclusively with the books in the library themselves (browsing, adding, deleting books)
- *Loan Management Service* - **port 8083** - which deals only with lending (borrowing and returning books)
- *Seat Management Service* - **port 8084**  - through which you can reserve a table in the library for studying (reserving a table, cancelling reservations, ...)
- *User Service* - **port 8082** - which deals with users and authentication in the system.

All services that need a Swagger UI have one:
![swagger pic](https://github.com/ericges/BibliotekaApp-UI-API/blob/main/Screenshot_58.png)
### Application overview
When you open the link localhost:8080, if you have started everything properly, you should see this:
![login pic](https://github.com/ericges/BibliotekaApp-UI-API/blob/main/Screenshot_60.png)

To log in to the application, you can use any user from the database.

Every password is hashed, and every user profile can be logged into with the password "123".

Once you have successfully logged into the system, you will see this:
![app pic](https://github.com/ericges/BibliotekaApp-UI-API/blob/main/Screenshot_59.png)
(specifically, this is the librarian's view)

