var mvs = require("Matchvs");
var Glb = require("Glb");
var response = require("MatchvsDemoResponse");
function MatchvsDemoEngine() {
    console.log('MatchvsDemoEngine init');
}

/**
 * 初始化
 * @param channel
 * @param platform
 * @param gameID
 */
MatchvsDemoEngine.prototype.init = function(channel, platform, gameID){
    console.log(response);
    response.prototype.bind();
    var result = mvs.engine.init(mvs.response,channel,platform,gameID);
    console.log("初始化result"+result);
    return result;
};

/**
 * 注册
 * @returns {number|*}
 */
MatchvsDemoEngine.prototype.registerUser = function() {
    var result = mvs.engine.registerUser();
    console.log("注册result"+result);
    return result;
};

/**
 * 注册
 * @param userID
 * @param token
 * @returns {DataView|*|number|void}
 */
MatchvsDemoEngine.prototype.login = function(userID,token){
    var DeviceID = 'abcdef';
    var gatewayID = 0;
    var result = mvs.engine.login(userID,token,Glb.gameID,Glb.gameVersion,
        Glb.appKey,Glb.secret,DeviceID,gatewayID);
    console.log("登录result"+result);
    return result;
};

/**
 * 断线重连
 * @returns {*|number}
 */
MatchvsDemoEngine.prototype.reconnect = function () {
    var result = mvs.engine.reconnect();
    console.log("重连result"+result);
    return result;
};

/**
 * 退出游戏
 * @returns {DataView|number|*}
 */
MatchvsDemoEngine.prototype.logout = function () {
    var result = mvs.engine.logout("退出游戏");
    console.log('退出游戏result'+result);
    return result;
};

/**
 * 反初始化
 */
MatchvsDemoEngine.prototype.uninit =function () {
    var result = mvs.engine.uninit();
    console.log('反初始化result'+result);
    return result;
}

/**
 * 随机匹配
 * @param mxaNumer 房间最大人数
 * @returns {number}
 */
MatchvsDemoEngine.prototype.joinRandomRoom = function(mxaNumer,profile){
    var result = mvs.engine.joinRandomRoom(mxaNumer,MatchvsDemoEngine.prototype.getUserProfile(profile));
    console.log("随机匹配result"+result)
    return result;
};

/**
 * 离开房间
 */
MatchvsDemoEngine.prototype.leaveRoom = function () {
    var result = mvs.engine.leaveRoom(Glb.name+"主动离开了房间");
    console.log(Glb.name+"主动离开房间result"+result);
    return result;
};

/**
 * 关闭房间
 * @returns {number}
 */
MatchvsDemoEngine.prototype.joinOver = function(){
    var result = mvs.engine.joinOver("关闭房间");
    console.log("joinOver result"+result);
    return result;
};

/**
 * 打开房间
 * @returns {number}
 */
MatchvsDemoEngine.prototype.joinOpen = function(){
    var result = mvs.engine.joinOpen("打开房间");
    console.log("joinOpen result"+result);
    return result;
};

MatchvsDemoEngine.prototype.sendEvent = function(event){
    var mockEventId = new Date().getTime();
    this._forEachResponse(function(res){
        setTimeout(function(){
            res.sendEventRsp && res.sendEventRsp({"status": 0, "seq": mockEventId});
        }, 100);
    });
    return {status: 0, seq: mockEventId};
};

/**
 * 获取进入房间负载信息
 * @param profile
 * @returns {string}
 */
MatchvsDemoEngine.prototype.getUserProfile = function (profile) {
    var userProfile = {name:Glb.name,avatar:Glb.avatar,profile:profile};
    var userProfileStr = JSON.stringify(userProfile);
    console.log("进入房间负载信息"+userProfileStr);
    return userProfileStr;
};
module.exports = MatchvsDemoEngine;