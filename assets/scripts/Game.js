var mvs = require("Matchvs");
var GLB = require("Glb");
var msg = require("MatvhsMessage");
var engine = require("MatchvsEngine");
var response = require("MatchvsDemoResponse");
cc.Class({
    extends: cc.Component,

    properties: {
        maxStarDuration: 0,
        minStarDuration: 0,

        ground: {
            default: null,
            type: cc.Node
        },

        players: [cc.Node],

        scoreDisplays0: {
            default: null,
            type: cc.Label
        },
        scoreDisplays1: {
            default: null,
            type: cc.Label
        },
        scoreDisplays2: {
            default: null,
            type: cc.Label
        },
        // 引用星星预支资源
        starPrefab: {
            default: null,
            type: cc.Prefab
        },

        // 音频资源
        scoreAudio: {
            default: null,
            url: cc.AudioClip
        },

        delay: cc.Label,
        maxDelay: cc.Label,
        minDelay: cc.Label,
        receiveCount: cc.Label,
        receiveCountValue: 0,
        buttonSubscribe: cc.Node,
        buttonUnsubscribe: cc.Node,
        buttonSend: cc.Node,
        buttonLeaveRoom: cc.Node,
        roomidLabel: {
            default: null,
            type: cc.Label
        },
        useridLabel: {
            default: null,
            type: cc.Label
        },
        labelInfo: {
            default: null,
            type: cc.Label
        },
        labelsyncrate: {
            default: null,
            type: cc.Label
        },
        labelGameoverTime: {
            default: null,
            type: cc.Label
        },
        userInfos :[],
        articlePositonX:0,  // 生成的物品的X坐标
        newStar : null,
        score:0,
        userScores:[],
        countDown:null
    },


    onLoad: function () {
        engine.prototype.getRoomDetail(GLB.roomID);
        this.scoreDisplays = [this.scoreDisplays0,this.scoreDisplays1, this.scoreDisplays2];
        this.timer = 0;
        var myScorce = {userID:GLB.userID,Score:this.score};
        this.userScores.push(myScorce);
        this.starDuration = this.maxStarDuration - this.minStarDuration;
        this.gameTime = 9999;
        this.roomidLabel.string = "房间号:" + GLB.roomID;
        this.useridLabel.string = "用户id:" + GLB.userID;
        // 场景ground的高度
        this.groundY = this.ground.y + this.ground.height / 2;
        this.compensation = 50;
        this.starMaxX = this.node.width / 2;
        if (GLB.mapType == "黑夜模式") {
            this.ground.opacity =  40;
        }
        cc.director.getCollisionManager().enabled = true;
        cc.director.getCollisionManager().enabledDebugDraw = true;
        cc.director.getCollisionManager().enabledDrawBoundingBox = true;
        mvs.response.frameUpdate = this.frameUpdate.bind(this);
        mvs.response.networkStateNotify = this.networkStateNotify.bind(this);

        var self = this;
        this.initEvent(self);
        this.buttonSubscribe.on(cc.Node.EventType.TOUCH_END, function (event) {
            var result = mvs.engine.subscribeEventGroup(["MatchVS"], ["hello"]);
            if (result !== 0)
                self.labelLog('订阅分组失败,错误码:' + result);
            mvs.response.subscribeEventGroupResponse = self.subscribeEventGroupResponse.bind(self);
        });
        this.buttonUnsubscribe.on(cc.Node.EventType.TOUCH_END, function (event) {
            var result = mvs.engine.subscribeEventGroup(["hello"], ["MatchVS"]);
            if (result !== 0)
                self.labelLog('取消订阅分组失败,错误码:' + result);
            mvs.response.subscribeEventGroupResponse = self.subscribeEventGroupResponse.bind(self);
        });
        this.buttonSend.on(cc.Node.EventType.TOUCH_END, function (event) {
            var result = mvs.engine.sendEventGroup("分组消息测试", ["MatchVS"]);
            if (result !== 0)
                self.labelLog('发送分组消息失败,错误码:' + result);
            mvs.response.sendEventGroupResponse = self.sendEventGroupResponse.bind(self);
            mvs.response.sendEventGroupNotify = self.sendEventGroupNotify.bind(self);
        });
        this.buttonLeaveRoom.on(cc.Node.EventType.TOUCH_END, function (event) {
            for (var i = 0, l = self.players.length; i < l; i++) {
                self.players[i].stopAllActions()
            }
            GLB.isGameOver = true;
            mvs.engine.leaveRoom("");
            cc.director.loadScene('lobby');
        });
        if (GLB.syncFrame === true && GLB.isRoomOwner === true) {
            mvs.response.setFrameSyncResponse = self.setFrameSyncResponse.bind(self);
            var result = mvs.engine.setFrameSync(GLB.FRAME_RATE);
            if (result !== 0)
                this.labelLog('设置帧同步率失败,错误码:' + result);
        }
        if (GLB.syncFrame === true) {
            this.labelsyncrate.string = "同步帧率:" + GLB.FRAME_RATE;
        }

        this.buttonSubscribe.active = false;
        this.buttonUnsubscribe.active = false;
        this.buttonSend.active = false;
        self.labelGameoverTime.string = GLB.playertime;
        GLB.isGameOver = false;
        this.countDown = setInterval(function () {
            self.labelGameoverTime.string = self.labelGameoverTime.string - 1;
            if (self.labelGameoverTime.string === "2") {
                GLB.isGameOver = true;
            }
            if (self.labelGameoverTime.string == "0") {
                // clearInterval(self.countDown);
                self.gameOver();
            }
        }, 1000);
        this.touchingNumber = 0;
    },

    /**
     * 注册对应的事件监听和把自己的原型传递进入，用于发送事件使用
     */
    initEvent:function (self) {
        response.prototype.init(self);
        this.node.on(msg.MATCHVS_ROOM_DETAIL,this.onEvent,this);
        this.node.on(msg.MATCHVS_SEND_EVENT_NOTIFY,this.onEvent,this);
        this.node.on(msg.MATCHVS_SEND_EVENT_RSP,this.onEvent,this);
        this.node.on(msg.MATCHVS_ERROE_MSG,this.onEvent,this);
        this.node.on(msg.MATCHVS_FRAME_UPDATE,this.onEvent ,this);
        this.node.on(msg.PLAYER_POSINTON,this.onEvent , this);
        this.node.on(msg.MATCHVS_LEAVE_ROOM_NOTIFY,this.onEvent, this);
    },
    
    onEvent :function (event) {
        switch(event.type) {
            case msg.MATCHVS_ROOM_DETAIL:
                for (var i = 0; i <event.detail.rsp.userInfos.length;i++) {
                    if (event.detail.rsp.userInfos[i].userId !== GLB.userID) {
                        this.userInfos.push(event.detail.rsp.userInfos[i]);
                        var userScore = {userID:0,Score:0};
                        userScore.userID = event.detail.rsp.userInfos[i].userId;
                        userScore.Score = 0;
                        this.userScores.push(userScore);
                    }
                }
                if (event.detail.rsp.owner === GLB.userID) {
                    GLB.isRoomOwner = true;
                    // 创建星星
                    this.spawnNewStar();
                }
                for (var i = 1; i < this.players.length; i++) {
                    (!this.players[i]) && (this.players[i] = this.node.getChildByName("Player" + (i + 1)).node);
                    this.players[i].getChildByName("playerLabel").getComponent(cc.Label).string = this.userScores[i].userID;
                    this.scoreDisplays[i].string = this.userScores[i].userID + ":"+this.userScores[i].Score ;
                }
                this.players[0].getChildByName("playerLabel").getComponent(cc.Label).string = GLB.userID;
                break;
            case msg.MATCHVS_SEND_EVENT_RSP:
                break;
            case msg.MATCHVS_SEND_EVENT_NOTIFY:
                this.onNewWorkGameEvent(event.detail.eventInfo);
                break;
            case msg.MATCHVS_ERROE_MSG:
                this.labelLog("[Err]errCode:"+event.detail.errorCode+" errMsg:"+event.detail.errorMsg);
                cc.director.loadScene('login');
                break;
            case msg.MATCHVS_FRAME_UPDATE:
                var rsp = event.detail.data;
                for (var i = 0; i < rsp.frameItems.length; i++) {
                    var info = rsp.frameItems[i];
                    this.onNewWorkGameEvent(info);
                }
                break;
            case msg.PLAYER_POSINTON:
                if (this.newStar != undefined) {
                    if (Math.abs(event.detail.x - GLB.NEW_STAR_POSITION) < 15) {
                        if (this.newStar.active) {
                            this.newStar.active = false;
                            var frameData = JSON.stringify({
                                "action": GLB.EVENT_GAIN_SCORE,
                                "userID": GLB.userID,
                            });
                            engine.prototype.sendEventEx(frameData);
                            var event = {
                                action: GLB.EVENT_NEW_START,
                                position: this.getNewStarPosition()
                            };
                            this.createStarNode(event.position)
                            engine.prototype.sendEvent(JSON.stringify(event));
                        }
                    }
                }
                break;
            case msg.MATCHVS_LEAVE_ROOM_NOTIFY:
                this.labelLog("leaveRoomNotify");
                this.gameOver();
                break;
        }
    },



    update: function (dt) {
        if (this.timer > this.gameTime)
            return this.gameOver();
        this.timer += dt
    },
    //
    // leaveRoomNotify: function () {
    //     this.labelLog("leaveRoomNotify");
    //     this.gameOver();
    // },

    setFrameSyncResponse: function (rsp) {
        this.labelLog('setFrameSyncResponse, status=' + rsp.status);
        if (rsp.status !== 200) {
            this.labelLog('设置同步帧率失败，status=' + rsp.status);
        } else {
            this.labelLog('设置同步帧率成功, 帧率为:' + GLB.FRAME_RATE);
        }
    },

    subscribeEventGroupResponse: function (status, groups) {
        this.labelLog("[Rsp]subscribeEventGroupResponse:status=" + status + " groups=" + groups);
    },

    sendEventGroupResponse: function (status, dstNum) {
        this.labelLog("[Rsp]sendEventGroupResponse:status=" + status + " dstNum=" + dstNum);
    },
    onNewWorkGameEvent : function(info) {
        if (info && info.cpProto) {
            var event = JSON.parse(info.cpProto);
            if (event.action === GLB.EVENT_NEW_START) {
                // 收到创建星星的消息通知，根据消息给的坐标创建星星
                this.createStarNode(event.position)
            } else if (event.action === GLB.EVENT_PLAYER_POSINTON_CHANGED) {
                console.log(new Date().getSeconds(), "收到位移消息"+event.x);
                this.updatePlayerMoveDirection(event);
            } else if (event.action === GLB.EVENT_GAIN_SCORE) {
                this.refreshScore(event);
            } else if (event.action === GLB.GAME_RECONNECT) {
                this.reconnection(event.cpProto);

            }
        }
    },

    /**
     * 重连进来的玩家
     * @param event
     */
    reconnection :function (event) {
        for (var a = 0; a <this.userScores.length; a++) {
            for (var i = 0; i <event.length; i++) {
                if (this.userScores[a].userID=== event[i].userID ) {
                    console.log(this.userScores[a].Score, event[i].Score);
                    this.userScores[a].Score = event[i].Score;
                }
            }
            this.scoreDisplays[a].string = this.userScores[a].userID+":"+this.userScores[a].Score;
        }
    },


    frameUpdate: function (rsp) {

    },

    sendEventGroupNotify: function (srcUid, groups, cpProto) {
        this.labelLog("收到分组消息：" + cpProto);
    },

    // 更新每个玩家的移动方向
    updatePlayerMoveDirection: function (event) {
        var player = this.getPlayerByUserId(event.userID);
        if (player) {
            // console.warn(new Date().getSeconds(), "开始执行移动");
            player.onPostionChanged(event.x, event.arrow);
        } else {
            console.warn("Not Found the user:" + event.userID);
        }
    },

    getPlayerByUserId: function (userId) {
        for (var i = 0; i < this.players.length; i++) {
            if (this.players[i].getChildByName("playerLabel").getComponent(cc.Label).string == userId) {
                return this.players[i].getComponent("Player");
            }
        }
    },

    // 根据坐标位置创建星星节点
    createStarNode: function (position) {
        for (var i = 0; i < this.node.children.length; i++) {
            var child = this.node.children[i];
            if (child.name === 'star') child.destroy();
        }
        this.newStar = cc.instantiate(this.starPrefab)
        this.node.addChild(this.newStar)

        this.newStar.setPosition(cc.p(position.x, position.y))
        this.newStar.getComponent('Star').game = this;
        this.newStar.active = true;
        this.timer = 0
        GLB.NEW_STAR_POSITION = position.x;
    },

    /**
     * 发送创建星星事件
     */
    spawnNewStar: function () {
        if (!GLB.isRoomOwner) return;    // 只有房主可创建星星

        var event = {
            action: GLB.EVENT_NEW_START,
            position: this.getNewStarPosition()
        };

        var result = mvs.engine.sendEvent(JSON.stringify(event))
        if (!result || result.result !== 0)
            return console.error('创建星星事件发送失败');

        this.createStarNode(event.position);
    },

    // 随机返回'新的星星'的位置
    getNewStarPosition: function () {
        var randX = cc.randomMinus1To1() * this.starMaxX;
        var randY = -90;
        return cc.p(randX, randY)
    },


    //玩家得分
    refreshScore: function (event) {
        if (event != undefined) {
            for (var i = 0; i < this.userScores.length;i++) {
                if (event.userID == this.userScores[i].userID) {
                    console.log(event.userID+"得分了");
                    this.userScores[i].Score ++;
                    this.scoreDisplays[i].string = this.userScores[i].userID + ':' + this.userScores[i].Score;
                }
            }
            GLB.number1 = this.userScores[0].userID + ':' + this.userScores[0].Score;
            GLB.number2 = this.userScores[1].userID + ':' + this.userScores[1].Score;
            GLB.number3 = this.userScores[2].userID + ':' + this.userScores[2].Score;
        }
        this.spawnNewStar();
    },

    // 游戏结束
    gameOver: function () {
        GLB.isGameOver = true;
        for (var i = 0, l = this.players.length; i < l; i++) {
            this.players[i].stopAllActions()
        }
        // 跳转到场景Game
        mvs.engine.leaveRoom("");
        cc.director.loadScene('result');
    },

    labelLog: function (info) {
        this.labelInfo.string += '\n' + info;
    },

    networkStateNotify: function (netNotify) {
        console.log("netNotify");
        console.log("netNotify.owner:" + netNotify.owner);
        if (netNotify.owner === GLB.userID) {
            GLB.isRoomOwner = true;
        }

        console.log("玩家：" + netNotify.userID + " state:" + netNotify.state);
        if (netNotify.state === 2) {
            console.log("玩家已经重连进来");
            var event = {
                action: GLB.GAME_RECONNECT,
                cpProto: this.userScores
            };
            setTimeout(function() {
                mvs.engine.sendEventEx(0,JSON.stringify(event),0,[netNotify.userID]);
                } ,500
            );
        }
    },

    /**
     * 移除监听
     */
    removeEvent:function () {
        this.node.off(msg.MATCHVS_ROOM_DETAIL,this.onEvent,this);
        this.node.off(msg.MATCHVS_SEND_EVENT_NOTIFY,this.onEvent,this);
        this.node.off(msg.MATCHVS_SEND_EVENT_RSP,this.onEvent,this);
        this.node.off(msg.MATCHVS_ERROE_MSG,this.onEvent,this);
        this.node.off(msg.MATCHVS_FRAME_UPDATE,this.onEvent ,this);
        this.node.off(msg.PLAYER_POSINTON,this.onEvent , this);
        this.node.off(msg.MATCHVS_LEAVE_ROOM_NOTIFY,this.onEvent, this);
    },

    onDestroy: function () {
        this.removeEvent();
        if (this.countDown != null) {
            clearInterval(this.countDown);
        }
        GLB.isGameOver = true;
    }
});
