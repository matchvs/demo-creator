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

        scoreDisplays: [cc.Label],

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
        this.timer = 0;
        this.starDuration = this.maxStarDuration - this.minStarDuration;
        this.gameTime = 9999;
        this.scores = [0, 0, 0];
        this.roomidLabel.string = "房间号:" + GLB.roomId;
        this.useridLabel.string = "用户id:" + GLB.userInfo.id;
        GLB.scoreMap = new Map();
        // 场景ground的高度
        this.groundY = this.ground.y + this.ground.height / 2;
        this.compensation = 50
        this.starMaxX = this.node.width / 2
        // 玩家可以跳到的高度
        this.playerJumpHeight = this.players[0].getComponent('Player').jumpHeight;

        mvs.response.sendEventNotify = this.sendEventNotify.bind(this);
        mvs.response.frameUpdate = this.frameUpdate.bind(this);
        mvs.response.leaveRoomNotify = this.leaveRoomNotify.bind(this);

        this.spawnNewStar();

        for(var i = 0; i < GLB.MAX_PLAYER_COUNT; i++) {
            var userId = GLB.playerUserIds[i];
            // this.scoreDisplays[i].string = userId + ': 0';
            this.players[i].getChildByName("playerLabel").getComponent(cc.Label).string = userId;
            GLB.scoreMap.set(userId, 0);
        }
        this.refreshScore();

        var self = this;
        this.buttonSubscribe.on(cc.Node.EventType.TOUCH_END, function(event){
            var result = mvs.engine.subscribeEventGroup(["MatchVS"], ["hello"])
            if (result !== 0) 
                self.labelLog('订阅分组失败,错误码:' + result);
            mvs.response.subscribeEventGroupResponse = self.subscribeEventGroupResponse.bind(self);
        });
        this.buttonUnsubscribe.on(cc.Node.EventType.TOUCH_END, function(event){
            var result = mvs.engine.subscribeEventGroup(["hello"], ["MatchVS"])
            if (result !== 0)
                self.labelLog('取消订阅分组失败,错误码:' + result);
            mvs.response.subscribeEventGroupResponse = self.subscribeEventGroupResponse.bind(self);
        });
        this.buttonSend.on(cc.Node.EventType.TOUCH_END, function(event){
            var result = mvs.engine.sendEventGroup("分组消息测试", ["MatchVS"])
            if (result !== 0)
                self.labelLog('发送分组消息失败,错误码:' + result);
            mvs.response.sendEventGroupResponse = self.sendEventGroupResponse.bind(self);
            mvs.response.sendEventGroupNotify = self.sendEventGroupNotify.bind(self);
        });
        this.buttonLeaveRoom.on(cc.Node.EventType.TOUCH_END, function(event){
            GLB.isGameOver = true;
            for (var i = 0, l = self.players.length; i < l; i++) {
                self.players[i].stopAllActions()
            }
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
        var id = setInterval(() => {
                self.labelGameoverTime.string = self.labelGameoverTime.string - 1;
                if (self.labelGameoverTime.string == 2) {
                    GLB.isGameOver = true;
                }
                if (self.labelGameoverTime.string == 0) {
                    clearInterval(id);
                    self.gameOver();
                }
            }, 1000);
    },

    update: function (dt) {
        if (this.timer > this.gameTime)
            return this.gameOver();

        this.timer += dt
    },

    leaveRoomNotify: function (rsp) {
        this.labelLog("leaveRoomNotify");
        GLB.isGameOver = true;
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

    subscribeEventGroupResponse: function (status,groups) {
        this.labelLog("[Rsp]subscribeEventGroupResponse:status="+ status+" groups="+ groups);
    },

    sendEventGroupResponse: function (status, dstNum) {
        this.labelLog("[Rsp]sendEventGroupResponse:status="+ status+" dstNum=" + dstNum);
    },

    sendEventNotify: function (info) {
        if (info && info.cpProto) {
            if (info.cpProto.indexOf(GLB.NEW_START_EVENT) >= 0) {
                // 收到创建星星的消息通知，根据消息给的坐标创建星星
                this.createStarNode(JSON.parse(info.cpProto).position)

            } else if (info.cpProto.indexOf(GLB.PLAYER_MOVE_EVENT) >= 0) {
                // 收到其他玩家移动的消息，根据消息信息修改加速度
                this.updatePlayerMoveDirection(info.srcUserId, JSON.parse(info.cpProto))

            } else if (info.cpProto.indexOf(GLB.PLAYER_POSITION_EVENT) >= 0) {
                // 收到其他玩家的位置速度加速度信息，根据消息中的值更新状态
                this.receiveCountValue++;
                this.receiveCount.string = "receive msg count: " + this.receiveCountValue;
                var cpProto = JSON.parse(info.cpProto);
                var player = this.getPlayerByUserId(info.srcUserId);
                
                if (info.srcUserId == GLB.userInfo.id) {
                    var delayValue = new Date().getTime() - cpProto.ts;
                    this.delay.string = "delay: " + delayValue;
                    if (this.minDelayValue === undefined || delayValue < this.minDelayValue) {
                        this.minDelayValue = delayValue;
                        this.minDelay.string = "minDelay: " + delayValue;
                    }
                    if (this.maxDelayValue === undefined || delayValue > this.maxDelayValue) {
                        this.maxDelayValue = delayValue;
                        this.maxDelay.string = "maxDelay: " + delayValue;
                    }
                } else if (player) {
                    player.node.x = cpProto.x;
                    player.xSpeed = cpProto.xSpeed;
                    player.accLeft = cpProto.accLeft;
                    player.accRight = cpProto.accRight;
                }
            } else if (info.cpProto.indexOf(GLB.GAIN_SCORE_EVENT) >= 0) {
                // 收到其他玩家的得分信息，更新页面上的得分数据
                var playerIndex = this.getPlayerIndexByUserId(info.srcUserId);
                var label = GLB.playerUserIds[playerIndex - 1] + ': ' + JSON.parse(info.cpProto).score;
                // this.scoreDisplays[playerIndex - 1].string = label;
                GLB.scoreMap.set(info.srcUserId, JSON.parse(info.cpProto).score);
                this.refreshScore();
                // 有玩家得分之后，创建新的星星
                this.spawnNewStar();
            }
        }
    },

    frameUpdate: function(rsp) {
        for (var i = 0 ; i < rsp.frameItems.length; i++) {
            var info = rsp.frameItems[i];
            if (info && info.cpProto) {
                if (info.cpProto.indexOf(GLB.NEW_START_EVENT) >= 0) {
                    // 收到创建星星的消息通知，根据消息给的坐标创建星星
                    this.createStarNode(JSON.parse(info.cpProto).position)

                } else if (info.cpProto.indexOf(GLB.PLAYER_MOVE_EVENT) >= 0) {
                    // 收到其他玩家移动的消息，根据消息信息修改加速度
                    this.updatePlayerMoveDirection(info.srcUserId, JSON.parse(info.cpProto))

                } else if (info.cpProto.indexOf(GLB.PLAYER_POSITION_EVENT) >= 0) {
                    // 收到其他玩家的位置速度加速度信息，根据消息中的值更新状态
                    this.receiveCountValue++;
                    this.receiveCount.string = "receive msg count: " + this.receiveCountValue;
                    var cpProto = JSON.parse(info.cpProto);
                    var player = this.getPlayerByUserId(info.srcUserId);

                    if (info.srcUserId == GLB.userInfo.id) {
                        var delayValue = new Date().getTime() - cpProto.ts;
                        this.delay.string = "delay: " + delayValue;
                        if (this.minDelayValue === undefined || delayValue < this.minDelayValue) {
                            this.minDelayValue = delayValue;
                            this.minDelay.string = "minDelay: " + delayValue;
                        }
                        if (this.maxDelayValue === undefined || delayValue > this.maxDelayValue) {
                            this.maxDelayValue = delayValue;
                            this.maxDelay.string = "maxDelay: " + delayValue;
                        }
                    } else if (player) {
                        player.node.x = cpProto.x;
                        player.xSpeed = cpProto.xSpeed;
                        player.accLeft = cpProto.accLeft;
                        player.accRight = cpProto.accRight;
                    }
                } else if (info.cpProto.indexOf(GLB.GAIN_SCORE_EVENT) >= 0) {
                    // 收到其他玩家的得分信息，更新页面上的得分数据
                    var playerIndex = this.getPlayerIndexByUserId(info.srcUserId);
                    var label = GLB.playerUserIds[playerIndex - 1] + ': ' + JSON.parse(info.cpProto).score;
                    // this.scoreDisplays[playerIndex - 1].string = label;
                    GLB.scoreMap.set(info.srcUserId, JSON.parse(info.cpProto).score);
                    this.refreshScore();
                    // 有玩家得分之后，创建新的星星
                    this.spawnNewStar();
                }
            }            
        }
    },

    sendEventGroupNotify: function (srcUid, groups, cpProto) {
        this.labelLog("收到分组消息：" + cpProto);
    },

    // 更新每个玩家的移动方向
    updatePlayerMoveDirection: function (userId, event) {
        var player = this.getPlayerByUserId(userId);
        if (player) {
            if (event.accLeft !== undefined) player.accLeft = event.accLeft;
            if (event.accRight !== undefined) player.accRight = event.accRight;
        }
    },

    getPlayerByUserId: function(userId) {
        var index = this.getPlayerIndexByUserId(userId);
        if (index) {
            return this.players[index-1].getComponent("Player" + index);
        }
    },

    // 返回玩家编写，一个1~3的数字
    getPlayerIndexByUserId: function(userId) {
        for (var i = 0; i < GLB.playerUserIds.length; i++) {
            if (GLB.playerUserIds[i] === userId) {
                return i + 1;
            }
        }
    },

    // 根据坐标位置创建星星节点
    createStarNode: function (position) {
        for (var i = 0; i<this.node.children.length; i++) {
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
            action: GLB.NEW_START_EVENT,
            position: this.getNewStarPosition()
        }

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
        var label = GLB.userInfo.id + ': ' + this.scores[0];
        GLB.scoreMap.set(GLB.userInfo.id, this.scores[0]);
        this.refreshScore();
        // this.scoreDisplays[0].string = label;
        // 播放得分音效
        cc.audioEngine.playEffect(this.scoreAudio, false);

        var event = {action: GLB.GAIN_SCORE_EVENT, score: this.scores[0]};
        var result = mvs.engine.sendEvent(JSON.stringify(event));
        if (!result || result.result !== 0) 
            return console.error('得分事件发送失败');

        this.spawnNewStar();
    },

    bubbleSort: function(arr) {
        var len = arr.length;
        for (var i = 0; i < len; i++) {
            for (var j = 0; j < len - 1 - i; j++) {
                if (arr[j].score < arr[j+1].score) {        //相邻元素两两对比
                    var temp = arr[j+1];        //元素交换
                    arr[j+1] = arr[j];
                    arr[j] = temp;
                }
            }
        }
        return arr;
    },

    refreshScore: function() {
        var score = new Array();
        var i = 0;
        for (var [key, value] of GLB.scoreMap.entries()) {
            score[i] = {
                uid: key,
                score: value
            };
            i++;
        }
        this.bubbleSort(score);
        for (i = 0; i < score.length; i++) {
            this.scoreDisplays[i].string = score[i].uid + ': ' + score[i].score;
        }
        GLB.number1 = score[0].uid + ': ' + score[0].score;
        GLB.number2 = score[1].uid + ': ' + score[1].score;
        GLB.number3 = score[2].uid + ': ' + score[2].score;
    },

    // 游戏结束
    gameOver: function () {
        for (var i = 0, l = this.players.length; i < l; i++) {
            this.players[i].stopAllActions()
        }
        // 跳转到场景Game
        cc.director.loadScene('result');
    },

    labelLog: function (info) {
        this.labelInfo.string += '\n' + info;
    },    
})
