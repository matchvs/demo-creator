let GLB = require("Glb");
let engine = require("../MatchvsLib/MatchvsDemoEngine");
let msg = require("../MatchvsLib/MatvhvsMessage");

cc.Class({
    extends: cc.Component,

    properties: {

        match: cc.Node,
        back: cc.Node,
        nickName:cc.Label,
        roomID: {
            default: null,
            type: cc.EditBox
        },
        errorHint: {
            default: null,
            type: cc.Label
        }
    },


    onLoad () {
        let self = this;
        this.initEvent();
        self.nickName.string = '用户ID:'+GLB.userID;
        this.back.on(cc.Node.EventType.TOUCH_END, function(){
            cc.director.loadScene("Lobby");
        });
        this.match.on(cc.Node.EventType.TOUCH_END, function(){
            let roomidTmp = self.roomID.string;
            if (roomidTmp !== null && roomidTmp !== "") {
                let result = engine.prototype.joinRoom(roomidTmp, "Matchvs");
                if (result === 0) {
                    self.errorHint.node.active = false;
                } else {
                    self.errorHint.node.active = true;
                    self.errorHint.string = "没有查找到此房间，请重新输入"
                }
            } else {
                self.errorHint.node.active = true;
                self.errorHint.string = "房间号不能为空，请输入房间号在进行加入"
            }
        });
    },

    /**
     * 注册对应的事件监听和把自己的原型传递进入，用于发送事件使用
     */
    initEvent:function () {
        cc.systemEvent.on(msg.MATCHVS_ERROE_MSG,this.onEvent,this);
        cc.systemEvent.on(msg.MATCHVS_JOIN_ROOM_RSP,this.onEvent,this);
        cc.systemEvent.on(msg.MATCHVS_NETWORK_STATE_NOTIFY,this.onEvent,this);
    },


    /**
     * 接收事件
     * @param event
     */
    onEvent:function (event) {
        let eventData = event.data;
        if (event.type === msg.MATCHVS_ERROE_MSG) {
            if (eventData.errorCode === 405 ) {
                this.errorHint.node.active = true;
                this.errorHint.string = "房间已满";
                console.warn("房间已满");
                return;
            }
            if (eventData.errorCode === 406) {
                this.errorHint.node.active = true;
                this.errorHint.string = "房间已经关闭";
                console.warn("房间已joinOver");
                return;
            }
            cc.director.loadScene('Login');
        } else if (event.type === msg.MATCHVS_JOIN_ROOM_RSP) {
            GLB.roomID = this.roomID.string;
            cc.director.loadScene("CreateRoom");
        } else if (event.type === msg.MATCHVS_NETWORK_STATE_NOTIFY) {
            if (eventData.netNotify.userID === GLB.userID && eventData.netNotify.state === 1) {
                console.log("netNotify.userID :"+eventData.netNotify.userID +"netNotify.state: "+eventData.netNotify.state);
                cc.director.loadScene("Login");
            }
        }
    },

    /**
     * 移除监听
     */
    removeEvent:function () {
        cc.systemEvent.off(msg.MATCHVS_ERROE_MSG,this.onEvent);
        cc.systemEvent.off(msg.MATCHVS_JOIN_ROOM_RSP,this.onEvent);
        cc.systemEvent.off(msg.MATCHVS_NETWORK_STATE_NOTIFY,this.onEvent);
    },


    
    onDestroy:function () {
        this.removeEvent();
        console.log("join certain Room 页面销毁");
    },

});
