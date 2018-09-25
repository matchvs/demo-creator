var engine = require("MatchvsEngine");
var response = require("MatchvsDemoResponse");
var GLB = require("Glb");
var msg = require("MatvhvsMessage");
cc.Class({
    extends: cc.Component,

    properties: {
        odd: cc.Toggle,
        even: cc.Toggle,
        startMatch: cc.Node,
        returnLobby: cc.Node,
        labelInfoSelfDefineMatch: {
            default: null,
            type: cc.Label
        },
        nickName:cc.Label,
    },


    onLoad () {
        var self = this;
        self.nickName.string = '用户ID：'+ GLB.userID;
        this.startMatch.on(cc.Node.EventType.TOUCH_END, function(event){
            if (self.odd.isChecked) {
                GLB.tagsInfo={"title": "A"};
            } else {
                GLB.tagsInfo={"title": "B"};
            }
            GLB.matchType = GLB.PROPERTY_MATCH;
            cc.director.loadScene('Match');
        });
        this.returnLobby.on(cc.Node.EventType.TOUCH_END, function(event){
            cc.director.loadScene('Lobby');
        });
    },

    startGame: function () {
        this.labelLog('游戏即将开始')
        cc.director.loadScene('game')
    },

});
