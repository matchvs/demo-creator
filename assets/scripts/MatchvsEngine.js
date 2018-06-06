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
}


/**
 * 
 * @returns {number}
 */
MatchvsDemoEngine.prototype.joinRandomRoom = function(){
    this._forEachResponse(function(res) {
        setTimeout(function(){
            var roomInfo = {
                status: 0,
                userInfoList: [
                    {userID: 10086,userProfile: '张三'},
                    {userID: 10087,userProfile: '李四'},
                    {userID: 10088,userProfile: '王五'},
                ],
                roomInfo: {
                    rootID: 1028374,
                    rootProperty: "好房间",
                    owner: 10086,
                }
            };
            res && res.roomJoinResponse(roomInfo);
        }, 100);
    });
    return 0;
};

MatchvsDemoEngine.prototype._forEachResponse = function(func) {
    if (this.responses) {
        for(var i = 0; i<this.responses.length; i++) {
            this.responses[i] && func(this.responses[i]);
        }
    }
};

MatchvsDemoEngine.prototype.joinOver = function(){
    return 0;
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

module.exports = MatchvsDemoEngine;