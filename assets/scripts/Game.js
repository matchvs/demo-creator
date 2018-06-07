var mvs = require("Matchvs");
var GLB = require("Glb");

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
        // 注意此时不能写成以下形式
        // players: {
        //     default: null,
        //     type: [cc.Node]
        // },

        // scoreDisplays: [cc.Label],
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
    },


    onLoad: function () {
        this.scoreDisplays = [this.scoreDisplays0, this.scoreDisplays1, this.scoreDisplays2];
        this.timer = 0;
        this.starDuration = this.maxStarDuration - this.minStarDuration;
        this.gameTime = 9999;
        this.scores = [0, 0, 0];
        this.roomidLabel.string = "房间号:" + GLB.roomId;
        this.useridLabel.string = "用户id:" + GLB.userID;
        // 场景ground的高度
        this.groundY = this.ground.y + this.ground.height / 2;
        this.compensation = 50;
        this.starMaxX = this.node.width / 2;


        mvs.response.sendEventNotify = this.sendEventNotify.bind(this);
        mvs.response.frameUpdate = this.frameUpdate.bind(this);
        mvs.response.leaveRoomNotify = this.leaveRoomNotify.bind(this);
        mvs.response.networkStateNotify = this.networkStateNotify.bind(this);
        this.spawnNewStar();

        for (var i = 0; i < this.players.length; i++) {
            (!this.players[i]) && (this.players[i] = this.node.getChildByName("Player" + (i + 1)).node);
            this.players[i].getChildByName("playerLabel").getComponent(cc.Label).string = GLB.playerUserIds[i];

        }
        this.refreshScore();

        var self = this;
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

        this.id = setInterval(function () {
            self.labelGameoverTime.string = self.labelGameoverTime.string - 1;
            if (self.labelGameoverTime.string === "2") {
                GLB.isGameOver = true;
            }
            if (self.labelGameoverTime.string === "0") {
                clearInterval(self.id);
                self.gameOver();
            }
        }, 1000);
    },

    update: function (dt) {
        if (this.timer > this.gameTime)
            return this.gameOver();

        this.timer += dt
    },

    leaveRoomNotify: function () {
        this.labelLog("leaveRoomNotify");
        this.gameOver();
    },

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
        try {
            if (info && info.cpProto) {
                var event = JSON.parse(info.cpProto);
                if (event.action === GLB.EVENT_NEW_START) {
                    // 收到创建星星的消息通知，根据消息给的坐标创建星星
                    this.createStarNode(event.position)
                } else if (event.action === GLB.EVENT_PLAYER_POSINTON_CHANGED) {
                    this.updatePlayerMoveDirection(event);
                } else if (event.action === GLB.EVENT_GAIN_SCORE) {
                    this.refreshScore(event);
                    if (event.userID === GLB.roomMaterID) {
                        // 有玩家得分之后，创建新的星星
                        this.spawnNewStar();
                    }
                }
            }
        } catch (e) {
            console.log(e.message);
        }
    },
    sendEventNotify: function (info) {
        this.onNewWorkGameEvent(info);

    },
    frameUpdate: function (rsp) {
        for (var i = 0; i < rsp.frameItems.length; i++) {
            var info = rsp.frameItems[i];
            this.onNewWorkGameEvent(info);
        }
    },

    sendEventGroupNotify: function (srcUid, groups, cpProto) {
        this.labelLog("收到分组消息：" + cpProto);
    },

    // 更新每个玩家的移动方向
    updatePlayerMoveDirection: function (event) {
        var player = this.getPlayerByUserId(event.userID);
        if (player) {
            player.onPostionChanged(event.x, event.arrow);
        } else {
            console.warn("Not Found the user:" + event.userID);
        }
    },

    getPlayerByUserId: function (userId) {
        for (var i = 0; i < this.players.length; i++) {

            if (this.players[i].getComponent("Player").userID === userId) {
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
        var newStar = cc.instantiate(this.starPrefab)
        this.node.addChild(newStar)

        newStar.setPosition(cc.p(position.x, position.y))
        newStar.getComponent('Star').game = this;

        this.timer = 0
    },

    // 发送创建星星事件
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
        var randX = cc.randomMinus1To1() * this.starMaxX
        var randY = this.groundY + cc.random0To1() * this.playerJumpHeight + this.compensation
        return cc.p(randX, randY)
    },

    // 得分
    gainScore: function () {
        this.scores[0] += 1;
        var label = GLB.userID + ': ' + this.scores[0];
        GLB.updateUserScore(GLB.userID, this.scores[0]);
        this.refreshScore();
        // this.scoreDisplays[0].string = label;
        // 播放得分音效
        cc.audioEngine.playEffect(this.scoreAudio, false);

        var event = {action: GLB.EVENT_GAIN_SCORE, score: this.scores[0]};
        var result = mvs.engine.sendEvent(JSON.stringify(event));
        if (!result || result.result !== 0)
            return console.error('得分事件发送失败');

        this.spawnNewStar();
    },

    refreshScore: function (event) {

        //TODO 更新分数
        // GLB.updateUserScore(event.userID, event.score);
        // var score = GLB.scoreMap;
        // score.sort(function (a, b) {
        //     return a.score - b.score
        // });
        // for (var i = 0; i < score.length; i++) {
        //     console.log("score.length" + score.length);
        //     this.scoreDisplays[i].string = score[i].uid + ': ' + score[i].score;
        //     GLB.playerUserScore.push(score[i].score);
        // }
        // GLB.number1 = score[0].uid || 0 + ': ' + score[0].score;
        // GLB.number2 = score[1].uid || 0 + ': ' + score[1].score;
        // GLB.number3 = score[2].uid || 0 + ': ' + score[2].score;
    },

    // 游戏结束
    gameOver: function () {
        GLB.isGameOver = true;
        for (var i = 0, l = this.players.length; i < l; i++) {
            this.players[i].stopAllActions()
        }
        // 跳转到场景Game
        // mvs.engine.leaveRoom("");
        cc.director.loadScene('result');
    },
    gameStop: function () {
        GLB.isGameOver = true;

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
                scoreMap: GLB.scoreMap
            };
            var result = mvs.engine.sendEvent(JSON.stringify(event));
            if (!result || result.result !== 0) {
                console.log("发送分数信息失败");
                mvs.engine.sendEvent(JSON.stringify(event))
            }
        }
    },

    onDestroy: function () {
        clearInterval(this.id);
        GLB.isGameOver = true;
        mvs.response.sendEventNotify = function () {

        };
        mvs.response.sendEventResponse = function () {

        }
    }
});
