let engine;
let response = {};
let MsMatchInfo;
let MsCreateRoomInfo;
let MsRoomFilterEx;
let LocalStore_Clear;
try {
    console.log("load matchvs");
    let jsMatchvs = require("matchvs.all");
    engine = new jsMatchvs.MatchvsEngine();
    response = new jsMatchvs.MatchvsResponse();
    MsMatchInfo = jsMatchvs.MsMatchInfo;
    MsCreateRoomInfo = jsMatchvs.MsCreateRoomInfo;
    MsRoomFilterEx  = jsMatchvs.MsRoomFilterEx ;
    LocalStore_Clear = jsMatchvs.LocalStore_Clear;
} catch (e) {
	console.warn("load matchvs fail,"+e.message);
}
module.exports = {
    engine: engine,
    response: response,
    MsMatchInfo: MsMatchInfo,
    MsCreateRoomInfo: MsCreateRoomInfo,
    MsRoomFilterEx :MsRoomFilterEx ,
    LocalStore_Clear:LocalStore_Clear,
};