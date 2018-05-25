var mvs = require("Matchvs");
var GLB = require("Glb");


cc.Class({
    extends: require("Player"),

    properties: {
        sendCount: cc.Label,
        sendCountValue: 0

    },
    isUserInput: 0,
    setInputControl: function () {
        var self = this;

        var rightAnim = this.node.getChildByName("rightAnim");
        var leftAnim = this.node.getChildByName("leftAnim");

        var animRight = this.node.getChildByName("rightAnim").getComponent(cc.Animation);
        var animLeft = this.node.getChildByName("leftAnim").getComponent(cc.Animation);

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
                    if (self.isUserInput !== 2) {
                        animLeft.stop();
                        animRight.play();
                        rightAnim.active = true;
                        leftAnim.active = false;
                    }
                    self.isUserInput = 2;
                    console.log(" move to right");

                } else {
                    if (self.isUserInput !== 1) {
                        animLeft.play();
                        animRight.stop();
                        rightAnim.active = false;
                        leftAnim.active = true;
                    }
                    self.isUserInput = 1;
                    console.log(" move to left");
                }
            },
            onTouchEnded: function (touch, event) {
                console.log("ended move ");
                self.isUserInput = 0;
                animRight.stop();
                animLeft.stop();

            }
        }, self.node);
    },

    onLoad: function () {
        this._super();
        var self = this;
        var id = setInterval(function () {
            if (GLB.isGameOver === true) {
                console.log("checked game(syncFrame) is over!, clearInterval:" + id);
                clearInterval(id);
                return;
            }
            if (self.isUserInput !== 0) {
                switch (self.isUserInput) {
                    case 3:
                        break;
                    case 1:
                        self.onPostionChanged(self.playerSpriteRight.node.x -= 100 / GLB.FPS);
                        console.log("changed arrow to left");
                        break;
                    case 2:
                        self.onPostionChanged(self.playerSpriteRight.node.x += 100 / GLB.FPS);
                        console.log("changed arrow to right");
                        break;
                    default:

                        break;
                }
                var frameData = JSON.stringify({
                    action: GLB.PLAYER_POSITION_EVENT,
                    x: self.playerSpriteRight.node.x
                });
                GLB.syncFrame === false ? (mvs.engine.sendEventEx(0, frameData, 0, GLB.playerUserIds))
                    : (mvs.engine.sendFrameEvent(frameData));
            }
        }, 1000 / GLB.FPS);
        // 初始化键盘输入监听
        this.setInputControl();


    },

    onDestroy: function () {
        clearInterval(this.timer);
    }


});
