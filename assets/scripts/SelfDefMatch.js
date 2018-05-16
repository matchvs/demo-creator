var mvs = require("Matchvs");
var GLB = require("Glb");

cc.Class({
    extends: cc.Component,

    properties: {
        odd: cc.Toggle,
        even: cc.Toggle,
        startMatch: cc.Node,
        returnLobby: cc.Node,
        labelInfoSelfDefineMatch: {
            default: null,
            type: cc.Label
        }
    },

    labelLog: function (info) {
        this.labelInfoSelfDefineMatch.string += '\n' + info;
    },

    startGame: function () {
        this.labelLog('游戏即将开始')
        cc.director.loadScene('game')
    },

    onLoad () {
        var self = this;
        this.startMatch.on(cc.Node.EventType.TOUCH_END, function(event){
            self.labelLog('开始属性匹配');
            GLB.matchType = GLB.PROPERTY_MATCH;
            if (self.odd.isChecked) {
                GLB.tagsInfo={"title": "A"};
                self.labelLog('设置标签A');
            } else {
                GLB.tagsInfo={"title": "B"};
                self.labelLog('设置标签B');
            }
            cc.director.loadScene('match');
            //cc.director.loadScene('match');
        });
        this.returnLobby.on(cc.Node.EventType.TOUCH_END, function(event){
            mvs.engine.leaveRoom("");
            cc.director.loadScene('lobby');
        });
    },

    joinRoomResponse: function (status, userInfoList, roomInfo) {
        if (status !== 200) {
            return this.labelLog('进入房间失败,异步回调错误码: ' + status);
        } else {
            this.labelLog('进入房间成功,房间号: ' + roomInfo.roomID);
            console.log('进入房间成功,房间号: ' + roomInfo.roomID);
       }


        var userIds = [GLB.userID]
        userInfoList.forEach(function(item) {if (GLB.userID !== item.userId) userIds.push(item.userId)});
        this.labelLog('房间用户: ' + userIds);
        mvs.response.sendEventNotify = this.sendEventNotify.bind(this); // 设置事件接收的回调

        if (userIds.length >= GLB.MAX_PLAYER_COUNT) {
            mvs.response.joinOverResponse = this.joinOverResponse.bind(this); // 关闭房间之后的回调
            var result = mvs.engine.joinOver("");
            this.labelLog("发出关闭房间的通知");
            if (result !== 0) {
                this.labelLog("关闭房间失败，错误码：", result);
            }

            GLB.playerUserIds = userIds;
        }
    },

    joinOverResponse: function(joinOverRsp) {
        if (joinOverRsp.status === 200) {
            this.labelLog("关闭房间成功");
            this.notifyGameStart();
        } else {
            this.labelLog("关闭房间失败，回调通知错误码：", joinOverRsp.status);
        }
    },

    notifyGameStart: function () {
        GLB.isRoomOwner = true;

        var event = {
            action: GLB.GAME_START_EVENT,
            userIds: GLB.playerUserIds
        };

        mvs.response.sendEventResponse = this.sendEventResponse.bind(this); // 设置事件发射之后的回调
        var result = mvs.engine.sendEvent(JSON.stringify(event));
        if (result.result !== 0)
            return this.labelLog('发送游戏开始通知失败，错误码' + result.result)

        // 发送的事件要缓存起来，收到异步回调时用于判断是哪个事件发送成功
        GLB.events[result.sequence] = event;
        this.labelLog("发起游戏开始的通知，等待回复");
    },

    sendEventResponse: function (info) {
        if (!info
            || !info.status
            || info.status !== 200) {
            return this.labelLog('事件发送失败')
        }

        var event = GLB.events[info.sequence]

        if (event && event.action === GLB.GAME_START_EVENT) {
            delete GLB.events[info.sequence]
            this.startGame()
        }
    },

    sendEventNotify: function (info) {
        if (info
            && info.cpProto
            && info.cpProto.indexOf(GLB.GAME_START_EVENT) >= 0) {

            GLB.playerUserIds = [GLB.userID]
            // 通过游戏开始的玩家会把userIds传过来，这里找出所有除本玩家之外的用户ID，
            // 添加到全局变量playerUserIds中
            JSON.parse(info.cpProto).userIds.forEach(function(userId) {
                if (userId !== GLB.userID) GLB.playerUserIds.push(userId)
            });
            this.startGame()
        }
    },    
});
