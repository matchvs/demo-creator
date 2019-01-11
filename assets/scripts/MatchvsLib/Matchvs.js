let engine;
let response = {};
let MsMatchInfo;
let MsCreateRoomInfo;
let MsRoomFilterEx;
let LocalStore_Clear;
try {
    console.log("load matchvs");
    engine =  new window.MatchvsEngine();
    console.log("load matchvs1");
    response = new window.MatchvsResponse();
    console.log("load matchvs2");
    MsMatchInfo = window.MsMatchInfo;
    console.log("load matchvs3");
    MsCreateRoomInfo = window.MsCreateRoomInfo;
    console.log("load matchvs4");
    MsRoomFilterEx  = window.MsRoomFilterEx ;
    console.log("load matchvs5");
    LocalStore_Clear = window.LocalStore_Clear;
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