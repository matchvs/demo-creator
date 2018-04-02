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
        back: cc.Node,
        button1: cc.Node,
        button2: cc.Node,
        button3: cc.Node,
        labelInfo: {
            default: null,
            type: cc.Label
        },        
        labelInfo1: {
            default: null,
            type: cc.Label
        },        
        labelInfo2: {
            default: null,
            type: cc.Label
        },        
        labelInfo3: {
            default: null,
            type: cc.Label
        },        
        roomList: {
            default: null,
            type: cc.Label
        }
    },

    // LIFE-CYCLE CALLBACKS:
    labelLog: function (info) {
        this.labelInfo.string += '\n' + info;
    },

    onLoad () {
        mvs.response.getRoomListResponse = this.getRoomListResponse.bind(this);
        var self = this;
        // function MsRoomFilter(maxPlayer,mode,canWatch,roomProperty) {
        //     this.maxPlayer = maxPlayer;
        //     this.mode = mode;
        //     this.canWatch = canWatch;
        //     this.roomProperty = roomProperty;
        // }
        // var roomFilter = {
        //     maxPlayer: 3,
        //     mode: 0,
        //     canWatch: 0,
        //     roomProperty: null
        // };
        var roomFilter = new mvs.RoomFilter();
        roomFilter.maxPlayer = GLB.MAX_PLAYER_COUNT;
        roomFilter.mode = 0;
        roomFilter.canWatch = 0;
        roomFilter.roomProperty = "2v2";
        var result = mvs.engine.getRoomList(roomFilter);
        this.back.on(cc.Node.EventType.TOUCH_END, function(event){
            mvs.engine.leaveRoom("");
            cc.director.loadScene("lobby");
        });
        this.button1.on(cc.Node.EventType.TOUCH_END, function(event) {
            self.labelLog("开始加入指定房间, roomid:" + self.labelInfo1.string);
            mvs.response.joinRoomResponse = self.joinRoomResponse.bind(self);
            mvs.response.errorResponse = self.errorResponse.bind(self);
            mvs.response.kickPlayerNotify = self.kickPlayerNotify.bind(self);
            var result = mvs.engine.joinRoom(self.labelInfo1.string, "joinRoomSpecial");
            self.labelLog("result:" + result);
            if (result !== 0)
                return self.labelLog('进入房间失败,错误码:' + result); 
        });
        this.button2.on(cc.Node.EventType.TOUCH_END, function(event) {
            self.labelLog("开始加入指定房间, roomid:" + self.labelInfo2.string);
            mvs.response.joinRoomResponse = self.joinRoomResponse.bind(self);
            mvs.response.errorResponse = self.errorResponse.bind(self);
            mvs.response.kickPlayerNotify = self.kickPlayerNotify.bind(self);
            var result = mvs.engine.joinRoom(self.labelInfo2.string, "joinRoomSpecial");
            self.labelLog("result:" + result);
            if (result !== 0)
                return self.labelLog('进入房间失败,错误码:' + result); 
        });        
        this.button3.on(cc.Node.EventType.TOUCH_END, function(event) {
            self.labelLog("开始加入指定房间, roomid:" + self.labelInfo3.string);
            mvs.response.joinRoomResponse = self.joinRoomResponse.bind(self);
            mvs.response.errorResponse = self.errorResponse.bind(self);
            mvs.response.kickPlayerNotify = self.kickPlayerNotify.bind(self);
            var result = mvs.engine.joinRoom(self.labelInfo3.string, "joinRoomSpecial");
            self.labelLog("result:" + result);
            if (result !== 0)
                return self.labelLog('进入房间失败,错误码:' + result); 
        });
        this.button1.active = false;
        this.button2.active = false;
        this.button3.active = false;
    },

    start () {

    },

    // getRoomListResponse: function (rsp) {
    //     this.roomList.string += '\n status:' + rsp.status;
    //     for (var i = 0 ; i < rsp.roomInfos.length; i++) {
    //         this.roomList.string += '\n' + rsp.roomInfos[i].roomID;
    //     }
    // }

    getRoomListResponse: function (status, roomInfos) {
        for (var i = 0 ; i < roomInfos.length; i++) {
            if (i == 0) {
                this.labelInfo1.string = roomInfos[i].roomID;
                this.button1.active = true;
            } else if (i == 1) {
                this.labelInfo2.string = roomInfos[i].roomID;
                this.button2.active = true;
            } else if ( i == 2) {
                this.labelInfo3.string = roomInfos[i].roomID;
                this.button3.active = true;
            }
        }
    },
    joinRoomResponse: function (status, userInfoList, roomInfo) {
        if (status !== 200) {
            return this.labelLog('进入房间失败,异步回调错误码: ' + status);
        } else {
            this.labelLog('进入房间成功,房间号: ' + roomInfo.roomID);
        }

        GLB.roomId = roomInfo.roomID;
        var userIds = [GLB.userInfo.id]
        userInfoList.forEach(function(item) {if (GLB.userInfo.id !== item.userId) userIds.push(item.userId)});
        this.labelLog('房间用户: ' + userIds);
        mvs.response.sendEventNotify = this.sendEventNotify.bind(this); // 设置事件接收的回调

    },

    errorResponse: function (errCode, errMsg) {
        this.labelLog("[Err]errCode:"+errCode+" errMsg:"+errMsg);
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
    },

    kickPlayerNotify: function (rsp) {
        this.labelLog("kickPlayerNotify, rsp=" + JSON.stringify(rsp));
        if (rsp.userId == GLB.userInfo.id) {
            cc.director.loadScene('lobby');
        }
    },

    // update (dt) {},
    startGame: function () {
        this.labelLog('游戏即将开始')
        cc.director.loadScene('game')
    }    
    // update (dt) {},
});
