
Jak uruchomić aplikacje:

- npm install 


# Jak uruchomić proxy plików lokalnych (deprecated)

npm install


uruchamiamy 

grunt serve
node proxy

Poniższy opis dotyczy przeglądarki chrome

Instalujemy:

https://chrome.google.com/webstore/detail/proxy-switchyomega/padekgcemlokbadohgkifijomclgjgif

Konfigurujemy:

1. Dodajemy nowy virtual profile: Digitalprint-localhost i uzupełniamy:

Protocol: Http
Server: localhost
Port: 7777

2. Dodajemy nowy switch profile: Digitalprint-static i uzupełniamy:

Condition Type: Host wildcard
Condition Details: static.digitalprint.pro
Profile: Digitalprint-localhost

Następny wpis:

Condition Type: Url wildcard
Condition Details: http://dev2.digitalprint.pro/templates/getFile/*
Profile: Digitalprint-localhost

Uruchamiamy w przeglądarce profil: Digitalprint-static

Rezultat: Możemy modyfikować pliki prosto w repozytorium git.

Pewnie do każdej przeglądarki istnieje odpowiednia wtyczka obsługująca proxy, ale nie testowałem. 

# Jak utworzyć wersję plików na ftp (deprecated)

```
grunt deploy-ftp --id=35
```

Id możemy sobie zmieniać.

Odpowiednie katalogi utworzone są w katalogu `/.tmp/deploy/<id>`

# Jak zaktualizować pliki na `accept`

./rsync.sh 35


# Jak utworzyć nowy szablon calc

Tworzymy nowy plik w katalogu:

```
app/src/category/templates/calc/
```

Uzupełniamy wg. uznania.

Dodajemy wpis do gruntfile.js

```
w sekcji processhtml:templates
```

Uruchamiamy komendę:

```
grunt processhtml:templates
```

<Brawa> mamy wygenerowany nowy szablon.


# Używanie szablonów
W panelu administracyjnym w menu Treści i komunikaty -> Szablony

Można ustawić źródło danego szablonu. Domyślne źródło jest kopią szablonów z repozytorium.
Na serwerze to ścieżka: 
```
/home/www/data/templates/default/{id_szablonu}/{nazwa_szablonu}.html
```

Aby, zmienić źródło czyli nadpisać szablon należy w panelu administracyjnym przełączyć 
input radio na "Dla drukarni" lub "Dla domeny". Własny szablon możemy wgrać w panelu administracyjnym, 
albo przez FTP jeżeli mamy dostęp.

Na serwerze ścieżka dla opcji "Dla drukarni" to:
```
/home/www/data/templates/{id_drukarni}/{id_szablonu}/{nazwa_szablonu}.html
```

Ścieżka dla opcji "Dla domeny" to:
```
/home/www/data/templates/{id_drukarni}/{id_szablonu}/{id_domeny}/{nazwa_szablonu}.html
```

Istnieje możliwość dodania **własnych szablonów**
W tym celu w tym samam miejscu administracji na samym dole mamy możliwość dodania szablonu.
Te szablony także mamy możliwość wgrania przez panel administracyjny lub przez FTP.

Ścieżki do własnych szablonów różnią się przedrostkiem _local.

Ścieżka dla opcji "Dla drukarni" w przypadku własnego szablonu to:
```
/home/www/data/templates/{id_drukarni}/local_{id_szablonu}/{nazwa_szablonu}.html
```

Ścieżka dla opcji "Dla domeny" w przypadku własnego szablonu to:
```
/home/www/data/templates/{id_drukarni}/local_{id_szablonu}/{id_domeny}/{nazwa_szablonu}.html
```

Jeżeli chcemy zmienić szablon z domyślnego na własny należy go podmienić w widokach, które
znajdziemy w menu Treści i komuniakty -> Routing i przycisk "zobacz" w interesującym nas wierszu routingu.
Po przejściu na stronę z widokami w kolumnie Szablony klikamy na ikonkę edycji obok nazwy szablonu i 
wybieramy inny szablon.

# Wstawianie treści statycznych
Aby wstawić treść statyczną należy w panelu administracyjnym w zakładce 
Treści i komunikaty -> treści statyczne
dodać treść statyczną z unikalnym kluczem, a następnie wypełnić 
pola dla języków w których chcemy daną treść wyświetlać.

Aby pokazać treść na stronie należy osadzić ją w kodzie html wybranego przez 
nas szablonu:

```
<div ng-static-contents class="staticContentBox" content="[klucz_wpisany_w_administracji]"></div>
```
