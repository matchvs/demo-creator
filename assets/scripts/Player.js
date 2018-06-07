var GLB = require("Glb");
var mvs = require("Matchvs");
cc.Class({
    extends: cc.Component,

    properties: {
        // 跳跃音效资源
        jumpAudio: {
            default: null,
            url: cc.AudioClip
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
        playerLabel:null
    },

    playJumpSound: function () {
        // 调用声音引擎播放声音
        cc.audioEngine.playEffect(this.jumpAudio, false);
    },
    onPostionChanged(x, arrow) {
        this.playerSpriteRight.node.x = x;
        this.playerSpriteLeft.node.x = x;
        this.playJumpSound();
        this.playAnimation(arrow);
        this.playerLabel.node.x = x;
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
                    console.log("checked game(syncFrame) is over!, clearInterval:" + id);
                    clearInterval(self.postionSampler);
                    return;
                }
                var frameData = JSON.stringify({
                    "userID": GLB.userID,
                    "action": GLB.EVENT_PLAYER_POSINTON_CHANGED,
                    "x": self.getPostion(), "arrow": self.isUserInputing
                });

                if (self.isDebug){
                    self.node.parent.getComponent("Game").onNewWorkGameEvent({"cpProto":frameData}); //remove me, This is for Test only
                }
                try {
                    // if (self.isUserInputing !== 0) {
                    GLB.syncFrame === false ? (mvs.engine.sendEventEx(0, frameData, 0, GLB.playerUserIds))
                        : (mvs.engine.sendFrameEvent(frameData));
                    // }
                } catch (e) {
                    console.log(e);
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
            if (touchLoc.x >= cc.winSize.width / 2) {
                self.isUserInputing = GLB.ARROW_RIGHT;
                self.onPostionChanged(self.playerSpriteRight.node.x + self.speed, self.isUserInputing);
            } else {
                self.isUserInputing = GLB.ARROW_LEFT;
                self.onPostionChanged(self.playerSpriteRight.node.x - self.speed, self.isUserInputing);
            }
        };
        cc.eventManager.addListener({
            event: cc.EventListener.TOUCH_ONE_BY_ONE,
            onTouchBegan: function (touch, event) {
                console.log("begin move ");
                onTouch(touch);
                return true;
            },
            onTouchMoved: function (touch) {
                onTouch(touch);
                return true;
            },
            onTouchEnded: function (touch, event) {
                self.isUserInputing = GLB.ARROW_STOP;
                self.onPostionChanged(self.playerSpriteRight.node.x, self.isUserInputing);
            }
        }, self.node);
    },
    onDestroy: function () {
        this.postionSampler && clearInterval(this.postionSampler);
    }
});
