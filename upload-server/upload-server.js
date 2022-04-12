// scp2 : https://www.npmjs.com/package/
// 引入scp2
const client = require("scp2");
const ora = require("ora");
const chalk = require("chalk"); //美化命令行
const BASE = require("../src/base");

const { wxNotify } = require("./index.js");
const moment = require('moment');
moment.locale('zh-cn');  

const isProduction = process.env.VUE_APP_PACK_ENV === "pro"; // 是否是生产环境

const server = {
  host: "42.xxx.xx.xxx", // 服务器ip
  port: "22", // 端口一般默认22
  username: "tomcat", // 用户名
  password: "xxxxx", // 密码
  pathNmae: isProduction
    ? "/opt/hdedu/pc/html/sepro"
    : "/opt/hdedu/pc/html/sedev", // 上传到服务器的位置
  locaPath:
    "/Users/duanyipeng/Desktop/userCode/securityStudy/se-pc/dist/" // 本地打包文件的位置
};

const onlinePath = isProduction
  ? "http://42.xx.xx.xxx/sepro"  //线上访问地址
  : "http://42.xx.xx.xxx/sedev"; 

const packInfo =  {
  ...BASE,
  serverPath: server.pathNmae
}

console.log(chalk.cyan("本次打包信息 =>"), packInfo);

const spinner = ora(
  "正在发布到" + (isProduction ? "生产" : "开发") + "服务器..."
);

const Client = require("ssh2").Client; // 创建shell脚本
const conn = new Client();

console.log(chalk.magenta("正在建立连接"));

conn
  .on("ready", function() {
    console.log(chalk.green("已连接"));
    if (!server.pathNmae) {
      console.log("连接已关闭");
      conn.end();
      return false;
    }
    // 这里我拼接了放置服务器资源目录的位置 ，首选通过rm -rf删除了这个目录下的文件
    conn.exec("rm -rf " + server.pathNmae + "/*", function(err, stream) {
      console.log(chalk.yellow("已删除服务端文件"));
      stream.on("close", function(code, signal) {
        console.log(chalk.blue("开始上传"));
        spinner.start();
        client.scp(
          server.locaPath,
          {
            host: server.host,
            port: server.port,
            username: server.username,
            password: server.password,
            path: server.pathNmae
          },
          err => {
            spinner.stop();
            if (!err) {
              console.log(
                chalk.green(
                  "Success! 成功发布到" +
                    (isProduction ? "生产" : "开发") +
                    "服务器!"
                ),
                `访问地址====>${onlinePath}`
              );
              // 部署成功后发送企业微信通知
              wxNotify({
                msgtype: "textcard",
                textcard: {
                  title: "发布成功",
                  description:
                    `<div class="gray">${moment().format('lll')}</div> <div class="highlight">华东院安全教育平台-${isProduction ? "生产" : "开发"}环境已发布</div><div class="normal">访问地址：${onlinePath}</div>`,
                  url: onlinePath,
                  btntxt: "更多"
                }
              });
            } else {
              console.log(chalk.red("发布失败.\n"), err);
              wxNotify({
                msgtype: "textcard",
                textcard: {
                  title: "发布失败",
                  description:
                    `<div class="gray">${moment().format('lll')}</div> <div class="highlight">华东院安全教育平台-${isProduction ? "生产" : "开发"}环境发布失败</div><div class="normal">访问地址：${onlinePath}</div>`,
                  url: onlinePath,
                  btntxt: "更多"
                }
              });
            }
            conn.end(); // 结束命令
          }
        );
      });
    });
  })
  .connect({
    host: server.host,
    port: server.port,
    username: server.username,
    password: server.password
    //privateKey: '' //使用 私钥密钥登录 目前测试服务器不需要用到
  });
