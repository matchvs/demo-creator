let mvs = require("Matchvs");
let msg = require("MatvhvsMessage");
let GLB = require("../interface/Glb");
function MatchvsDemoResponse() {

}

// //使用外部传递的原型进行传递事件
// MatchvsDemoResponse.prototype.init = function (Context) {
//     this.context = Context;
// };

/**
 * 绑定所有的回调事件
 */
MatchvsDemoResponse.prototype.bind = function () {
    mvs.response.initResponse = this.initResponse.bind(this);
    mvs.response.registerUserResponse = this.registerUserResponse.bind(this);
    mvs.response.loginResponse = this.loginResponse.bind(this);
    mvs.response.logoutResponse = this.logoutResponse.bind(this);
    mvs.response.reconnectResponse = this.reconnectResponse.bind(this);
    mvs.response.errorResponse = this.errorResponse.bind(this);
    mvs.response.joinRoomResponse = this.joinRoomResponse.bind(this);
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
    try{
        if (status === 200) {
            console.log("初始化成功");
            MatchvsDemoResponse.prototype.sendEventToUI(msg.MATCHVS_INIT,{status:status,type:msg.MATCHVS_INIT});
        } else {
            console.log("初始化失败"+status);
        }
    } catch(error){
        console.log(error.message);
    }

};

/**
* 注册回调
*/
MatchvsDemoResponse.prototype.registerUserResponse = function (userInfo) {
    if (userInfo.status === 0) {
        console.log("注册成功");
        if (userInfo.name !== "") {
            GLB.name = userInfo.name;
        } else {
            GLB.name = userInfo.userID;
        }
        GLB.avatar = userInfo.avatar;
        GLB.userID = userInfo.userID;
        MatchvsDemoResponse.prototype.sendEventToUI(msg.MATCHVS_REGISTER_USER,{userInfo:userInfo,type:msg.MATCHVS_REGISTER_USER});
    } else {
        console.log("注册失败"+userInfo.status);
    }
};

/**
*  登录回调
*/
MatchvsDemoResponse.prototype.loginResponse = function (MsLoginRsp) {
    if (MsLoginRsp.status === 200) {
        console.log("登录成功");
        MatchvsDemoResponse.prototype.sendEventToUI(msg.MATCHVS_LOGIN,{MsLoginRsp:MsLoginRsp,type:msg.MATCHVS_LOGIN});
    } else {
        console.log("登录失败"+ MsLoginRsp.status);
    }
};


MatchvsDemoResponse.prototype.logoutResponse =function (status) {

};

/**
 * 重连回调
 * @param status
 * @param roomUserInfoList
 * @param roomInfo
 */
MatchvsDemoResponse.prototype.reconnectResponse = function (status,roomUserInfoList,roomInfo) {
    if(status === 200) {
        console.log("重连成功");
        roomUserInfoList.roomID = roomInfo.roomID;
        roomUserInfoList.roomProperty = roomInfo.roomProperty;
        roomUserInfoList.state = roomInfo.state;
        roomUserInfoList.ownerID = roomInfo.ownerID;
        MatchvsDemoResponse.prototype.sendEventToUI(msg.MATCHVS_RE_CONNECT,{roomUserInfoList:roomUserInfoList,type:msg.MATCHVS_RE_CONNECT});
    } else {
        console.log("重连失败"+status);
    }
};

/**
 * 错误回调
 * @param errorCode
 * @param errorMsg
 */
MatchvsDemoResponse.prototype.errorResponse = function (errorCode,errorMsg) {
    console.log("发生错误了！！！");
    MatchvsDemoResponse.prototype.sendEventToUI(msg.MATCHVS_ERROE_MSG, {errorCode,errorMsg,type:msg.MATCHVS_ERROE_MSG});
};

/**
 * 进入房间回调
 * @param status
 * @param userInfoList
 * @param roomInfo
 */
