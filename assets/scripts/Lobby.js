var mvs = require("Matchvs");
var GLB = require("Glb");
cc.Class({
    extends: cc.Component,

    properties: {
        randomMatch: cc.Node,
        selfDefMatch: cc.Node,
        roomList: cc.Node,
        joinCertainRoom: cc.Node,
        createRoom: cc.Node,
        returnLogin: cc.Node,
        buttonSyncFrame: cc.Node,
        buttonLeaveRoom: cc.Node,
        labelInfo: {
            default: null,
            type: cc.Label
        },

        errorMsg: {
            default: null,
            type: cc.Label
        },

        btnBack: cc.Node,
    },

    onLoad:function () {
        var self = this;
        // 返回登录
        this.returnLogin.on(cc.Node.EventType.TOUCH_END, function(event){
            mvs.engine.logout("");
            mvs.engine.uninit();
            console.log("logout + un init");
            cc.director.loadScene('login');
        });

        // 随机匹配
        this.randomMatch.on(cc.Node.EventType.TOUCH_END, function(event){
            GLB.matchType = GLB.RANDOM_MATCH; // 修改匹配方式为随机匹配
            self.labelLog('开始随机匹配');
            cc.director.loadScene('match');
        });

        // 自定义属性匹配
        this.selfDefMatch.on(cc.Node.EventType.TOUCH_END, function(event){
            cc.director.loadScene("selfDefMatch");
        });

        // 查看房间列表
        this.roomList.on(cc.Node.EventType.TOUCH_END, function(event){
            cc.director.loadScene("roomList");
        });

        // 加入指定房间
        this.joinCertainRoom.on(cc.Node.EventType.TOUCH_END, function(event){
            cc.director.loadScene("joinCertainRoom");
        }); 

        // 创建房间
        this.createRoom.on(cc.Node.EventType.TOUCH_END, function(event){
            cc.director.loadScene("createRoom");
        });

        // 离开房间
        this.buttonLeaveRoom.on(cc.Node.EventType.TOUCH_END, function(event){
            var result = mvs.engine.leaveRoom("");
            this.labelLog("离开房间:" + result);
        });

        this.buttonSyncFrame.on(cc.Node.EventType.TOUCH_END, function(event){
            GLB.syncFrame = true;
            self.labelLog('准备开启帧同步');
            GLB.matchType = GLB.RANDOM_MATCH; // 修改匹配方式为随机匹配
            self.labelLog('开始随机匹配');
            cc.director.loadScene('match');
        });

        this.btnBack.on(cc.Node.EventType.TOUCH_END, function(event){

            console.log(" back ,result:"+result);
            cc.director.loadScene('login');
        });


    mvs.response.errorResponse = this.errorResponse.bind(this);
        // mvs.response.reconnectResponse = this.reconnectResponse.bind(this);
        GLB.playerUserIds = [];
        GLB.playerSet.clear();
        GLB.isRoomOwner = false;
        GLB.syncFrame = false;
        this.btnBack.active = false;
        this.buttonLeaveRoom.active = false;
    },

    labelLog: function (info) {
        this.labelInfo.string += '\n' + info;
    },

    startGame: function () {
        this.labelLog('游戏即将开始');
        cc.director.loadScene('game');
    },

    recordPlayerUserIds: function (userIds) {
        GLB.playerUserIds = [GLB.userID];

        for (var i = 0, l = userIds.length; i < l; i++) {
            var userId = userIds[i];
            if (userId !== GLB.userID) {
                GLB.playerUserIds.push(userId);
            }
        }
    },

    errorResponse :function (errCode,errMsg) {
        var message = "[errorResponse] code:" + errCode + " msg:" + errMsg;
        console.error(message);
        try{
            this.errorMsg.string = 'errorCode='+errCode+'errorMsg='+errMsg;
            this.randomMatch.active = false;
            this.selfDefMatch.active = false;
            this.joinCertainRoom.active = false;
            this.createRoom.active = false;
            this.returnLogin.active = false;
            this.buttonSyncFrame.active = false;
            this.buttonLeaveRoom.active = false;
            this.roomList.active = false;
            this.btnBack.active = true;
        }catch(e){
            console.error(e.message);
        }
        GLB.lastErrMsg = message;
        GLB.isGameOver = false;
        try{
            cc.director.loadScene('login');
        }catch(e){
            console.error(e.message);
        }
    },

    initResponse: function(status) {
        this.labelLog('初始化成功，开始注册用户');


            mvs.response.registerUserResponse = this.registerUserResponse.bind(this); // 用户注册之后的回调
            var result = mvs.engine.registerUser();
        if (result !== 0)
            return this.labelLog('注册用户失败，错误码:' + result);
        else
            this.labelLog('注册用户成功');
    },

    registerUserResponse: function (userInfo) {
        GLB.userID = userInfo.id;
        this.labelLog('开始登录,用户Id:' + userInfo.id);

        mvs.response.loginResponse = this.loginResponse.bind(this); // 用户登录之后的回调
        this.login(userInfo.id,userInfo.token);
    },

    login :function (id,token) {
        var deviceId = 'abcdef';
        var gatewayId = 0;
        var result = mvs.engine.login(id, token,
            GLB.gameId, GLB.gameVersion,
            GLB.appKey, GLB.secret,
            deviceId, gatewayId);
        if (result !== 0)
            return this.labelLog('登录失败,错误码:' + status);
    },

    loginResponse: function (info) {
        if (info.status !== 200)
            return this.labelLog('登录失败,异步回调错误码:' + info.status);
        else
            this.labelLog('登录成功')

        // this.labelLog('开始进入房间');
        // mvs.response.joinRoomResponse = this.joinRoomResponse.bind(this);
        // var result = mvs.engine.joinRandomRoom(GLB.MAX_PLAYER_COUNT, '')
        // if (result !== 0)
        //     return this.labelLog('进入房间失败,错误码:' + result)
    },

    joinRoomResponse: function (status, userInfoList, roomInfo) {
        if (status !== 200) {
            return this.labelLog('进入房间失败,异步回调错误码: ' + status);
        } else {
            this.labelLog('进入房间成功');
            this.labelLog('房间号: ' + roomInfo.roomId);
        }


        var userIds = [GLB.userID]
        userInfoList.forEach(function(item) {if (GLB.userID !== item.userId) userIds.push(item.userId)});
        this.labelLog('房间用户: ' + userIds);
        mvs.response.sendEventNotify = this.sendEventNotify.bind(this); // 设置事件接收的回调

        if (userIds.length >= GLB.MAX_PLAYER_COUNT) {
            mvs.response.joinOverResponse = this.joinOverResponse.bind(this); // 关闭房间之后的回调
            var result = mvs.engine.joinOver("");
            this.labelLog("发出关闭房间的通知");
            if (result !== 0) {
                this.labelLog("关闭房间失败，错误码：", result);
            }

            GLB.playerUserIds = userIds;
        }
    },

    createRoomResponse: function (rsp) {
        var status = rsp.status;
        if (status !== 200) {
            return this.labelLog('创建房间失败,异步回调错误码: ' + status);
        } else {
            this.labelLog('创建房间成功');
            this.labelLog('房间号: ' + rsp.roomId);
            mvs.response.sendEventNotify = this.sendEventNotify.bind(this); // 设置事件接收的回调
        }
    },

    joinOverResponse: function(joinOverRsp) {
        if (joinOverRsp.status === 200) {
            this.labelLog("关闭房间成功");
            this.notifyGameStart();
        } else {
            this.labelLog("关闭房间失败，回调通知错误码：", joinOverRsp.status);
        }
    },

    notifyGameStart: function () {
        GLB.isRoomOwner = true;

        var event = {
            action: GLB.GAME_START_EVENT,
            userIds: GLB.playerUserIds
        };

        mvs.response.sendEventResponse = this.sendEventResponse.bind(this); // 设置事件发射之后的回调
        var result = mvs.engine.sendEvent(JSON.stringify(event));
        if (result.result !== 0)
            return this.labelLog('发送游戏开始通知失败，错误码' + result.result)

        // 发送的事件要缓存起来，收到异步回调时用于判断是哪个事件发送成功
        GLB.events[result.sequence] = event;
        this.labelLog("发起游戏开始的通知，等待回复");
    },

    sendEventResponse: function (info) {
        if (!info
            || !info.status
            || info.status !== 200) {
            return this.labelLog('事件发送失败')
        }

        var event = GLB.events[info.sequence]

        if (event && event.action === GLB.GAME_START_EVENT) {
            delete GLB.events[info.sequence]
            this.startGame()
        }
    },

    sendEventNotify: function (info) {
        if (info
            && info.cpProto
            && info.cpProto.indexOf(GLB.GAME_START_EVENT) >= 0) {

            GLB.playerUserIds = [GLB.userID]
            // 通过游戏开始的玩家会把userIds传过来，这里找出所有除本玩家之外的用户ID，
            // 添加到全局变量playerUserIds中
            JSON.parse(info.cpProto).userIds.forEach(function(userId) {
                if (userId !== GLB.userID) GLB.playerUserIds.push(userId)
            });
            this.startGame()
        }
    },


});
