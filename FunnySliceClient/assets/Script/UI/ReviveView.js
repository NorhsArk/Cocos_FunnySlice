cc.Class({
    extends: cc.Component,

    properties: {
        //UIText
        timeText: {
            default: null,
            visible: false,
        },
        timeVal: {
            default: 0,
            visible: false,
        },
    },

    onLoad: function () {
        window.pauseScript = this;
        this.timeText = cc.find("Bg/Time", this.node).getComponent(cc.Label);
    },

    onEnable() {
        window.revive = false;
        this.timeVal = 10;
        this.timeText.string = this.timeVal;
        this.schedule(this.countTime, 1, 10, 1);
    },

    onDisable() {},

    //刷新数据
    countTime() {
        if (this.timeVal > 0 && this.timeVal < 100) {
            this.timeVal = this.timeVal - 1;
        }
        soundManager.playSound("Time");
        if (this.timeVal <= 0) {
            this.menuClick(null,"skip");
        } else {
            this.timeText.string = this.timeVal;
        }
    },

    start() { },

    //点击事件处理
    menuClick(event, type) {
        soundManager.playSound("btnClick")
        if (type == "video") {
            gameApplication.onVideoBtnClick(function (isOK) {
                if (isOK) {
                    window.revive = true;
                    viewManager.popView("ReviveView", false, function () {
                        mainScript.blowAll();
                    }.bind(this));
                }
            }.bind(this), 0);
        } else if (type == "skip") {
            window.isOver = true;
            soundManager.playSound("TimeOver");
            this.timeVal = 100;
            this.unschedule(this.countTime);
            viewManager.popView("ReviveView", false);
            viewManager.popView("RankView", true);
            gameApplication.onGiftBtnClick();
        }
    },


    update(dt) { },
});