MatchvsDemoResponse.prototype.joinRoomResponse = function (status, userInfoList, roomInfo) {
    if (status === 200) {
        console.log("进入房间成功");
        userInfoList.roomID = roomInfo.roomID;
        MatchvsDemoResponse.prototype.sendEventToUI(msg.MATCHVS_JOIN_ROOM_RSP,{userInfoList:userInfoList,type:msg.MATCHVS_JOIN_ROOM_RSP});
        // var player ={userID:GLB.userID,userName: GLB.name};
        // MatchvsDemoResponse.prototype.roomUserInfoListChangeNotify(userInfoList,"joinRoom",player,roomInfo.owner);
    } else {
        console.log("进入房间失败"+status);
    }
};

/**
 * 其他玩家进入房间通知
 * @param roomUserInfo
 */
MatchvsDemoResponse.prototype.joinRoomNotify = function (roomUserInfo) {
    console.log(roomUserInfo.userID+"加入了房间");
    // var player ={userID:roomUserInfo.userID,userName: roomUserInfo.userProfile};
    // MatchvsDemoResponse.prototype.roomUserInfoListChangeNotify(roomUserInfo,"joinRoomNotify",player,0);
    MatchvsDemoResponse.prototype.sendEventToUI(msg.MATCHVS_JOIN_ROOM_NOTIFY,{roomUserInfo:roomUserInfo,type:msg.MATCHVS_JOIN_ROOM_NOTIFY});
};

/**
 * 房间打开通知
 * @param notify
 */
MatchvsDemoResponse.prototype.joinOpenNotify = function (notify) {
    console.log("房间打开通知");
    MatchvsDemoResponse.prototype.sendEventToUI(msg.MATCHVS_JOIN_OPEN_NOTIFY,{notify,type:msg.MATCHVS_JOIN_OPEN_NOTIFY});
};

/**
 * 房间打开回调
 * @param rsp
 */
MatchvsDemoResponse.prototype.joinOpenResponse =function (rsp) {
    if (rsp.status === 200) {
        console.log("房间打开成功");
        MatchvsDemoResponse.prototype.sendEventToUI(msg.MATCHVS_JOIN_OPEN_RSP,{rsp,type:msg.MATCHVS_JOIN_OPEN_RSP});
    } else {
        console.log("房间打开失败"+rsp.status);
    }

};

/**
 * 房间关闭回调
 * @param rsp
 */
