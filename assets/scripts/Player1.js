var mvs = require("Matchvs");
var GLB = require("Glb");

cc.Class({
    extends: require("Player"),

    properties: {
        sendCount: cc.Label,
        sendCountValue: 0,
    },

    sendAccChangeMessage(accLeft, accRight)  {
        var msg = { action: GLB.PLAYER_MOVE_EVENT };
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
            event: cc.EventListener.KEYBOARD,
            onKeyPressed: function (keyCode, event) {
                switch (keyCode) {
                    case cc.KEY.a:
                    case cc.KEY.left:
                        return self.sendAccChangeMessage(true, false);
                    case cc.KEY.d:
                    case cc.KEY.right:
                        return self.sendAccChangeMessage(false, true);
                }
            },

            onKeyReleased: function (keyCode, event) {
                switch (keyCode) {
                    case cc.KEY.a:
                        return self.sendAccChangeMessage(false, null);
                    case cc.KEY.d:
                        return self.sendAccChangeMessage(null, false);
                }
            }
        }, self.node);

        // touch input
        cc.eventManager.addListener({
            event: cc.EventListener.TOUCH_ONE_BY_ONE,
            onTouchBegan: function(touch, event) {
                var touchLoc = touch.getLocation();
                if (touchLoc.x >= cc.winSize.width/2) {
                    self.sendAccChangeMessage(false, true);
                } else {
                    self.sendAccChangeMessage(true, false);
                }
                // don't capture the event
                return true;
            },
            onTouchEnded: function(touch, event) {
                self.sendAccChangeMessage(false, false);
            }
        }, self.node);
    },

    onLoad: function () {
        this._super();

        if (GLB.syncFrame === false) {
                this.timer = setInterval(() => {
                    var obj = JSON.stringify({
                        action: GLB.PLAYER_POSITION_EVENT,
                        x: this.node.x,
                        xSpeed: this.xSpeed,
                        accLeft: this.accLeft,
                        accRight: this.accRight,
                        score:[... GLB.scoreMap],
                        ts: new Date().getTime()
                    });
                    mvs.engine.sendEventEx(0,obj , 0, GLB.playerUserIds);
                    console.log(GLB.isGameOver);
                    if (GLB.isGameOver === true) {
                        clearInterval(this.timer);
                    }
                }, 200);
        } else {
            var id = setInterval(() => {
                mvs.engine.sendFrameEvent(JSON.stringify({
                    action: GLB.PLAYER_POSITION_EVENT,
                    x: this.node.x,
                    xSpeed: this.xSpeed,
                    accLeft: this.accLeft,
                    accRight: this.accRight,
                    ts: new Date().getTime(),

                }));
                if (GLB.isGameOver === true) {
                    clearInterval(id);
                }
                // this.sendCountValue++;
                // this.sendCount.string = "send msg count: " + this.sendCountValue;
            }, 200);
        }

        // 初始化键盘输入监听
        this.setInputControl();
    },

    onDestroy() {
        clearInterval(this.timer);
    }


});
