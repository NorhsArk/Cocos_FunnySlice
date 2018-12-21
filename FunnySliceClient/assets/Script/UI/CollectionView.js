cc.Class({
    extends: cc.Component,

    properties: {
        //收集UI
        collectionList: {
            default: [],
            visible: false,
        },
        //收集品content
        collectionContent: {
            default: null,
            visible: false,
        },
        //收集品item
        collectionItem: {
            default: null,
            visible: false,
        },
        challengeText:{
            default: null,
            type: cc.Node,
        },
    },

    onLoad: function () {
        window.collectionScript = this;
        this.collectionItem = cc.find("Bg/Collection", this.node);
        this.collectionContent = cc.find("Bg/Collections", this.node);
    },

    onEnable() {
        this.schedule(this.refreashVal, 0.5);
        //显示红点
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

        //处理图标显示
        player.getData("collectionIdx", function (val) {
            if (val == null || val == undefined) {
                val = 0;
            }
            for (var i = 0; i < val; i = i + 1) {
                this.loadCollection(i);
                if (i == (val - 1)) {
                    this.collectionList[i].newSprite.active = true;
                } else {
                    this.collectionList[i].newSprite.active = false;
                }
            }
        }.bind(this));
        var content = this.collectionContent.getComponent(cc.Layout);
        content.cellSize.width = (cc.winSize.width - 10) / 3;
    },
    onDisable() {
        this.unschedule(this.refreashVal);
    },

    //刷新数据
    refreashVal() { },

    start() { },

    //加载一个收集品
    loadCollection(i) {
        var collection = this.collectionList[i];
        if (collection == null || collection == undefined) {
            collection = cc.instantiate(this.collectionItem);
            collection.sprite = cc.find("Sprite", collection).getComponent(cc.Sprite);
            collection.newSprite = cc.find("New", collection.sprite.node);
            collection.parent = this.collectionContent;
            this.collectionList[i] = collection;
            collection.setSiblingIndex(1);
        }

        var spriteName = "Game." + mainScript.spriteCof.spriteName[i];
        resManager.loadSprite(spriteName, function (spriteFrame) {
            collection.sprite.node.scale = 0.85;
            collection.sprite.spriteFrame = spriteFrame;
            collection.active = true;
        }.bind(this))
    },

    //点击事件处理
    menuClick(event, type) {
        soundManager.playSound("btnClick");
        if (type == "videoUnlock") {
            gameApplication.onVideoBtnClick(function (isOK) {
                if (isOK) {
                    window.challenge = 1;
                    mainScript.gameStart();
                    viewManager.showView("MainView", true, false);
                    viewManager.popView("CollectionView", false);
                }
            }.bind(this), 0)
        }else if (type == "challenge") {
            //判断是否挑战成功
            gameApplication.checkDailyCount("challenge", false, function (val) {
                if (val == null || val == undefined) {
                    val = 0;
                }
                if (val > 0) {
                    gameApplication.warnTips("lang.challenged");
                } else {
                    window.challenge = 1;
                    mainScript.gameStart();
                    viewManager.popView("CollectionView", false);
                    viewManager.showView("HomeView", false, true);
                    viewManager.showView("MainView", true, false);
                }
            }.bind(this))
        }
    },


    update(dt) { },
});
