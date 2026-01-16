#!/bin/bash
# 快速部署脚本 - aimlab to yuan1.cn server

set -e

SERVER="ubuntu@43.139.73.98"
REMOTE_DIR="/srv/app/aimlab"

echo "🚀 开始部署 AimLab..."

# 1. 确保本地已构建
if [ ! -d "out" ]; then
    echo "📦 构建项目..."
    npm run build
fi

# 2. 创建远程目录
echo "📁 创建远程目录..."
ssh $SERVER "sudo mkdir -p $REMOTE_DIR/out && sudo chown -R ubuntu:ubuntu $REMOTE_DIR"

# 3. 上传构建文件
echo "📤 上传文件..."
rsync -avz --delete out/ $SERVER:$REMOTE_DIR/out/

# 4. 上传并配置 nginx
echo "⚙️  配置 Nginx..."
scp nginx.conf $SERVER:/tmp/aimlab.nginx.conf

ssh $SERVER << 'ENDSSH'
    sudo mv /tmp/aimlab.nginx.conf /etc/nginx/sites-available/aimlab.yuan1.cn
    sudo ln -sf /etc/nginx/sites-available/aimlab.yuan1.cn /etc/nginx/sites-enabled/
    sudo nginx -t
    sudo systemctl reload nginx
ENDSSH

echo "✅ 部署完成！"
echo "🌐 访问: https://aimlab.yuan1.cn"
