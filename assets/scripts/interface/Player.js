let GLB = require("Glb");
let engine = require("../MatchvsLib/MatchvsEngine");
let msg = require("../MatchvsLib/MatvhvsMessage");
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
        mouseListener:null,
        startPostion:0,
    },


    onPostionChanged(x, arrow) {
        try{
            this.playerSpriteRight.node.x = x;
            this.playerSpriteLeft.node.x = x;
            this.playAnimation(arrow);
            this.playerLabel.node.x = x;
        } catch(error){
            console.log(error.message);
        }
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
        let self = this;
        if (this.isAllowInput) {
            this.postionSampler = setInterval(function () {
                if (GLB.isGameOver === true) {
                    // console.log("checked game(syncFrame) is over!, clearInterval:" + id);
                    clearInterval(self.postionSampler);
                    return;
                }
                let frameData = JSON.stringify({
                    "userID": GLB.userID,
                    "action": msg.EVENT_PLAYER_POSINTON_CHANGED,
                    "x": self.getPostion(),
                    "arrow": self.isUserInputing
                });
                let  x = self.getPostion();
                // self.node.parent.getComponent("Game").node.emit(msg.PLAYER_POSINTON, {x:x,type:msg.PLAYER_POSINTON});
                let event = new cc.Event(msg.PLAYER_POSINTON,true);
                event["data"] = {x:x,type:msg.PLAYER_POSINTON};
                cc.systemEvent.dispatchEvent(event);
                // if (self.isDebug){
                //     self.node.parent.getComponent("Game").onNewWorkGameEvent({"cpProto":frameData}); //remove me, This is for Test only
                // } else  {
                //     engine.prototype.sendEvent(frameData);
                // }
                if (GLB.syncFrame === true) {
                    engine.prototype.sendFrameEvent(frameData);
                } else {
                    engine.prototype.sendEvent(frameData);
                }

            }, 1000 / GLB.FPS);
            // 初始化键盘输入监听
            this.addEventManageListener();
        }
    },


    playAnimation: function (arrow) {
        try{
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
        } catch(error){
            console.log(error.message);
        }

    },
    onTouch : function (touch) {
        let self = this;
        try{
            let touchLoc = touch.getLocation();
            if (touchLoc.x >= cc.winSize.width / 3) {
                self.isUserInputing = GLB.ARROW_RIGHT;
                self.onPostionChanged(self.playerSpriteRight.node.x + self.speed, self.isUserInputing);
            } else {
                self.isUserInputing = GLB.ARROW_LEFT;
                self.onPostionChanged(self.playerSpriteRight.node.x - self.speed, self.isUserInputing);
            }
        } catch(error){
            console.warn(error.message);
            cc.eventManager.removeListener(self.mouseListener);
            self.addEventManageListener();
        }

    },

    //2.0 需要手动移除
    addEventManageListener :function() {
        try{
            let self = this;
            if (this.mouseListener != null) {
                cc.eventManager.removeListener(this.mouseListener);
            }
            this.mouseListener = cc.eventManager.addListener({
                event: cc.EventListener.TOUCH_ONE_BY_ONE,
                fakeMove: null,
                onTouchBegan: function (touch) {
                    console.log("begin move ");
                    self.onTouch(touch);
                    if (this.fakeMove == null) {
                        this.fakeMove = setInterval(function () {
                            self.onTouch(touch);
                        },GLB.FPS);
                    }
                    return true;
                },
                onTouchMoved: function () {
                    // onTouch(touch);
                    return true;
                },
                onTouchEnded: function () {
                    console.log("begin let go");
                    clearInterval(this.fakeMove);
                    this.fakeMove = null;
                    self.isUserInputing = GLB.ARROW_STOP;
                    self.onPostionChanged(self.playerSpriteRight.node.x, self.isUserInputing);
                }
            }, self.node);
        } catch(error){
            console.log(error.message);
        }
    },


    // 随机返回'新的星星'的位置
    getNewStarPosition: function () {
        let randX = cc.randomMinus1To1() * this.starMaxX;
        let randY = -90;
        return cc.p(randX, randY)
    },





    onDestroy: function () {
        cc.eventManager.removeListener(this.mouseListener);
        console.log("人物节点销毁");
        this.postionSampler && clearInterval(this.postionSampler);
    }
});
