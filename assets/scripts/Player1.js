var mvs = require("Matchvs");
var GLB = require("Glb");


cc.Class({
    extends: require("Player"),

    properties: {
        sendCount: cc.Label,
        sendCountValue: 0
    },
    isUserInput: 0,
    sendAccChangeMessage: function (accLeft, accRight) {
        var msg = {action: GLB.PLAYER_MOVE_EVENT};
        if (typeof accLeft === 'boolean') msg.accLeft = accLeft;
        if (typeof accRight === 'boolean') msg.accRight = accRight;
        var result = mvs.engine.sendEvent(JSON.stringify(msg));

        if (result.result !== 0)
            return console.error("移动事件发送失败", result.result);

        if (typeof accLeft === 'boolean') this.accLeft = accLeft;
        if (typeof accRight === 'boolean') this.accRight = accRight;


    },

    setInputControl: function () {
        var self = this;
        cc.eventManager.addListener({
            event: cc.EventListener.TOUCH_ONE_BY_ONE,
            onTouchBegan: function (touch, event) {
                self.isUserInput = 3;
                console.log("begin move ");
                return true;
            },
            onTouchMoved: function (touch) {
                var touchLoc = touch.getLocation();
                if (touchLoc.x >= cc.winSize.width / 2) {
                    self.sendAccChangeMessage(false, true);
                    self.isUserInput = 2;
                    console.log(" move to right");
                } else {
                    self.sendAccChangeMessage(true, false);
                    self.isUserInput = 1;
                    console.log(" move to left");
                }
            },
            onTouchEnded: function (touch, event) {
                self.sendAccChangeMessage(false, false);
                console.log("ended move ");
                self.isUserInput = 0;

            }
        }, self.node);
    },

    onLoad: function () {
        this._super();
        var self = this;
        var playerSprite = self.getComponent(cc.Sprite);

        var anim = this.getComponent(cc.Animation);
        var animState = anim.play();
        var animationWaitingPlay = [];

        animState.onStop = function () {
            console.log("anim is stop ");
            var _arrow = animationWaitingPlay.pop();
            while (_arrow != null) {
                anim.play();
                _arrow = animationWaitingPlay.pop();
            }
        };

        var id = setInterval(function () {
            if (GLB.isGameOver === true) {
                console.log("checked game(syncFrame) is over!, clearInterval:" + id);
                clearInterval(id);
                return;
            }

            var frameData = JSON.stringify({
                action: GLB.PLAYER_POSITION_EVENT,
                x: self.node.x,
                xSpeed: self.xSpeed,
                accLeft: self.accLeft,
                accRight: self.accRight,
                ts: new Date().getTime()
            });
            GLB.syncFrame === false ? (mvs.engine.sendEventEx(0, frameData, 0, GLB.playerUserIds))
                : (mvs.engine.sendFrameEvent(frameData));

            if (self.isUserInput !== 0) {
                animationWaitingPlay.unshift(self.isUserInput);
                switch (self.isUserInput) {
                    case 3:
                        anim.play();
                        break;
                    case 1:
                        playerSprite.node.x -= 100 / GLB.FPS;
                        animationWaitingPlay.unshift(self.isUserInput);
                        break;
                    case 2:
                        playerSprite.node.x += 100 / GLB.FPS;
                        animationWaitingPlay.unshift(self.isUserInput);
                        break;
                    default:
                        anim.stop();
                        break;
                }
            }
        }, 1000 / GLB.FPS);


        // 初始化键盘输入监听
        this.setInputControl();


    },

    onDestroy: function () {
        clearInterval(this.timer);
    }


});
