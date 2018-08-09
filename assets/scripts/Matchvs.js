var engine;
var response = {};
var MsMatchInfo;
var MsCreateRoomInfo;
var MsRoomFilterEx;
var LocalStore_Clear;
try {
    engine = Matchvs.MatchvsEngine.getInstance();
    MsMatchInfo = Matchvs.MatchInfo;
    MsCreateRoomInfo = Matchvs.CreateRoomInfo;
    MsRoomFilterEx  = Matchvs.RoomFilterEx ;
    console.log("load matchvs JSB");
} catch (e) {
	console.warn("load matchvs JSB fail,"+e.message);
    // try {
        var jsMatchvs = require("matchvs.all");
        engine = new jsMatchvs.MatchvsEngine();
        response = new jsMatchvs.MatchvsResponse();
        MsMatchInfo = jsMatchvs.MsMatchInfo;
        MsCreateRoomInfo = jsMatchvs.MsCreateRoomInfo;
        MsRoomFilterEx  = jsMatchvs.MsRoomFilterEx ;
        LocalStore_Clear = jsMatchvs.LocalStore_Clear;
		console.log("load matchvs.all.js");
    // } catch (e) {
		// console.warn("load matchvs.all.js fail,"+e.message);
        // var MatchVSEngine = require('MatchvsEngine');
		// console.log("load matchvs test code");
        // engine = new MatchVSEngine();
    // }
}
module.exports = {
    engine: engine,
    response: response,
    MsMatchInfo: MsMatchInfo,
    MsCreateRoomInfo: MsCreateRoomInfo,
    MsRoomFilterEx :MsRoomFilterEx ,
    LocalStore_Clear:LocalStore_Clear,
};