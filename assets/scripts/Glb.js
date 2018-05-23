var obj = {
    RANDOM_MATCH: 1,  // 随机匹配
    PROPERTY_MATCH: 2,  // 属性匹配
    MAX_PLAYER_COUNT: 3,
    GAME_START_EVENT: "gameStart",
    NEW_START_EVENT: "newStar",
    PLAYER_MOVE_EVENT: "playerMove",
    GAIN_SCORE_EVENT: "gainScore",
    PLAYER_POSITION_EVENT: "playerPosition",
    GAME_RECONNECT:"Reconnect",

    channel: 'MatchVS',
    platform: 'alpha',
    gameId: 200978,
    gameVersion: 1,
    appKey: '4fd4a67c10e84e259a2c3c417b9114f4',
    secret: 'bd00c3953f6a447eaaa1e36f19684764',

    matchType: 1,
    tagsInfo: {"title": "A"},
    userID: 0,
    reconnectSorce: null,
    playerUserIds: [],
    playerSet: new Set(),
    isRoomOwner: false,
    events: {},
    playerUserScore :[],
    syncFrame: false,
    FRAME_RATE: 25,
    roomId: 0,
    playertime: 180,
    first: null,
    second: null,
    third: null,
    isGameOver: false,

    scoreMap: [{"uid":0,score:0},{"uid":0,score:0},{"uid":0,score:0}],

    number1: "",
    number2: "",
    number3: "",

    mapType: "",
    lastErrMsg: "2018-05-17",


    isReconnect:false,

    updateUserScore:function (id,score) {
        for (var i = 0; i < this.scoreMap.length; i++) {
            if (this.scoreMap[i].userID ===id){
                this.scoreMap[i].score = score;
                console.log( "[update score] userID:"+id+" score:"+score);
            }
        }
    },
    FPS:24,//数据帧每秒采样次数
    noSuchMethod:null
};
module.exports = obj;