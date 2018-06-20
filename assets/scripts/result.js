// var mvs = require("Matchvs");
var GLB = require("Glb");
var engine = require("MatchvsEngine");
var response = require("MatchvsDemoResponse");
var msg = require("MatvhsMessage");

cc.Class({
    extends: cc.Component,

    properties: {

        labelFirst: {
            default: null,
            type: cc.Label
        },
        buttonBack: cc.Node,
    },


    onLoad () {
        var self = this;
        this.labelFirst.string = GLB.number1 + "\n" + GLB.number2 + "\n" + GLB.number3 + "\n";
        this.initEvent(self);
        this.buttonBack.on(cc.Node.EventType.TOUCH_END, function(event){
            // engine.prototype.leaveRoom();
            cc.director.loadScene('lobby');
        });
    },


    /**
     * 注册对应的事件监听和把自己的原型传递进入，用于发送事件使用
     */
    initEvent:function (self) {
        response.prototype.init(self);
        this.node.on(msg.MATCHVS_ERROE_MSG, this.onEvent, this);
        this.node.on(msg.MATCHVS_LEAVE_ROOM, this.onEvent, this);
    },
    
    
    onEvent:function (event) {
        switch (event.type){
            case msg.MATCHVS_ERROE_MSG:
                console.log("[Err]errCode:"+event.detail.errorCode+" errMsg:"+event.detail.errorMsg);
            break;
        }

    },

    start () {

    },

    onDestroy() {
        GLB.number1 = 0;
        GLB.number2 = 0;
        GLB.number3 = 0;
        this.node.off(msg.MATCHVS_ERROE_MSG, this.onEvent, this);
        this.node.off(msg.MATCHVS_LEAVE_ROOM, this.onEvent, this);
    }

});
