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

![eureka pic](https://github.com/ErisEve/BibliotekaApp-UI-API/blob/main/Pasted%20image%2020260622040136.png)

## Funkcionalnosti aplikacije
### Servisi koji postoje
Ova aplikacija se sastoji od 5 odvojenih servisa:
- *UI Service* - **port 8017** - koji sluzi da korisniku vizuelno pomogne kretanju kroz aplikaciju
- *Library Management Service* - **port 8081** - koji se iskljucivo bavi samim knjigama u biblioteci (pregledanje, ubacivanje, brisanje knjiga)
- *Loan Management Service* - **port 8083** - koji se bavi samo iznajmljivanjem (iznajmljivanje i vracanje knjiga)
- *Seat Management Service* - **port 8084**  - preko kojeg mozete rezervisati sto u biblioteci za ucenje (rezervacija stola, ukidanje rezervacija..)
- *User Service* - **port 8082** - koji se bavi korisnicima i autentifikacijom u sistemu.

Swagger UI imaju svi servisi kojima je potrebno da ga imaju:
![swagger pic](https://github.com/ErisEve/BibliotekaApp-UI-API/blob/main/Screenshot_58.png)
### Pregled aplikacije
Kada otvorite link localhost:8080, ukoliko ste sve pokrenuli kako treba, na njemu treba da se nadje ovo:
![login pic](https://github.com/ErisEve/BibliotekaApp-UI-API/blob/main/Screenshot_58.png)
**BITNO:**
Za logovanje u aplikaciju, nije moguce koristiti svakog usera iz baze podataka.[^1] Ovo ce biti doterano u toku dana.[^2]

Za logovanje u ulogu korisnika, koristiti ovaj email i sifru:
- lala@example.com
- Abcd123

Za logovanje u ulogu bibliotekara, koristiti ovaj email i sifru:
- aaa@library.com
- 123

Kada se uspesno ulogujete u sistem, videcete ovo:
![app pic](https://github.com/ErisEve/BibliotekaApp-UI-API/blob/main/Screenshot_59.png)
(specificno, ovo je pogled bibliotekara)



[^1]: Ukratko, kad sam ubacivala podatke na pocetku, zaboravila sam da se hesiraju prilikom autentifikacije. Stoga se trenutno u bazi nalazi gomilu nekih korisnika sa siframa kojima je nemoguce pristupiti zato sto nisu hesovane. 
[^2]: Azuriracu library-db-mkfile.sql u toku dana tako da svi korisnici imaju upotrebljive sifre i emailove, i da se iz svakog moze pristupiti aplikaciji. Ne mogu sad odma jer je 5 ujutru.