cc.Class({
    extends: cc.Component,

    properties: {
        // 星星和主角之间的距离小于这个数值时，就会完成收集
        pickRadius: 0,
        // 暂存 Game 对象的引用
        game: {
            default: null,
            serializable: false
        }
    },

    // use this for initialization
    onLoad: function () {
        cc.director.getCollisionManager().enabled = true;
    },

    onCollisionEnter: function (other, self) {
        console.log("碰撞生效了！！！！！！");
        if (self.tag === 0) {
            // this.view.active = true;
            // this.label.string = "you win";
        } else {
            // this.view.active = true;
            // this.label.string = "you lose";
        }
    },



    getPlayerDistance: function () {
        // 根据 player 节点位置判断距离
        let playerPos = this.game.players[0].getPosition();
        // this.game.players[0].node.x;
        // 根据两点位置计算两点之间距离
        let dist = this.pDistance(this.node.position, playerPos);
        return dist;
    },

    onPicked: function() {
        // 当星星被收集时，调用 Game 脚本中的接口，生成一个新的星星
        //this.game.spawnNewStar();
        // 调用 Game 脚本的得分方法
        // this.game.gainScore();
        // 然后销毁当前星星节点
        this.node.destroy();
    },

    // called every frame
    update: function () {
        // 每帧判断和主角之间的距离是否小于收集距离
        if (this.getPlayerDistance() < this.pickRadius) {
            // 调用收集行为
            this.onPicked();
            return;
        }
        // 根据 Game 脚本中的计时器更新星星的透明度
        let opacityRatio = Math.max(1 - this.game.timer/this.game.starDuration, 0.01);
        let minOpacity = 50;
        this.node.opacity = minOpacity + Math.floor(opacityRatio * (255 - minOpacity));
    },

    pDistance :function(v1, v2) {
        return this.pLength(this.pSub(v1, v2));
    },

    pLength : function(v) {
        return Math.sqrt(this.pLengthSQ(v));
    },

    pSub :function(v1, v2) {
        return cc.v2(v1.x - v2.x, v1.y - v2.y);
    },
    pLengthSQ : function(v) {
        return this.pDot(v, v);
    },

    pDot : function(v1, v2) {
        return v1.x * v2.x + v1.y * v2.y;
    },
});
