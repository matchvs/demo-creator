var obj = {
    RANDOM_MATCH: 1,  // 随机匹配
    PROPERTY_MATCH: 2,  // 属性匹配
    MAX_PLAYER_COUNT: 3,
    GAME_START_EVENT: "gameStart",
    EVENT_NEW_START: "newStar",
    PLAYER_MOVE_EVENT: "playerMove",
    EVENT_GAIN_SCORE: "gainScore",
    EVENT_PLAYER_POSINTON_CHANGED: "playerPosition",
    GAME_RECONNECT:"Reconnect",

    channel: 'MatchVS',
    platform: 'alpha',
    gameID: 200978,
    gameVersion: 1,
    appKey: '4fd4a67c10e84e259a2c3c417b9114f4',
    secret: 'bd00c3953f6a447eaaa1e36f19684764',

    matchType: 1,
    tagsInfo: {"title": "A"},
    userID: 0,
    name: "",
    avatar: "",
    roomMaterID: 0,
    ARROW_LEFT: 1,
    ARROW_RIGHT: 2,
    ARROW_STOP: 0,
    reconnectSorce: null,
    playerUserIds: [],
    playerSet: new Set(),
    isRoomOwner: false,
    events: {},
    playerUserScore :[],
    syncFrame: false,
    FRAME_RATE: 25,
    roomID: 0,
    playertime: 180,
    first: null,
    second: null,
    third: null,
    isGameOver: false,
    NEW_STAR_POSITION : 0,

    scoreMap: [{"uid":0,score:0},{"uid":0,score:0},{"uid":0,score:0}],

    number1: "",
    number2: "",
    number3: "",

    mapType: "",
    lastErrMsg: "2018-05-17",



    FPS:30,//数据帧每秒采样次数
    noSuchMethod:null,
    putPushID2Set : function(item){
        this.playerUserIds.push(item);
        var res = [];
        var json = {};
        for(var i = 0; i < this.playerUserIds.length; i++){
            if(!json[this.playerUserIds[i]]){
                res.push(this.playerUserIds[i]);
                json[this.playerUserIds[i]] = 1;
            }
        }
        Array.sort(res);
        this.playerUserIds = res;
    }
};
/**
 * 去重复item
 * @returns {Array}
 */


module.exports = obj;