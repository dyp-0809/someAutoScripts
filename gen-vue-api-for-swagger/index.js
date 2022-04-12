
// 将swagger 转换为 vue api代码 

const fs = require("fs");
const path = require("path");
const http = require("http");

// 生成api文件地址
const srcFolder = "../src/api";
// swagger接口地址
const url = "http://42.xxx.xx.xxx/dev-api/v3/api-docs";

// 生成本地文件
function mkdirsSync(dirname) {
  if (fs.existsSync(dirname)) {
    return true;
  } else {
    if (mkdirsSync(path.dirname(dirname))) {
      fs.mkdirSync(dirname);
      return true;
    }
  }
}

function getPath(pathUrl) {
  return path.resolve(__dirname, pathUrl);
}

function generateTemplate(arr) {
  return `import request from '@/utils/request'\n`;
}

// 下划线转换驼峰
function toHump(name) {
  return name.replace(/\/(\w)/g, function (all, letter) {
    return letter.toUpperCase();
  });
}

// 去除花括号，获取干净的字段
function removeBrace(value) {
  const regex = /\{(.+?)\}/g; // {} 花括号，大括号
  const str = value.match(regex)[0] || "";
  return str.replace(/\{|}/g, "");
}

/**
 * 生成具体的api: 
 * export function postRsArticle(data) {
 *  return request({
 *   url: '/rs/article',
 *    method: 'post', 
 *    data: data
 *  })
 * }
 */
function generateFunc(url, summary, type = "post") {
  const isBrace = url.indexOf("{") !== -1;
  let funcName = toHump(type + url);
  let splitUrl = "";
  let braceKey = "";
  if (isBrace) {
    splitUrl = url.split("{")[0];
    braceKey = removeBrace(url);
    funcName = toHump(type + splitUrl + braceKey);
  }

  const funcArguments = `${
    isBrace
      ? braceKey
      : !isBrace && (type === "post" || type === "put")
      ? "data"
      : "query"
  }`;
  const funcUrl = `${!isBrace ? `'${url}'` : `'${splitUrl}' + ${braceKey}`}`;
  const funcParams = `${
    isBrace
      ? ""
      : !isBrace && (type === "post" || type === "put")
      ? "\n    data: data"
      : "\n    params: query"
  }`;

  return `
// ${summary || ""}
export function ${funcName}(${funcArguments}) {
  return request({
    url: ${funcUrl},
    method: '${type}', ${funcParams}
  })
}\n`;
}

function httpgetJson(url) {
  return new Promise((resolve, reject) => {
    http
      .get(url, (res) => {
        const { statusCode } = res;
        const contentType = res.headers["content-type"];

        let error;
        if (statusCode !== 200) {
          error = new Error("请求失败。\n" + `状态码: ${statusCode}`);
        } else if (!/^application\/json/.test(contentType)) {
          error = new Error(
            "无效的 content-type.\n" +
              `期望 application/json 但获取的是 ${contentType}`
          );
        }
        if (error) {
          console.error(error.message);
          // 消耗响应数据以释放内存
          res.resume();
          return;
        }

        res.setEncoding("utf8");
        let rawData = "";
        res.on("data", (chunk) => {
          rawData += chunk;
        });
        res.on("end", () => {
          try {
            const parsedData = JSON.parse(rawData);
            resolve(parsedData);
          } catch (e) {
            reject(`错误: ${e.message}`);
          }
        });
      })
      .on("error", (e) => {
        reject(`错误: ${e.message}`);
      });
  });
}

async function main() {
  console.log("获取远程json文件中...");
  const { paths } = await httpgetJson(url);
  console.log("获取成功正在生成api文件");
  const obj = {};
  /**
   * 将数据转换成格式
   * se-ex-exam-controller: [
   *   {
   *     folder:'exam'
   *     name:'/ex/exam'
   *     summary:'修改考试考卷'
   *     tag:'se-ex-exam-controller'
   *     type:'put'
   *   }
   *   ...
   * ]
   */
  for (const name in paths) {
    const path = paths[name] || {};
    const pathKeys = Object.keys(path) || [];
    for (let i = 0, len = pathKeys.length; i < len; i++) {
      const apiType = pathKeys[i];
      const tag = path[apiType].tags[0];
      if (!tag) continue;
      console.log(tag);
      const urlArray = name.slice(1).split("/");
      const folder = urlArray[1];
      const item = {
        summary: path[apiType].summary,
        tag,
        name,
        type: apiType,
        folder,
      };
      if (obj[path[apiType].tags[0]]) {
        obj[path[apiType].tags[0]].push(item);
      } else {
        obj[path[apiType].tags[0]] = [item];
      }
    }
  }
  for (const tagName in obj) {
    let jsString = "";
    const requestTypes = [];
    let folder = "";
    for (const item of obj[tagName]) {
      const requestType = requestTypes.filter((o) => o === item.type);
      if (requestType.length === 0) requestTypes.push(item.type);
      jsString += generateFunc(item.name, item.summary, item.type);
      folder = item.folder;
    }
    jsString = generateTemplate(requestTypes) + jsString;
    mkdirsSync(getPath(`${srcFolder}/${folder}`));
    // console.log(jsString)
    fs.writeFileSync(getPath(`${srcFolder}/${folder}/${tagName}.js`), jsString);
  }
  console.log("生成完毕");
}

main();
