var mvs = require("Matchvs");
var GLB = require("Glb");
var engine = require("MatchvsEngine");
var msg = require("MatvhsMessage");
var response = require("MatchvsDemoResponse");

cc.Class({
    extends: cc.Component,

    properties: {

        match: cc.Node,
        back: cc.Node,
        roomID: {
            default: null,
            type: cc.EditBox
        },
        labelInfo: {
            default: null,
            type: cc.Label
        }        
    },

    labelLog: function (info) {
        this.labelInfo.string += '\n' + info;
    },

    onLoad () {
        var self = this;
        this.initEvent(self);
        this.back.on(cc.Node.EventType.TOUCH_END, function(event){
            cc.director.loadScene("lobby");
        });
        this.match.on(cc.Node.EventType.TOUCH_END, function(event){
            var roomidTmp = self.roomID.string;
            if (roomidTmp !== null && roomidTmp !== "") {
                self.labelLog("开始加入指定房间, roomid:" + roomidTmp);
                engine.prototype.joinRoom(roomidTmp, "china");
                c.director.loadScene("match");
            } else {
                self.labelLog("房间ID为空，请输入指定房间号");
            }
        });
    },

    /**
     * 注册对应的事件监听和把自己的原型传递进入，用于发送事件使用
     */
    initEvent:function (self) {
        response.prototype.init(self);
        this.node.on(msg.MATCHVS_ERROE_MSG, this.onEvent, this);
        this.node.on(msg.MATCHVS_JOIN_ROOM_RSP, this.onEvent, this);
    },

    /**
     * 接收事件
     * @param event
     */
    onEvent:function (event) {
        if (event.type == msg.MATCHVS_ERROE_MSG) {
            this.labelLog("[Err]errCode:"+event.detail.errorCode+" errMsg:"+event.detail.errorMsg);
        } else if (event.type == msg.MATCHVS_JOIN_ROOM_RSP) {
            GLB.roomID = this.roomID.string;
            cc.director.loadScene("createRoom");
        }
    },

    /**
     * 移除监听
     */
    removeEvent:function () {
        this.node.off(msg.MATCHVS_ERROE_MSG, this.onEvent, this);
    },


    
    onDestroy:function () {
        this.removeEvent();
        console.log("join certain Room 页面销毁");
    },

});
