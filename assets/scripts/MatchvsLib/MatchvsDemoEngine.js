let mvs = require("Matchvs");
let Glb = require("../interface/Glb");
let response = require("MatchvsDemoResponse");

function MatchvsDemoEngine() {

}

/**
 * 初始化
 * @param channel
 * @param platform
 * @param gameID
 */
MatchvsDemoEngine.prototype.init = function(channel, platform){
        response.prototype.bind();
        let gameVersion = 1;
        let result = mvs.engine.init(mvs.response, channel, platform,Glb.gameID,Glb.appKey,gameVersion);
        console.log("初始化result"+result);
        return result;
};

/**
 * 独立部署使用的初始化接口
 * @param {string} endPoint
 * @param {number} gameID
 */
MatchvsDemoEngine.prototype.premiseInit = function (endPoint, gameID) {
    response.prototype.bind();
    let result = mvs.engine.premiseInit(mvs.response, endPoint, gameID);
    console.log("独立部署初始化result"+result);
    return result;
};

/**
 * 注册
 * @returns {number|*}
 */
MatchvsDemoEngine.prototype.registerUser = function() {
    let result = mvs.engine.registerUser();
    console.log("注册result"+result);
    return result;
};

/**
 * 登录
 * @param userID
 * @param token
 * @returns {DataView|*|number|void}
 */
MatchvsDemoEngine.prototype.login = function(userID,token){
    let DeviceID = 'abcdef';
    let result = mvs.engine.login(userID, token,DeviceID);
    console.log("登录result"+result);
    return result;
};

/**
 * 断线重连
 * @returns {*|number}
 */
MatchvsDemoEngine.prototype.reconnect = function () {
    let result = mvs.engine.reconnect();
    console.log("重连result"+result);
    return result;
};

/**
 * 退出游戏
 * @returns {DataView|number|*}
 */
MatchvsDemoEngine.prototype.logout = function () {
    let result = mvs.engine.logout("退出游戏");
    console.log('退出游戏result'+result);
    return result;
};

/**
 * 反初始化
 */
MatchvsDemoEngine.prototype.uninit =function () {
    let result = mvs.engine.uninit();
    console.log('反初始化result'+result);
    return result;
};

/**
 * 随机匹配
 * @param mxaNumer 房间最大人数
 * @param profile 负载消息，可以用来传送玩家姓名 等级等信息
 * @returns {number}
 */
MatchvsDemoEngine.prototype.joinRandomRoom = function(mxaNumer,profile){
    let result = mvs.engine.joinRandomRoom(mxaNumer, MatchvsDemoEngine.prototype.getUserProfile(profile));
    console.log("随机匹配result"+result);
    return result;
};

/**
 * 属性匹配
 * @param matchinfo
 * @param profile
 */
MatchvsDemoEngine.prototype.joinRoomWithProperties = function (matchinfo,profile) {
    let result = mvs.engine.joinRoomWithProperties(matchinfo, MatchvsDemoEngine.prototype.getUserProfile(profile));
    console.log("属性匹配result"+result);
    return result;
};

/**
 * 离开房间
 */
MatchvsDemoEngine.prototype.leaveRoom = function () {
    let obj = {name: Glb.name, profile: '主动离开了房间'};
    let result = mvs.engine.leaveRoom(JSON.stringify(obj));
    console.log(Glb.name+"主动离开房间result"+result);
    return result;
};

/**
 * 关闭房间
 * @returns {number}
 */
MatchvsDemoEngine.prototype.joinOver = function(){
    let result = mvs.engine.joinOver("关闭房间");
    console.log("joinOver result"+result);
    return result;
};

/**
 * 打开房间
 * @returns {number}
 */
MatchvsDemoEngine.prototype.joinOpen = function(){
    let result = mvs.engine.joinOpen("打开房间");
    console.log("joinOpen result"+result);
    return result;
};

/**
 * 获取房间列表扩展接口
 * @param roomFilter
 * @returns {*|number}
 */
MatchvsDemoEngine.prototype.getRoomListEx = function (roomFilter) {
    let result = mvs.engine.getRoomListEx(roomFilter);
    console.log("加载房间列表扩展接口 result"+result);
    return result;
};

/**
 * 加入指定房间
 * @param roomID
 * @param profile
 */
MatchvsDemoEngine.prototype.joinRoom = function (roomID,profile) {
    let result = mvs.engine.joinRoom(roomID, MatchvsDemoEngine.prototype.getUserProfile(profile));
    console.log("加入指定房间 result"+result);
    return result;
};

/**
 * 创建指定房间
 * @param roomFilter
 * @param profile
 * @returns {number}
 */
MatchvsDemoEngine.prototype.createRoom = function (roomFilter,profile) {
    let result = mvs.engine.createRoom(roomFilter, MatchvsDemoEngine.prototype.getUserProfile(profile));
    console.log("创建指定类型房间 result"+result);
    return result;
};

/**
 * 踢出指定玩家
 * @param userID
 * @param profile
 */
MatchvsDemoEngine.prototype.kickPlayer = function (userID,profile) {
    let obj = {name: profile, profile: profile + '被踢出了房间'};
    let result = mvs.engine.kickPlayer(userID, JSON.stringify(obj));
    console.log(userID+"被踢出游戏 result"+result);
    return result;
};

/**
 * 修改房间属性
 * @param roomID
 * @param roomProperty
 * @returns {*}
 */
MatchvsDemoEngine.prototype.setRoomProperty = function(roomID,roomProperty){
    let result = mvs.engine.setRoomProperty(roomID, roomProperty);
    console.log("修改房间属性 result"+ result);
    return result;
};


/**
 * 修改房间属性
 * @param roomID
 * @returns {*}
 */
MatchvsDemoEngine.prototype.getRoomDetail = function(roomID){
    let result = mvs.engine.getRoomDetail(roomID);
    console.log("获取房间详情 result"+ result);
    return result;
};

MatchvsDemoEngine.prototype.sendEvent = function (msg) {
    let data = mvs.engine.sendEvent(msg);
    // console.log("发送信息 result"+ data.result);
    return data.result;
};

/**
 * 发送消息扩展
 * @param type 消息类型。0表示转发给房间成员；1表示转发给game server；2表示转发给房间成员及game server
 * @param msg 消息内容
 * @returns {*}
 */
MatchvsDemoEngine.prototype.sendEventEx = function (type,msg) {
    let data = mvs.engine.sendEventEx(type, msg, 1, []);
    return data.result;
};
/**
 * 设置帧率
 * @param frameRate
 * @returns {DataView|number|*}
 */
MatchvsDemoEngine.prototype.setFrameSync = function (frameRate) {
    let enableGS = 1;
    let other = {cacheFrameMS:0};
    let result = mvs.engine.setFrameSync(frameRate,enableGS,other);
    console.log('设置帧率 result：'+result);
    return result;
};

/**
 * 帧同步发送
 * @param cpProto
 * @returns {DataView|number|*}
 */
MatchvsDemoEngine.prototype.sendFrameEvent = function (cpProto) {
    let op = 0; // 0-只发送客户端 1-只发送GS 2-客户端和GS
    let result = mvs.engine.sendFrameEvent(cpProto,op);
    return result;
};


    /**
 * 获取进入房间负载信息
 * @param profile
 * @returns {string}
 */
MatchvsDemoEngine.prototype.getUserProfile = function (profile) {
    let userProfile = {name: Glb.name, avatar: Glb.avatar, profile: profile};
    let userProfileStr = JSON.stringify(userProfile);
    console.log("进入房间负载信息"+userProfileStr);
    return userProfileStr;
};



module.exports = MatchvsDemoEngine;