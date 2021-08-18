#API do systemu digitalprint

W czasie testów używamy adresu 
- dev2.digitalprint.pro

Na produkcji to:
- api.digitalprint.pro

Po wrzuceniu plików na master update na serwerze robimy na użytkowniku deploy w folderze:
- backend-prod

Po wrzuceniu na accept update na użytkowniku deploy robimy w folderze:
- backend-accept

Po updacie trzeba też zrobić

```composer dumpautoload -o```

###Migracje

```vendor/bin/phinx create [NazwaMigracji] -c phinx/plik_konfiguracyjny [--template phinx/template.php]```

Pliki konfiguracyjne:
 - phinx/dp.config.php
 - phinx/vprojekt.config
 
 Aby wykonać migracje:
 
 ```vendor/bin/phinx migrate -c phinx/[plik_konfiguracyjny]```
 Developerska forma migracji w pliku migrations-company.sh
 
### DODAWANIE CERTYFIKATU DLA DOMEN NA DEDYKU ###
 - letsencrypt certonly --webroot -w /var/www -d nazwa.domeny
 - potem dodanie konfiguracji domeny do 
 - /etc/apache2/sites-available/
 - symkink do (ln -s /etc/apache2/sites-available/nazwa.domeny.conf /etc/apache2/sites-enabled/)
 - /etc/apache2/sites-enabled/
 - potem
 - sudo /etc/init.d/apache2 restart
###
