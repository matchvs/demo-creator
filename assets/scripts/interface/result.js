let GLB = require("Glb");
let msg = require("../MatchvsLib/MatvhvsMessage");

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
        let self = this;
        this.sortScore(self);
        this.initEvent();
        this.buttonBack.on(cc.Node.EventType.TOUCH_END, function(){
            cc.director.loadScene('Lobby');
        });
    },

    sortScore() {
        let nums = [GLB.number1,GLB.number2,GLB.number3];
        for(let i = 0; i < nums.length;i++) {
            let num = nums[i].split(":");
            //如果自己是房主
            this.showNum(num);
        }
    },

    showNum(num) {
        let IDS = [this.oneID,this.twoID];
        let scoreS = [this.oneScore,this.twoScore];
        if (num[0] == GLB.ownew) {
            this.ownerID .string = num[0];
            this.ownerScore.string = num[1];
        } else {
            for(let i = 0; i < IDS.length ;i++) {
                if(IDS[i].string === "") {
                    IDS[i].string = num[0];
                    scoreS[i].string = num[1];
                    return;
                }
            }
        }
    },


    /**
     * 注册对应的事件监听和把自己的原型传递进入，用于发送事件使用
     */
    initEvent:function () {
        cc.systemEvent.on(msg.MATCHVS_ERROE_MSG,this.onEvent);
        cc.systemEvent.on(msg.MATCHVS_NETWORK_STATE_NOTIFY,this.onEvent);
    },
    
    
    onEvent:function (event) {
        let eventData = event.data;
        switch (event.type){
            case msg.MATCHVS_ERROE_MSG:
                console.log("[Err]errCode:"+event.detail.errorCode+" errMsg:"+event.detail.errorMsg);
                cc.director.loadScene('Login');
            break;
            case msg.MATCHVS_NETWORK_STATE_NOTIFY:
                if (eventData.netNotify.userID === GLB.userID && eventData.netNotify.state === 1) {
                    console.log("netNotify.userID :"+eventData.netNotify.userID +"netNotify.state: "+eventData.netNotify.state);
                    cc.director.loadScene("Login");
                }
            break;
        }

    },


    onDestroy() {
        GLB.number1 = 0;
        GLB.number2 = 0;
        GLB.number3 = 0;
        cc.systemEvent.on(msg.MATCHVS_ERROE_MSG,this.onEvent);
        cc.systemEvent.on(msg.MATCHVS_NETWORK_STATE_NOTIFY,this.onEvent);
    }

});
