let obj = {
    RANDOM_MATCH: 1,  // 随机匹配
    PROPERTY_MATCH: 2,  // 属性匹配
    MAX_PLAYER_COUNT: 3,
    channel: 'Matchvs',
    platform: 'alpha',
    gameID: 200978,
    gameVersion: 1,
    appKey: '4fd4a67c10e84e259a2c3c417b9114f4',
    secret: 'bd00c3953f6a447eaaa1e36f19684764',
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
    playertime: 120,
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

window['obj'] = obj; //这步不能少