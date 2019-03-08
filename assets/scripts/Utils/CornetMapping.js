let GLB = require("../interface/Glb");

let CornetMappingHost = GLB.platform === "release"? "http://vsopen.matchvs.com":"http://alphavsopen.matchvs.com";
let shortCreate = "/extra/shortCreate?"; // 短号生成
let shortQuery = "/extra/shortQuery?"; //短号还原


/**
 * 生成短房间号
 * @param gameID 游戏ID
 * @param userID 用户ID
 * @param expire 短号过期时间，秒
 * @param longstr 	长字符串，例如 roomID、teamID
 * @param appKey 游戏appKey
 * @param token 用户token
 * @param length 短号长度，默认6位，最长10位，最小1位
 * @param callback 回调函数
 * @param seq 请求序号，每次请求递增变化由发起方自行维护  可选参数
 * @param ts 请求时间戳，精确到秒  可选参数
 */
function shortCreateRoomID(gameID,userID,expire,longstr,appKey,token,length,callback,seq,ts) {
    let request = new XMLHttpRequest();
    let url = CornetMappingHost + shortCreate;
    url += "&userID="+userID+"&mode="+1+"&sign="+getShortCreateUserSign(token,appKey,expire,gameID,longstr,seq,ts,userID);
    request.open("post",url , true);
    request.setRequestHeader("Content-Type", "application/json");
    request.onreadystatechange = function () {
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
    let jsonParam ={
        gameID:gameID,
        longstr:longstr,
        expire:expire,
        length:length,
    };
    request.send(JSON.stringify(jsonParam));
};

/**
 * 还原短房间号
 * @param gameID 游戏ID
 * @param userID 用户ID
 * @param shortstr 生成的短房间号
 * @param appKey 游戏appKey
 * @param token 用户token
 * @param callback 回调函数
 * @param seq 	请求序号，每次请求递增变化由发起方自行维护  可选参数
 * @param ts 请求时间戳，精确到秒 可选参数
 */
function shortQueryRoomID(gameID,userID,shortstr,appKey,token,callback,seq,ts) {
    let request = new XMLHttpRequest();
    let url = CornetMappingHost + shortQuery;
    url += "&userID="+userID+"&mode="+1+"&sign="+getShortQueryUserSign(token,appKey,gameID,seq,shortstr,ts,userID);
    request.open("post",url , true);
    request.setRequestHeader("Content-Type", "application/json");
    request.onreadystatechange = function () {
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
    let jsonParam ={
        gameID:gameID,
        shortstr:shortstr,
    };
    request.send(JSON.stringify(jsonParam));
};



/**
 * 生成短房间号普通用户sign生成
 * @param token 用户token
 * @param appKey 游戏appKey
 * @param gameID 游戏ID
 * @param seq 请求序号，每次请求递增变化由发起方自行维护   可选参数
 * @param shortstr 生成的短房间号
 * @param ts 请求时间戳，精确到秒    可选参数
 * @param userID 用户ID
 * @returns {*}
 */
function getShortQueryUserSign(token,appKey,gameID,seq,shortstr,ts,userID) {
    let signStr;
    if (seq === undefined || ts === undefined) {
        signStr = hex_md5(appKey+"&gameID="+gameID+"&shortstr="+shortstr+"&userID="+userID+"&"+token);
    } else {
        signStr = hex_md5(appKey+"&gameID="+gameID+"&seq="+seq+"&shortstr="+shortstr+"&ts="+ts+"&userID="+userID+"&"+token);
    }
    return signStr;
};


/**
 * 生成短房间号普通用户sign生成
 * @param token 用户token
 * @param appKey 游戏appKey
 * @param expire 	短号过期时间
 * @param gameID 游戏ID
 * @param longstr 房间号或小队号
 * @param seq 请求序号，每次请求递增变化由发起方自行维护   可选参数
 * @param ts 请求时间戳，精确到秒    可选参数
 * @param userID 用户ID
 * @returns {*}
 */
function getShortCreateUserSign(token,appKey,expire,gameID,longstr,seq,ts,userID) {
    console.log("token",token);
    let signStr;
    if (seq === undefined || ts === undefined) {
        signStr = hex_md5(appKey+"&expire="+expire+"&gameID="+gameID+"&longstr="+longstr+"&userID="+userID+"&"+token);
    } else  {
        signStr = hex_md5(appKey+"&expire="+expire+"&gameID="+gameID+"&longstr="+longstr+"&seq="+seq+"&ts="+ts+"&userID="+userID+"&"+token);
    }
    return signStr;
}



window.getShortCreateUserSign = getShortCreateUserSign;
window.shortCreateRoomID = shortCreateRoomID;
window.shortQueryRoomID = shortQueryRoomID;
window.getShortQueryUserSign = getShortQueryUserSign;
