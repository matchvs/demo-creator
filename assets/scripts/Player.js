var GLB = require("Glb");
var mvs = require("Matchvs");
cc.Class({
    extends: cc.Component,

    properties: {
        // 主角跳跃高度
        jumpHeight: 0,
        // 主角跳跃持续时间
        jumpDuration: 0,
        // 最大移动速度
        maxMoveSpeed: 0,
        // 加速度
        accel: 0,

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
        isAllowInput:false,
        isUserInputing: 0,
        postionSampler: null,
        speed:2
    },

    playJumpSound: function () {
        // 调用声音引擎播放声音
        cc.audioEngine.playEffect(this.jumpAudio, false);
    },
    onPostionChanged(x) {
        this.playerSpriteRight.node.x += x;
        this.playerSpriteLeft.node.x += x;
        this.playJumpSound();
    },
    getPostion: function(){
        return this.playerSpriteRight.node.x;
    },

    onLoad: function () {
        // 初始化跳跃动作
        // this.jumpAction = this.setJumpAction();
        // this.node.runAction(this.jumpAction);

        // 加速度方向开关
        this.accLeft = false;
        this.accRight = false;
        // 主角当前水平方向速度
        this.xSpeed = 0;
        this.rightAnimNode = this.node.getChildByName("rightAnimNode");
        this.leftAnimNode = this.node.getChildByName("leftAnimNode");
        this.animRightComp = this.rightAnimNode.getComponent(cc.Animation);
        this.animLeftComp = this.leftAnimNode.getComponent(cc.Animation);
        this.playerSpriteRight = this.rightAnimNode.getComponent(cc.Sprite);
        this.playerSpriteLeft = this.leftAnimNode.getComponent(cc.Sprite);

        var self = this;
        if (this.isAllowInput){
            this.postionSampler = setInterval(function () {
                if (GLB.isGameOver === true) {
                    console.log("checked game(syncFrame) is over!, clearInterval:" + id);
                    clearInterval(id);
                    return;
                }
                // if (self.isUserInputing !== 0) {
                var frameData = JSON.stringify({
                    "action": GLB.PLAYER_POSITION_EVENT,
                    "x": self.getPostion(), "arrow": self.isUserInputing
                });
                GLB.syncFrame === false ? (mvs.engine.sendEventEx(0, frameData, 0, GLB.playerUserIds))
                    : (mvs.engine.sendFrameEvent(frameData));
                // }
            }, 1000 / GLB.FPS);
            // 初始化键盘输入监听
            this.setInputControl();
        }
    },

    update: function (dt) {
        // 根据当前加速度方向每帧更新速度
        if (this.accLeft) {
            this.xSpeed -= this.accel * dt;
        } else if (this.accRight) {
            this.xSpeed += this.accel * dt;
        }
        // 限制主角的速度不能超过最大值
        if (Math.abs(this.xSpeed) > this.maxMoveSpeed) {
            this.xSpeed = this.maxMoveSpeed * this.xSpeed / Math.abs(this.xSpeed);
        }

        this.node.x += this.xSpeed * dt;

        // limit player position inside screen
        if (this.node.x > this.node.parent.width / 2) {
            this.node.x = this.node.parent.width / 2;
            this.xSpeed = 0;
        } else if (this.node.x < -this.node.parent.width / 2) {
            this.node.x = -this.node.parent.width / 2;
            this.xSpeed = 0;
        }
    },
    playAnimation: function (isLeft, isStop) {


        if (isStop) {
            this.animRightComp.stop();
            this.animLeftComp.stop();
            this.lastArrow = 0;
        } else {
            if (!isLeft) {
                if (this.lastArrow !== 1) {
                    this.animLeftComp.stop();
                    this.animRightComp.play();
                    this.rightAnimNode.active = true;
                    this.leftAnimNode.active = false;
                }

                this.lastArrow = 1;
            } else {
                if (this.lastArrow !== 2) {
                    this.animLeftComp.play();
                    this.animRightComp.stop();
                    this.rightAnimNode.active = false;
                    this.leftAnimNode.active = true;
                }
                this.lastArrow = 2;
            }
        }

    },
    setInputControl: function () {
        var self = this;

        // var touchEnd = self.node.on(cc.Node.EventType.MOUSE_MOVE, function (event) {
        //     console.log("this is callback");
        //
        // }, self.node);


        var onTouch = function (touch) {
            var touchLoc = touch.getLocation();
            if (touchLoc.x >= cc.winSize.width / 2) {
                self.playAnimation(false, false);
                self.onPostionChanged(self.speed);
            } else {
                self.playAnimation(true, false);
                self.onPostionChanged(-1 * self.speed);
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
                self.playAnimation(false, true);
                self.isUserInputing = 0;

            }
        }, self.node);
    },
    onDestroy: function () {
        this.postionSampler&&clearInterval(this.postionSampler);
        this.node.off(cc.Node.EventType.TOUCH_END);
    }
});
