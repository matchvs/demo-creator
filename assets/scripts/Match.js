var engine = require("MatchvsEngine");
var response = require("MatchvsDemoResponse");
var GLB = require("Glb");
var msg = require("MatvhsMessage");
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
        joinopen: cc.Node,
        userList :[],
        nameViewList:[]
    },


    onLoad: function () {
        var self = this;
        this.initEvent(self);
        this.nameViewList = [this.player2,this.player3];
        // var result = 0;
        // mvs.response.joinRoomResponse = this.joinRoomResponse.bind(this);
        // mvs.response.joinRoomNotify = this.joinRoomNotify.bind(this);
        // mvs.response.getRoomDetailResponse = this.getRoomDetailResponse.bind(this);
        // mvs.response.leaveRoomNotify = this.leaveRoomNotify.bind(this);
        engine.prototype.joinRandomRoom(GLB.MAX_PLAYER_COUNT,"这里是负载信息");
        // if (GLB.matchType === GLB.RANDOM_MATCH) {
        //     result = mvs.engine.joinRandomRoom(GLB.MAX_PLAYER_COUNT, '');
        //     if (result !== 0)
        //         return this.labelLog('进入房间失败,错误码:' + result)
        // } else if (GLB.matchType === GLB.PROPERTY_MATCH) {
        //     var matchinfo = new mvs.MsMatchInfo();
        //     matchinfo.maxPlayer = GLB.MAX_PLAYER_COUNT;
        //     matchinfo.mode = 0;
        //     matchinfo.canWatch = 0;
        //     matchinfo.tags = GLB.tagsInfo;
        //     this.labelProperty.string = "自定义属性:" + JSON.stringify(GLB.tagsInfo);
        //     result = mvs.engine.joinRoomWithProperties(matchinfo, "china");
        //     if (result !== 0)
        //         return this.labelLog('进入房间失败,错误码:' + result);
        // }
        this.leaveRoom.on(cc.Node.EventType.TOUCH_END, function (event) {
            engine.prototype.leaveRoom();

        });
        var isOpen = true;



        // mvs.response.joinOpenResponse = function (d) {
        //     self.labelLog("我设置允许房间加人");
        //     checkBox.isChecked = true;
        // };
        // mvs.response.joinOpenNotify=  function (d) {
        //     self.labelLog("有人设置了允许房间加人");
        //     checkBox.isChecked = true;
        // };
        // mvs.response.joinOverNotify = function () {
        //     self.labelLog("有人设置了不允许房间加人");
        //     checkBox.isChecked = false;
        // };
        // mvs.response.joinOverResponse= function () {
        //     self.labelLog("我设置了不允许房间加人");
        //     checkBox.isChecked = false;
        // };
        this.joinopen.on(cc.Node.EventType.TOUCH_END, function (event) {
            isOpen = !isOpen;
            if(isOpen){
                engine.prototype.joinOpen();
            }else{
                engine.prototype.joinOver();
            }
        });


    },

    /**
     * 注册对应的事件监听和把自己的原型传递进入，用于发送事件使用
     */
    initEvent:function (self) {
        response.prototype.init(self);
        this.node.on(msg.MATCHVS_ERROE_MSG, this.onEvent, this);
        this.node.on(msg.MATCHVS_JOIN_ROOM_RSP,this.onEvent,this);
        this.node.on(msg.MATCHVS_JOIN_ROOM_NOTIFY,this.onEvent,this);
        this.node.on(msg.MATCHVS_LEAVE_ROOM,this.onEvent,this);
        this.node.on(msg.MATCHVS_LEAVE_ROOM_NOTIFY,this.onEvent,this);
    },

    /**
     * 事件接收方法
     * @param event
     */
    onEvent:function (event) {
        var checkBox = this.joinopen.getComponent(cc.Toggle);
        switch (event.type) {
            case msg.MATCHVS_JOIN_ROOM_RSP:
                var userInfoList = event.detail.msg;
                console.log(userInfoList);
                this.joinRoom(userInfoList);
                break;
            case msg.MATCHVS_JOIN_ROOM_NOTIFY:
                this.userList.push(event.detail.msg)
                this.initUserView(this.userList);
                break;
            case msg.MATCHVS_LEAVE_ROOM:
                cc.director.loadScene('lobby');
                break;
            case msg.MATCHVS_LEAVE_ROOM_NOTIFY:
                this.removeView(event.detail.msg.userId);
                break;
            case msg.MATCHVS_JOIN_OVER_NOTIFY:
                checkBox.isChecked = false;
                break;
            case msg.MATCHVS_JOIN_OVER_RSP:
                checkBox.isChecked = false;
                break;
            case msg.MATCHVS_JOIN_OPEN_RSP:
                checkBox.isChecked = true;
                break;
            case msg.MATCHVS_JOIN_OPEN_NOTIFY:
                checkBox.isChecked = true;
                break;
        }
        
    },


    /**
     * 生命周期，页面销毁
     */
    onDestroy:function () {
        this.removeEvent();
        console.log("Match页面销毁");
    },


    /**
     * 取消事件监听
     */
    removeEvent:function (self) {
        response.prototype.init(self);
        this.node.off(msg.MATCHVS_ERROE_MSG, this.onEvent, this);
        this.node.off(msg.MATCHVS_JOIN_ROOM_RSP,this.onEvent,this);
        this.node.off(msg.MATCHVS_JOIN_ROOM_NOTIFY,this.onEvent,this);
        this.node.off(msg.MATCHVS_LEAVE_ROOM,this.onEvent,this);
        this.node.off(msg.MATCHVS_LEAVE_ROOM_NOTIFY,this.onEvent,this);
    },


    joinRoom: function (userInfoList) {
        this.labelLog('进入房间成功');
        this.labelLog('房间号: ' + userInfoList.roomID);
        this.labelRoomID.string = userInfoList.roomID;
        this.player1.string = GLB.name;
        this.userList = userInfoList;
        this.initUserView(this.userList);
        if (this.userList.length == GLB.MAX_PLAYER_COUNT-1) {
            engine.prototype.joinOver();
            this.startGame();
        }

        // mvs.response.joinOverResponse = this.joinOverResponse.bind(this); // 关闭房间之后的回调
        // var result = mvs.engine.joinOver("");
        // this.labelLog("发出关闭房间的通知");
        // if (result !== 0) {
        //     this.labelLog("关闭房间失败，错误码：", result);
        // }
    },

    /**
     * 展示玩家信息
     * @param userList
     */
    initUserView :function(userList){
        for(var i = 0; i < userList.length; i++) {
            var info = JSON.parse(userList[i].userProfile);
            if (this.nameViewList[i].string === "") {
                this.nameViewList[i].string = info.name;
            }
        }
        if (this.userList.length == GLB.MAX_PLAYER_COUNT-1) {
            engine.prototype.joinOver();
            this.startGame();
        }
    },

    /**
     * 玩家退出将玩家的信息从页面上消失
     * @param userID
     */
    removeView:function (userID) {
        for(var i = 0; i < this.userList.length;i++ ) {
            if(userID == this.userList[i].userID) {
                this.userList.splice(i,1);
            }
        }
        for(var i = 0; i < this.nameViewList.length; i++) {
            if(userID == this.nameViewList[i].string) {
                this.nameViewList[i].string = "";
            }
        }
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
    },

    labelLog: function (info) {
        this.labelInfo.string += '\n' + info;
    },
    startGame: function () {
        this.labelLog('游戏即将开始');
        cc.director.loadScene('game');
    },
});
