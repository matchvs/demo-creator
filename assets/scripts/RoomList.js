var engine = require("MatchvsEngine");
var response = require("MatchvsDemoResponse");
var mvs = require("Matchvs");
var GLB = require("Glb");
var msg = require("MatvhvsMessage");

var refreshNum = 0;
var time;


cc.Class({
    extends: cc.Component,

    properties: {
        back: cc.Node,

        itemTemplate: { // item template to instantiate other items
            default: null,
            type: cc.Node
        },

        scrollView: {
            default: null,
            type: cc.ScrollView
        },
        spacing: 0,
        totalCount: 0,
        labelInfo: {
            default: null,
            type: cc.Label
        },
        refreshNumText: {
            default: null,
            type: cc.Label
        },

    },


    onLoad:function () {
        this.content = this.scrollView.content;
        this.items = [];
        var self = this;
        this.initEvent(self);
        this.getRooomList();
        this.back.on(cc.Node.EventType.TOUCH_END, function(event){
            cc.director.loadScene("Lobby");
        });

        time = setInterval(this.getRooomList,10000);
    },


    getRooomList:function () {
        var RoomFilterEx = new mvs.MsRoomFilterEx();
        RoomFilterEx.maxPlayer = GLB.MAX_PLAYER_COUNT;
        RoomFilterEx.mode = 0;
        RoomFilterEx.canWatch = 0;
        RoomFilterEx.roomProperty = "白天模式";
        RoomFilterEx.pageNo = 0;
        RoomFilterEx.pageSize = 10;
        engine.prototype.getRoomListEx(RoomFilterEx)
    },


    /**
     * 注册对应的事件监听和把自己的原型传递进入，用于发送事件使用
     */
    initEvent:function (self) {
        response.prototype.init(self);
        this.node.on(msg.MATCHVS_ERROE_MSG, this.onEvent, this);
        this.node.on(msg.MATCHVS_ROOM_LIST_EX,this.onEvent, this);
        this.node.on(msg.MATCHVS_JOIN_ROOM_RSP,this.onEvent, this);
        this.node.on(msg.MATCHVS_NETWORK_STATE_NOTIFY,this.onEvent,this);

    },

    /**
     * 接收事件
     * @param event
     */
    onEvent :function (event) {
        var eventData = event.detail;
        if (eventData == undefined) {
            eventData = event;
        }
        switch (event.type) {
            case msg.MATCHVS_ROOM_LIST_EX:
                this.getRoomListExResponse(eventData.rsp);
                break;
            case msg.MATCHVS_ERROE_MSG:
                if (eventData.errorCode == 405) {
                    this.labelLog("房间人数已满");
                    console.warn("房间人数已满");
                    return;
                }
                if (eventData.errorCode === 406) {
                    this.labelLog("房间已joinOver");
                    console.warn("房间已joinOver");
                    return;
                }
                this.labelLog("[Err]errCode:"+eventData.errorCode+" errMsg:"+eventData.errorMsg);
                cc.director.loadScene('Login');
                break;
            case msg.MATCHVS_JOIN_ROOM_RSP:
                GLB.roomID = eventData.userInfoList.roomID;
                this.labelLog("加入指定房间成功, roomID:" +  GLB.roomID);
                cc.director.loadScene('CreateRoom');
                break;
            case msg.MATCHVS_NETWORK_STATE_NOTIFY:
                if (eventData.netNotify.userID == GLB.userID && eventData.netNotify.state === 1) {
                    console.log("netNotify.userID :"+eventData.netNotify.userID +"netNotify.state: "+eventData.netNotify.state)
                    cc.director.loadScene("Login");
                }
                break;
        }

    },
    


    getRoomListExResponse: function(roomListExInfo) {
        refreshNum ++;
        this.refreshNumText.string = '获取列表次数'+ refreshNum;
        this.totalCount  = roomListExInfo.total;
        this.content.height = this.totalCount * (this.itemTemplate.height + this.spacing) + this.spacing; // get total content height
        this.content.removeAllChildren(true);
        for(var i = 0; i < roomListExInfo.total; i++) {
            let item = cc.instantiate(this.itemTemplate);
            this.content.addChild(item);
            item.setPosition(0, -item.height * (0.5 + i) - this.spacing * (i + 1));
            item.getComponent('Item').updateItem(roomListExInfo.roomAttrs[i]);
        }
    },

    labelLog: function (info) {
        this.labelInfo.string += '\n' + info;
    },

    onDestroy:function() {
        clearInterval(time);
        refreshNum = 0;
        this.removeEvent();
        console.log("RoomList 页面销毁");
    },

    /**
     * 移除监听
     */
    removeEvent:function () {
        this.node.off(msg.MATCHVS_ERROE_MSG, this.onEvent, this);
        this.node.off(msg.MATCHVS_ROOM_LIST_EX,this.onEvent, this);
        this.node.off(msg.MATCHVS_NETWORK_STATE_NOTIFY,this.onEvent,this);
    },



});
