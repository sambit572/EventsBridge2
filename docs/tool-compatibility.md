
# EventsBridge Ubuntu 24.04 LTS Tool Compatibility

## Operating System

| Component | Purpose | Version |
|---|---|---|
| Ubuntu Server | Target deployment operating system | 24.04 LTS |


## Application Stack

| Component | Purpose | Version |
|---|---|---|
| Node.js | Backend and frontend runtime | 24.x (defined in backend dependencies) |
| npm | Package manager | Compatible with Node.js runtime |
| React | Frontend framework | 19.1.0 |
| Vite | Frontend build tool | 6.3.5 |
| Express.js | Backend framework | 4.21.2 |
| MongoDB | Database driver compatibility | MongoDB Node.js Driver 6.x |
| Redis | Cache and session management | Redis client 5.x |


## Required Tools

| Tool | Purpose | Version |
|---|---|---|
| Git | Source code management | Compatible with Ubuntu 24.04 LTS |
| Node.js | Application runtime | 24.x |
| npm | Dependency management | Compatible with Node.js runtime |
| Docker | Containerization | To be verified |
| Docker Compose | Container orchestration | To be verified |
| Nginx | Reverse proxy | To be verified |
| UFW | Firewall management | Available with Ubuntu 24.04 LTS |
| Fail2Ban | Server security | To be verified |


## Project Structure Compatibility

| Component | Location | Details |
|---|---|---|
| Backend | `/backend` | Node.js + Express.js application |
| Frontend | `/frontend` | React + Vite application |
| Documentation | `/docs` | Project documentation |


## Package Management

- Backend contains `package-lock.json`, indicating npm dependency management.
- Backend also contains `bun.lock`, indicating Bun has been used in the project.
- The production package manager should be confirmed with the development team to avoid dependency inconsistencies.


## Deployment Notes

- Docker configuration files (`Dockerfile` and `docker-compose.yml`) were not found in the repository.
- Nginx reverse proxy configuration was not found in the repository.
- Containerization and reverse proxy setup should be verified separately during deployment.
- Ubuntu 24.04 LTS server configuration should be aligned with the final production deployment approach.