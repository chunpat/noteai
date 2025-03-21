@echo off
setlocal enabledelayedexpansion

:: 设置颜色代码
set "GREEN=92"
set "RED=91"
set "YELLOW=93"
set "BLUE=94"

:: 显示彩色输出的函数
call :print_color %BLUE% "
███╗   ██╗ ██████╗ ████████╗███████╗ █████╗ ██╗
████╗  ██║██╔═══██╗╚══██╔══╝██╔════╝██╔══██╗██║
██╔██╗ ██║██║   ██║   ██║   █████╗  ███████║██║
██║╚██╗██║██║   ██║   ██║   ██╔══╝  ██╔══██║██║
██║ ╚████║╚██████╔╝   ██║   ███████╗██║  ██║██║
╚═╝  ╚═══╝ ╚═════╝    ╚═╝   ╚══════╝╚═╝  ╚═╝╚═╝
                                               
智能对话记账助手启动脚本
"

:: 检查必要的工具
call :print_color %YELLOW% "检查必要的工具..."

:: 检查 Docker
docker --version > nul 2>&1
if %errorlevel% neq 0 (
    call :print_color %RED% "错误: 未安装 Docker。请先安装 Docker: https://docs.docker.com/get-docker/"
    exit /b 1
)

:: 检查 Docker Compose
docker-compose --version > nul 2>&1
if %errorlevel% neq 0 (
    call :print_color %RED% "错误: 未安装 Docker Compose。请先安装 Docker Compose: https://docs.docker.com/compose/install/"
    exit /b 1
)

:: 检查 Node.js
node --version > nul 2>&1
if %errorlevel% neq 0 (
    call :print_color %RED% "错误: 未安装 Node.js。请先安装 Node.js: https://nodejs.org/"
    exit /b 1
)

:: 检查 npm 或 yarn
set "PACKAGE_MANAGER=npm"
yarn --version > nul 2>&1
if %errorlevel% equ 0 (
    set "PACKAGE_MANAGER=yarn"
) else (
    npm --version > nul 2>&1
    if %errorlevel% neq 0 (
        call :print_color %RED% "错误: 未安装 npm 或 yarn。请先安装 Node.js: https://nodejs.org/"
        exit /b 1
    )
)

:: 检查 Expo CLI
expo --version > nul 2>&1
if %errorlevel% neq 0 (
    call :print_color %YELLOW% "未安装 Expo CLI，正在安装..."
    if "!PACKAGE_MANAGER!"=="yarn" (
        yarn global add expo-cli
    ) else (
        npm install -g expo-cli
    )
)

call :print_color %GREEN% "所有必要的工具已安装 ✓"

:: 启动后端服务
call :print_color %YELLOW% "启动后端服务..."

:: 进入后端目录
cd server

:: 检查 .env 文件是否存在
if not exist .env (
    call :print_color %YELLOW% ".env 文件不存在，从示例文件创建..."
    copy .env.example .env
    call :print_color %YELLOW% "请记得编辑 .env 文件配置您的环境变量！"
)

:: 启动 Docker 容器
docker-compose up -d

:: 检查是否需要安装依赖
if not exist vendor (
    call :print_color %YELLOW% "安装 PHP 依赖..."
    docker-compose exec app composer install
)

:: 检查是否需要运行数据库迁移
call :print_color %YELLOW% "运行数据库迁移..."
docker-compose exec app php vendor/bin/phinx migrate

call :print_color %GREEN% "后端服务已启动 ✓"

:: 返回根目录
cd ..

:: 启动前端服务
call :print_color %YELLOW% "启动前端服务..."

:: 进入前端目录
cd app

:: 检查是否需要安装依赖
if not exist node_modules (
    call :print_color %YELLOW% "安装前端依赖..."
    if "!PACKAGE_MANAGER!"=="yarn" (
        yarn install
    ) else (
        npm install
    )
)

:: 启动 Expo 开发服务器
call :print_color %GREEN% "启动 Expo 开发服务器..."
if "!PACKAGE_MANAGER!"=="yarn" (
    yarn start
) else (
    npm start
)

goto :eof

:: 函数定义
:print_color
echo [%~1m%~2[0m
goto :eof 