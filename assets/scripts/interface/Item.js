var engine = require("../MatchvsLib/MatchvsDemoEngine");
cc.Class({
    extends: cc.Component,

    properties: {
        roomName: {
            default: null,
            type: cc.Label
        },

        roomState: {
            default: null,
            type:cc.Label
        },
        roomPlayer: {
            default: null,
            type:cc.Label
        },
        roomMap: {
            default: null,
            type:cc.Label
        },
        startGame: cc.Node,
        itemID: 0

    },

    onLoad: function () {
        var self = this;
        this.node.on('touchend', function () {
            console.log("Item " + this.itemID + ' clicked');
        }, this);
        this.startGame.on(cc.Node.EventType.TOUCH_END, function (event) {
            //     cc.director.loadScene("lobby");
            engine.prototype.joinRoom(self.roomName.string, "china");
            console.log();
        })
    },

    updateItem: function(obj) {
        this.roomName.string = obj.roomID;
        console.log(obj.roomID);
        if (obj.state == 1) {
            this.roomState.string = "开放";
        } else {
            this.roomState.string = "关闭";
        }
        this.roomPlayer.string = obj.gamePlayer+"/"+obj.maxPlayer;
        this.roomMap.string = obj.roomProperty;
    }
});