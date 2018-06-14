var engine = require("MatchvsEngine");
var response = require("MatchvsDemoResponse");
var mvs = require("Matchvs");
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
        if (GLB.matchType === GLB.RANDOM_MATCH) {
            engine.prototype.joinRandomRoom(GLB.MAX_PLAYER_COUNT, "这里是负载信息");
        } else if (GLB.matchType === GLB.PROPERTY_MATCH) {
            var matchinfo = new mvs.MsMatchInfo();
            matchinfo.maxPlayer = GLB.MAX_PLAYER_COUNT;
            matchinfo.mode = 0;
            matchinfo.canWatch = 0;
            matchinfo.tags = GLB.tagsInfo;
            this.labelProperty.string = "自定义属性:" + JSON.stringify(GLB.tagsInfo);
            mvs.engine.joinRoomWithProperties(matchinfo, "china");
        }

        this.leaveRoom.on(cc.Node.EventType.TOUCH_END, function (event) {
            GLB.roomID = "";
            engine.prototype.leaveRoom();
        });
        var isOpen = true;
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
        this.node.on(msg.MATCHVS_JOIN_OPEN_NOTIFY,this.onEvent,this);
        this.node.on(msg.MATCHVS_JOIN_OPEN_RSP,this.onEvent,this);
        this.node.on(msg.MATCHVS_JOIN_OVER_RSP,this.onEvent,this);
        this.node.on(msg.MATCHVS_JOIN_OVER_NOTIFY,this.onEvent,this);
    },

    /**
     * 事件接收方法
     * @param event
     */
    onEvent:function (event) {
        var checkBox = this.joinopen.getComponent(cc.Toggle);
        switch (event.type) {
            case msg.MATCHVS_JOIN_ROOM_RSP:
                var userInfoList = event.detail.userInfoList;
                console.log(userInfoList);
                this.joinRoom(userInfoList);
                break;
            case msg.MATCHVS_JOIN_ROOM_NOTIFY:
                this.userList.push(event.detail.roomUserInfo)
                this.initUserView(this.userList);
                break;
            case msg.MATCHVS_LEAVE_ROOM:
                cc.director.loadScene('lobby');
                break;
            case msg.MATCHVS_LEAVE_ROOM_NOTIFY:
                this.removeView(event.detail);
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
            case msg.MATCHVS_ERROE_MSG:
                GLB.roomID = "";
                this.labelLog("[Err]errCode:"+event.detail.errorCode+" errMsg:"+event.detail.errorMsg);
                cc.director.loadScene("login")
                break
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
        this.node.off(msg.MATCHVS_JOIN_OPEN_NOTIFY,this.onEvent,this);
        this.node.off(msg.MATCHVS_JOIN_OPEN_RSP,this.onEvent,this);
        this.node.off(msg.MATCHVS_JOIN_OVER_RSP,this.onEvent,this);
        this.node.off(msg.MATCHVS_JOIN_OVER_NOTIFY,this.onEvent,this);
    },


    joinRoom: function (userInfoList) {
        this.labelLog('进入房间成功');
        this.labelLog('房间号: ' + userInfoList.roomID);
        this.labelRoomID.string = userInfoList.roomID;
        GLB.roomID = userInfoList.roomID;
        this.player1.string = GLB.name;
        this.userList = userInfoList;
        this.initUserView(this.userList);
        if (this.userList.length == GLB.MAX_PLAYER_COUNT-1) {
            engine.prototype.joinOver();
            this.startGame();
        }
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
    removeView:function (info) {
        for(var i = 0; i < this.userList.length;i++ ) {
            if(info.userId == this.userList[i].userId) {
                this.userList.splice(i,1);
            }
        }
        var name = info.cpProto.split("/n")[0];
        console.log(name);
        for(var i = 0; i < this.nameViewList.length; i++) {
            if(name == this.nameViewList[i].string) {
                this.nameViewList[i].string = "";
            }
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
