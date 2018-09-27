var engine;
var response = {};
var MsMatchInfo;
var MsCreateRoomInfo;
var MsRoomFilterEx;
var LocalStore_Clear;
try {
    // engine = Matchvs.MatchvsEngine.getInstance();
    // MsMatchInfo = Matchvs.MatchInfo;
    // MsCreateRoomInfo = Matchvs.CreateRoomInfo;
    // MsRoomFilterEx  = Matchvs.RoomFilterEx ;
    console.log("load matchvs");
    var jsMatchvs = require("matchvs.all");
    console.log("load matchvs1");
    engine = new jsMatchvs.MatchvsEngine();
    console.log("load matchvs2");
    response = new jsMatchvs.MatchvsResponse();
    console.log("load matchvs3");
    MsMatchInfo = jsMatchvs.MsMatchInfo;
    console.log("load matchvs4");
    MsCreateRoomInfo = jsMatchvs.MsCreateRoomInfo;
    console.log("load matchvs5");
    MsRoomFilterEx  = jsMatchvs.MsRoomFilterEx ;
    console.log("load matchvs6");
    LocalStore_Clear = jsMatchvs.LocalStore_Clear;
    console.log("load matchvs.all.js");
} catch (e) {
	console.warn("load matchvs JSB fail,"+e.message);
}
module.exports = {
    engine: engine,
    response: response,
    MsMatchInfo: MsMatchInfo,
    MsCreateRoomInfo: MsCreateRoomInfo,
    MsRoomFilterEx :MsRoomFilterEx ,
    LocalStore_Clear:LocalStore_Clear,
};