var engine = require("MatchvsEngine");
var response = require("MatchvsDemoResponse");
var GLB = require("Glb");
var msg = require("MatvhsMessage");
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
        userList :[],
    },


    onLoad () {
        this.nameViewList = [this.labelUserID2,this.labelUserID3];
        var self = this;
        // roomID的全局赋值要慎重使用，离开房间记得置空
        if (GLB.roomID != "") {
            engine.prototype.getRoomDetail(GLB.roomID);
        }
        this.initEvent(self);
        this.kickPlayer2.on(cc.Node.EventType.TOUCH_END, function(event){
            if (self.userList[0] != null) {
                engine.prototype.kickPlayer(self.userList[0].userId,self.labelUserID2.string);
                self.labelUserID2.string = "";
            }
        });
        this.kickPlayer3.on(cc.Node.EventType.TOUCH_END, function(event){
            if (self.userList[1] != null) {
                engine.prototype.kickPlayer(self.userList[1].userId,self.labelUserID3.string);
                self.labelUserID3.string = "";
            }
        });
        this.leaveRoom.on(cc.Node.EventType.TOUCH_END, function(event){
            engine.prototype.leaveRoom("");
            self.leaveRoom1();
        });
        this.btnStartGame.on(cc.Node.EventType.TOUCH_END, function(event){
            if (self.userList.length === GLB.MAX_PLAYER_COUNT-1) {
                var event = {
                    action: msg.EVENT_GAME_START,
                };
                engine.prototype.sendEvent(JSON.stringify(event));
            } else {
                self.labelLog('房间人数小于' + GLB.MAX_PLAYER_COUNT);
            }
        });
        this.seleButton.on(cc.Node.EventType.TOUCH_END, function(event){
            var mapType = self.mapString.string;
            if (mapType === '白天模式') {
                engine.prototype.setRoomProperty(GLB.roomID,"黑夜模式")
            } else {
                engine.prototype.setRoomProperty(GLB.roomID,"白天模式")
            }
        });
    },

    /**
     * 注册对应的事件监听和把自己的原型传递进入，用于发送事件使用
     */
    initEvent:function (self) {
        response.prototype.init(self);
        this.node.on(msg.MATCHVS_ERROE_MSG, this.onEvent, this);
        this.node.on(msg.MATCHVS_KICK_PLAYER, this.onEvent, this)
        this.node.on(msg.MATCHVS_KICK_PLAYER_NOTIFY, this.onEvent, this)
        this.node.on(msg.MATCHVS_JOIN_ROOM_RSP,this.onEvent, this);
        this.node.on(msg.MATCHVS_SET_ROOM_PROPETY,this.onEvent , this);
        this.node.on(msg.MATCHVS_SET_ROOM_PROPETY_NOTIFY, this.onEvent ,this);
        this.node.on(msg.MATCHVS_JOIN_ROOM_RSP,this.onEvent,this);
        this.node.on(msg.MATCHVS_JOIN_ROOM_NOTIFY,this.onEvent,this);
        this.node.on(msg.MATCHVS_ROOM_DETAIL,this.onEvent,this);
        this.node.on(msg.MATCHVS_LEAVE_ROOM_NOTIFY,this.onEvent,this);
        this.node.on(msg.MATCHVS_SEND_EVENT_NOTIFY,this.onEvent,this);
        this.node.on(msg.MATCHVS_SEND_EVENT_RSP,this.onEvent,this);
    },

    /**
     * 时间接收
     * @param event
     */
    onEvent :function (event) {
        switch(event.type) {
            case msg.MATCHVS_JOIN_ROOM_NOTIFY:
                this.userList.push(event.detail.roomUserInfo)
                this.initUserView(this.userList);
                break;
            case msg.MATCHVS_KICK_PLAYER:
                this.removeView(event.detail.kickPlayerRsp);
                break;
            case msg.MATCHVS_KICK_PLAYER_NOTIFY:
                this.removeView(event.detail.kickPlayerNotify);
                break;
            case msg.MATCHVS_SET_ROOM_PROPETY:
                this.setRoomPropertyResponse(event.detail.rsp);
                break;
            case msg.MATCHVS_SET_ROOM_PROPETY_NOTIFY:
                this.setRoomPropertyResponse(event.detail.rsp);
                break;
            case msg.MATCHVS_ROOM_DETAIL:
                this.joinRoom(event.detail.rsp);
                for (var i in event.detail.rsp.userInfos) {
                    if (GLB.userID != event.detail.rsp.userInfos[i].userId) {
                        this.userList.push(event.detail.rsp.userInfos[i]);
                    }
                }
                this.initUserView(this.userList);
                break;
            case msg.MATCHVS_LEAVE_ROOM_NOTIFY:
                this.removeView(event.detail.leaveRoomInfo)
                break;
            case msg.MATCHVS_SEND_EVENT_RSP:
                this.startGame();
                break;
            case msg.MATCHVS_SEND_EVENT_NOTIFY:
                this.startGame();
                break;
            case msg.MATCHVS_ERROE_MSG:
                this.labelLog("[Err]errCode:"+event.detail.errorCode+" errMsg:"+event.detail.errorMsg);
                cc.director.loadScene('login');
                break;
        }
    },

    setRoomPropertyResponse: function (rsp) {
        if (rsp.roomProperty === '白天模式') {
            this.mapString.string = rsp.roomProperty;
            GLB.mapType = rsp.roomProperty;
            this.seleButton.getChildByName("Label").getComponent(cc.Label).string = '切换黑夜模式';
        } else {
            this.mapString.string = rsp.roomProperty;
            GLB.mapType = rsp.roomProperty;
            this.seleButton.getChildByName("Label").getComponent(cc.Label).string = '切换为白天模式';
        }
    },


    /**
     * 房主是通过joinRoom ,非房主玩家是通过getRoomDetail 进来的
     * @param rsp
     */
    joinRoom: function (rsp) {
        if (rsp.owner === GLB.userID) {
            GLB.isRoomOwner = true;
        } else {
            GLB.isRoomOwner = false;
        }
        this.buttonIsShow(GLB.isRoomOwner);
        if (GLB.roomID != "") {
            this.labelLog('房间号: ' + GLB.roomID);
            this.labelMyRoomID.string = GLB.roomID;
        } else {
            this.labelLog('房间号: ' + rsp.roomID);
            this.labelMyRoomID.string = rsp.roomID;
            GLB.roomID = rsp.roomID;
        }
        this.labelUserID1.string = GLB.name;
        GLB.mapType = "白天模式";
        this.mapString.string = "白天模式";
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
    },

    /**
     * 玩家退出将玩家的信息从页面上消失
     * @param userID
     */
    removeView:function (info) {
        var userID ;
        if (info.userID == undefined) {
            userID = info.userId;
        } else {
            userID = info.userID;
        }
        for(var i = 0; i < this.userList.length;i++ ) {
            if(userID == this.userList[i].userId) {
                this.userList.splice(i,1);
            }
        }
        if (info.cpProto != undefined) {
            var name = info.cpProto.split("/n")[0];
            console.log(name);
            if(name == GLB.name) {
                this.leaveRoom1();
            }
            for(var i = 0; i < this.nameViewList.length; i++) {
                if(name == this.nameViewList[i].string) {
                    this.nameViewList[i].string = "";
                }
            }
        }
        if (info.owner === GLB.userID) {
            GLB.isRoomOwner = true;
            this.buttonIsShow(true);
        }
    },

    /**
     * 房主和非房主玩家的功能按键显示和隐藏
     * @param isShow
     */
    buttonIsShow :function (isShow) {
        if (isShow) {
            this.seleButton.active = true;
            this.btnStartGame.active = true;
            this.kickPlayer2.active = true;
            this.kickPlayer3.active = true;
        } else {
            this.seleButton.active = false;
            this.btnStartGame.active = false;
            this.kickPlayer2.active = false;
            this.kickPlayer3.active = false;
        }
    },

    /**
     * 移除监听
     */
    removeEvent:function () {
        this.node.off(msg.MATCHVS_ERROE_MSG, this.onEvent, this);
        this.node.off(msg.MATCHVS_KICK_PLAYER, this.onEvent, this)
        this.node.off(msg.MATCHVS_KICK_PLAYER_NOTIFY, this.onEvent, this)
        this.node.off(msg.MATCHVS_JOIN_ROOM_RSP,this.onEvent, this);
        this.node.off(msg.MATCHVS_SET_ROOM_PROPETY,this.onEvent , this);
        this.node.off(msg.MATCHVS_SET_ROOM_PROPETY_NOTIFY, this.onEvent ,this);
        this.node.off(msg.MATCHVS_JOIN_ROOM_RSP,this.onEvent,this);
        this.node.off(msg.MATCHVS_JOIN_ROOM_NOTIFY,this.onEvent,this);
        this.node.off(msg.MATCHVS_ROOM_DETAIL,this.onEvent,this);
        this.node.off(msg.MATCHVS_LEAVE_ROOM_NOTIFY,this.onEvent,this);
        this.node.off(msg.MATCHVS_SEND_EVENT_NOTIFY,this.onEvent,this);
        this.node.off(msg.MATCHVS_SEND_EVENT_RSP,this.onEvent,this);
    },


    /**
     * 生命周期，销毁
     */
    onDestroy :function () {
        this.removeEvent();
        console.log("create Room 页面销毁");
    },

    leaveRoom1 :function () {
        GLB.roomID = ""
        cc.director.loadScene('lobby');
    },

    startGame: function () {
        engine.prototype.joinOver();
        this.labelLog('游戏即将开始')
        cc.director.loadScene('game')
    },

    labelLog: function (info) {
        this.labelInfo.string += '\n' + info;
    }

});
