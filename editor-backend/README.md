# digitalprint-node-backend


## Pobranie danych dla PDF
Przykładowy resource:
https://digitalprint.pro:1351/getProjectTimber/5a61f986f256ed299cb1d232

### Struktura tych danych:

1. Lista projektów, dla produktów
    1. Projekt dla danego produktu
        1. Typ produktu
        1. ID formatu
        1. Strony
            1. Order
            1. Scene

### Instalacja dev

Zmapować domene na local - np pla wn wpis do hosts: 127.0.0.1 digitalprint.pro
Wtedy obsługa produkcji możę chodzić np tak: ssh rafal_node@94.23.90.166

#### mongo (dla 3.6)
mongo.exe mongodb://editorDb:ed1t0rf69b54@localhost:27017/editor_25?authSource=admin
mongodump --username editorDb --password ed1t0rf69b54 --authenticationDatabase admin --db editor_25 --out ./editor_25.dump


Bazy editor_25 admin
admin jest potrzebna dla autoryzacji i wystarczy wstawic tam usera jak 
use admin
db.createUser(
  {
    user: "myUserAdmin",
    pwd: "abc123",
    roles: [ { role: "userAdminAnyDatabase", db: "admin" },{role:"dbOwner",db:"editor_25"} ]
  }
)
mongorestore --username editorDb --password ed1t0rf69b54 --authenticationDatabase admin -d editor_25  editor_25



#### mysql
bazy: dp, vprojekt i klienta np 25piekny_druk
ustawić różne konta dla połaczeń do tych baz wg kodu

sql na start:
```sql
CREATE USER 'dp_user'@'localhost' IDENTIFIED BY 'be091eb0189MSQLR';
CREATE USER 'v_pieknydruk'@'localhost' IDENTIFIED BY '5c99bd7a69';
GRANT ALL PRIVILEGES  ON 25piekny_druk.* TO 'v_pieknydruk'@'localhost'  WITH GRANT OPTION;
GRANT ALL PRIVILEGES ON *.* TO 'dp_user'@'localhost'  WITH GRANT OPTION;
CREATE USER 'vprojekt_select'@'localhost' IDENTIFIED BY 'A88d1QWf7e94ef7N';
GRANT select  ON vprojekt.* TO 'vprojekt_select'@'localhost'  WITH GRANT OPTION;
CREATE USER 'dp_user'@'localhost' IDENTIFIED BY 'be091eb0189MSQLR';
FLUSH PRIVILEGES;
```
```sql
use 25piekny_druk;
SELECT `ps_products_complex`.*
create database vprojekt;
use vprojekt;
```
przydatne
```sql
select * from dp_domains where name like '%dreamsoft.pro%';
select * from dp_domains where id = '1';
select * from users where name='pieknydruk';
select * from dp_domains where companyID=25;
insert into dp_domains (companyID, name) values(25,'edytor1.dreamsoft.pro');
```
> "C:/Program Files/MySQL/MySQL Server 8.0/bin/mysql.exe" --user=root --host=127.0.0.1 --port=3306 --database=35studioten --password=... < C:\Users\robert\Downloads\35studioten.sql
#### npm
```shell
npm install
npm start albo start-win
```

