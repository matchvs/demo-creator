var mvs = require("Matchvs");
var msg = require("MatvhvsMessage");
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
    mvs.response.errorResponse = this.errorResponse.bind(this);
    mvs.response.joinRoomResponse = this.joinRoomResponse.bind(this)
    mvs.response.joinRoomNotify = this.joinRoomNotify.bind(this);
    mvs.response.leaveRoomResponse = this.leaveRoomResponse.bind(this);
    mvs.response.leaveRoomNotify = this.leaveRoomNotify.bind(this);
    mvs.response.joinOpenResponse = this.joinOpenResponse.bind(this);
    mvs.response.joinOpenNotify = this.joinOpenNotify.bind(this);
    mvs.response.joinOverResponse = this.joinOverResponse.bind(this);
    mvs.response.joinOverNotify = this.joinOverNotify.bind(this);
    mvs.response.getRoomListExResponse = this.getRoomListExResponse.bind(this);
    mvs.response.createRoomResponse = this.createRoomResponse.bind(this);
    mvs.response.kickPlayerResponse = this.kickPlayerResponse.bind(this);
    mvs.response.kickPlayerNotify = this.kickPlayerNotify.bind(this);
    mvs.response.getRoomDetailResponse = this.getRoomDetailResponse.bind(this);
    mvs.response.setRoomPropertyResponse = this.setRoomPropertyResponse.bind(this);
    mvs.response.setRoomPropertyNotify = this.setRoomPropertyNotify.bind(this);
    mvs.response.sendEventResponse = this.sendEventResponse.bind(this);
    mvs.response.sendEventNotify = this.sendEventNotify.bind(this);
    mvs.response.frameUpdate = this.frameUpdate.bind(this);
    mvs.response.networkStateNotify = this.networkStateNotify.bind(this);
    mvs.response.setFrameSyncResponse = this.setFrameSyncResponse.bind(this);
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
    if (userInfo.id != undefined) {
        console.log("注册成功");
        if (userInfo.name != "") {
            GLB.name = userInfo.name;
        } else {
            GLB.name = userInfo.id;
        }
        GLB.avatar = userInfo.avatar;
        GLB.userID = userInfo.id;
        this.context.node.emit(msg.MATCHVS_REGISTER_USER, {msg: userInfo,});
    } else {
        console.log("注册失败"+userInfo.status);
    }
};

/**
*  登录回调
*/
MatchvsDemoResponse.prototype.loginResponse = function (MsLoginRsp) {
    if (MsLoginRsp.status == 200) {
        console.log("登录成功");
        this.context.node.emit(msg.MATCHVS_LOGIN, {MsLoginRsp});
    } else {
        console.log("登录失败"+ MsLoginRsp.status);
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
        roomUserInfoList.roomID = roomInfo.roomID;
        roomUserInfoList.roomProperty = roomInfo.roomProperty;
        roomUserInfoList.state = roomInfo.state;
        roomUserInfoList.ownerID = roomInfo.ownerID;
        this.context.node.emit(msg.MATCHVS_RE_CONNECT, {roomUserInfoList});
    } else {
        console.log("重连失败"+status);
    }
};

/**
 * 错误回调
 * @param error
 */
MatchvsDemoResponse.prototype.errorResponse = function (errorCode,errorMsg) {
    console.log("发生错误了！！！！！！！！！！！！！");
    this.context.node.emit(msg.MATCHVS_ERROE_MSG, {errorCode,errorMsg});
};

/**
 * 进入房间回调
 * @param status
 * @param userInfoList
 * @param roomInfo
 */
MatchvsDemoResponse.prototype.joinRoomResponse = function (status, userInfoList, roomInfo) {
    if (status == 200) {
        console.log("进入房间成功");
        userInfoList.roomID = roomInfo.roomID;
        this.context.node.emit(msg.MATCHVS_JOIN_ROOM_RSP,{userInfoList});
    } else {
        console.log("进入房间失败"+status);
    }
};

/**
 * 其他玩家进入房间通知
 * @param roomUserInfo
 */
MatchvsDemoResponse.prototype.joinRoomNotify = function (roomUserInfo) {
    console.log(roomUserInfo.userId+"加入了房间");
    this.context.node.emit(msg.MATCHVS_JOIN_ROOM_NOTIFY,{roomUserInfo});
};

/**
 * 房间打开通知
 * @param notify
 */
MatchvsDemoResponse.prototype.joinOpenNotify = function (notify) {
    console.log("房间打开通知");
    this.context.node.emit(msg.MATCHVS_JOIN_OPEN_NOTIFY,{notify});
};

/**
 * 房间打开回调
 * @param rep
 */
MatchvsDemoResponse.prototype.joinOpenResponse =function (rsp) {
    if (rsp.status == 200) {
        console.log("房间打开成功");
        this.context.node.emit(msg.MATCHVS_JOIN_OPEN_RSP,{rsp});
    } else {
        console.log("房间打开失败"+rsp.status);
    }

};

/**
 * 房间关闭回调
 * @param rep
 */
MatchvsDemoResponse.prototype.joinOverResponse = function (rsp) {
    if(rsp.status == 200) {
        console.log("房间关闭成功");
        this.context.node.emit(msg.MATCHVS_JOIN_OVER_RSP,{rsp});
    } else  {
        console.log("房间关闭失败"+rsp.status);
    }
};
/**
 * 房间关闭通知
 * @param notify
 */
MatchvsDemoResponse.prototype.joinOverNotify = function (notify) {
    console.log("房间关闭通知");
    this.context.node.emit(msg.MATCHVS_JOIN_OVER_NOTIFY,{notify});
};

/**
 * 离开房间回调
 * @param leaveRoomRsp
 */
