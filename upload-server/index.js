/**
 * @name WXbot
 * @description 获取环境变量参数，执行微信消息通知函数
 */

const { getToken, postMsg } = require("./api");
const { WX_COMPANY_ID, WX_APP_ID, WX_APP_SECRET } = require("./constants.js");

// 主函数
async function wxNotify(config) {
  try {
    // 获取token
    const accessToken = await getToken({
      id: WX_COMPANY_ID,
      secret: WX_APP_SECRET
    });

    // 发送消息
    const defaultConfig = {
      msgtype: "text",
      agentid: WX_APP_ID,
      ...config
    };
    const option = { ...defaultConfig, ...config };
    const res = await postMsg(accessToken, option);
    console.log("wx:信息发送成功！", res);
    return true;
  } catch (error) {
    console.log("wx:信息发送失败！", error);
    return false;
  }
}


exports.wxNotify = wxNotify;


// 调用例子
// wxNotify({
//   msgtype: "text",
//   text: {
//     content: `${moment().format('lll')}`
//   }
// });

// wxNotify({
//   msgtype: "textcard",
//   textcard: {
//     title: "应用发布提醒",
//     description:
//       '<div class="gray">2016年9月26日</div> <div class="normal">恭喜你抽中iPhone 7一台，领奖码：xxxx</div><div class="highlight">请于2016年10月10日前联系行政同事领取</div>',
//     url: "www.baidu.com",
//     btntxt: "更多"
//   }
// });
