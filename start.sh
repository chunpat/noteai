#!/bin/bash

# 显示彩色输出的函数
print_color() {
  case $1 in
    "green") echo -e "\033[0;32m$2\033[0m" ;;
    "red") echo -e "\033[0;31m$2\033[0m" ;;
    "yellow") echo -e "\033[0;33m$2\033[0m" ;;
    "blue") echo -e "\033[0;34m$2\033[0m" ;;
    *) echo "$2" ;;
  esac
}

# 显示启动信息
print_color "blue" "
███╗   ██╗ ██████╗ ████████╗███████╗ █████╗ ██╗
████╗  ██║██╔═══██╗╚══██╔══╝██╔════╝██╔══██╗██║
██╔██╗ ██║██║   ██║   ██║   █████╗  ███████║██║
██║╚██╗██║██║   ██║   ██║   ██╔══╝  ██╔══██║██║
██║ ╚████║╚██████╔╝   ██║   ███████╗██║  ██║██║
╚═╝  ╚═══╝ ╚═════╝    ╚═╝   ╚══════╝╚═╝  ╚═╝╚═╝
                                               
智能对话记账助手启动脚本
"

# 检查是否安装了必要的工具
check_requirements() {
  print_color "yellow" "检查必要的工具..."
  
  # 检查 Docker
  if ! command -v docker &> /dev/null; then
    print_color "red" "错误: 未安装 Docker。请先安装 Docker: https://docs.docker.com/get-docker/"
    exit 1
  fi
  
  # 检查 Docker Compose
  if ! command -v docker compose &> /dev/null; then
    print_color "red" "错误: 未安装 Docker Compose。请先安装 Docker Compose: https://docs.docker.com/compose/install/"
    exit 1
  fi
  
  # 检查 Node.js
  if ! command -v node &> /dev/null; then
    print_color "red" "错误: 未安装 Node.js。请先安装 Node.js: https://nodejs.org/"
    exit 1
  fi
  
  # 检查 npm 或 yarn
  if command -v yarn &> /dev/null; then
    PACKAGE_MANAGER="yarn"
  elif command -v npm &> /dev/null; then
    PACKAGE_MANAGER="npm"
  else
    print_color "red" "错误: 未安装 npm 或 yarn。请先安装 Node.js: https://nodejs.org/"
    exit 1
  fi
  
  # 检查 Expo CLI
  if ! command -v expo &> /dev/null; then
    print_color "yellow" "未安装 Expo CLI，正在安装..."
    if [ "$PACKAGE_MANAGER" = "yarn" ]; then
      yarn global add expo-cli
    else
      npm install -g expo-cli
    fi
  fi
  
  print_color "green" "所有必要的工具已安装 ✓"
}

# 启动后端服务
start_backend() {
  print_color "yellow" "启动后端服务..."
  
  # 进入后端目录
  cd server
  
  # 检查 .env 文件是否存在
  if [ ! -f .env ]; then
    print_color "yellow" ".env 文件不存在，从示例文件创建..."
    cp .env.example .env
    print_color "yellow" "请记得编辑 .env 文件配置您的环境变量！"
  fi
  
  # 启动 Docker 容器
  docker compose up -d
  
  # 检查是否需要安装依赖
  if [ ! -d "vendor" ]; then
    print_color "yellow" "安装 PHP 依赖..."
    docker compose exec app composer install
  fi
  
  # 检查是否需要运行数据库迁移
  print_color "yellow" "运行数据库迁移..."
  docker compose exec app php vendor/bin/phinx migrate
  
  print_color "green" "后端服务已启动 ✓"
  
  # 返回根目录
  cd ..
}

# 启动前端服务
start_frontend() {
  print_color "yellow" "启动前端服务..."
  
  # 进入前端目录
  cd app
  
  # 检查是否需要安装依赖
  if [ ! -d "node_modules" ]; then
    print_color "yellow" "安装前端依赖..."
    if [ "$PACKAGE_MANAGER" = "yarn" ]; then
      yarn install
    else
      npm install
    fi
  fi
  
  # 启动 Expo 开发服务器
  print_color "green" "启动 Expo 开发服务器..."
  if [ "$PACKAGE_MANAGER" = "yarn" ]; then
    yarn start
  else
    npm start
  fi
}

# 主函数
main() {
  # 检查必要的工具
  check_requirements
  
  # 启动后端服务
  start_backend
  
  # 启动前端服务
  start_frontend
}

# 执行主函数
main 