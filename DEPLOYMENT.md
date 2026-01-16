# AimLab 部署指南

## 部署到 yuan1.cn 服务器

### 前置要求

1. **服务器访问权限**：需要 SSH 访问权限
2. **域名配置**：需要将 `aimlab.yuan1.cn` 解析到服务器 IP
3. **SSL 证书**：需要为 `aimlab.yuan1.cn` 申请 SSL 证书

### 快速部署步骤

#### 方式一：使用自动化脚本（推荐）

```bash
# 1. 修改 Next.js 配置已完成（启用静态导出）

# 2. 重新构建项目（生成 out 目录）
npm run build

# 3. 执行部署脚本
chmod +x deploy.sh
./deploy.sh root@your-server-ip
```

#### 方式二：手动部署

**1. 构建项目**

```bash
cd d:\codeWork\aimlab
npm run build
```

构建完成后会生成 `out` 目录，包含所有静态文件。

**2. 上传文件到服务器**

```bash
# 使用 rsync（推荐）
rsync -avz --delete out/ root@your-server-ip:/srv/app/aimlab/out/

# 或使用 scp
scp -r out/* root@your-server-ip:/srv/app/aimlab/out/
```

**3. 配置 DNS**

在你的域名管理面板添加 A 记录：

```
类型: A
主机: aimlab
值: 你的服务器IP
TTL: 600
```

**4. 申请 SSL 证书**

登录服务器，执行：

```bash
# 安装 certbot（如果未安装）
sudo apt update
sudo apt install certbot python3-certbot-nginx -y

# 申请证书
sudo certbot certonly --nginx -d aimlab.yuan1.cn
```

证书会自动保存到：
- `/etc/letsencrypt/live/aimlab.yuan1.cn/fullchain.pem`
- `/etc/letsencrypt/live/aimlab.yuan1.cn/privkey.pem`

**5. 配置 Nginx**

```bash
# 上传 nginx 配置
scp nginx.conf root@your-server-ip:/tmp/aimlab.nginx.conf

# SSH 登录服务器
ssh root@your-server-ip

# 更新 nginx 配置文件中的证书路径
sudo nano /tmp/aimlab.nginx.conf
# 修改为实际证书路径：
# ssl_certificate /etc/letsencrypt/live/aimlab.yuan1.cn/fullchain.pem;
# ssl_certificate_key /etc/letsencrypt/live/aimlab.yuan1.cn/privkey.pem;

# 移动配置文件
sudo mv /tmp/aimlab.nginx.conf /etc/nginx/sites-available/aimlab.yuan1.cn

# 创建软链接
sudo ln -sf /etc/nginx/sites-available/aimlab.yuan1.cn /etc/nginx/sites-enabled/

# 测试配置
sudo nginx -t

# 重启 nginx
sudo systemctl reload nginx
```

**6. 验证部署**

访问: https://aimlab.yuan1.cn

### 目录结构

部署后服务器目录结构：

```
/srv/app/aimlab/
└── out/                    # Next.js 静态导出文件
    ├── index.html
    ├── trainer.html
    ├── _next/
    │   └── static/        # JS/CSS 资源
    └── ...

/etc/nginx/
├── sites-available/
│   └── aimlab.yuan1.cn    # Nginx 配置
└── sites-enabled/
    └── aimlab.yuan1.cn    # 软链接
```

### 更新部署

后续更新只需：

```bash
# 1. 本地构建
npm run build

# 2. 上传
rsync -avz --delete out/ root@your-server-ip:/srv/app/aimlab/out/

# 3. 清理浏览器缓存访问
```

### 故障排查

**问题 1: 502 Bad Gateway**
- 检查 nginx 配置：`sudo nginx -t`
- 查看错误日志：`sudo tail -f /var/log/nginx/error.log`

**问题 2: SSL 证书错误**
- 检查证书路径是否正确
- 确认证书未过期：`sudo certbot certificates`
- 续期证书：`sudo certbot renew`

**问题 3: 页面无法访问**
- 检查 DNS 解析：`nslookup aimlab.yuan1.cn`
- 检查防火墙：`sudo ufw status`
- 确保开放 80 和 443 端口

**问题 4: 静态资源 404**
- 检查文件权限：`ls -la /srv/app/aimlab/out/`
- 设置正确权限：`sudo chown -R www-data:www-data /srv/app/aimlab/`

### Nginx 配置说明

关键配置项：

```nginx
# 静态导出的根目录
root /srv/app/aimlab/out;

# Next.js 路由支持
location / {
    try_files $uri $uri.html $uri/ =404;
}

# 静态资源缓存
location /_next/static/ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

### 性能优化建议

1. **启用 Gzip 压缩**（已在配置中）
2. **CDN 加速**：可考虑使用 CloudFlare
3. **HTTP/2**：已启用
4. **静态资源缓存**：1年过期时间

### 监控和维护

```bash
# 查看 nginx 状态
sudo systemctl status nginx

# 查看访问日志
sudo tail -f /var/log/nginx/access.log

# 查看错误日志
sudo tail -f /var/log/nginx/error.log

# 检查磁盘空间
df -h

# 自动续期证书（cron job 已自动配置）
sudo certbot renew --dry-run
```

### 安全建议

1. 定期更新系统：`sudo apt update && sudo apt upgrade`
2. 配置防火墙：只开放必要端口（22, 80, 443）
3. 使用 fail2ban 防止暴力破解
4. 定期备份网站文件和配置

---

## 项目信息

- **项目名称**: AimLab Trainer
- **技术栈**: Next.js 16 + React 19 + TypeScript + Tailwind CSS
- **部署方式**: 静态导出 (Static Export)
- **域名**: https://aimlab.yuan1.cn
- **服务器路径**: /srv/app/aimlab/out

## 联系方式

如有问题，请查看 [Next.js 静态导出文档](https://nextjs.org/docs/app/building-your-application/deploying/static-exports)
