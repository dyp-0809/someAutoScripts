

/**
 * @description 根据企业ID、应用secret 获取token
 * @returns token
 */
 const axios = require('axios');
 const BASE_URL = 'https://qyapi.weixin.qq.com'

 // 获取token
 async function getToken({ id, secret }) {
   try {
     const response = await axios({
       url: `${BASE_URL}/cgi-bin/gettoken?corpid=${id}&corpsecret=${secret}`,
       method: 'GET',
       headers: {
         'Content-Type': 'application/json',
       },
     })
     return response.data.access_token
   }
   catch (error) {
     console.log(error)
     return ''
   }
 }

 /**
 * 发送消息通知到企业微信
 * 
 * api示列: https://developer.work.weixin.qq.com/tutorial/application-message/3
 * api: https://developer.work.weixin.qq.com/document/path/90372
 */
const postMsg = async(accessToken, config) => {
  const response = await axios({
    url: `${BASE_URL}/cgi-bin/message/send?access_token=${accessToken}`,
    method: 'POST',
    data: {
      touser: config.touser || '@all',
      ...config,
    },
  })
  return response.data
}


exports.getToken = getToken;
exports.postMsg = postMsg;
 