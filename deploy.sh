#!/bin/bash
rsync -vhra ./ ubuntu@ec2-3-143-224-40.us-east-2.compute.amazonaws.com:/home/ubuntu/movienest-backend \
  --include='**.gitignore' \
  --exclude='/.git' \
  --filter=':- .gitignore'

ssh ubuntu@ec2-3-143-224-40.us-east-2.compute.amazonaws.com /bin/bash << 'EOF'
  source ~/.profile
  cd /home/ubuntu/movienest-backend
  npm i
  npm run build
  pm2 restart all
EOF
