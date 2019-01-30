const {ccclass, property} = cc._decorator;


@ccclass
export default class NewClass extends cc.Component {

    @property(cc.EditBox)
    gameIdInput: cc.EditBox = null;

    @property(cc.EditBox)
    appKeyInput: cc.EditBox = null;

    @property(cc.Node)
    confirm: cc.Node = null;

    @property(cc.Node)
    clear: cc.Node = null;

    @property(cc.Node)
    independent: cc.Node = null;

    @property(cc.Node)
    labelInfo: cc.Label = null;
    private Engine: MatchvsEngine;
    private Response: MatchvsResponse;
    private GameID: number = 200978;
    private AppKey: string = "4fd4a67c10e84e259a2c3c417b9114f4";
    private ms: MsRoomInfo;

    start() {
        // let self = this;
        // self.Engine = new MatchvsEngine();
        // self.Response = new MatchvsResponse();
        // this.confirm.on(cc.Node.EventType.TOUCH_END, function () {
        //     if (Number(self.gameIdInput.string) === 0 && Number(self.gameIdInput.placeholder) === 0 && self.appKeyInput.string === "" && self.appKeyInput.placeholder === "") {
        //         return;
        //     }
        //     if (self.appKeyInput.string === "") {
        //         self.AppKey = self.appKeyInput.placeholder;
        //     } else {
        //         self.AppKey = self.appKeyInput.string;
        //     }
        //     const gameVersion = 1;
        //     if (Number(self.gameIdInput.string) === 0) {
        //         self.Engine.init(self.Response, "Matchvs", "alpha", Number(self.gameIdInput.placeholder), this.AppKey, gameVersion);
        //     } else {
        //         self.Engine.init(self.Response, "Matchvs", "alpha", Number(self.gameIdInput.string), this.AppKey, gameVersion);
        //     }
        //
        // });
        //
        // self.initEvent();
    }

    /**
     * 注册对应的事件监听和把自己的原型传递进入，用于发送事件使用
     */
    private initEvent() {
        this.Response.initResponse = this.initRsp.bind(this);
        this.Response.registerUserResponse = this.registerUserRsp.bind(this);
        this.Response.loginResponse = this.loginRsp.bind(this);
    }

    /**
     * 初始化回调
     * @param status
     */
    initRsp(status) {
        if (status === 200) {
            console.log("Ts版本 初始化成功");
            this.Engine.registerUser();
        } else {
            console.log("Ts版本 初始化失败");
        }
    }

    /**
     * 注册回调
     * @param userInfo
     */
    registerUserRsp(userInfo) {
        if (userInfo.status === 0) {
            this.login(userInfo.userID, userInfo.token);
            console.log("Ts版本 注册成功");
        } else {
            console.log("Ts版本 注册失败");
        }
    }

    /**
     * 登录回调
     * @param loginRsp
     */
    loginRsp(loginRsp) {
        if (loginRsp.status === 200) {
            console.log("Ts版本 登录成功");
            if (loginRsp.roomID !== null && loginRsp.roomID !== '0') {
                this.Engine.leaveRoom("");
                cc.director.loadScene("Lobby");
            } else {
                cc.director.loadScene("Lobby");
            }

        } else {
            console.log("Ts版本 登录失败");
        }

    }

    /**
     * 登录
     * @param id
     * @param token
     */
    login(id, token) {
        // this.labelLog('开始登录...用户ID:' + id + " gameID " + "200978");
        const deviceID = "abcd01";
        this.Engine.login(id, token, deviceID);
    }

    /**
     * 页面log打印
     * @param info
     */
    labelLog(info) {
        this.labelInfo.string += '\n[LOG]: ' + info;
    }

}
