#  Mini-Netumo - Uptime Monitoring & SSL/Domain Alerts

A full-stack uptime and domain monitor system with SSL expiry checks, domain WHOIS lookup, and alert notifications via email and Slack.

---

##  Stack Used

- **Frontend**: React + Vite + Axios + Tailwind CSS  
- **Backend/API**: Node.js + Express + Sequelize + PostgreSQL  
- **Worker**: BullMQ + Node.js for async checks and alerts  
- **Notifier**: Sends alerts via Email (Mailtrap) and Slack  
- **Database**: PostgreSQL  
- **Message Queue**: Redis  
- **Deployment**: Docker Compose on AWS EC2  
- **CI/CD**: GitHub Actions  

---

##  Project Structure

Mini-netumo/
├── api/  Express API with Sequelize ORM
├── worker/  Background workers for checks and SSL/domain expiry
├── notifier/  Email/Slack notification service
├── frontends/  React frontend for user dashboard
├── nginx/  NGINX reverse proxy and load balancer
├── docker-compose.yml  Multi-service Docker setup
├── .env  Environment variables (not committed)
└── README.md  This file


---

##  Features

- Add & monitor websites/URLs
- Pause or resume monitoring
- SSL and domain expiry alerts
- Email & Slack notification support
- Real-time frontend dashboard
- Background workers with queue-based execution
- Fully Dockerized deployment

---

##  Setup Locally

### 1. Clone the Repo

```bash
git clone https://github.com/CAPSTONE-PROJECT-G7/Mini-netumo.git
cd Mini-netumo
```

### 2. Create .env file
Place this in the root of the repo

# database
POSTGRES_URL=postgres://postgres:mayaya@db:5432/monitor

# auth
JWT_SECRET=supersecret

# e-mail / Slack (replace with your own)
MAIL_USER=fc547b19a3f738
MAIL_PASS=8ef635997df24b
MAIL_FROM=mini-netumo@demo.io

### 3. Start with Docker Compose

```bash
docker compose up --build
```
Frontend: http://localhost

API Base: http://localhost/api


### Deploying to AWS EC2 (Live)
1. Setup EC2
Launch Ubuntu EC2 instance

Allow inbound rules: Ports 22, 80, 443

SSH into EC2:
```bash
ssh -i netumo.pem ubuntu@your-ec2-public-ip

```
### 2. Install Docker and Docker Compose
```bash
sudo apt update && sudo apt install docker.io docker-compose -y
sudo usermod -aG docker $USER
newgrp docker
```
### 3. Clone the Repo on EC2

```bash
git clone https://github.com/your-username/Mini-netumo.git
cd Mini-netumo
```
### 4. Create .env file on EC2 (same as local)
```bash
nano .env
```
### 5. Run the App on EC2
```bash
docker compose up --build -d
```

Now visit:
```arduino
http://your-ec2-public-ip
```
