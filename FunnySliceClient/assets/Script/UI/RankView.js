// Learn cc.Class:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/life-cycle-callbacks.html

cc.Class({
    extends: cc.Component,

    properties: {
        content: {
            default: null,
            type: cc.Node,
        },
        //头像储存
        headSpriteList: {
            default: {},
            visible: false,
        },
        //储存用户信息列表
        worldPlayer: {
            default: [],
            visible: false,
        },
        friendPlayer: {
            default: [],
            visible: false,
        },
        //储存用户UI列表
        uiPlayer: {
            default: [],
            visible: false,
        },
        player: {
            default: null,
            type: cc.Node,
        },
        sharePlayer: {
            default: [],
            type: [cc.Node],
        },
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
    },

    onEnable() {
        this.LoadRank();
    },

    onDisable() {},

    //按钮点击事件
    menuClick(event, type) {
        soundManager.playSound("btnClick");
        if (type == "friend") {
            if (this.friendPlayer != null && this.friendPlayer.length > 0) {
                this.getRank(this.friendPlayer, 2);
            } else {
                5
                SDK().getFriendRank(2, function (list) {
                    this.getRank(list, 2);
                }.bind(this));
            }
        } else if (type == "world") {
            if (this.worldPlayer != null && this.worldPlayer.length > 0) {
                this.getRank(this.worldPlayer, 1);
            } else {
                SDK().getWorldRank(2, 50, 0, function (list) {
                    this.getRank(list, 1);
                }.bind(this));
            }
        }
        else if (type == "share") {
            gameApplication.onShareBtnClick();
        } else if (type == "play") {
            if(window.challenge == 1){
                this.menuClick(null,"back");
            }else{
                window.isOver = false;
                mainScript.gameStart();
                viewManager.showView("HomeView", false, true);
                viewManager.showView("MainView", true, false);
                viewManager.popView("RankView", false);
            }
        } else if (type == "back") {
            viewManager.popView("RankView", false);
            if (window.isOver) {
                window.isOver = false;
                viewManager.showView("HomeView", true, true);
                viewManager.showView("MainView", false, false);
            }
        }
    },

    //加载榜单
    LoadRank() {
        /* SDK().getWorldRank(2, 50, 0, function (list) {
            this.worldPlayer = list;
        }.bind(this)); */
        SDK().getFriendRank(2, function (list) {
            this.friendPlayer = list;
            this.menuClick(null, "friend")
        }.bind(this));
    },

    //排行榜
    getRank(list, type) {
        var isOnRank = false;
        var curList = list;
        if (type == 1) {
            this.worldPlayer = list;
        } else if (type == 2) {
            this.friendPlayer = list;
        }
        for (var i = 0; i < curList.length; i = i + 1) {
            if (this.LoadRankData(i, curList[i], type)) {
                isOnRank = true;
            }
        }
        //如果自己不在榜单上就将自己加载最后
        var listLength = curList.length;
        if (!isOnRank && type == 1) {
            SDK().getRankScore(2, function (info) {
                if (info != undefined || info != null) {
                    this.LoadRankData(listLength - 1, info);
                    listLength = listLength + 1;
                }
                if (listLength < this.uiPlayer.length) {
                    for (var i = curList.length; i < this.uiPlayer.length; i = i + 1) {
                        this.uiPlayer[i].playerBar.active = false;
                    }
                }
            }.bind(this))
        } else {
            //隐藏多余的榜单
            if (listLength < this.uiPlayer.length) {
                for (var i = curList.length; i < this.uiPlayer.length; i = i + 1) {
                    this.uiPlayer[i].playerBar.active = false;
                }
            }
        }
    },

    //将玩家信息加载到第I排
    LoadRankData(i, playerData, type) {
        var isOnRank = false;
        var playerBar;
        var mainBg;
        var No;
        var Score;
        var Mask;
        var Head;
        var Name;
        var Play;
        if (i >= this.uiPlayer.length) {
            playerBar = cc.instantiate(this.player);
            mainBg = playerBar.getChildByName("Bg").getComponent(cc.Sprite);
            No = playerBar.getChildByName("No").getComponent(cc.Label);
            Score = playerBar.getChildByName("Money").getChildByName("Val").getComponent(cc.Label);
            Mask = playerBar.getChildByName("Head").getComponent(cc.Sprite);
            Head = playerBar.getChildByName("Sprite").getComponent(cc.Sprite);
            Name = playerBar.getChildByName("Name").getComponent(cc.Label);
            Play = playerBar.getChildByName("Play");
            this.uiPlayer[i] = {};
            this.uiPlayer[i].playerBar = playerBar;
            this.uiPlayer[i].mainBg = mainBg;
            this.uiPlayer[i].No = No;
            this.uiPlayer[i].Score = Score;
            this.uiPlayer[i].Head = Head;
            this.uiPlayer[i].Name = Name;
            this.uiPlayer[i].Play = Play;
        } else {
            playerBar = this.uiPlayer[i].playerBar;
            mainBg = this.uiPlayer[i].mainBg;
            No = this.uiPlayer[i].No;
            Score = this.uiPlayer[i].Score;
            Mask = this.uiPlayer[i].Mask;
            Head = this.uiPlayer[i].Head;
            Name = this.uiPlayer[i].Name;
            Play = this.uiPlayer[i].Play;
        }
        if (type == 1) {
            Play.active = false;
        } else if (type == 2) {
            Play.active = true;
        }
        No.node.active = true;
        Score.node.active = true;
        Head.node.active = true;
        Name.node.active = true;

        //前三名的背景处理
        if (parseInt(playerData.no) <= 3) {
            /* //读取图片信息
            resManager.loadSprite("UI.no" + parseInt(playerData.no - 1), function (spriteFrame) {
                Mask.spriteFrame = spriteFrame;
                Mask.active = true;
            }.bind(this)); */
            Mask.active = false;
        } else {
            Mask.active = false;
            /* //读取图片信息
            resManager.loadSprite("UIRank.rankBg0", function (spriteFrame) {
                mainBg.spriteFrame = spriteFrame;
            }.bind(this)); */
        }

        playerBar.parent = this.content;
        //是否为自己
        if (playerData.id == SDK().getSelfInfo().id) {
            isOnRank = true;
            mainBg.node.active = true;
            if (this.friendPlayer.length == 1) {
                this.sharePlayer[0].active = true;
                this.sharePlayer[0].setSiblingIndex(this.sharePlayer[0].parent.childrenCount);
                this.sharePlayer[1].active = true;
                this.sharePlayer[1].setSiblingIndex(this.sharePlayer[1].parent.childrenCount);
            } else {
                this.sharePlayer[0].active = false;
                this.sharePlayer[1].active = false;
            }
            Play.active = false;
        }
        //按钮初始化
        Play.gameId = playerData.id;
        Play.off("click");
        Play.on("click", function (event) {
            SDK().playWith(event.target.gameId, null, function (isCompleted) {
                if (isCompleted) {
                    console.log("Share to " + playerData.id);
                }
            }.bind(this));
        }.bind(this), this);
        //加载名次
        No.string = playerData.no;
        //加载分数
        Score.string = "LV." + playerData.score;
        Name.string = playerData.name;
        //加载头像
        this.LoadSprite(playerData.headUrl, Head, this.headSpriteList[playerData.id]);
        playerBar.active = true;
        return isOnRank;
    },

    //根据URL加载头像并到对应的sprite上
    LoadSprite(url, sprite, saver) {
        if (saver == null) {
            cc.loader.load(url, function (err, texture) {
                saver = new cc.SpriteFrame(texture);
                sprite.spriteFrame = saver;
                sprite.node.parent.active = true;
            });
        } else {
            sprite.spriteFrame = saver;
            sprite.node.parent.active = true;
        }
    },

    // update (dt) {},
});
