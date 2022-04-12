## 此项目汇总一些脚本，便于日常项目的快速开发及迭代

### 项目结构
    |-- edit-version   // 更改版本号
        |-- edit-version.sh 
        |-- version.json
    |-- gen-vue-api-for-swagger // 将swagger转换为vue代码的Api
        |-- index.js
    |-- upload-server // 将vue打包文件部署至服务器并企业微信推送消息
        |-- index.js
        |-- upload-server.js


### 使用

可单独运行也可以在 vue项目中的package.json配置使用