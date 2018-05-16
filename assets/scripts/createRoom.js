// Learn cc.Class:
//  - [Chinese] http://www.cocos.com/docs/creator/scripting/class.html
//  - [English] http://www.cocos2d-x.org/docs/editors_and_tools/creator-chapters/scripting/class/index.html
// Learn Attribute:
//  - [Chinese] http://www.cocos.com/docs/creator/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/editors_and_tools/creator-chapters/scripting/reference/attributes/index.html
// Learn life-cycle callbacks:
//  - [Chinese] http://www.cocos.com/docs/creator/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/editors_and_tools/creator-chapters/scripting/life-cycle-callbacks/index.html
var mvs = require("Matchvs");
var GLB = require("Glb");
var roomID;
cc.Class({
    extends: cc.Component,

    properties: {
        // foo: {
        //     // ATTRIBUTES:
        //     default: null,        // The default value will be used only when the component attaching
        //                           // to a node for the first time
        //     type: cc.SpriteFrame, // optional, default is typeof default
        //     serializable: true,   // optional, default is true
        // },
        // bar: {
        //     get () {
        //         return this._bar;
        //     },
        //     set (value) {
        //         this._bar = value;
        //     }
        // },
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

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        var create = new mvs.CreateRoomInfo();
        create.name = 'roomName';
        create.maxPlayer = GLB.MAX_PLAYER_COUNT;
        create.mode = 0;
        create.canWatch = 0;
        create.visibility = 1;

        create.roomProperty = '白天模式';
        mvs.response.createRoomResponse = this.createRoomResponse.bind(this);
        mvs.response.kickPlayerNotify = this.kickPlayerNotify.bind(this);
        mvs.response.networkStateNotify = this.networkStateNotify.bind(this);
        var result = mvs.engine.createRoom(create, 'userProfile');
        if (result !== 0)
            return this.labelLog('创建房间失败,错误码:' + result);
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
    },

    start () {

    },

    setRoomPropertyResponse: function (rsp) {
        var status = rsp.status;
        if (status !== 200) {
            return this.labelLog('修改房间属性失败,异步回调错误码: ' + status);
        } else {
            if (rsp.roomProperty === '白天模式') {
                this.mapString.string = rsp.roomProperty;
                GLB.mapType = rsp.roomProperty;
                this.seleButton.getChildByName("Label").getComponent(cc.Label).string = '切换黑夜模式';

            } else {
                this.mapString.string = rsp.roomProperty;
                GLB.mapType = rsp.roomProperty;
                this.seleButton.getChildByName("Label").getComponent(cc.Label).string = '切换为白天模式';
            }
        }
    },


    createRoomResponse: function (rsp) {
        var status = rsp.status;
        if (status !== 200) {
            return this.labelLog('创建房间失败,异步回调错误码: ' + status);
        } else {
            this.labelLog('创建房间成功:' + JSON.stringify(rsp));
            this.labelLog('房间号: ' + rsp.roomID);
            this.labelMyRoomID.string = rsp.roomID;
            this.labelUserID1.string = GLB.userID;
            mvs.response.sendEventNotify = this.sendEventNotify.bind(this); // 设置事件接收的回调
            mvs.response.joinRoomNotify = this.joinRoomNotify.bind(this);
            mvs.response.leaveRoomNotify = this.leaveRoomNotify.bind(this);
            GLB.playerSet.add(Number(GLB.userID));
            GLB.roomId = rsp.roomID;
            GLB.mapType = "白天模式";
            this.mapString.string = "白天模式";
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

    leaveRoomNotify: function (rsp) {
        this.labelLog('leaveRoomNotify:' + JSON.stringify(rsp) + ' roomId:' + rsp.roomID);
        var userID = rsp.userId;
        GLB.playerSet.delete(Number(userID));
        if (this.labelUserID1.string === userID) {
            this.labelUserID1.string = '';
        } else if (this.labelUserID2.string === userID) {
            this.labelUserID2.string = '';
        } else if (this.labelUserID3.string === userID) {
            this.labelUserID3.string = '';
        }
    },

    startGame: function () {
        this.labelLog('游戏即将开始')
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

    kickPlayerNotify: function (rsp) {
        this.labelLog("kickPlayerNotify, rsp=" + JSON.stringify(rsp));
        if (rsp.userId == GLB.userID) {
            cc.director.loadScene('lobby');
        }
    },

    networkStateNotify :function () {
        mvs.engine.sendEvent()
    },

    labelLog: function (info) {
        this.labelInfo.string += '\n' + info;
    }

});
