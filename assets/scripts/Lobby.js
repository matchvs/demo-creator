/**
 * 大厅页面
 */
var engine = require("MatchvsEngine");
var response = require("MatchvsDemoResponse");
var GLB = require("Glb");
var mvs = require("Matchvs");
var msg = require("MatvhvsMessage");
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
        labelInfo: {
            default: null,
            type: cc.Label
        },

        errorMsg: {
            default: null,
            type: cc.Label
        },


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
        var self = this;
        this.initEvent(self);
        this.nickName.string = GLB.name;
        console.log('avatar url', GLB.avatar);
        if (GLB.isWX) {
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
            }
            image.src = GLB.avatar;
        } else {
            cc.loader.load(GLB.avatar, function (err, res) {
                if (err) {
                    console.error('load avatar image error', err);
                    return;
                }
                var frame = new cc.SpriteFrame(res);
                self.avatar111.spriteFrame  = frame;
            }) ;
        }
        // 返回登录
        this.returnLogin.on(cc.Node.EventType.TOUCH_END, function(event){
            engine.prototype.logout();
            engine.prototype.uninit();
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
            var create = new mvs.MsCreateRoomInfo();
            create.name = 'roomName';
            create.maxPlayer = GLB.MAX_PLAYER_COUNT;
            create.mode = 0;
            create.canWatch = 0;
            create.visibility = 1;
            create.roomProperty = '白天模式';
            engine.prototype.createRoom(create,"china");
        });

        this.buttonSyncFrame.on(cc.Node.EventType.TOUCH_END, function(event){
            GLB.syncFrame = true;
            self.labelLog('准备开启帧同步');
            GLB.matchType = GLB.RANDOM_MATCH; // 修改匹配方式为随机匹配
            self.labelLog('开始随机匹配');
            cc.director.loadScene('match');
        });

    },

    /**
     * 注册对应的事件监听和把自己的原型传递进入，用于发送事件使用
     */
    initEvent:function (self) {
        response.prototype.init(self);
        this.node.on(msg.MATCHVS_ERROE_MSG, this.onEvent, this);
        this.node.on(msg.MATCHVS_CREATE_ROOM,this.onEvent,this);
    },

    /**
     * 接收事件
     * @param event
     */
    onEvent:function (event) {
        if (event.type == msg.MATCHVS_ERROE_MSG) {
            this.labelLog("[Err]errCode:"+event.detail.errorCode+" errMsg:"+event.detail.errorMsg);
            cc.director.loadScene('login');
        } else if (event.type == msg.MATCHVS_CREATE_ROOM) {
            GLB.roomID = event.detail.rsp.roomID;
            cc.director.loadScene("createRoom");
        }
    },

    /**
     * 移除监听
     */
    removeEvent:function () {
        this.node.off(msg.MATCHVS_CREATE_ROOM,this.onEvent, this);
        this.node.off(msg.MATCHVS_ERROE_MSG, this.onEvent, this);
    },


    labelLog: function (info) {
        this.labelInfo.string += '\n' + info;
    },


    /**
     * 生命周期，页面销毁
     */
    onDestroy:function () {
        this.removeEvent();
        console.log("Lobby页面销毁");
    }


});
