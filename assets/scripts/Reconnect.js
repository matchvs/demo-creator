var mvs = require("Matchvs");
var GLB = require("Glb");
cc.Class({
    extends: cc.Component,

    properties: {

    },


    onLoad () {
        var self = this;
        mvs.response.sendEventNotify = this.sendEventNotify.bind(this);
        mvs.response.reconnectResponse = this.reconnectResponse.bind(this);
    },
    start () {

    },

    sendEventNotify:function (eventInfo) {
        var obj = JSON.parse(eventInfo.cpProto);
        // console.log(obj.action);
        if ( GLB.reconnectSorce == null) {
            GLB.reconnectSorce = obj.score
            // GLB.scoreMap = new Map(obj.score);
            console.log("GLB.mapType:"+GLB.mapType);
            if (GLB.mapType == "白天模式") {
                cc.director.loadScene('game')
            } else {
                cc.director.loadScene('gameB')
            }
        }
        // if (eventInfo.cpProto.indexOf(GLB.GAME_RECONNECT) >= 0) {
        //     console.log('已经接受到了玩家的游戏分数消息');
        //     GLB.scoreMap = JSON.parse(eventInfo.cpProto).scoreMap;
        //
        // }
    },

    //断线重连
    reconnectResponse:function (status,roomUserInfoList,roomInfo) {
        //断线重连成功
        if (status === 200) {
            GLB.playerUserIds.push(GLB.userID);
            for (var i = 0; i < roomUserInfoList.length;i++) {
                GLB.playerUserIds.push(roomUserInfoList[i].userId)
            }
            GLB.isReconnect = true;
            mvs.engine.getRoomDetail(roomInfo.roomID);
            GLB.roomId = roomInfo.roomID;
            mvs.response.getRoomDetailResponse = this.getRoomDetailResponse.bind(this);
        }
    },
    
    getRoomDetailResponse:function (roomDetailRsp) {
        //还没有开始游戏
        if(roomDetailRsp.status == 200 && roomDetailRsp.state === 1){
            cc.director.loadScene('gameRoom');
        } else {

            GLB.mapType = roomDetailRsp.roomProperty;

        }
    },


    // update (dt) {},
});
