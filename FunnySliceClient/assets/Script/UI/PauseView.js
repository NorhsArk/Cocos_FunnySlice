cc.Class({
    extends: cc.Component,

    properties: {
        //按钮UI
        btnList: {
            default: [],
            visible: false,
        },
        musicSprite: {
            default: null,
            visible: false,
        },
    },

    onLoad: function () {
        window.pauseScript = this;
        this.btnList[0] = cc.find("Bg/Btns/Rank", this.node);
        this.btnList[1] = cc.find("Bg/Btns/Music", this.node);
        this.btnList[2] = cc.find("Bg/Btns/Home", this.node);
        this.btnList[3] = cc.find("Bg/Btns/Replay", this.node);
        this.btnList[4] = cc.find("Bg/Btns/Resume", this.node);
        this.musicSprite = cc.find("Bg/Btns/Music/Sprite", this.node).getComponent(cc.Sprite);
    },

    onEnable() {
        var btns = cc.find("Bg/Btns", this.node).getComponent(cc.Layout);
        if (window.pauseType == 0) {
            this.btnList[2].active = false;
            this.btnList[3].active = false;
            this.btnList[4].active = false;
            btns.cellSize.width = (cc.winSize.width - 10) / 2;
        } else {
            this.btnList[2].active = true;
            this.btnList[3].active = true;
            this.btnList[4].active = true;
            btns.cellSize.width = (cc.winSize.width - 10) / 3;
        }
        this.schedule(this.refreashVal, 0.5);
    },
    onDisable() {
        this.unschedule(this.refreashVal);
    },

    //刷新数据
    refreashVal() { },

    start() {
    },

    //点击事件处理
    menuClick(event, type) {
        soundManager.playSound("btnClick")
        if (type == "rank") {
            viewManager.popView("PauseView", false);
            viewManager.popView("RankView", true, function (view) {
                //初始化
            }.bind(this));
        } else if (type == "music") {
            if (this.musicSprite.spriteFrame.name == "soundOffBtn") {
                resManager.loadSprite("UI.soundOnBtn", function (spriteFrame) {
                    this.musicSprite.spriteFrame = spriteFrame;
                }.bind(this))
                soundManager.setIsOpen(true);
                soundManager.setBgOpen(true);
            } else {
                resManager.loadSprite("UI.soundOffBtn", function (spriteFrame) {
                    this.musicSprite.spriteFrame = spriteFrame;
                }.bind(this))
                soundManager.setIsOpen(false);
                soundManager.setBgOpen(false);
            }
        }
        else if (type == "home") {
            viewManager.popView("PauseView", false);
            viewManager.showView("MainView", false, true);
            viewManager.showView("HomeView", true, false);
        }
        else if (type == "replay") {
            mainScript.gameStart();
            viewManager.popView("PauseView", false);
        }
        else if (type == "resume") {
            viewManager.popView("PauseView", false);
        }
    },


    update(dt) { },
});
