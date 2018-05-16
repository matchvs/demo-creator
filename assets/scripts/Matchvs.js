var engine;
var response = {};
var MatchInfo;
var CreateRoomInfo;

var GetRoomListExReq;
try {
    engine = Matchvs.MatchvsEngine.getInstance();
    MatchInfo = Matchvs.MatchInfo;
    CreateRoomInfo = Matchvs.CreateRoomInfo;

    MsRoomFilterEx  = Matchvs.MsRoomFilterEx ;
} catch (e) {
    try {
        var jsMatchvs = require("matchvs.all");
        engine = new jsMatchvs.MatchvsEngine();
        response = new jsMatchvs.MatchvsResponse();
        MatchInfo = jsMatchvs.MatchInfo;
        CreateRoomInfo = jsMatchvs.CreateRoomInfo;
        MsRoomFilterEx  = jsMatchvs.MsRoomFilterEx ;
    } catch (e) {
        var MatchVSEngine = require('MatchvsEngine');
        engine = new MatchVSEngine();
    }
}
module.exports = {
    engine: engine,
    response: response,
    MatchInfo: MatchInfo,
    CreateRoomInfo: CreateRoomInfo,
    MsRoomFilterEx :MsRoomFilterEx ,
};