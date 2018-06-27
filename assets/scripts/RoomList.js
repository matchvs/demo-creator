var engine = require("MatchvsEngine");
var response = require("MatchvsDemoResponse");
var mvs = require("Matchvs");
var GLB = require("Glb");
var msg = require("MatvhsMessage");
var RoomFilterEx = new mvs.MsRoomFilterEx();
RoomFilterEx.maxPlayer = GLB.MAX_PLAYER_COUNT;
RoomFilterEx.mode = 0;
RoomFilterEx.canWatch = 0;
RoomFilterEx.roomProperty = "";
RoomFilterEx.pageNo = 0;
RoomFilterEx.pageSize = 10;
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
        // button1: cc.Node,
        // button2: cc.Node,
        // button3: cc.Node,
        labelInfo: {
            default: null,
            type: cc.Label
        },

        // roomID1: {
        //     default: null,
        //     type: cc.Label
        // },
        // roomID2: {
        //     default: null,
        //     type: cc.Label
        // },
        // roomID3: {
        //     default: null,
        //     type: cc.Label
        // },
        // state1: {
        //     default: null,
        //     type: cc.Label
        // },
        // state2: {
        //     default: null,
        //     type: cc.Label
        // },
        // state3: {
        //     default: null,
        //     type: cc.Label
        // },
        // gamePlayer1: {
        //     default: null,
        //     type: cc.Label
        // },
        // gamePlayer2: {
        //     default: null,
        //     type: cc.Label
        // },
        // gamePlayer3: {
        //     default: null,
        //     type: cc.Label
        // },
        refreshNumText: {
            default: null,
            type: cc.Label
        },
        // map1: {
        //     default: null,
        //     type: cc.Label
        // },
        // map2: {
        //     default: null,
        //     type: cc.Label
        // },
        // map3: {
        //     default: null,
        //     type: cc.Label
        // },

    },


    getPositionInView: function (item) { // get item position in scrollview's node space
        let worldPos = item.parent.convertToWorldSpaceAR(item.position);
        let viewPos = this.scrollView.node.convertToNodeSpaceAR(worldPos);
        return viewPos;
    },


    onLoad:function () {
        this.content = this.scrollView.content;
        this.items = [];
        this.content.height = this.totalCount * (this.itemTemplate.height + this.spacing) + this.spacing; // get total content height
        // this.initialize();
        var self = this;
        this.initEvent(self);
        this.getRooomList();
        this.back.on(cc.Node.EventType.TOUCH_END, function(event){
            cc.director.loadScene("lobby");
        });

        time = setInterval(this.getRooomList,10000);
    },

    // initialize:function () {
    //
    //     for (let i = 0; i < this.spawnCount; ++i) { // spawn items, we only need to do this once
    //         let item = cc.instantiate(this.itemTemplate);
    //         this.content.addChild(item);
    //         item.setPosition(0, -item.height * (0.5 + i) - this.spacing * (i + 1));
    //         item.getComponent('Item').updateItem(i, i);
    //         this.items.push(item);
    //     }
    // },

    getRooomList:function () {
        mvs.engine.getRoomListEx(RoomFilterEx);
    },


    /**
     * 注册对应的事件监听和把自己的原型传递进入，用于发送事件使用
     */
    initEvent:function (self) {
        response.prototype.init(self);
        this.node.on(msg.MATCHVS_ERROE_MSG, this.onEvent, this);
        this.node.on(msg.MATCHVS_ROOM_LIST_EX,this.onEvent, this);
        this.node.on(msg.MATCHVS_JOIN_ROOM_RSP,this.onEvent, this);
    },

    /**
     * 接收事件
     * @param event
     */
    onEvent :function (event) {
        switch (event.type) {
            case msg.MATCHVS_ROOM_LIST_EX:
                this.getRoomListExResponse(event.detail);
                break;
            case msg.MATCHVS_ERROE_MSG:
                this.labelLog("[Err]errCode:"+event.detail.errorCode+" errMsg:"+event.detail.errorMsg);
                break;
            case msg.MATCHVS_JOIN_ROOM_RSP:
                GLB.roomID = event.detail.userInfoList.roomID;
                this.labelLog("加入指定房间成功, roomID:" +  GLB.roomID);
                cc.director.loadScene('createRoom');
                break;
        }

    },
    


    getRoomListExResponse: function(roomListExInfo) {
        refreshNum ++;
        this.refreshNumText.string = '获取列表次数'+ refreshNum;
        // for (var i = 0; i < 3; i++) {
        //     this.roomIDs[i].string = "";
        //     this.stateS[i].string = "";
        //     this.stateS[i].string = "";
        //     this.gamePlayerS[i].string = "";
        //     this.maps[i].string = "";
        //     this.buttonS[i].active = false;
        // }
        for(var i = 0; i < roomListExInfo.rsp.total; i++) {
            let item = cc.instantiate(this.itemTemplate);
            this.content.addChild(item);
            item.setPosition(0, -item.height * (0.5 + i) - this.spacing * (i + 1));
            item.getComponent('Item').updateItem(roomListExInfo.rsp.roomAttrs[i]);
            // this.roomIDs[i].string = roomListExInfo.rsp.roomAttrs[i].roomID;
            // this.buttonS[i].active = true;
            // var state = roomListExInfo.rsp.roomAttrs[i].state;
            // if (state == 1) {
            //     this.stateS[i].string = "开放";
            // } else {
            //     this.stateS[i].string = "关闭";
            // }
            // this.maps[i].string = roomListExInfo.rsp.roomAttrs[i].roomProperty;
            // this.gamePlayerS[i].string = roomListExInfo.rsp.roomAttrs[i].gamePlayer+"/"+roomListExInfo.rsp.roomAttrs[i].maxPlayer;
        }
    },

    labelLog: function (info) {
        // this.labelInfo.string += '\n' + info;
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
    },



});
