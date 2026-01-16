# GitHub Actions 自动部署指南

## 🚀 自动部署流程

每次推送代码到 GitHub 的 `main` 分支时，GitHub Actions 会自动：
1. 检出代码
2. 安装依赖
3. 构建项目
4. 部署到服务器
5. 配置 Nginx

## 📋 配置步骤

### 1. 生成 SSH 密钥对

在本地终端执行：

```bash
ssh-keygen -t ed25519 -C "github-actions" -f ~/.ssh/aimlab_deploy
```

这会生成两个文件：
- `~/.ssh/aimlab_deploy` (私钥)
- `~/.ssh/aimlab_deploy.pub` (公钥)

### 2. 将公钥添加到服务器

```bash
# 复制公钥内容
cat ~/.ssh/aimlab_deploy.pub

# 登录服务器
ssh root@your-server-ip

# 添加公钥到授权列表
echo "公钥内容" >> ~/.ssh/authorized_keys

# 设置权限
chmod 600 ~/.ssh/authorized_keys
chmod 700 ~/.ssh
```

### 3. 配置 GitHub Secrets

访问你的 GitHub 仓库页面：

1. 进入 **Settings** > **Secrets and variables** > **Actions**
2. 点击 **New repository secret**，添加以下密钥：

#### 必需的 Secrets：

| 名称 | 值 | 说明 |
|------|-----|------|
| `SSH_PRIVATE_KEY` | 私钥内容 | 运行 `cat ~/.ssh/aimlab_deploy` 获取 |
| `SERVER_HOST` | 服务器IP或域名 | 例如：`123.456.789.0` |
| `SERVER_USER` | SSH 用户名 | 通常是 `root` 或 `ubuntu` |

#### 添加 SSH_PRIVATE_KEY 的步骤：

```bash
# 复制私钥全部内容（包括开头和结尾）
cat ~/.ssh/aimlab_deploy

# 输出应该类似于：
# -----BEGIN OPENSSH PRIVATE KEY-----
# b3BlbnNzaC1rZXktdjEAAAAA...
# -----END OPENSSH PRIVATE KEY-----
```

将整个内容（包括 BEGIN 和 END 行）复制到 GitHub Secret。

### 4. 推送代码到 GitHub

```bash
# 如果还没有 Git 仓库，初始化
cd d:\codeWork\aimlab
git init

# 添加远程仓库（替换为你的仓库地址）
git remote add origin https://github.com/your-username/aimlab.git

# 添加所有文件
git add .

# 提交
git commit -m "Initial commit with GitHub Actions deployment"

# 推送到 GitHub
git push -u origin main
```

### 5. 查看部署进度

1. 在 GitHub 仓库页面，点击 **Actions** 标签
2. 查看运行中的工作流
3. 点击具体的运行查看详细日志

## 🔧 工作流配置说明

工作流文件位置：`.github/workflows/deploy.yml`

### 触发条件

- **自动触发**：推送到 `main` 分支时
- **手动触发**：在 GitHub Actions 页面点击 "Run workflow"

### 部署步骤

1. **Checkout code** - 检出代码
2. **Setup Node.js** - 配置 Node.js 环境
3. **Install dependencies** - 安装依赖
4. **Build project** - 构建生产版本
5. **Setup SSH** - 配置 SSH 连接
6. **Deploy to server** - 上传文件到服务器
7. **Configure Nginx** - 配置和重启 Nginx

## 🛠️ 自定义配置

### 修改分支

如果你的主分支是 `master` 而不是 `main`：

```yaml
on:
  push:
    branches:
      - master  # 修改这里
```

### 修改部署路径

在 `.github/workflows/deploy.yml` 中修改：

```yaml
env:
  REMOTE_DIR: /srv/app/aimlab  # 修改为你的路径
```

### 添加部署前后的钩子

可以在工作流中添加自定义步骤：

```yaml
- name: Run tests
  run: npm test

- name: Notify deployment
  run: echo "Deployment started"
```

## 📱 通知配置（可选）

### Slack 通知

```yaml
- name: Slack notification
  uses: 8398a7/action-slack@v3
  with:
    status: ${{ job.status }}
    webhook_url: ${{ secrets.SLACK_WEBHOOK }}
```

### 邮件通知

```yaml
- name: Send email
  uses: dawidd6/action-send-mail@v3
  with:
    server_address: smtp.gmail.com
    server_port: 465
    username: ${{ secrets.EMAIL_USERNAME }}
    password: ${{ secrets.EMAIL_PASSWORD }}
    subject: Deployment completed
    to: your-email@example.com
    from: GitHub Actions
```

