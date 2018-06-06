var mvs = require("Matchvs");
var msg = require("MatvhsMessage");
var GLB = require("Glb");
function MatchvsDemoResponse() {

}

//使用外部传递的原型进行传递事件
MatchvsDemoResponse.prototype.init = function (Context) {
    this.context = Context;
};

/**
 * 绑定所有的回调事件
 */
MatchvsDemoResponse.prototype.bind = function () {
    mvs.response.initResponse = this.initResponse.bind(this);
    mvs.response.registerUserResponse = this.registerUserResponse.bind(this);
    mvs.response.loginResponse = this.loginResponse.bind(this);
    mvs.response.reconnectResponse = this.reconnectResponse.bind(this);
};

/**
 * 初始化回调
 */
MatchvsDemoResponse.prototype.initResponse =function (status) {
    if (status == 200) {
        console.log("初始化成功");
        console.log(this.context);
        this.context.node.emit(msg.MATCHVS_INIT, {
            msg: status,
        });
    } else {
        console.log("初始化失败"+status);
    }
};

/**
* 注册回调
*/
MatchvsDemoResponse.prototype.registerUserResponse = function (userInfo) {
    if (userInfo.status == 0) {
        console.log("注册成功");
        console.log(this.context);
        this.context.node.emit(msg.MATCHVS_REGISTER_USER, {
            msg: userInfo,
        })
    } else {
        console.log("注册失败"+userInfo.status);
    }
};

/**
*  登录回调
*/
MatchvsDemoResponse.prototype.loginResponse = function (loginRsp) {
    if (loginRsp.status == 200) {
        console.log("登录成功")
        this.context.node.emit(msg.MATCHVS_LOGIN, {msg:loginRsp})
    } else {
        console.log("登录失败"+ loginRsp.status);
    }
};

/**
 * 重连回调
 * @param status
 * @param roomUserInfoList
 * @param roomInfo
 */
MatchvsDemoResponse.prototype.reconnectResponse = function (status,roomUserInfoList,roomInfo) {
    if(status == 200) {
        console.log("重连成功");
    } else {
        console.log("重连失败"+status);
    }
};


module.exports = MatchvsDemoResponse;

