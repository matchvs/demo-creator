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
        },
        leaveRoom: cc.Node,
        joinopen: cc.Node
    },

    labelLog: function (info) {
        this.labelInfo.string += '\n' + info;
    },
    startGame: function () {
        this.labelLog('游戏即将开始');
        cc.director.loadScene('game');
    },
    initReopenRoom: function (self) {
        var isOpen = true;
        var checkBox = self.joinopen.getComponent(cc.Toggle);
        checkBox.isChecked = true;
        mvs.response.joinOpenResponse = function () {
            self.labelLog("我设置允许房间加人");
            checkBox.isChecked = true;
        };
        mvs.response.joinOpenNotify = function () {
            self.labelLog("有人设置了允许房间加人");
            checkBox.isChecked = true;
        };
        mvs.response.joinOverNotify = function () {
            self.labelLog("有人设置了不允许房间加人");
            checkBox.isChecked = false;
        };
        mvs.response.joinOverResponse = function () {
            self.labelLog("我设置了不允许房间加人");
            checkBox.isChecked = false;
        };
        self.joinopen.on(cc.Node.EventType.TOUCH_END, function () {
            isOpen = !isOpen;
            if (isOpen) {
                mvs.engine.joinOpen("");
            } else {
                mvs.engine.joinOver("");
            }
            console.log("joinopen:" + isOpen);
        });
    },
    onLoad: function () {
        var result = 0;
        mvs.response.joinRoomResponse = this.joinRoomResponse.bind(this);
        mvs.response.joinRoomNotify = this.joinRoomNotify.bind(this);
        mvs.response.getRoomDetailResponse = this.getRoomDetailResponse.bind(this);
        mvs.response.leaveRoomNotify = this.leaveRoomNotify.bind(this);
        if (GLB.matchType === GLB.RANDOM_MATCH) {
            result = mvs.engine.joinRandomRoom(GLB.MAX_PLAYER_COUNT, '');
            if (result !== 0) {
                return this.labelLog('进入房间失败,错误码:' + result);
            }
        } else if (GLB.matchType === GLB.PROPERTY_MATCH) {
            var matchinfo = new mvs.MsMatchInfo();
            matchinfo.maxPlayer = GLB.MAX_PLAYER_COUNT;
            matchinfo.mode = 0;
            matchinfo.canWatch = 0;
            matchinfo.tags = GLB.tagsInfo;
            this.labelProperty.string = "自定义属性:" + JSON.stringify(GLB.tagsInfo);
            result = mvs.engine.joinRoomWithProperties(matchinfo, "china");
            if (result !== 0)
                return this.labelLog('进入房间失败,错误码:' + result);
        }
        this.leaveRoom.on(cc.Node.EventType.TOUCH_END, function (event) {
            mvs.engine.leaveRoom("");
            cc.director.loadScene('lobby');
        });

        this.initReopenRoom(this);


    },

    joinRoomResponse: function (status, userInfoList, roomInfo) {
        if (status !== 200) {
            return this.labelLog('进入房间失败,异步回调错误码: ' + status);
        } else {
            this.labelLog('进入房间成功');
            this.labelLog('房间号: ' + roomInfo.roomID);
            mvs.engine.getRoomDetail(roomInfo.roomID)
        }
        this.labelRoomID.string = roomInfo.roomID;

        // GLB.roomId = roomInfo.roomID;
        // var userIds = [GLB.userID];
        // this.player1.string = GLB.userID;
        // var self = this;
        userInfoList.forEach(function (item) {
            GLB.putPushID2Set(item.userId);
        });
        // this.labelLog('房间用户: ' + userIds);
        // mvs.response.sendEventNotify = this.sendEventNotify.bind(this); // 设置事件接收的回调
        // GLB.playerUserIds = userIds;
        // if (userIds.length >= GLB.MAX_PLAYER_COUNT) {
        //     mvs.response.joinOverResponse = this.joinOverResponse.bind(this); // 关闭房间之后的回调
        //     var result = mvs.engine.joinOver("");
        //     this.labelLog("发出关闭房间的通知");
        //     if (result !== 0) {
        //         this.labelLog("关闭房间失败，错误码：", result);
        //     }
        //
        //     GLB.playerUserIds = userIds;
        // }
    },

    joinRoomNotify: function (roomUserInfo) {
        this.labelLog("joinRoomNotify, roomUserInfo:" + JSON.stringify(roomUserInfo));
        GLB.putPushID2Set(item.userId);
    },

    joinOverResponse: function (joinOverRsp) {
        if (joinOverRsp.status === 200) {
            this.labelLog("关闭房间成功");
            this.notifyGameStart();
        } else {
            this.labelLog("关闭房间失败，回调通知错误码：", joinOverRsp.status);
        }
    },
    /**
     * 获取房间详细信息回调
     * @param roomDetailRsp
     */
    getRoomDetailResponse: function (roomDetailRsp) {
        if (roomDetailRsp.status === 200) {
            this.labelLog('房间最大人数:' + roomDetailRsp.maxPlayer)
        } else {
            this.labelLog("获取房间详情失败");
        }

    },


    leaveRoomNotify: function (rsp) {
        this.labelLog('leaveRoomNotify:' + JSON.stringify(rsp) + ' roomId:' + rsp.roomID);
        var userID = rsp.userId;
        GLB.playerSet.delete(Number(userID));
        if (this.player1.string === userID) {
            this.player1.string = '';
        } else if (this.player2.string === userID) {
            this.player2.string = '';
        } else if (this.player3.string === userID) {
            this.player3.string = '';
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
            return this.labelLog('事件发送失败');
        }

        var event = GLB.events[info.sequence];

        if (event && event.action === GLB.GAME_START_EVENT) {
            delete GLB.events[info.sequence];
            this.startGame();
        }
    },

    sendEventNotify: function (info) {
        if (info
            && info.cpProto
            && info.cpProto.indexOf(GLB.GAME_START_EVENT) >= 0) {

            GLB.playerUserIds = [GLB.userID];
            // 通过游戏开始的玩家会把userIds传过来，这里找出所有除本玩家之外的用户ID，
            // 添加到全局变量playerUserIds中
            JSON.parse(info.cpProto).userIds.forEach(function (userId) {
                if (userId !== GLB.userID) GLB.playerUserIds.push(userId)
            });
            this.startGame()
        }
    }
});
