# 1. BUILD IMAGE (LOCAL)

docker build -t <your-username>/adminapis-app:latest .
### Example : 
docker build -t impetrosys/adminapis-app:latest .

---

# 2. LOGIN TO DOCKER HUB

docker login

# 3. PUSH IMAGE

docker push <your-username>/adminapis-app:latest


# 4. ON SERVER (PULL IMAGE)

docker pull <your-username>/adminapis-app:latest

# 5. RUN / START CONTAINER

docker run -d -p 8001:8001 --name node_app --env-file .env <your-username>/adminapis-app:latest

# 6. CONTAINER COMMANDS

# Start container
docker start node_app
# Stop container
docker stop node_app
# Restart container
docker restart node_app

# 7. CHECK STATUS

docker ps        # running
docker ps -a     # all

# 8. LOGS (VERY IMPORTANT)

docker logs node_app

Live logs:
docker logs -f node_app

# 9. REMOVE CONTAINERS

# Remove one
docker rm node_app
# Force remove
docker rm -f node_app
# Remove all
docker rm -f $(docker ps -aq)

# 10. REMOVE IMAGES

# Remove one
docker rmi <your-username>/adminapis-app:latest
# Remove all
docker rmi -f $(docker images -aq)


# 11. FULL CLEANUP

docker system prune -a
# remove volumes too:
docker system prune -a --volumes


# 12. DOCKER COMPOSE (RECOMMENDED)

# Start
docker compose up -d
# Stop
docker compose stop
# Restart
docker compose restart
# Down (remove containers)
docker compose down
# Down + volumes
docker compose down -v
# Rebuild + start
docker compose up -d --build

# BEST PRACTICE FLOW

# Local:
docker build -t impetrosys/adminapis-app:latest .
docker push impetrosys/adminapis-app:latest

# Server:
docker pull impetrosys/adminapis-app:latest
docker stop node_app
docker rm node_app
docker run -d -p 8001:8001 --name node_app impetrosys/adminapis-app:latest