MatchvsDemoResponse.prototype.joinOverResponse = function (rsp) {
    if(rsp.status === 200) {
        console.log("房间关闭成功");
        MatchvsDemoResponse.prototype.sendEventToUI(msg.MATCHVS_JOIN_OVER_RSP,{rsp,type:msg.MATCHVS_JOIN_OVER_RSP});
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
    MatchvsDemoResponse.prototype.sendEventToUI(msg.MATCHVS_JOIN_OVER_NOTIFY,{notify,type:msg.MATCHVS_JOIN_OVER_NOTIFY});
};

/**
 * 离开房间回调
 * @param leaveRoomRsp
 */
MatchvsDemoResponse.prototype.leaveRoomResponse = function (leaveRoomRsp) {
    if (leaveRoomRsp.status === 200) {
        console.log("离开房间成功");
        // var player ={userID:leaveRoomRsp.userID,userName: leaveRoomRsp.cpProto};
        // MatchvsDemoResponse.prototype.roomUserInfoListChangeNotify(leaveRoomRsp,"leaveRoom",player,0);
        MatchvsDemoResponse.prototype.sendEventToUI(msg.MATCHVS_LEAVE_ROOM,{leaveRoomRsp,type:msg.MATCHVS_LEAVE_ROOM});
    } else {
        console.log("离开房间失败"+leaveRoomRsp.status);
    }
};

/**
 * 离开房间通知
 * @param leaveRoomInfo
 */
MatchvsDemoResponse.prototype.leaveRoomNotify = function (leaveRoomInfo) {
    // var player ={userID:leaveRoomInfo.userID,userName: leaveRoomInfo.cpProto};
    // MatchvsDemoResponse.prototype.roomUserInfoListChangeNotify(leaveRoomInfo,"leaveRoom",player,leaveRoomInfo.owner);
    MatchvsDemoResponse.prototype.sendEventToUI(msg.MATCHVS_LEAVE_ROOM_NOTIFY,{leaveRoomInfo:leaveRoomInfo,type:msg.MATCHVS_LEAVE_ROOM_NOTIFY});
};

/**
 * 获取房间列表扩展接口
 * @param rsp
 */
MatchvsDemoResponse.prototype.getRoomListExResponse = function (rsp) {
    if (rsp.status === 200) {
        console.log("获取房间列表扩展接口成功");
        MatchvsDemoResponse.prototype.sendEventToUI(msg.MATCHVS_ROOM_LIST_EX,{rsp:rsp,type:msg.MATCHVS_ROOM_LIST_EX});
    } else {
        console.log("获取房间列表扩展接口失败 status" + rsp.status);
    }
};

/**
 * 创建指定类型房间回调
 * @param rsp
 */
MatchvsDemoResponse.prototype.createRoomResponse = function (rsp) {
    if (rsp.status === 200) {
        console.log("创建指定类型房间接口成功");
        // var player ={userID:GLB.userID,userName:  GLB.name};
        // MatchvsDemoResponse.prototype.roomUserInfoListChangeNotify([],"joinRoom",player,GLB.userID);
        MatchvsDemoResponse.prototype.sendEventToUI(msg.MATCHVS_CREATE_ROOM,{rsp:rsp,type:msg.MATCHVS_CREATE_ROOM});
    } else {
        console.log("创建指定类型房间接口失败 status" + rsp.status);
    }
};

/**
 * 踢出指定玩家回调
 * @param kickPlayerRsp
 */
MatchvsDemoResponse.prototype.kickPlayerResponse = function (kickPlayerRsp) {
    if (kickPlayerRsp.status === 200) {
        console.log("踢出指定玩家成功");
        // var player ={userID:kickPlayerRsp.userID,userName: ""};
        // MatchvsDemoResponse.prototype.roomUserInfoListChangeNotify(kickPlayerRsp,"leaveRoom",player,kickPlayerRsp.owner);
        MatchvsDemoResponse.prototype.sendEventToUI(msg.MATCHVS_KICK_PLAYER,{kickPlayerRsp:kickPlayerRsp,type:msg.MATCHVS_KICK_PLAYER} );
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
    // var player ={userID:kickPlayerNotify.userID,userName: kickPlayerNotify.cpProto};
    // MatchvsDemoResponse.prototype.roomUserInfoListChangeNotify(kickPlayerNotify,"leaveRoom",player,kickPlayerNotify.owner);
    MatchvsDemoResponse.prototype.sendEventToUI(msg.MATCHVS_KICK_PLAYER_NOTIFY, {kickPlayerNotify:kickPlayerNotify,type:msg.MATCHVS_KICK_PLAYER_NOTIFY});
};

/**
 * 修改房间属性回调
 * @param rsp
 */
MatchvsDemoResponse.prototype.setRoomPropertyResponse = function (rsp) {
    if (rsp.status === 200) {
        console.log("修改房间属性成功");
        MatchvsDemoResponse.prototype.sendEventToUI(msg.MATCHVS_SET_ROOM_PROPETY, {rsp:rsp,type:msg.MATCHVS_SET_ROOM_PROPETY});
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
    console.log(rsp.userID+"修改了房间属性，新的房间属性是"+rsp.roomProperty);
    MatchvsDemoResponse.prototype.sendEventToUI(msg.MATCHVS_SET_ROOM_PROPETY_NOTIFY, {rsp:rsp,type:msg.MATCHVS_SET_ROOM_PROPETY_NOTIFY});
};

/**
 * 获取房间详情
 * @param rsp
 */
MatchvsDemoResponse.prototype.getRoomDetailResponse = function (rsp) {
    if (rsp.status === 200) {
        MatchvsDemoResponse.prototype.sendEventToUI(msg.MATCHVS_ROOM_DETAIL,{rsp:rsp,type:msg.MATCHVS_ROOM_DETAIL});
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
    if (sendEventRsp.status === 200) {
        MatchvsDemoResponse.prototype.sendEventToUI(msg.MATCHVS_SEND_EVENT_RSP,{sendEventRsp,type:msg.MATCHVS_SEND_EVENT_RSP});
    } else {
        console.log("发送消息失败 status"+sendEventRsp.status);
    }
};

/**
 * 发送消息通知
 * @param eventInfo
 */
MatchvsDemoResponse.prototype.sendEventNotify = function (eventInfo) {
    MatchvsDemoResponse.prototype.sendEventToUI(msg.MATCHVS_SEND_EVENT_NOTIFY,{eventInfo:eventInfo,type:msg.MATCHVS_SEND_EVENT_NOTIFY});
};

MatchvsDemoResponse.prototype.setFrameSyncResponse = function (rsp) {
    MatchvsDemoResponse.prototype.sendEventToUI(msg.MATCHVS_SET_FRAME_SYNC_RSP,{rsp,type:msg.MATCHVS_SET_FRAME_SYNC_RSP});
    if (rsp.status === 200) {
        console.log('帧率设置成功');
    } else if (rsp.status === 519 ) {
        console.log('帧率设置失败,重复设置');
    } else if (rsp.status === 500) {
        console.log('帧率设置失败,帧率需被1000整除');
    }
};

/**
 * 帧同步回调
 * @param data
 */
MatchvsDemoResponse.prototype.frameUpdate = function (data) {
    MatchvsDemoResponse.prototype.sendEventToUI(msg.MATCHVS_FRAME_UPDATE, {data:data,type:msg.MATCHVS_FRAME_UPDATE});
};

MatchvsDemoResponse.prototype.networkStateNotify = function (netNotify) {
    console.log("netNotify.owner:" + netNotify.owner);
    MatchvsDemoResponse.prototype.sendEventToUI(msg.MATCHVS_NETWORK_STATE_NOTIFY,{netNotify:netNotify,type:msg.MATCHVS_NETWORK_STATE_NOTIFY});
};

MatchvsDemoResponse.prototype.onMsg = function (buf) {
    let data = JSON.parse(buf);
    MatchvsDemoResponse.prototype.sendEventToUI(msg.MATCHVS_WX_BINDING,{data:data.data,type:msg.MATCHVS_WX_BINDING});
};

let userList = new Array();
/**
 * 房间内玩家变化接口
 * @param data 进入房间的数据
 * @param action 动作类型 例如 加入  退出
 * @param userID 执行动作的玩家
 * @param ownerID 房间的房主ID
 */
MatchvsDemoResponse.prototype.roomUserInfoListChangeNotify = function (data,action,player,ownerID) {
    switch (action) {
        case "joinRoom":
            userList = data;
            userList.push(player);
            break;
        case "joinRoomNotify":
            userList.push(player);
            break;
        case "leaveRoom":
            for(var i = 0; i < userList.length;i++) {
                if (player.userID === userList[i].userID) {
                    userList.length = 0;
                    break;
                }
                if (userList[i].userID === player.userID) {
                    userList.splice(i,1);
                }
            }
            break;
    }
    userList.sort(MatchvsDemoResponse.prototype.sortNumber);
    for(var i = 0; i < userList.length;i++) {
        if (ownerID === userList[i].userID) {
            MatchvsDemoResponse.prototype.swapArray(userList,i,0);
        }
    }
    // MatchvsDemoResponse.prototype.sendEventToUI(msg.MATCHVS_ROOM_USERLIST_CHANGE_NOTIFY,{userList:userList,type:msg.MATCHVS_ROOM_USERLIST_CHANGE_NOTIFY});
};

/**
 * 排序
 * @param obj1
 * @param obj2
 * @returns {number}
 */
MatchvsDemoResponse.prototype.sortNumber = function(obj1,obj2) {
    var userID1 = obj1.userID;
    var userID2 = obj2.userID;
    if (userID1 < userID2) {
        return -1;
    } else if (userID1 > userID2) {
        return 1;
    } else {
        return 0;
    }
};

/**
 * 交换位置，把房主放到第一位
 * @param arr
 * @param index1
 * @param index2
 * @returns {*}
 */
MatchvsDemoResponse.prototype.swapArray = function(arr, index1, index2) {
    arr[index1] = arr.splice(index2, 1, arr[index1])[0];
    return arr;
};

/**
 * 全局发送消息
 * @param action
 * @param data
 */
MatchvsDemoResponse.prototype.sendEventToUI = function (action,data) {
    let event = new cc.Event(action,true);
    event["data"] = data;
    cc.systemEvent.dispatchEvent(event);
};

module.exports = MatchvsDemoResponse;

