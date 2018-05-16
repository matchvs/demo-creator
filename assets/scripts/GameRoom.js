var mvs = require("Matchvs");
var GLB = require("Glb");

cc.Class({
    extends: cc.Component,

    properties: {

        labelMyRoomID: {
            default: null,
            type: cc.Label
        },
        labelUserID1: {
            default: null,
            type: cc.Label
        },
        labelUserID2: {
            default: null,
            type: cc.Label
        },
        labelUserID3: {
            default: null,
            type: cc.Label
        },
        labelInfo: {
            default: null,
            type: cc.Label
        },
        leaveRoom: cc.Node,
        btnStartGame: cc.Node,
        kickPlayer2: cc.Node,
        kickPlayer3: cc.Node,
        seleButton: cc.Node,
        mapString: {
            default: null,
            type: cc.Label
        },

    },

    onLoad() {
        this.labelUserIDs = [this.labelUserID2,this.labelUserID3];
        this.userIds = [];
        var result = mvs.engine.getRoomDetail(GLB.roomId);
        this.labelMyRoomID.string = GLB.roomId;
        this.labelUserID1.string = GLB.userID;
        mvs.response.getRoomDetailResponse = this.getRoomDetailResponse.bind(this);
        mvs.response.kickPlayerNotify = this.kickPlayerNotify.bind(this);
        mvs.response.joinOverResponse = this.joinOverResponse.bind(this); // 关闭房间之后的回调
        mvs.response.sendEventNotify = this.sendEventNotify.bind(this); // 设置事件接收的回调
        mvs.response.setRoomPropertyNotify = this.setRoomPropertyNotify.bind(this);
        mvs.response.errorResponse = this.errorResponse.bind(this);
        if (result !== 0)
            return this.labelLog('获取房间详情失败,错误码:' + result);
        var self = this;
        this.kickPlayer2.on(cc.Node.EventType.TOUCH_END, function(event){
            var result = mvs.engine.kickPlayer(self.labelUserID2.string, '');
            if (result !== 0)
                return self.labelLog('踢人失败,错误码:' + result);
            mvs.response.kickPlayerResponse = self.kickPlayerResponse.bind(self);
            GLB.playerSet.delete(Number(self.labelUserID2.string));
            self.labelUserID2.string = '';
        });
        this.kickPlayer3.on(cc.Node.EventType.TOUCH_END, function(event){
            var result = mvs.engine.kickPlayer(self.labelUserID3.string, '');
            if (result !== 0)
                return self.labelLog('踢人失败,错误码:' + result);
            mvs.response.kickPlayerResponse = self.kickPlayerResponse.bind(self);
            GLB.playerSet.delete(Number(self.labelUserID3.string));
            self.labelUserID3.string = '';
        });
        this.leaveRoom.on(cc.Node.EventType.TOUCH_END, function(event){
            mvs.engine.leaveRoom("");
            cc.director.loadScene('lobby');
        });
        this.btnStartGame.on(cc.Node.EventType.TOUCH_END, function(event){
            var size = 0;
            for (let item of GLB.playerSet) {
                console.log("item:" + item);
                size++;
            }
            if (size >= GLB.MAX_PLAYER_COUNT) {
                mvs.response.joinOverResponse = self.joinOverResponse.bind(self); // 关闭房间之后的回调
                var result = mvs.engine.joinOver("");
                self.labelLog("发出关闭房间的通知");
                if (result !== 0) {
                    self.labelLog("关闭房间失败，错误码：", result);
                }

                GLB.playerUserIds = [...GLB.playerSet];
            } else {
                self.labelLog('房间人数小于' + GLB.MAX_PLAYER_COUNT);
            }
        });
        this.seleButton.on(cc.Node.EventType.TOUCH_END, function(event){
            mvs.response.setRoomPropertyResponse = self.setRoomPropertyResponse.bind(self);
            var mapType = self.mapString.string;
            if (mapType === '白天模式') {
                mvs.engine.setRoomProperty(GLB.roomId,"黑夜模式");
            } else {
                mvs.engine.setRoomProperty(GLB.roomId,"白天模式");
            }
        });
        this.seleButton.active = false;
        this.btnStartGame.active = false;
        this.kickPlayer2.active = false;
        this.kickPlayer3.active = false;
    },

    errorResponse :function (rep,Lobby) {
        // GLB.errorMsg  = rep;
        this.labelLog( 'errorCode='+rep+'errorMsg='+Lobby)
        // cc.director.loadScene('error');
    },

    setRoomPropertyResponse: function (rsp) {
        var status = rsp.status;
        if (status !== 200) {
            return this.labelLog('创建房间失败,异步回调错误码: ' + status);
        } else {
            if (rsp.roomProperty === '白天模式') {
                this.mapString.string = rsp.roomProperty;
                GLB.mapType = rsp.roomProperty;
                this.seleButton.getChildByName("Label").getComponent(cc.Label).string = '切换为黑夜模式';

            } else {
                this.mapString.string = rsp.roomProperty;
                GLB.mapType = rsp.roomProperty;
                this.seleButton.getChildByName("Label").getComponent(cc.Label).string = '切换为白天模式';
            }
        }
    },


    setRoomPropertyNotify: function (rsp) {
        this.mapString.string = rsp.roomProperty
        GLB.mapType = rsp.roomProperty;
    },

    getRoomDetailResponse : function (roomDetailRsp) {
        if (roomDetailRsp.status === 200) {
            this.labelLog("获取房间详情成功");
            mvs.response.joinRoomNotify = this.joinRoomNotify.bind(this);
            mvs.response.leaveRoomNotify = this.leaveRoomNotify.bind(this);
            this.mapString.string = roomDetailRsp.roomProperty;
            if (roomDetailRsp.roomProperty === '白天模式') {
                this.seleButton.getChildByName("Label").getComponent(cc.Label).string = '切换为黑夜模式';
            } else {
                this.seleButton.getChildByName("Label").getComponent(cc.Label).string = '切换为白天模式';
            }
            GLB.mapType = roomDetailRsp.roomProperty;
            for (var i = 0; i < roomDetailRsp.userInfos.length; i++) {
                if (roomDetailRsp.userInfos[i].userId != GLB.userID) {
                    this.userIds.push(roomDetailRsp.userInfos[i].userId);
                    GLB.playerSet.add(Number(roomDetailRsp.userInfos[i].userId));
                }
            }
            for (var i = 0; i < this.userIds.length; i++) {
                this.labelUserIDs[i].string = this.userIds[i];
            }
            this.isRoomOwner(roomDetailRsp.owner);
        } else {
            this.labelLog("获取房间详情失败");
        }
    },

    joinRoomNotify: function (rsp) {
        this.labelLog('joinRoomNotify:' + JSON.stringify(rsp));
        if (this.labelUserID1.string === '') {
            this.labelUserID1.string = rsp.userId;
        } else if (this.labelUserID2.string === '' && this.labelUserID1.string != rsp.userId) {
            this.labelUserID2.string = rsp.userId;
        } else if (this.labelUserID3.string === '' && this.labelUserID2.string != rsp.userId) {
            this.labelUserID3.string = rsp.userId;
        }
        if (rsp.userId != GLB.userID) {
            GLB.playerSet.add(Number(rsp.userId));
        }

    },

    kickPlayerResponse: function (rsp) {
        this.labelLog('kickPlayerResponse:' + JSON.stringify(rsp));
        var status = rsp.status;
        if (status !== 200) {
            return this.labelLog('踢人失败,异步回调错误码: ' + status);
        } else {

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
                if (userId != GLB.userID) {
                    GLB.playerUserIds.push(userId)
                }
            });
            this.startGame()
        }
    },

    leaveRoomNotify: function (rsp) {
        this.labelLog('leaveRoomNotify:' + JSON.stringify(rsp) + ' roomId:' + rsp.roomID );
        var userID = rsp.userId;
        GLB.playerSet.delete(Number(userID));
        if (this.labelUserID1.string === userID) {
            this.labelUserID1.string = '';
        } else if (this.labelUserID2.string === userID) {
            this.labelUserID2.string = '';
        } else if (this.labelUserID3.string === userID) {
            this.labelUserID3.string = '';
        }
        this.isRoomOwner(rsp.owner);
    },

    isRoomOwner:function (ownerID) {
        if (ownerID == GLB.userID) {
            this.seleButton.active = true;
            this.btnStartGame.active = true;
            this.kickPlayer2.active = true;
            this.kickPlayer3.active = true;
            GLB.isRoomOwner = true;
        }
    },

    startGame: function () {
        this.labelLog('游戏即将开始');
        if (GLB.mapType === "白天模式") {
            cc.director.loadScene('game')
        } else {
            cc.director.loadScene('gameB')
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
        // GLB.isRoomOwner = true;

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


    kickPlayerNotify: function (rsp) {
        this.labelLog("kickPlayerNotify, rsp=" + JSON.stringify(rsp));
        if (rsp.userId == GLB.userID) {
            cc.director.loadScene('lobby');
        } else if (rsp.userId === this.userIds[0]){
            this.labelUserID2.string = this.userIds[1];
            this.labelUserID3.string = "";
        } else {
            this.labelUserID2.string = this.userIds[0];
            this.labelUserID3.string = "";
        }
    },

    labelLog: function (info) {
        this.labelInfo.string += '\n' + info;
    }

});
