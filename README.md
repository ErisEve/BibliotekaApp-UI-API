# BibliotekaApp-UI-API
*Aplikacija pravljena za biblioteku, koristeci springboot / App made for a library, using springboot*

Ovo je aplikacija predvidjena za bibliotekare i clanove biblioteka. Aplikacija je predvidjena da pre svega bude koriscena u toku poslovnog dana jednog bibliotekara, kada neko dodje da iznajmi knjigu, ali aplikacija takodje moze da funkcionise i kao platforma na kojoj bilo koji clan moze unapred sebi pozajmiti knjigu, i videti koje knjige u biblioteci su vec pozajmljene, zajedno sa vremenom kada je planirano da budu vracene.

## Pokretanje aplikacije
Aplikaciju je potrebno pokrenuti iz delova. Evo potpunog uputstva za pokretanje:

### 1. Napraviti i pokrenuti PostgreSQL bazu
Ova aplikacija ne radi bez postgres baze, stoga je prvo morate pokrenuti. U repozitorijumu projekta nalazi se library-db-mkfile.sql fajl koji kompletno rekreira trenutnu bazu za testiranje, koja je popunjena podacima za manipulaciju. 
Koriscen je Postgres 17, a podaci za logovanje na server su:
- username: postgres
- password: 1
### 2. Pokrenuti Eureka i Gateway servise
Pre pokretanja cele aplikacije, bitno je prvo pokrenuti Eureka Discovery Server (istoimeni folder) a potom i LibGateway (odgovarajuci gateway servis za ovu aplikaciju) u bas tom redosledu. 
Nejasno je da li su verzije springboota i jdk u svim ovim servisima iste (autorka je pokusala da pokrene sve iz istog IntelliJ prozora ali nije joj islo) tako da se preporucuje da svaki servis ima svoj odvojeni IntelliJ prozor (ali ako umete namestiti da radi iz jednog, to je bolje).
### 3. Pokrenuti sve ostale servise na apsolutno isti nacin
Nista, samo otvorite sve u IntelliJ-u i proveravate da li se vezuju na Eureka server, koji radi na portu/linku http://localhost:8761/ .
Sama aplikacija ce biti otvorena na gateway portu http://localhost:8080/ .
![[Pasted image 20260622040136.png]]