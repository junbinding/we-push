# we-push

基于 Node.js 微信推送服务

## 快速开始

### 时序图
登录流程
![登录流程](https://pic.imgdb.cn/item/5f811cd71cd1bbb86b86fb16.jpg)

消息推送
![消息推送]](https://pic.imgdb.cn/item/5f811d221cd1bbb86b87a9cf.jpg)

### 相关配置
- 环境变量相关的配置在 `.env` 文件
- 应用相关的配置在 `config/config.default.js` 文件
- nginx 配置文件路径 `server/nginx/conf/nginx.conf`
- mysql 配置文件路径 `server/mysql/conf/`

### 项目初始化
1. 启动 nginx、mysql、redis
```bash
$ docker-compose up -d
```
2. 导入 sql 文件，文件目录 `server/tutorial.sql`.

### 开发环境

```bash
# 安装依赖
$ npm i
# 启动开发服务
$ npm run dev
# 浏览器访问
$ open http://localhost:7001/
```

### 生产环境

```bash
# 启动生产服务
$ npm start
# 停止生产服务
$ npm stop
```
