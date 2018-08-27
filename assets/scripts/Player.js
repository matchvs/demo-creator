var GLB = require("Glb");
var mvs = require("Matchvs");
var engine = require("MatchvsEngine");
var msg = require("MatvhvsMessage");
cc.Class({
    extends: cc.Component,

    properties: {
        // 跳跃音效资源
        // jumpAudio: {
        //     default: null,
        //     url: cc.AudioClip
        // },

        // 暂存 Game 对象的引用
        game: {
            default: null,
            serializable: false,
        },
        // 引用星星预支资源
        starPrefab: {
            default: null,
            type: cc.Prefab
        },
        playerSpriteLeft: null,
        playerSpriteRight: null,
        rightAnim: null,
        leftAnim: null,
        animRight: null,
        animLeft: null,
        lastArrow: 0,
        isAllowInput: false,
        isUserInputing: 0,
        postionSampler: null,
        speed: 2,
        isDebug:false,
        userID:0,
        playerLabel:null,

        startPostion:0,
    },

    // playJumpSound: function () {
    //     // 调用声音引擎播放声音
    //     cc.audioEngine.playEffect(this.jumpAudio, false);
    // },
    onPostionChanged(x, arrow) {
        // var action = cc.moveTo(1,x,0);
        // if (x != this.playerSpriteRight.node.x) {
        //     this.playerSpriteRight.node.runAction(action);
            this.playerSpriteRight.node.x = x;
            // this.playerSpriteRight.node.stopAction(action);
        // }

        // if (x !=  this.playerSpriteLeft.node.x) {
            // this.playerSpriteLeft.node.runAction(action);
            this.playerSpriteLeft.node.x = x;
            // this.playerSpriteLeft.node.stopAction(action);
        // }
        // this.playJumpSound();
        this.playAnimation(arrow);
        this.playerLabel.node.x = x;
        // console.log(x,GLB.NEW_STAR_POSITION);

    },
    getPostion: function () {
        return this.playerSpriteRight.node.x;
    },

    onLoad: function () {
        this.rightAnimNode = this.node.getChildByName("rightAnimNode");
        this.leftAnimNode = this.node.getChildByName("leftAnimNode");
        this.animRightComp = this.rightAnimNode.getComponent(cc.Animation);
        this.animLeftComp = this.leftAnimNode.getComponent(cc.Animation);
        this.playerSpriteRight = this.rightAnimNode.getComponent(cc.Sprite);
        this.playerSpriteLeft = this.leftAnimNode.getComponent(cc.Sprite);
        this.playerLabel = this.node.getChildByName("playerLabel").getComponent(cc.Label);

        var self = this;
        if (this.isAllowInput) {
            this.postionSampler = setInterval(function () {
                if (GLB.isGameOver === true) {
                    clearInterval(self.postionSampler);
                    return;
                }
                var frameData = JSON.stringify({
                    "userID": GLB.userID,
                    "action": GLB.EVENT_PLAYER_POSINTON_CHANGED,
                    "x": self.getPostion(),
                    "arrow": self.isUserInputing
                });
                var  x = self.getPostion();
                self.node.parent.getComponent("Game").node.emit(msg.PLAYER_POSINTON, {x});
                if (GLB.syncFrame === true) {
                    engine.prototype.sendFrameEvent(frameData);
                } else {
                    engine.prototype.sendEvent(frameData);
                }
            }, 1000 / GLB.FPS);
            // 初始化键盘输入监听
            this.setInputControl();
        }
    },



    playAnimation: function (arrow) {
        if (arrow === GLB.ARROW_STOP) {
            this.animRightComp.stop();
            this.animLeftComp.stop();
            this.lastArrow = GLB.ARROW_STOP;
        } else if (arrow === GLB.ARROW_RIGHT) {
            if (this.lastArrow !== GLB.ARROW_RIGHT) {
                this.animLeftComp.stop();
                this.animRightComp.play();
                this.rightAnimNode.active = true;
                this.leftAnimNode.active = false;
            }
            this.lastArrow = GLB.ARROW_RIGHT;
        } else if (arrow === GLB.ARROW_LEFT) {
            if (this.lastArrow !== GLB.ARROW_LEFT) {
                this.animLeftComp.play();
                this.animRightComp.stop();
                this.rightAnimNode.active = false;
                this.leftAnimNode.active = true;
            }
            this.lastArrow = GLB.ARROW_LEFT;
        } else {
            console.warn("unknown arrow");
        }


    },
    setInputControl: function () {
        var self = this;

        var onTouch = function (touch) {
            var touchLoc = touch.getLocation();
            if (touchLoc.x >= cc.winSize.width / 3) {
                self.isUserInputing = GLB.ARROW_RIGHT;
                self.onPostionChanged(self.playerSpriteRight.node.x + self.speed, self.isUserInputing);
            } else {
                self.isUserInputing = GLB.ARROW_LEFT;
                self.onPostionChanged(self.playerSpriteRight.node.x - self.speed, self.isUserInputing);
            }
        };
        cc.eventManager.addListener({
            event: cc.EventListener.TOUCH_ONE_BY_ONE,
            fakeMove: Number,
            onTouchBegan: function (touch, event) {
                console.log("begin move ");
                onTouch(touch);
                this.fakeMove = setInterval(function () {
                    onTouch(touch);
                },GLB.FPS);
                return true;
            },
            onTouchMoved: function (touch) {
                // onTouch(touch);
                return true;
            },
            onTouchEnded: function (touch, event) {
                clearInterval(this.fakeMove);
                self.isUserInputing = GLB.ARROW_STOP;
                self.onPostionChanged(self.playerSpriteRight.node.x, self.isUserInputing);
            }
        }, self.node);
    },



    // 随机返回'新的星星'的位置
    getNewStarPosition: function () {
        var randX = cc.randomMinus1To1() * this.starMaxX;
        var randY = -90;
        return cc.p(randX, randY)
    },



    onDestroy: function () {
        this.postionSampler && clearInterval(this.postionSampler);
    }
});
