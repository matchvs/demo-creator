let obj = {
    RANDOM_MATCH: 1,  // 随机匹配
    PROPERTY_MATCH: 2,  // 属性匹配
    MAX_PLAYER_COUNT: 3,
    channel: 'Matchvs',
    platform: 'alpha',
    gameID: 201865,
    gameVersion: 1,
    appKey: '0257c1782f2343e3a66b0c52e8b955c4',
    isWX:false,
    matchType: 1,
    tagsInfo: {"title": "A"},
    frameInfo: {"title" : "frameInfo"},
    userID: 0,
    name: "",
    avatar: "",
    ARROW_LEFT: 1,
    ARROW_RIGHT: 2,
    ARROW_STOP: 0,
    playerUserIds: [],
    isRoomOwner: false,
    syncFrame: false,
    FRAME_RATE: 20,
    roomID: 0,
    playertime: 60,
    isGameOver: false,
    NEW_STAR_POSITION : 0,
    number1: "",
    number2: "",
    number3: "",
    ownew:0, //只为做分数展示时判断使用
    mapType: "",
    FPS:30,//数据帧每秒采样次数
};

module.exports = obj;

// window['obj'] = obj; //这步不能少