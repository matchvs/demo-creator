/**
 * 大厅页面
 */
let engine = require("../MatchvsLib/MatchvsEngine");
let GLB = require("Glb");
let mvs = require("../MatchvsLib/Matchvs");
let msg = require("../MatchvsLib/MatvhvsMessage");

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

        nickName: {
            default:null,
            type:cc.Label
        },
        avatar111: {
            default:null,
            type:cc.Sprite
        },
    },

    onLoad:function () {
        let self = this;
        this.initEvent();
        this.nickName.string = "用户ID："+ GLB.name;
        console.log('avatar url', GLB.avatar);
        if (typeof(wx) !== 'undefined') {
            let image = wx.createImage();
            image.onload = () => {
                try {
                    let texture = new cc.Texture2D();
                    texture.initWithElement(image);
                    texture.handleLoadedTexture();
                    self.avatar111.spriteFrame = new cc.SpriteFrame(texture);
                } catch (e) {
                    console.log('wx onload image error');
                }
            };
            image.src = GLB.avatar;
        } else {
            cc.loader.load(GLB.avatar, function (err, res) {
                if (err) {
                    console.error('load avatar image error', err);
                    return;
                }
                self.avatar111.spriteFrame  = new cc.SpriteFrame(res);
            }) ;
        }
        // 返回登录
        this.returnLogin.on(cc.Node.EventType.TOUCH_END, function(){
            engine.prototype.logout();
            cc.director.loadScene('Login');
        });

        // 随机匹配
        this.randomMatch.on(cc.Node.EventType.TOUCH_END, function(){
            GLB.matchType = GLB.RANDOM_MATCH; // 修改匹配方式为随机匹配
            GLB.syncFrame = false;
           // self.labelLog('开始随机匹配');
            cc.director.loadScene('Match');
        });

        // 自定义属性匹配
        this.selfDefMatch.on(cc.Node.EventType.TOUCH_END, function(){
            GLB.syncFrame = false;
            cc.director.loadScene("SelfDefMatch");
        });

        // 查看房间列表
        this.roomList.on(cc.Node.EventType.TOUCH_END, function(){
            GLB.syncFrame = false;
            cc.director.loadScene("RoomList");
        });

        // 加入指定房间
        this.joinCertainRoom.on(cc.Node.EventType.TOUCH_END, function(){
            GLB.syncFrame = false;
            cc.director.loadScene("JoinCertainRoom");
        }); 

        // 创建房间
        this.createRoom.on(cc.Node.EventType.TOUCH_END, function(){
            GLB.syncFrame = false;
            let create = new mvs.MsCreateRoomInfo();
            create.name = 'roomName';
            create.maxPlayer = GLB.MAX_PLAYER_COUNT;
            create.mode = 0;
            create.canWatch = 0;
            create.visibility = 1;
            create.roomProperty = '白天模式';
            engine.prototype.createRoom(create,"Matchvs");
        });

        this.buttonSyncFrame.on(cc.Node.EventType.TOUCH_END, function(){
            GLB.syncFrame = true;
            GLB.matchType = GLB.RANDOM_MATCH; // 修改匹配方式为随机匹配
            cc.director.loadScene('Match');
        });

    },

    /**
     * 注册对应的事件监听和把自己的原型传递进入，用于发送事件使用
     */
    initEvent () {
        cc.systemEvent.on(msg.MATCHVS_ERROE_MSG,this.onEvent,this);
        cc.systemEvent.on(msg.MATCHVS_CREATE_ROOM,this.onEvent,this);
        cc.systemEvent.on(msg.MATCHVS_NETWORK_STATE_NOTIFY,this.onEvent,this);
    },

    /**
     * 接收事件
     * @param event
     */
    onEvent (event) {
        let eventData = event.data;
        if (event.type === msg.MATCHVS_ERROE_MSG) {
            cc.director.loadScene('Login');
        } else if (event.type === msg.MATCHVS_CREATE_ROOM) {
            GLB.roomID = eventData.rsp.roomID;
            cc.director.loadScene("CreateRoom");
        } else if (event.type === msg.MATCHVS_NETWORK_STATE_NOTIFY){
            if (eventData.netNotify.userID === GLB.userID && eventData.netNotify.state === 1) {
                console.log("netNotify.userID :"+eventData.netNotify.userID +"netNotify.state: "+eventData.netNotify.state);
                cc.director.loadScene("Login");
            }
        }
    },

    /**
     * 移除监听
     */
    removeEvent() {
        cc.systemEvent.off(msg.MATCHVS_ERROE_MSG,this.onEvent);
        cc.systemEvent.off(msg.MATCHVS_CREATE_ROOM,this.onEvent);
        cc.systemEvent.off(msg.MATCHVS_NETWORK_STATE_NOTIFY,this.onEvent);
    },


    /**
     * 生命周期，页面销毁
     */
    onDestroy:function () {
        this.removeEvent();
        console.log("Lobby页面销毁");
    }


});
