var engine;
var response = {};
var MsMatchInfo;
var MsCreateRoomInfo;
var MsRoomFilterEx;
var LocalStore_Clear;
try {
    console.log("load matchvs");
    var jsMatchvs = require("matchvs.all");
    engine = new jsMatchvs.MatchvsEngine();
    response = new jsMatchvs.MatchvsResponse();
    MsMatchInfo = jsMatchvs.MsMatchInfo;
    MsCreateRoomInfo = jsMatchvs.MsCreateRoomInfo;
    MsRoomFilterEx  = jsMatchvs.MsRoomFilterEx ;
    LocalStore_Clear = jsMatchvs.LocalStore_Clear;
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