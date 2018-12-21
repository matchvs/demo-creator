var wxShareConf = {
    getOpenIDAddr:"http://test79open.matchvs.com/getOpenID?" //传入code获取微信openID的服务端地址
}
let engine = require("../MatchvsLib/MatchvsEngine");
/**
 * 获取启动参数
 */
function getLaunchOptionsSync() {
    var LaunchOption = wx.getLaunchOptionsSync();
    console.log("LaunchOption:" + JSON.stringify(LaunchOption));
    console.log("LaunchOption quary:" + JSON.stringify(LaunchOption.query));
    return LaunchOption;
}

/**
 * 约战API
 * @param {string} title 
 * @param {string} query getLaunchOptionsSync 中的参数
 */
function together(title, query) {
    wx.shareAppMessage({
        title: title,
        query: query,
        complete: function () {
            console.log(arguments);
        },
        success: function (shareTickets, groupMsgInfos) {
            console.log(shareTickets);
            console.log(groupMsgInfos);
        }
    })

    wx.updateShareMenu({
        withShareTicket: true,//开启群发
        success: function () {
            console.log("updateShareMenu success");
        },
        fail: function (e) {
            console.log("updateShareMenu fail" + e);
        }
    });


}

/**
 * 获取用户信息
 */
function getWxUserInfo(data) {
    wx.getUserInfo({
        openIdList: ['selfOpenId'],
        lang: 'zh_CN',
        success: function (res) {
            console.log('success', res.userInfo);
            return data(res.userInfo);
        },
        fail: function (res) {
            // reject(res);
            if (res.errMsg == "getUserInfo:fail scope unauthorized") {
                console.warn("getWxUserInfo error");
                engine.prototype.registerUser();
            }
            console.log("fail", res);
            return "";
        }
    });
}


/**
 * 获取用户OpenID
 */
function getUserOpenID(obj) {
    var callObj = obj;
    wx.login({
        success: function (res) {
            var wcode = res.code;
            wx.request({
                url: wxShareConf.getOpenIDAddr,
                method: "GET",
                data: {
                    code: wcode
                },
                success: function (res) {
                    console.log(res.data);
                    return obj(res.data);
                }
            });
        },
        fail: function (res) {
            obj.fail(res);
            console.log(res.data);
            return obj(res.data);
        },
    });

    /**创建用户信息按钮*/
   function  CreateUserInfoButton(callBackSucc,BackGroundImageUrl,backgroundColor,color) {
        var sysInfo = wx.getSystemInfoSync();
        var left = (sysInfo.screenWidth / 2) - 100;
        var top = (sysInfo.screenHeight / 2) + 80;
        let button = wx.createUserInfoButton({
            type: 'image',
            image: BackGroundImageUrl,
            style: {
                left: left,
                top: top,
                width: 200,
                height: 40,
                backgroundColor:backgroundColor === undefined ? backgroundColor : '#ff0000',
                color: color === undefined ? color : '#ffffff',
                borderColor: "",
                borderWidth: 1,
                borderRadius: 4,
                textAlign: 'center',
                fontSize: 16,
                lineHeight: 4,
            },
            withCredentials: true
        });
        button.onTap((re) => {
            wx.getSetting({
                success: (res) => {
                    if (!res.authSetting['scope.userInfo']) {
                        button.show();
                    } else {
                        //授权成功
                        let userData = {
                            encryptedData: re.encryptedData,
                            iv: re.iv
                        }
                        button.destroy();
                        callBackSucc(userData, re.userInfo);
                    }
                },
                //申请授权失败
                fail: (res) => {
                },
                complete: (res) => {
                }
            });
        });
    }

}



window.getLaunchOptionsSync = getLaunchOptionsSync;
window.together = together;
window.getWxUserInfo = getWxUserInfo;
window.getUserOpenID = getUserOpenID;