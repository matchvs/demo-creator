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
        this.node.on(msg.MATCHVS_RE_CONNECT,this.onEvent,this);
        this.node.on(msg.MATCHVS_ERROE_MSG, this.onEvent, this);
        this.node.on(msg.MATCHVS_INIT, this.onEvent, this);
        this.node.on(msg.MATCHVS_REGISTER_USER,this.onEvent,this);
        this.node.on(msg.MATCHVS_LOGIN,this.onEvent,this);
        this.node.on(msg.MATCHVS_WX_BINDING,this.onEvent,this);
        this.node.on(msg.MATCHVS_ROOM_DETAIL,this.onEvent,this);
    },


    /**
     * 事件接收方法
     * @param event
     */
    onEvent:function (event) {
        switch (event.type){
            case msg.MATCHVS_INIT:
                this.labelLog('初始化成功');
                this.getUserFromWeChat(this);
                break;
            case msg.MATCHVS_REGISTER_USER:
                var userInfo = event.detail.msg;
                console.log(userInfo);
                this.login(userInfo.id,userInfo.token);
                break;
            case msg.MATCHVS_LOGIN:
                var MsLoginRsp = event.detail.MsLoginRsp;
                // // todo 先不管重连
                if (MsLoginRsp.roomID != null && MsLoginRsp.roomID !== '0') {
                    console.log("开始重连"+ MsLoginRsp.roomID);
                    engine.prototype.reconnect();
                //     //todo 直接跳游戏页面
                } else {
                    cc.director.loadScene("lobby");
                }
                break;
            case msg.MATCHVS_RE_CONNECT:
                var reConnect  = event.detail.roomUserInfoList;
                engine.prototype.getRoomDetail(reConnect.roomID);
                GLB.roomID = reConnect.roomID;
                break;
            case msg.MATCHVS_ERROE_MSG:
                this.labelLog("[Err]errCode:"+event.detail.errorCode+" errMsg:"+event.detail.errorMsg);
                break;
            case msg.MATCHVS_WX_BINDING:
                engine.prototype.login(event.detail.val.userid,event.detail.val.token);
                break;
            case msg.MATCHVS_ROOM_DETAIL:
                if (event.detail.rsp.state == 1) {
                    cc.director.loadScene('createRoom');
                } else {
                    cc.director.loadScene("game");
                }
                if (event.detail.rsp.owner == GLB.userID) {
                    GLB.isRoomOwner = true;
                } else {
                    GLB.isRoomOwner = false;
                }
                break;
        }
    },


    getUserFromWeChat:function(self){
        //获取微信信息
        try {
            getWxUserInfo(function(userInfos){
                getUserOpenID(function (openInfos) {
                    userInfos.openInfos = openInfos;
                    self.bindOpenIDWithUserID(userInfos);
                });
            });
        } catch (error) {
            console.log("不是在微信平台，调用不进行绑定！");
            engine.prototype.registerUser();
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
        this.node.off(msg.MATCHVS_WX_BINDING,this.onEvent,this);
        this.node.off(msg.MATCHVS_RE_CONNECT,this.onEvent,this);
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
    },

    /**
     * 绑定微信OpenID 返回用户信息
     */
    bindOpenIDWithUserID:function(wxUserInfo){
        var self = this;
        console.log("获取到的微信用户信息",wxUserInfo);
        if(!wxUserInfo){
            return;
        }
        GLB.name = wxUserInfo.nickName;
        GLB.avatar = wxUserInfo.avatarUrl;
        var req = new  XMLHttpRequest();
        let reqUrl = this.getBindOpenIDAddr(GLB.channel,GLB.platform);
        req.open("post",reqUrl , true);
        req.setRequestHeader("Content-Type", "application/json")
        req.onreadystatechange = function () {
            if (req.readyState == 4 && (req.status >= 200 && req.status < 400)) {
                var response = req.responseText;
                console.log(response);
                var data = JSON.parse(response).data;
                console.log(data);
                console.log(data.userid,data.token);
                self.login(data.userid,data.token);
            }
        };
        //sign=md5(appKey&gameID=value1&openID=value2&session=value3&thirdFlag=value4&appSecret)
        let params = "gameID="+GLB.gameID+"&openID="+wxUserInfo.openInfos.data.openid+"&session="+wxUserInfo.openInfos.data.session_key+"&thirdFlag=1";
        //计算签名
        let signstr = this.getSign(params);
        //重组参数
        params = "userID=0&"+params+"&sign="+signstr;

        let jsonParam ={
            userID:0,
            gameID:GLB.gameID,
            openID:wxUserInfo.openInfos.data.openid,
            session:wxUserInfo.openInfos.data.session_key,
            thirdFlag:1,
            sign:signstr
        };
        req.send(jsonParam);

    },

    getBindOpenIDAddr :function(channel, platform){
        if(channel == "MatchVS" || channel == "Matchvs"){
            if(platform == "release"){
                return "http://vsuser.matchvs.com/wc6/thirdBind.do?"
            }else if(platform == "alpha"){
                return "http://alphavsuser.matchvs.com/wc6/thirdBind.do?";
            }
        }else if(channel == "MatchVS-Test1"){
            if(platform == "release"){
                return "http://zwuser.matchvs.com/wc6/thirdBind.do?"
            }else if(platform == "alpha"){
                return "http://alphazwuser.matchvs.com/wc6/thirdBind.do?";
            }
        }
    },

    getSign:function(params){
        let str = GLB.appKey+"&"+params+"&"+GLB.secret;
        console.log(str);
        let md5Str = hex_md5(str);
        console.log(md5Str);
        return md5Str;
    }

});
