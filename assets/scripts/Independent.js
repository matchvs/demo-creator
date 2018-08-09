var engine = require("MatchvsEngine");
var response = require("MatchvsDemoResponse");
var msg = require("MatvhsMessage");
var GLB = require("Glb");
cc.Class({
    extends: cc.Component,

    properties: {
        endPointEditBox: cc.EditBox,
        gameIDEditBox: cc.EditBox,
        keyEditBox: cc.EditBox,
        secretEditBox: cc.EditBox,
        userIDEditBox:cc.EditBox,
        confirmButton:cc.Node,
        tokenEditBox:cc.EditBox,
        labelInfo: {
            default: null,
            type: cc.Label
        }
    },

    start () {
        var selt = this;
        this.initEvent(selt);
        var endPoint = this.endPointEditBox.getComponent(cc.EditBox).string;
        var gameID = this.gameIDEditBox.getComponent(cc.EditBox).string;
        GLB.appKey = this.keyEditBox.getComponent(cc.EditBox).string;
        GLB.secret = this.secretEditBox.getComponent(cc.EditBox).string;
        this.confirmButton.on(cc.Node.EventType.TOUCH_END, function (event) {
            selt.premiseInit(endPoint,gameID);
        });

    },
    /**
     * 初始化
     */
    premiseInit(enPoint,gameID){
        if (enPoint == '' && gameID =='') {
            this.labelLog("enPoint或gameID不能为空");
        } else {
            GLB.gameID = Number(gameID);
            engine.prototype.premiseInit(enPoint,gameID);
        }
    },

    login(id,token) {
        GLB.userID = Number(id);
        GLB.name = id;
        GLB.avatar = 'http://pic.vszone.cn/upload/avatar/1464079969.png';
        this.labelLog('开始登录...用户ID:' + id + " gameID " + GLB.gameID);
        engine.prototype.login(id,token);
    },

    /**
     * 注册对应的事件监听和把自己的原型传递进入，用于发送事件使用
     */
    initEvent:function (self) {
        response.prototype.init(self);
        this.node.on(msg.MATCHVS_INIT, this.onEvent, this);
        this.node.on(msg.MATCHVS_LOGIN,this.onEvent,this);
    },

    onEvent(event) {
        switch (event.type){
            case msg.MATCHVS_INIT:
                var token = this.tokenEditBox.getComponent(cc.EditBox).string;
                var userID = this.userIDEditBox.getComponent(cc.EditBox).string;
                if (userID == '' && token == '') {
                    this.labelLog("userID和token不能为空");
                } else {
                    this.login(userID,token);
                }
                break;
            case msg.MATCHVS_LOGIN:
                    cc.director.loadScene("lobby");
                break;
        }









    },

    /**
     * 页面log打印
     * @param info
     */
    labelLog: function (info) {
        this.labelInfo.string += '\n[LOG]: ' + info;
    },


    onDestroy() {

    }
});
