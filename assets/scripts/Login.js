/**
 * 登录
 */
var GLB = require("Glb");
var engine = require("MatchvsEngine");
var response = require("MatchvsDemoResponse");
var msg = require("MatvhsMessage");
cc.Class({
    extends: cc.Component,

    properties: {
        gameIdInput: cc.Node,
        appKeyInput: cc.Node,
        secret: cc.Node,
        alphaRadio: cc.Node,
        confirm: cc.Node,
        clear: cc.Node,
        labelInfo: {
            default: null,
            type: cc.Label
        }
    },


    /**
     * load 显示页面
     */
    onLoad: function () {
        var self = this;
        this.initEvent(self);
        this.alphaRadio.getComponent(cc.Toggle).isChecked = true;
        this.confirm.on(cc.Node.EventType.TOUCH_END, function (event) {
            engine.prototype.init(GLB.channel,GLB.platform,GLB.gameID);
            // 获取用户输入的参数
            if (Number(self.gameIdInput.getComponent(cc.EditBox).string) != 0) {
                GLB.gameID = Number(self.gameIdInput.getComponent(cc.EditBox).string);
            }
            if (self.appKeyInput.getComponent(cc.EditBox).string != "")
                GLB.appKey = self.appKeyInput.getComponent(cc.EditBox).string;

            if (self.secret.getComponent(cc.EditBox).string != "") {
                GLB.secret = self.secret.getComponent(cc.EditBox).string;
            }
            var alpha = self.alphaRadio.getComponent(cc.Toggle).isChecked;
            if (alpha === true) {
                GLB.platform = 'alpha';
            } else {
                GLB.platform = 'release';
            }
        });
        this.clear.on(cc.Node.EventType.TOUCH_END, function (event) {
            if (LocalStore_Clear) {
                LocalStore_Clear()
            }
            console.log("clear user info cache");
        });
        this.labelLog(GLB.lastErrMsg);
    },

    /**
     * 注册对应的事件监听和把自己的原型传递进入，用于发送事件使用
     */
    initEvent:function (self) {
        response.prototype.init(self);
        this.node.on(msg.MATCHVS_ERROE_MSG, this.onEvent, this);
        this.node.on(msg.MATCHVS_INIT, this.onEvent, this);
        this.node.on(msg.MATCHVS_REGISTER_USER,this.onEvent,this);
        this.node.on(msg.MATCHVS_LOGIN,this.onEvent,this);
    },


    /**
     * 事件接收方法
     * @param event
     */
    onEvent:function (event) {
        switch (event.type){
            case msg.MATCHVS_INIT:
                this.labelLog('初始化成功');
                engine.prototype.registerUser();
                break;
            case msg.MATCHVS_REGISTER_USER:
                var userInfo = event.detail.msg;
                console.log(userInfo);
                this.login(userInfo.id,userInfo.token);
                break;
            case msg.MATCHVS_LOGIN:
                var loginRsp = event.detail;
                // // todo 先不管重连
                // if (loginRsp.roomID != null && loginRsp.roomID !== '0') {
                //     console.log("开始重连"+ loginRsp.roomID);
                //     engine.prototype.reconnect();
                //     //todo 直接跳游戏页面
                // } else {
                    cc.director.loadScene("lobby");
                // }
                break;
            case msg.MATCHVS_ERROE_MSG:
                this.labelLog("[Err]errCode:"+event.detail.errorCode+" errMsg:"+event.detail.errorMsg);
                break;
        }
    },


    /**
     * 登录
     * @param id
     * @param token
     */
    login: function (id, token) {
        GLB.userID = id;
        this.labelLog('开始登录...用户ID:' + id + " gameID " + GLB.gameID);
        engine.prototype.login(id,token);
    },

    /**
     * 移除监听
     */
    removeEvent:function () {
        this.node.off(msg.MATCHVS_ERROE_MSG, this.onEvent, this);
        this.node.off(msg.MATCHVS_INIT, this.onEvent, this);
        this.node.off(msg.MATCHVS_REGISTER_USER,this.onEvent,this);
        this.node.off(msg.MATCHVS_LOGIN,this.onEvent,this);
    },

    /**
     * 页面log打印
     * @param info
     */
    labelLog: function (info) {
        this.labelInfo.string += '\n[LOG]: ' + info;
    },

    /**
     * 生命周期，页面销毁
     */
    onDestroy:function () {
        this.removeEvent();
        console.log("Login页面销毁");
    }

});
