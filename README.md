# BibliotekaApp-UI-API
*Aplikacija pravljena za biblioteku, koristeci springboot / App made for a library, using springboot*

Ovo je aplikacija predvidjena za bibliotekare i clanove biblioteka. Aplikacija je predvidjena da pre svega bude koriscena u toku poslovnog dana jednog bibliotekara, kada neko dodje da iznajmi knjigu, ali aplikacija takodje moze da funkcionise i kao platforma na kojoj bilo koji clan moze unapred sebi pozajmiti knjigu, i videti koje knjige u biblioteci su vec pozajmljene, zajedno sa vremenom kada je planirano da budu vracene.

## Pokretanje aplikacije
Aplikaciju je potrebno pokrenuti iz delova. Evo potpunog uputstva za pokretanje:

### 1. Napraviti i pokrenuti PostgreSQL bazu
Ova aplikacija ne radi bez postgres baze, stoga je prvo morate pokrenuti. U repozitorijumu projekta nalazi se .sql fajl koji kompletno rekreira trenutnu bazu za testiranje, koja je popunjena podacima za manipulaciju. 
Koriscen je Postgres 17, a podaci za logovanje na server su:
- username: postgres
- password: 1
### 2. 