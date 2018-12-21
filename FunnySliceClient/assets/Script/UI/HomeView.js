cc.Class({
    extends: cc.Component,

    properties: {
        musicSprite:{
            default:null,
            visible:false,
        },
        challengeText:{
            default:null,
            type:cc.Node,
        },
    },

    onLoad: function () {
        window.pauseScript = this;
        this.musicSprite = cc.find("Middle/Btns/Sound/Sprite",this.node).getComponent(cc.Sprite);
    },

    onEnable() {
        gameApplication.checkDailyCount("challenge", false, function (val) {
            if (val == null || val == undefined) {
                val = 0;
            }
            if (val <= 0) {
                this.challengeText.active = true;
            }else{
                this.challengeText.active = false;
            }
        }.bind(this))
        this.schedule(this.refreashVal, 0.5);
    },
    onDisable() {
        this.unschedule(this.refreashVal);
    },

    //刷新数据
    refreashVal() { },

    start() { },

    //点击事件处理
    menuClick(event, type) {
        soundManager.playSound("btnClick")
        if (type == "play") {
            viewManager.popView("PauseView", false);
            viewManager.showView("HomeView", false, true);
            viewManager.showView("MainView", true, false);
            mainScript.gameStart();
        }
        else if (type == "collection") {
            viewManager.popView("CollectionView", true);
        } 
        else if (type == "rank") {
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

    },


    update(dt) { },
});