MatchvsDemoResponse.prototype.leaveRoomResponse = function (leaveRoomRsp) {
    if (leaveRoomRsp.status == 200) {
        console.log("离开房间成功");
        this.context.node.emit(msg.MATCHVS_LEAVE_ROOM,{leaveRoomRsp});
    } else {
        console.log("离开房间失败"+leaveRoomRsp.status);
    }
};

/**
 * 离开房间通知
 * @param leaveRoomInfo
 */
MatchvsDemoResponse.prototype.leaveRoomNotify = function (leaveRoomInfo) {
    console.log(JSON.stringify(leaveRoomInfo));
    this.context.node.emit(msg.MATCHVS_LEAVE_ROOM_NOTIFY,{leaveRoomInfo});
};

/**
 * 获取房间列表扩展接口
 * @param rep
 */
MatchvsDemoResponse.prototype.getRoomListExResponse = function (rsp) {
    if (rsp.status == 200) {
        console.log("获取房间列表扩展接口成功");
        this.context.node.emit(msg.MATCHVS_ROOM_LIST_EX,{rsp});
    } else {
        console.log("获取房间列表扩展接口失败 status" + rsp.status);
    }

};

/**
 * 创建指定类型房间回调
 * @param rsp
 */
MatchvsDemoResponse.prototype.createRoomResponse = function (rsp) {
    if (rsp.status == 200) {
        console.log("创建指定类型房间接口成功");
        this.context.node.emit(msg.MATCHVS_CREATE_ROOM,{rsp});
    } else {
        console.log("创建指定类型房间接口失败 status" + rsp.status);
    }
};

/**
 * 踢出指定玩家回调
 * @param kickPlayerRsp
 */
MatchvsDemoResponse.prototype.kickPlayerResponse = function (kickPlayerRsp) {
    if (kickPlayerRsp.status == 200) {
        console.log("踢出指定玩家成功");
        this.context.node.emit(msg.MATCHVS_KICK_PLAYER, {kickPlayerRsp})
    } else {
        console.log("踢出指定玩家失败 status" + kickPlayerRsp.status);
    }
};

/**
 * 踢出指定玩家通知
 * @param kickPlayerNotify
 */
MatchvsDemoResponse.prototype.kickPlayerNotify = function (kickPlayerNotify) {
    console.log("踢出指定玩家通知");
    this.context.node.emit(msg.MATCHVS_KICK_PLAYER_NOTIFY, {kickPlayerNotify})
};

/**
 * 修改房间属性回调
 * @param rsp
 */
MatchvsDemoResponse.prototype.setRoomPropertyResponse = function (rsp) {
    if (rsp.status == 200) {
        console.log("修改房间属性成功");
        this.context.node.emit(msg.MATCHVS_SET_ROOM_PROPETY, {rsp})
    } else {
        console.log("修改房间属性失败 status" + rsp.status);
    }
};
/**
 * 修改房间属性通知
 * @param rsp
 */
MatchvsDemoResponse.prototype.setRoomPropertyNotify = function (rsp) {
    console.log("修改房间属性通知");
    this.context.node.emit(msg.MATCHVS_SET_ROOM_PROPETY_NOTIFY, {rsp})
};

/**
 * 获取房间详情
 * @param rsp
 */
MatchvsDemoResponse.prototype.getRoomDetailResponse = function (rsp) {
    if (rsp.status == 200) {
        this.context.node.emit(msg.MATCHVS_ROOM_DETAIL,{rsp});
        console.log("获取房间详情成功");
    } else {
        console.log("获取房间详情失败 status "+ rsp.status);
    }
};

/**
 * 发送消息
 * @param sendEventRsp
 */
MatchvsDemoResponse.prototype.sendEventResponse = function (sendEventRsp) {
    if (sendEventRsp.status == 200) {
        this.context.node.emit(msg.MATCHVS_SEND_EVENT_RSP,{sendEventRsp});
        // console.log("发送消息Response");
    } else {
        console.log("发送消息失败 status"+sendEventRsp.status);
    }
};

/**
 * 发送消息通知
 * @param eventInfo
 */
MatchvsDemoResponse.prototype.sendEventNotify = function (eventInfo) {
    // console.log("收到信息");
    this.context.node.emit(msg.MATCHVS_SEND_EVENT_NOTIFY, {eventInfo});
};

MatchvsDemoResponse.prototype.setFrameSyncResponse = function (rsp) {
    this.context.node.emit(msg.MATCHVS_SET_FRAME_SYNC_RSP,rsp);
    if (rsp.mStatus == 200) {
        console.log('帧率设置成功');
    } else if (rsp.mStatus ==519 ) {
        console.log('帧率设置失败,重复设置');
    } else if (rsp.mStatus == 500) {
        console.log('帧率设置失败,帧率需被1000整除');
    }
}

/**
 * 帧同步回调
 * @param data
 */
MatchvsDemoResponse.prototype.frameUpdate = function (data) {
    this.context.node.emit(msg.MATCHVS_FRAME_UPDATE, data);
};

MatchvsDemoResponse.prototype.networkStateNotify = function (netNotify) {
    console.log("netNotify.owner:" + netNotify.owner);
    this.context.node.emit(msg.MATCHVS_NETWORK_STATE_NOTIFY,netNotify);
};

MatchvsDemoResponse.prototype.onMsg = function (buf) {
    var data = JSON.parse(buf);
    if (data.status == 0) {
        var val = data.data;
        this.context.node.emit(msg.MATCHVS_WX_BINDING,{val})
    } else {

    }
};

MatchvsDemoResponse.prototype.onErr = function (errCode,errMsg) {
    console.log(errCode,errMsg+"11111111111111111111111");
};

module.exports = MatchvsDemoResponse;

