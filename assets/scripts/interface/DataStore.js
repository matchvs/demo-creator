let GLB = require("Glb");
let platform = "alpha";
let DataStoreHost = GLB.platform === "release"? "https://vsopen.matchvs.com":"https://alphavsopen.matchvs.com";
let getGameData = "/wc5/getUserData.do?";
let setGameData = "/wc5/setUserData.do?";


/**
 * 存储用户数据
 * @param gameID 游戏ID
 * @param userID 用户ID
 * @param key 存储的key值
 * @param value 存储的value值
 * @param appKey 游戏appKey
 * @param token 用户token
 * @param callback 回调函数
 */
function setUserData(gameID,userID,key,value,appKey,token,callback) {
    let request = new  XMLHttpRequest();
    let url = DataStoreHost + setGameData;
    let object ={"key":key,"value":value};
    url += "gameID="+gameID+"&userID="+userID+"&dataList=["+JSON.stringify(object)+"]&sign="+getUserSign(appKey,gameID,userID,token);
    request.open("GET",url , true);
    request.onload = function () {
        if (request.readyState === 4 && (request.status >= 200 && request.status < 400)) {
            try{
                let response = request.responseText;
                let data = JSON.parse(response);
                callback(data);
            } catch(error){
                console.warn(error.message);
                callback(error);
            }
        }
    };
    request.send(null);
};

/**
 * 取用户数据
 * @param GameID 游戏ID
 * @param userID 用户ID
 * @param key 获取用户数的key
 * @param appKey 游戏appKey
 * @param token 用户token
 */
function getUserData(gameID,userID,key,appKey,token,callback) {
    let request = new  XMLHttpRequest();
    let url = DataStoreHost + getGameData;
    let object ={"key":key};
    url += "gameID="+gameID+"&userID="+userID+"&keyList=["+JSON.stringify(object)+"]&sign="+getUserSign(appKey,gameID,userID,token);
    request.open("GET",url , true);
    request.onload = function () {
        if (request.readyState === 4 && (request.status >= 200 && request.status < 400)) {
            try{
                let response = request.responseText;
                let data = JSON.parse(response);
                callback(data);
            } catch(error){
                console.warn(error.message);
                callback(error);
            }
        }
    };
    request.send(null);
};

/**
 * 获取用户存储的sign
 * @param appKey
 * @param gameID
 * @param userID
 * @param token
 */
function getUserSign(appKey,gameID,userID,token) {
    let params = appKey+"&gameID="+gameID+"&userID="+userID+"&"+token;
    let signstr = getSign(params);
    return signstr;
}

/**
 * md5加密
 * @param params
 * @returns {*}
 */
function getSign (params) {
    let md5Str = hex_md5(params);
    console.log(md5Str);
    return md5Str;
};


window.setUserData = setUserData;
window.getUserData = getUserData;
window.getSign = getSign;
window.getUserSign = getUserSign;