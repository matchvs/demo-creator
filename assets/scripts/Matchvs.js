var engine;
var response = {};
var MsMatchInfo;
var MsCreateRoomInfo;
var MsRoomFilterEx;

try {
	console.log("load matchvs JSB  a ");
    engine = Matchvs.MatchvsEngine.getInstance();
	console.log("load matchvs JSB  a1 ");
    MsMatchInfo = Matchvs.MatchInfo;
	console.log("load matchvs JSB  a2 ");
    MsCreateRoomInfo = Matchvs.CreateRoomInfo;
	console.log("load matchvs JSB  a3 ");
    MsRoomFilterEx  = Matchvs.RoomFilterEx ;
	console.log("load matchvs JSB b ");
} catch (e) {
	console.error("load matchvs JSB fail,"+e.message);
    try {
        var jsMatchvs = require("matchvs.all");
        engine = new jsMatchvs.MatchvsEngine();
        response = new jsMatchvs.MatchvsResponse();
        MsMatchInfo = jsMatchvs.MsMatchInfo;
        MsCreateRoomInfo = jsMatchvs.MsCreateRoomInfo;
        MsRoomFilterEx  = jsMatchvs.MsRoomFilterEx ;
		console.log("load matchvs.all.js");
    } catch (e) {
		console.error(e);
        var MatchVSEngine = require('MatchvsEngine');
		console.log("load matchvs JSB");
        engine = new MatchVSEngine();
    }
}
module.exports = {
    engine: engine,
    response: response,
    MsMatchInfo: MsMatchInfo,
    MsCreateRoomInfo: MsCreateRoomInfo,
    MsRoomFilterEx :MsRoomFilterEx 
};