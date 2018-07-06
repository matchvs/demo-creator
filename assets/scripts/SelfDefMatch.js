var engine = require("MatchvsEngine");
var response = require("MatchvsDemoResponse");
var GLB = require("Glb");
var msg = require("MatvhsMessage");
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
        }
    },


    onLoad () {
        var self = this;
        this.startMatch.on(cc.Node.EventType.TOUCH_END, function(event){
            self.labelLog('开始属性匹配');
            if (self.odd.isChecked) {
                GLB.tagsInfo={"title": "A"};
                self.labelLog('设置标签A');
            } else {
                GLB.tagsInfo={"title": "B"};
                self.labelLog('设置标签B');
            }
            // 设置当前模式为属性匹配
            GLB.matchType = GLB.PROPERTY_MATCH;
            cc.director.loadScene('match');
        });
        this.returnLobby.on(cc.Node.EventType.TOUCH_END, function(event){
            cc.director.loadScene('lobby');
        });
    },


    labelLog: function (info) {
        this.labelInfoSelfDefineMatch.string += '\n' + info;
    },

    startGame: function () {
        this.labelLog('游戏即将开始')
        cc.director.loadScene('game')
    },

});
