// var mvs = require("Matchvs");

var GLB = require("Glb");
var response = require("MatchvsDemoResponse");
var msg = require("MatvhvsMessage");

cc.Class({
    extends: cc.Component,

    properties: {
        roomNum:cc.Label,
        ownerID:cc.Label,
        ownerScore:cc.Label,
        oneID:cc.Label,
        oneScore:cc.Label,
        twoID:cc.Label,
        twoScore:cc.Label,
        buttonBack: cc.Node,
    },


    onLoad () {
        var self = this;
        this.sortScore(self);
        this.initEvent(self);
        this.buttonBack.on(cc.Node.EventType.TOUCH_END, function(event){
            cc.director.loadScene('Lobby');
        });
    },

    sortScore() {
        var nums = [GLB.number1,GLB.number2,GLB.number3];
        for(var i = 0; i < nums.length;i++) {
            var num = nums[i].split(":")
            //如果自己是房主
            this.showNum(num);
        }
    },

    showNum(num) {
        var IDS = [this.oneID,this.twoID];
        var scoreS = [this.oneScore,this.twoScore];
        if (num[0] == GLB.ownew) {
            this.ownerID .string= num[0];
            this.ownerScore.string = num[1];
        } else {
            for(var i = 0; i < IDS.length ;i++) {
                if(IDS[i].string === "") {
                    IDS[i].string = num[0];
                    scoreS[i].string = num[1]
                    return;
                }
            }
        }
    },


    /**
     * 注册对应的事件监听和把自己的原型传递进入，用于发送事件使用
     */
    initEvent:function (self) {
        response.prototype.init(self);
        this.node.on(msg.MATCHVS_ERROE_MSG, this.onEvent, this);
    },
    
    
    onEvent:function (event) {
        switch (event.type){
            case msg.MATCHVS_ERROE_MSG:
                console.log("[Err]errCode:"+event.detail.errorCode+" errMsg:"+event.detail.errorMsg);
                cc.director.loadScene('Login');
            break;
        }

    },

    start () {
    },

    onDestroy() {
        GLB.number1 = 0;
        GLB.number2 = 0;
        GLB.number3 = 0;
        this.node.off(msg.MATCHVS_ERROE_MSG, this.onEvent, this);
    }

});
