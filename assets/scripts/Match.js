var mvs = require("Matchvs");
var GLB = require("Glb");
cc.Class({
    extends: cc.Component,

    properties: {
        player1: {
            default: null,
            type: cc.Label
        },
        player2: {
            default: null,
            type: cc.Label
        },
        player3: {
            default: null,
            type: cc.Label
        },
        labelRoomID: {
            default: null,
            type: cc.Label
        },
        labelCountdown: {
            default: null,
            type: cc.Label
        },
        labelProperty: {
            default: null,
            type: cc.Label
        },
        labelInfo: {
            default: null,
            type: cc.Label
        }        
    },

    labelLog: function (info) {
        this.labelInfo.string += '\n' + info;
    },
    startGame: function () {
        this.labelLog('游戏即将开始')
        cc.director.loadScene('game')
    },
    onLoad () {
        mvs.response.joinRoomResponse = this.joinRoomResponse.bind(this);
        mvs.response.joinRoomNotify = this.joinRoomNotify.bind(this);
        if (GLB.matchType === GLB.RANDOM_MATCH) {
            var result = mvs.engine.joinRandomRoom(GLB.MAX_PLAYER_COUNT, '');
            if (result !== 0)
                return this.labelLog('进入房间失败,错误码:' + result)
        } else if (GLB.matchType === GLB.PROPERTY_MATCH) {
            var matchinfo = new mvs.MatchInfo();
            matchinfo.maxPlayer = GLB.MAX_PLAYER_COUNT;
            matchinfo.mode = 0;
            matchinfo.canWatch = 0;
            matchinfo.tags = GLB.tagsInfo;
            this.labelProperty.string = "自定义属性:" + JSON.stringify(GLB.tagsInfo);
            var result = mvs.engine.joinRoomWithProperties(matchinfo, "joinRoomWithProperties");
            if (result !== 0)
                return self.labelLog('进入房间失败,错误码:' + result);
        }
    },
    joinRoomResponse: function (status, userInfoList, roomInfo) {
        if (status !== 200) {
            return this.labelLog('进入房间失败,异步回调错误码: ' + status);
        } else {
            this.labelLog('进入房间成功');
            this.labelLog('房间号: ' + roomInfo.roomID);
        }
        this.labelRoomID.string = roomInfo.roomID;
        GLB.roomId = roomInfo.roomID;
        var userIds = [GLB.userInfo.id]
        this.player1.string = GLB.userInfo.id;
        var self = this;
        userInfoList.forEach(function(item) {
            if (item.userId === GLB.userInfo.id) {
            } else if (self.player2.string === '') {
                self.player2.string = item.userId;
            } else if (self.player3.string === '') {
                self.player3.string = item.userId;
            }
            if (GLB.userInfo.id !== item.userId) {
                userIds.push(item.userId);
            }
        });
        this.labelLog('房间用户: ' + userIds);
        mvs.response.sendEventNotify = this.sendEventNotify.bind(this); // 设置事件接收的回调
        GLB.playerUserIds = userIds;
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

    joinRoomNotify: function(roomUserInfo) {
        this.labelLog("joinRoomNotify, roomUserInfo:" + JSON.stringify(roomUserInfo));
        if (this.player1.string === '') {
            this.player1.string = roomUserInfo.userId;
        } else if (this.player2.string === '') {
            this.player2.string = roomUserInfo.userId;
        } else if (this.player3.string === '') {
            this.player3.string = roomUserInfo.userId;
        }
        if (GLB.playerUserIds.length === GLB.MAX_PLAYER_COUNT - 1) {
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

            GLB.playerUserIds = [GLB.userInfo.id]
            // 通过游戏开始的玩家会把userIds传过来，这里找出所有除本玩家之外的用户ID，
            // 添加到全局变量playerUserIds中
            JSON.parse(info.cpProto).userIds.forEach(function(userId) {
                if (userId !== GLB.userInfo.id) GLB.playerUserIds.push(userId)
            });
            this.startGame()
        }
    }
});
