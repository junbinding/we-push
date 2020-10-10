# we-push

基于 Node.js 微信推送服务

## 快速开始
### 相关配置
- 环境变量相关的配置在 `.env` 文件
- 应用相关的配置在 `config/config.default.js` 文件
- nginx 配置文件路径 `server/nginx/conf/nginx.conf`
- mysql 配置文件路径 `server/mysql/conf/`

### 项目初始化
1. 修改 `.env.example` 为 `.env`，并设置文件中的密码
2. 启动 nginx、mysql、redis
```bash
$ docker-compose up -d
```
3. 导入 sql 文件，文件目录 `server/tutorial.sql`.

注：可参考 `doc/Node.js 服务器环境搭建.pdf` 来搭建服务端环境
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

## 时序图
登录流程
<br>
<img src="https://pic.imgdb.cn/item/5f811cd71cd1bbb86b86fb16.jpg" width="600px" />

消息推送
<br>
<img src="https://pic.imgdb.cn/item/5f811d221cd1bbb86b87a9cf.jpg" width="600px" />

## License
MIT

---

## 问题反馈
有问题请联系我微信
<br>
<img src="https://pic.imgdb.cn/item/5f8122ef1cd1bbb86b92e642.jpg" width="340">