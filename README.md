# NoteAI: 智能对话记账助手

基于自然语言对话的智能记账应用，让记账像聊天一样简单。通过对话即可轻松完成日常记账，支持多平台使用。

## 📱 产品概述

让记账变得简单自然，用户通过日常对话方式即可完成记账，智能分类，自动统计，让记账不再是负担。

## 🎯 MVP开发阶段

### 第一阶段：核心对话记账功能（当前阶段）
- [x] AI对话式记账基础功能
  - 自然语言识别记账内容
  - 智能分类系统
  - 基础账目管理
- [x] 跨平台基础版本开发
  - 对话界面
  - 账目列表
  - 基础统计

### 第二阶段：移动端完善
- [ ] 原生功能集成
  - 本地存储优化
  - 推送通知
  - TouchID/FaceID支持
- [ ] 离线功能支持
  - 本地数据同步
  - 断网记账支持

### 第三阶段：功能扩展
- [ ] 语音输入
- [ ] 多币种支持
- [ ] 数据导出
- [ ] 预算管理

## 💡 核心功能

### AI对话记账
- 支持多种记账表达方式：
  ```
  "今天中午吃饭花了30块"
  "刚刚买菜花了100"
  "发工资了5000"
  ```
- 智能识别：金额、类别、时间、备注
- 快速修改和删除

### 数据统计
- 每日收支概览
- 月度收支报告
- 消费类别分析

## 🛠️ 技术方案

### 核心框架选型

#### React Native + Expo
- **一套代码，多端运行**
  - iOS、Android和Web三端统一
  - 优秀的跨平台表现
  - 接近原生的用户体验
- **活跃的社区支持**
  - 丰富的第三方组件
  - 完善的文档和教程
  - 大量的开源项目参考
- **开发效率**
  - 热重载快速开发
  - Expo简化开发流程
  - 容易招到开发人员

### 技术架构

#### 前端架构
- React Native + Expo：核心框架
- React Navigation：路由导航
- Redux Toolkit：状态管理
- React Native Paper：UI组件库

#### 后端架构
- Slim + docker：轻量级PHP框架
- MySQL：主数据库
- Redis：缓存
- GPT API：智能对话处理

### 项目结构
```
noteai/
├── app/                # React Native应用目录
│   ├── components/     # 可复用组件
│   │   ├── ChatMessage.tsx       # 聊天消息组件
│   │   ├── TransactionItem.tsx   # 交易项目组件
│   │   └── ...
│   ├── screens/        # 页面组件
│   │   ├── HomeScreen.tsx        # 首页
│   │   ├── ChatScreen.tsx        # 聊天页面
│   │   ├── StatisticsScreen.tsx  # 统计页面
│   │   ├── ProfileScreen.tsx     # 个人资料页面
│   │   └── ...
│   ├── navigation/     # 导航配置
│   │   └── AppNavigator.tsx      # 应用导航
│   ├── services/       # API服务
│   │   └── api.ts                # API请求服务
│   ├── store/          # 状态管理
│   │   ├── index.ts              # Redux store配置
│   │   ├── transactionsSlice.ts  # 交易状态管理
│   │   ├── userSlice.ts          # 用户状态管理
│   │   └── chatSlice.ts          # 聊天状态管理
│   └── utils/          # 工具函数
│       ├── constants.ts          # 常量定义
│       └── theme.ts              # 主题配置
├── config/                 # Configuration files
│   ├── container.php      # Dependency injection container
│   ├── middleware.php     # Middleware configuration
│   ├── routes.php         # Route definitions
│   └── logger.php         # Logging configuration
├── src/
│   ├── Actions/           # Action classes (endpoints)
│   ├── Constants/         # Constants and enums
│   ├── Exceptions/        # Custom exceptions
│   ├── Middleware/        # Custom middleware
│   ├── Models/            # Database models
│   ├── Services/          # Business logic
│   └── Validators/        # Request validators
├── public/                # Web root
│   └── index.php         # Application entry point
├── logs/                  # Log files
├── docker/               # Docker configuration
├── .env.example          # Environment template
├── composer.json         # Composer dependencies
└── docker-compose.yml    # Docker compose config
```

## 📈 项目里程碑

### Phase 1（2-3周）
1. 基础框架搭建（3-5天）
   - React Native + Expo环境配置
   - 基础架构搭建
   - 核心组件开发

2. 对话功能开发（1周）
   - AI对话接口集成
   - 对话解析系统
   - 记账数据存储
   
3. 界面开发（1周）
   - 对话交互界面
   - 账目管理界面
   - 基础数据展示

### Phase 2（2-3周）
- 原生功能集成
- 数据同步优化
- 离线支持

### Phase 3（2-3周）
- 高级功能开发
- 性能优化
- 用户反馈优化

## 🚀 快速开始

### 环境要求
- Node.js >= 16
- Expo CLI
- Android Studio 或 Xcode（可选，用于模拟器）
- PHP >= 8.1
- MySQL >= 5.7
- Redis >= 6.0
- Docker 和 Docker Compose
- GPT API Key

### 一键启动（推荐）

我们提供了一键启动脚本，可以自动检查环境、启动后端服务和前端应用：

#### macOS/Linux:
```bash
# 赋予脚本执行权限
chmod +x start.sh

# 运行启动脚本
./start.sh
```

#### Windows:
```bash
# 运行启动脚本
start.bat
```

### 手动启动

如果您想手动启动各个服务，可以按照以下步骤操作：

#### 前端开发环境准备
```bash
# 进入前端目录
cd noteai/app

# 安装依赖
npm install
# 或
yarn install

# 启动开发服务器
expo start
```

#### 后端开发环境准备
```bash
# 进入后端目录
cd noteai/server

# 复制环境配置文件
cp .env.example .env
# 编辑.env文件，配置数据库和API密钥

# 使用Docker启动服务
docker-compose up -d

# 安装PHP依赖
composer install

# 运行数据库迁移
php vendor/bin/phinx migrate
```

## 📋 开发注意事项

### 前端开发规范
1. 组件化开发
   - 每个功能模块独立组件
   - 保持组件的可复用性
   - 使用TypeScript类型检查

2. 状态管理
   - 使用Redux Toolkit管理全局状态
   - 本地状态使用useState/useReducer
   - 异步操作使用createAsyncThunk

3. 样式规范
   - 使用StyleSheet创建样式
   - 遵循React Native Paper设计规范
   - 支持深色/浅色主题

### 后端开发规范
1. API设计
   - RESTful API设计
   - 统一的响应格式
   - 完善的错误处理

2. 数据库操作
   - 使用Eloquent ORM
   - 编写数据库迁移
   - 避免直接SQL查询

3. 安全性
   - 输入验证
   - JWT认证
   - CORS配置

## 🤝 参与贡献

1. Fork本项目
2. 创建特性分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'feat: add some amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 发起Pull Request

### 提交规范
- feat: 新功能
- fix: 修复
- docs: 文档更新
- style: 代码格式
- refactor: 重构
- test: 测试
- chore: 构建过程或辅助工具的变动

## 📞 联系方式

- 微信公众号：NoteAI记账助手
- 邮箱：support@noteai.com
- 官网：https://www.noteai.com

## 📄 许可证

本项目采用 MIT 许可证 - 详情请参阅 [LICENSE](LICENSE) 文件

---

用❤️打造 by NoteAI团队


