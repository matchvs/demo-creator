var engine = require("MatchvsEngine");
var response = require("MatchvsDemoResponse");
var mvs = require("Matchvs");
var GLB = require("Glb");
var msg = require("MatvhvsMessage");
cc.Class({
    extends: cc.Component,

    properties: {
        playerNameOne: {
            default: null,
            type: cc.Label
        },
        playerNameTwo: {
            default: null,
            type: cc.Label
        },
        playerTwoLayout: cc.Layout,
        playerTwoLabel : cc.Label,
        playerNameThree: {
            default: null,
            type: cc.Label
        },
        playerThreeLayout:cc.Layout,
        playerThreeLabel : cc.Label,
        labelRoomID: {
            default: null,
            type: cc.Label
        },
        matchingWay: {
            default: null,
            type: cc.Label
        },
        back: cc.Node,
        joinopen: cc.Node,
        nickName:cc.Label,
        userList :[],
        nameViewList:[]
    },


    onLoad: function () {
        var self = this;
        this.initEvent(self);
        this.nameViewList = [[this.playerNameTwo,this.playerTwoLayout,this.playerTwoLabel],
            [this.playerNameThree,this.playerThreeLayout,this.playerThreeLabel]];
        if (GLB.syncFrame) {
            self.matchingWay.string = "帧同步模式" ;
        }
        // this.nameViewList[0][1].node.color = '#ffffff';
        // self.playerTwoLayout.node.color.a = 255;
        // self.playerTwoLayout.node.color.r = 139;
        // self.playerTwoLayout.node.color.g = 215;
        // self.playerTwoLayout.node.color.b = 224;
        // console.log(JSON.stringify(self.playerTwoLayout.node.color.a)+'node');
        self.nickName.string = '用户ID：'+ GLB.userID;
        if (GLB.matchType === GLB.RANDOM_MATCH) {
            engine.prototype.joinRandomRoom(GLB.MAX_PLAYER_COUNT, "这里是负载信息");
        } else if (GLB.matchType === GLB.PROPERTY_MATCH) {
            var matchinfo = new mvs.MsMatchInfo();
            matchinfo.maxPlayer = GLB.MAX_PLAYER_COUNT;
            matchinfo.mode = 0;
            matchinfo.canWatch = 1;
            matchinfo.tags =  GLB.tagsInfo;
            self.matchingWay.string = "自定义属性匹配" ;
            engine.prototype.joinRoomWithProperties(matchinfo,"Matchvs");
        }

        this.back.on(cc.Node.EventType.TOUCH_END, function (event) {
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
        var eventData = event.detail;
        if (eventData == undefined) {
            eventData = event;
        }
        var checkBox = this.joinopen.getComponent(cc.Toggle);
        switch (event.type) {
            case msg.MATCHVS_JOIN_ROOM_RSP:
                this.joinRoom(eventData.userInfoList);
                break;
            case msg.MATCHVS_JOIN_ROOM_NOTIFY:
                this.userList.push(eventData.roomUserInfo)
                this.initUserView(this.userList);
                break;
            case msg.MATCHVS_LEAVE_ROOM:
                cc.director.loadScene('Lobby');
                break;
            case msg.MATCHVS_LEAVE_ROOM_NOTIFY:
                this.removeView(eventData.leaveRoomInfo);
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
                cc.director.loadScene("Login")
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
        this.labelRoomID.string = userInfoList.roomID;
        GLB.roomID = userInfoList.roomID;
        this.playerNameOne.string = GLB.name;
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
            if (this.nameViewList[i][0].string === "") {
                this.nameViewList[i][0].string = info.name;
                this.nameViewList[i][1].node.color = '#96E8B5';
            }
        }
        if (this.userList.length == GLB.MAX_PLAYER_COUNT-1) {
            engine.prototype.joinOver();
            this.startGame();
            //1 是游戏已经开始
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
        var name = JSON.parse(info.cpProto).name;
        for(var i = 0; i < this.nameViewList.length; i++) {
            if(name == this.nameViewList[i][0].string) {
                this.nameViewList[i][0].string = "";
            }
        }
    },


    startGame: function () {
        cc.director.loadScene('Game');
    },
});
