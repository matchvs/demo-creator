var engine = require("MatchvsEngine");
var response = require("MatchvsDemoResponse");
var GLB = require("Glb");
var msg = require("MatvhvsMessage");
cc.Class({
    extends: cc.Component,

    properties: {
        labelMyRoomID: {
            default: null,
            type: cc.Label
        },
        labelUserName: {
            default: null,
            type: cc.Label
        },
        labelUserName2: {
            default: null,
            type: cc.Label
        },
        labelUserName3: {
            default: null,
            type: cc.Label
        },
        nickName: {
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
        labelUserID2:cc.Label,
        labelUserID3:cc.Label,
        ownerLogo:cc.Node,
        ownerLogo2:cc.Node,
        ownerLogo3:cc.Node,
        userIDfontSize:26,
    },


    onLoad () {
        this.nameViewList = [this.labelUserName2,this.labelUserName3];
        this.userIDViewList = [this.labelUserID2,this.labelUserID3];
        this.userOwnewLogoList = [this.ownerLogo2,this.ownerLogo3];
        GLB.number1 = "";
        GLB.number2 = "";
        GLB.number3 = "";
        var self = this;
        self.nickName.string = '用户ID：'+GLB.userID;
        // roomID的全局赋值要慎重使用，离开房间记得置空
        if (GLB.roomID != "") {
            engine.prototype.getRoomDetail(GLB.roomID);
        }
        this.initEvent(self);
        this.kickPlayer2.on(cc.Node.EventType.TOUCH_END, function(event){
            // var userID = self.kickPlayerName(self.labelUserID2.string);
            var userID = self.labelUserID2.string;
            if (userID != undefined && userID != 2) {
                engine.prototype.kickPlayer(userID,self.labelUserName2.string);
                self.labelUserID2.string = 2;
                self.labelUserID2.fontSize = 80;
                self.labelUserName2.string = "待加入";
            }
        });
        this.kickPlayer3.on(cc.Node.EventType.TOUCH_END, function(event){
            // var userID = self.kickPlayerName(self.labelUserID3.string);
            var userID = self.labelUserID3.string;
            if (userID != undefined && userID != 3) {
                engine.prototype.kickPlayer(userID,self.labelUserName3.string);
                self.labelUserID3.string = 3;
                self.labelUserID3.fontSize = 80;
                self.labelUserName3.string = "待加入";
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
                engine.prototype.sendEventEx(JSON.stringify(event));
                engine.prototype.joinOver();
            } else {
                // self.labelLog('房间人数小于' + GLB.MAX_PLAYER_COUNT);
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
        this.node.on(msg.MATCHVS_NETWORK_STATE_NOTIFY,this.onEvent ,this);
    },

    /**
     * 时间接收
     * @param event
     */
    onEvent :function (event) {
        var eventData = event.detail;
        if (eventData == undefined) {
            eventData = event;
        }
        switch(event.type) {
            case msg.MATCHVS_JOIN_ROOM_NOTIFY:
                this.userList.push(eventData.roomUserInfo);
                this.initUserView(eventData.roomUserInfo.userProfile,eventData.roomUserInfo.userID,0);
                break;
            case msg.MATCHVS_KICK_PLAYER:
                this.removeView(eventData.kickPlayerRsp);
                break;
            case msg.MATCHVS_KICK_PLAYER_NOTIFY:
                this.removeView(eventData.kickPlayerNotify);
                break;
            case msg.MATCHVS_SET_ROOM_PROPETY:
                this.setRoomPropertyResponse(eventData.rsp);
                break;
            case msg.MATCHVS_SET_ROOM_PROPETY_NOTIFY:
                this.setRoomPropertyResponse(eventData.rsp);
                break;
            case msg.MATCHVS_ROOM_DETAIL:
                this.joinRoom(eventData.rsp);
                for (var i in eventData.rsp.userInfos) {
                    if (GLB.userID != eventData.rsp.userInfos[i].userID) {
                        this.initUserView(eventData.rsp.userInfos[i].userProfile,eventData.rsp.userInfos[i].userID,eventData.rsp.owner);
                        this.userList.push(eventData.rsp.userInfos[i]);
                    }
                }
                break;
            case msg.MATCHVS_LEAVE_ROOM_NOTIFY:
                this.removeView(eventData.leaveRoomInfo)
                break;
            case msg.MATCHVS_SEND_EVENT_NOTIFY:
                var  data = JSON.parse(eventData.eventInfo.cpProto);
                if (data.action == msg.EVENT_GAME_START) {
                    this.startGame();
                }
                break;
            case msg.MATCHVS_ERROE_MSG:
                if (eventData.errorCode != 400) {
                    cc.director.loadScene('Login');
                }
                break;
            case msg.MATCHVS_NETWORK_STATE_NOTIFY:
                if (eventData.netNotify.state === 1) {
                    engine.prototype.kickPlayer(eventData.netNotify.userID,"你断线了，被提出房间");
                }
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
    
    // kickPlayerName :function (name) {
    //     for (var i in  this.userList) {
    //         var obj = JSON.parse(this.userList[i].userProfile);
    //         if (obj.name == name) {
    //             return this.userList[i].userId
    //         }
    //     }
    // },


    /**
     * 房主是通过joinRoom ,非房主玩家是通过getRoomDetail 进来的
     * @param rsp
     */
    joinRoom: function (rsp) {
        if (rsp.owner === GLB.userID) {
            GLB.isRoomOwner = true;
            this.ownerLogo.active = true;
        } else {
            GLB.isRoomOwner = false;
            this.ownerLogo.active = false;
        }
        this.buttonIsShow(GLB.isRoomOwner);
        if (GLB.roomID != "") {
            this.labelMyRoomID.string = GLB.roomID;
        } else {
            this.labelMyRoomID.string = rsp.roomID;
            GLB.roomID = rsp.roomID;
        }
        this.labelUserName.string = GLB.name;
        GLB.mapType = rsp.roomProperty;
        this.setRoomPropertyResponse(rsp);
    },

    /**
     * 展示玩家信息
     * @param userList
     */
    initUserView :function(userProfile,userID,owner){
        for(var i = 0; i < this.nameViewList.length; i++) {
            var info = JSON.parse(userProfile);
            if (this.nameViewList[i].string === "待加入") {
                this.userIDViewList[i].string = userID;
                this.userIDViewList[i].fontSize = this.userIDfontSize;
                this.nameViewList[i].string = info.name;
                if(userID === owner) {
                    this.userOwnewLogoList[i].active = true;
                }
                return;
            }
        }
    },

    /**
     * 玩家退出将玩家的信息从页面上消失
     * @param userID
     */
    removeView:function (info) {
        var userID = info.userID;
        for(var i = 0; i < this.userList.length;i++ ) {
            if(userID == this.userList[i].userId) {
                this.userList.splice(i,1);
                this.nameViewList[i].string = "待加入";
                this.userIDViewList[i].string = i+2;
                this.userIDViewList[i].fontSize = 80;
                this.userOwnewLogoList[i].active = false;
            }
        }
        if (userID== GLB.userID) {
            this.leaveRoom1();
        }

        for(var i = 0; i < this.userIDViewList.length;i++) {
            if (info.owner == this.userIDViewList[i].string) {
                this.userOwnewLogoList[i].active = true;
            }
        }


        if (info.owner === GLB.userID) {
            this.ownerLogo.active = true;
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
        this.node.off(msg.MATCHVS_NETWORK_STATE_NOTIFY,this.onEvent ,this);
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
        cc.director.loadScene('Lobby');
    },

    startGame: function () {
        // this.labelLog('游戏即将开始')
        cc.director.loadScene('Game')
    },


});
