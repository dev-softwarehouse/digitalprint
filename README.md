# Dockerize digitalprint

## Build

### Requirements
 * docker
 * docker-compose

### Build
```bash
~# docker-compose build
```

### Run
```bash
~# docker-compose up
```

### Restore mongo
```bash
mongorestore --username=admin --password=M0nG0f69b54 --authenticationDatabase=admin -d editor_25 editor_25
```