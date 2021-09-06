echo "Jump to app folder"
cd node-server-jwt/

echo "Update app from Git"
git pull

echo "Build your app"
 sudo docker-compose build

echo "run with docker"
sudo docker-compose up -d