## 🔍 故障排查

### 问题 1: SSH 连接失败

**错误信息**：`Permission denied (publickey)`

**解决方案**：
1. 确认私钥格式正确（包含完整的 BEGIN 和 END 标记）
2. 确认公钥已添加到服务器的 `~/.ssh/authorized_keys`
3. 检查服务器 SSH 配置是否允许密钥登录

```bash
# 在服务器上检查
sudo nano /etc/ssh/sshd_config

# 确保以下设置：
PubkeyAuthentication yes
PasswordAuthentication no  # 可选，提高安全性
```

### 问题 2: Nginx 配置失败

**错误信息**：`nginx: configuration file test failed`

**解决方案**：
1. 检查 nginx.conf 文件语法
2. 确保 SSL 证书路径正确
3. 手动在服务器上测试：`sudo nginx -t`

### 问题 3: 权限不足

**错误信息**：`Permission denied` 或 `sudo: no tty present`

**解决方案**：

```bash
# 方式 1: 为部署用户配置无密码 sudo（推荐）
sudo visudo

# 添加以下行（替换 deploy 为你的用户名）
deploy ALL=(ALL) NOPASSWD: /usr/sbin/nginx, /usr/bin/systemctl

# 方式 2: 使用 root 用户部署
# 在 GitHub Secrets 中设置 SERVER_USER=root
```

### 问题 4: rsync 失败

**错误信息**：`rsync: command not found`

**解决方案**：

```bash
# 在服务器上安装 rsync
sudo apt update
sudo apt install rsync -y
```

## 📊 查看部署日志

### GitHub Actions 日志

1. 访问仓库的 **Actions** 标签
2. 点击具体的工作流运行
3. 展开各个步骤查看详细输出

### 服务器日志

```bash
# Nginx 访问日志
sudo tail -f /var/log/nginx/access.log

# Nginx 错误日志
sudo tail -f /var/log/nginx/error.log

# 系统日志
sudo journalctl -u nginx -f
```

## 🔐 安全最佳实践

1. **最小权限原则**
   - 创建专门的部署用户，不使用 root
   - 只授予必要的 sudo 权限

2. **密钥管理**
   - 定期轮换 SSH 密钥
   - 为不同项目使用不同的密钥
   - 从不在代码中提交私钥

3. **网络安全**
   - 限制 SSH 访问 IP（如果可能）
   - 使用防火墙规则
   - 启用 fail2ban 防止暴力破解

4. **监控和审计**
   - 定期检查 GitHub Actions 日志
   - 监控服务器异常访问
   - 设置部署失败告警

## 🎯 完整部署流程示例

```bash
# 1. 本地开发完成
git add .
git commit -m "feat: add new feature"

# 2. 推送到 GitHub
git push origin main

# 3. GitHub Actions 自动执行
# - 构建项目
# - 运行测试（如果有）
# - 部署到服务器
# - 重启 Nginx

# 4. 访问网站验证
# https://aimlab.yuan1.cn

# 5. 查看部署状态
# 访问 GitHub Actions 页面
```

## 📚 相关文档

- [GitHub Actions 文档](https://docs.github.com/en/actions)
- [SSH Agent Action](https://github.com/webfactory/ssh-agent)
- [Next.js 部署文档](https://nextjs.org/docs/deployment)
- [Nginx 配置指南](https://nginx.org/en/docs/)

## 💡 高级功能

### 多环境部署

创建不同的工作流文件：
- `.github/workflows/deploy-staging.yml` - 测试环境
- `.github/workflows/deploy-production.yml` - 生产环境

### 回滚机制

```yaml
- name: Backup current deployment
  run: |
    ssh $SERVER_USER@$SERVER_HOST \
      "cp -r $REMOTE_DIR/out $REMOTE_DIR/out.backup.$(date +%Y%m%d_%H%M%S)"
```

### 健康检查

```yaml
- name: Health check
  run: |
    sleep 10
    curl -f https://aimlab.yuan1.cn || exit 1
```

---

## 🎉 开始使用

现在你可以：
1. ✅ 配置好 GitHub Secrets
2. ✅ 推送代码到 GitHub
3. ✅ 自动部署到服务器
4. ✅ 享受 CI/CD 的便利！

有问题？查看 [GitHub Actions 运行日志](https://github.com/your-username/aimlab/actions)
