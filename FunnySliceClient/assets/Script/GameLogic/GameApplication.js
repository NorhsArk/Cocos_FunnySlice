var DataAnalytics = require("../SDK/DataAnalytics");
cc.Class({
    extends: cc.Component,

    properties: {
        viewManager: {
            default: null,
            visible: false,
        },
        resManager: {
            default: null,
            visible: false,
        },
        soundManager: {
            default: null,
            visible: false,
        },
        effectManager: {
            default: null,
            visible: false,
        },
        dataManager: {
            default: null,
            visible: false,
        },
        gameBg: {
            default: null,
            visible: false,
        },
        player: {
            default: null,
            visible: false,
        },
        _playTimes: {
            default: 0,
            type: cc.Integer,
            visible: false,
        },
        playTimes: {
            get: function () {
                return this._playTimes;
            },
            set: function (val) {
                this._playTimes = val;
                SDK().plusPlayTimes();
            },
            visible: false,
        },
        trueTime: {
            default: 0,
            visible: false,
        },
    },

    onEnable() {
        this.scheduleOnce(function () {
            this.schedule(this.countGameTime, 3);
        }.bind(this), 2)
    },

    onDisable() {
        this.unschedule(this.countGameTime);
    },

    onDestroy() {
        DataAnalytics.levelResult(true, { level: "gameTime" });
        DataAnalytics.logout(SDK().getSelfInfo().id);
    },

    onLoad() {
        cc.director.setDisplayStats(false);
        this.lang = i18n.languages['en'].lang;
        //初始化ASDK
        this.DataAnalytics = DataAnalytics;
        DataAnalytics.init()
        SDK().init(function () {
            DataAnalytics.login(SDK().getSelfInfo().id);
        });
        SDK().getTime();

        this.scheduleOnce(function () {
            SDK().getTime(function (time) {
                this.trueTime = time;
            }.bind(this));
        }.bind(this), 30)

        //初始化各系统脚本
        window.gameApplication = this;
        this.dataManager = this.node.addComponent("DataManager");
        this.resManager = this.node.addComponent("ResManager");
        this.soundManager = this.node.addComponent("SoundManager");
        this.viewManager = this.node.addComponent("ViewManager");
        this.effectManager = this.node.addComponent("EffectManager");
        this.player = this.node.addComponent("Player");

        viewManager.showView("MainView", true, true);
        viewManager.showView("HomeView", false, false);

        //后台运行处理
        cc.game.on(cc.game.EVENT_HIDE, function () {
            DataAnalytics.gameHideAndShow(true);
            cc.audioEngine.pauseAll();
        });
        cc.game.on(cc.game.EVENT_SHOW, function () {
            DataAnalytics.gameHideAndShow(false);
            cc.audioEngine.resumeAll();
        });
    },


    start() {
        //初始化语言
        SDK().getItem("curLang", function (idx) {
            if (idx == null) {
                idx = 0;
            }
            this.setLanguage(window.nameArr[idx]);
        }.bind(this))
        SDK().init();
        this.scheduleOnce(function () {
            DataAnalytics.createAPart({
                roleID: SDK().getSelfInfo().id,
                userName: SDK().getSelfInfo().name,
            });
            DataAnalytics.levelBegin({ level: "gameTime" })
        }.bind(this), 10);

        window.mainScript.initStart();
    },

    //计算游戏时长
    countGameTime() {
        if (this.trueTime != 0 && this.trueTime != 100000000000000000) {
            this.trueTime = this.trueTime + 3;
            let nowTime = new Date().getTime() / 1000;
            if (Math.abs(this.trueTime - nowTime) > 3600) {
                this.warnTips("lang.errorTime", function () {
                    SDK().quit();
                    cc.game.end();
                }.bind(this))
                this.trueTime = 100000000000000000;
            }
        }
    },

    //设置语言
    setLanguage(language) {
        const i18n = require('LanguageData');
        i18n.init(language);
    },

    //视频奖励
    onVideoBtnClick(cb, type) {
        SDK().showVideoAd(
            function (isCompleted) {
                if (null == isCompleted) {
                    console.log("没有观看成功")
                    this.fbFail(1);
                    if (cb != null) {
                        cb(false);
                    }
                } else if (isCompleted) {
                    if (cb != null) {
                        cb(true);
                    }
                } else {
                    console.log("没有观看成功")
                    this.fbFail(1);
                    if (cb != null) {
                        cb(false);
                    }
                }
            }.bind(this)
            , type);
    },

    //检查日常次数限制
    checkDailyCount(key, isAdd, cb) {
        var myDate = new Date();
        let month = myDate.getMonth();       //获取当前月份(0-11,0代表1月)
        let day = myDate.getDate();        //获取当前日(1-31)
        SDK().getItem(month + "_" + day + "_" + key, function (val) {
            if (val == null) {
                val = 0;
            }
            val = parseInt(val);
            if (isAdd) {
                val = val + 1
                var param = {};
                param[month + "_" + day + "_" + key] = val;
                SDK().setItem(param);
            }
            if (cb != null) {
                cb(val);
            }
        })
    },

    //插屏广告按钮
    onGiftBtnClick(cb) {
        SDK().showInterstitialAd(
            function (isCompleted) {
                if (null == isCompleted) {
                    console.log("没有观看成功")
                    this.fbFail(1);
                } else if (isCompleted) {
                    cb(true);
                } else {
                    console.log("没有观看成功")
                }
            }.bind(this)
            , true);
    },

    //显示是否分享的提示框
    showSharaView(cb) {
        if (this.SharaView == null) {
            var view = cc.instantiate(this.SharaView_prefab);
            var Canvas = cc.find("Canvas");
            view.parent = Canvas;
            view.width = window.width;
            view.height = window.height;
            this.SharaView = view;
        }
        this.SharaView.active = true;
        let sureBtn = this.SharaView.getChildByName("Bg").getChildByName("Sure");
        sureBtn.off(cc.Node.EventType.TOUCH_END);
        sureBtn.on(cc.Node.EventType.TOUCH_END, function (event) {
            this.onShareBtnClick(function (isCompleted) {
                cb(isCompleted)
                if (isCompleted) {
                    this.SharaView.active = false;
                }
            }.bind(this));
            soundManager.playSound("btnClick");
        }, this);

        var laterBtn = this.SharaView.getChildByName("Bg").getChildByName("Later");
        laterBtn.off(cc.Node.EventType.TOUCH_END);
        laterBtn.on(cc.Node.EventType.TOUCH_END, function (event) {
            this.SharaView.active = false;
            soundManager.playSound("btnClick");
        }, this);
    },

    //分享按钮
    onShareBtnClick(cb) {
        var score = player.getDate("Level");
        SDK().share(score, function (isCompleted) {
            if (isCompleted) {//分享激励
                console.log("share:" + score);
                if (cb != null) {
                    cb(true)
                }
            } else {
                this.fbFail(2);
            }
        }.bind(this));
    },

    //飞行礼包
    flyGift() {
        var randomType = Math.floor(Math.random() * 2.99);
        effectManager.flyGift(randomType, function (giftPos) {
            var val = Math.random();
            if (val < 0) {
                viewManager.popView("FlyGiftView", true, function (view) {
                    var bg = cc.find("Bg", view);
                    //初始化
                    var moneyView = cc.find("Bg/Money", view);
                    var DiamondView = cc.find("Bg/Diamond", view);
                    var okBtn = cc.find("Bg/OK", view);
                    var moreBtn = cc.find("Bg/More", view);
                    var okText = cc.find("Bg/OK/Text", view).getComponent("LocalizedLabel");
                    var moreText = cc.find("Bg/More/Text", view).getComponent("LocalizedLabel");
                    //绑定事件
                    okBtn.off("click");
                    okBtn.on("click", function () {
                        viewManager.popView("FlyGiftView", false);
                        moneyView.active = false;
                        DiamondView.active = false;
                    }.bind(this), this)
                    moreBtn.off("click");
                    moreBtn.on("click", function () {
                        //分享按钮点击
                        gameApplication.onShareBtnClick(function (isOK) {
                            if (isOK) {
                                //gameApplication.DataAnalytics.doEvent("flyGiftShare");
                                soundManager.playSound("getCoin");
                                player.itemArrayAdd("pCurrency", 1, 5);
                                effectManager.flyReward(10, 1, mainScript.diamonds.node, giftPos, null, true);
                                gameApplication.checkDailyCount("flyGift", true);
                                moneyView.active = false;
                                DiamondView.active = false;
                                viewManager.popView("FlyGiftView", false);
                            }
                        }.bind(this))
                    }.bind(this), this)
                    //按钮字
                    okText.dataID = "lang.noThanksText";
                    moreText.dataID = "lang.shareText";
                    //显示界面
                    moneyView.active = false;
                    DiamondView.active = true;
                    bg.active = true;
                }.bind(this));
            } else if (val < 0) {
                //随机收益
                var randomMul = 10 + Math.random() * 5;
                var totalProfit = 0;
                for (var idx = 0; idx < mainScript.floorInfoList.length; idx = idx + 1) {
                    if (mainScript.floorInfoList[idx] != null && mainScript.floorInfoList[idx] != "undefined" && mainScript.floorInfoList[idx] != undefined) {
                        totalProfit = totalProfit + (buildManager.countProfit(idx) / buildManager.countProfitTime(idx));
                    }
                }
                //弹窗询问是否进行翻倍
                viewManager.popView("FlyGiftView", true, function (view) {
                    //获得钱
                    player.itemArrayAdd("pCurrency", 0, totalProfit * randomMul);

                    var bg = cc.find("Bg", view);
                    //初始化
                    var moneyView = cc.find("Bg/Money", view);
                    var DiamondView = cc.find("Bg/Diamond", view);
                    var okBtn = cc.find("Bg/OK", view);
                    var moreBtn = cc.find("Bg/More", view);
                    var okText = cc.find("Bg/OK/Text", view).getComponent("LocalizedLabel");
                    var moreText = cc.find("Bg/More/Text", view).getComponent("LocalizedLabel");
                    var numText = cc.find("Bg/Money/Num", view).getComponent(cc.Label);
                    numText.string = gameApplication.countUnit(totalProfit * randomMul)[2];
                    //绑定事件
                    okBtn.off("click");
                    okBtn.on("click", function () {
                        moneyView.active = false;
                        DiamondView.active = false;
                        viewManager.popView("FlyGiftView", false);
                        effectManager.flyReward(10, 0, mainScript.coins.node, giftPos, null, true);
                        soundManager.playSound("getCoin");
                    }.bind(this), this)
                    moreBtn.off("click");
                    moreBtn.on("click", function () {
                        //视频按钮点击
                        gameApplication.onVideoBtnClick(function (isOK) {
                            if (isOK) {
                                gameApplication.DataAnalytics.doEvent("flyGiftVideo");
                                moneyView.active = false;
                                DiamondView.active = false;
                                player.itemArrayAdd("pCurrency", 0, totalProfit * randomMul);
                                effectManager.flyReward(10, 0, mainScript.coins.node, giftPos, null, true);
                                gameApplication.checkDailyCount("flyGift", true);
                                viewManager.popView("FlyGiftView", false);
                                soundManager.playSound("getCoin");
                            }
                        }.bind(this), 0)
                    }.bind(this), this)
                    okText.dataID = "lang.receiveText";
                    moreText.dataID = "lang.watchText";
                    moneyView.active = true;
                    DiamondView.active = false;
                    bg.active = true;
                }.bind(this));
            } else {
                //随机收益
                var randomMul = 5 + Math.random() * 5;
                var totalProfit = 0;
                for (var idx = 0; idx < mainScript.floorInfoList.length; idx = idx + 1) {
                    if (mainScript.floorInfoList[idx] != null && mainScript.floorInfoList[idx] != "undefined" && mainScript.floorInfoList[idx] != undefined) {
                        totalProfit = totalProfit + (buildManager.countProfit(idx) / buildManager.countProfitTime(idx));
                    }
                }
                //获得收益
                player.itemArrayAdd("pCurrency", 0, totalProfit * randomMul);
                effectManager.flyReward(10, 0, mainScript.coins.node, giftPos, null, true);
                soundManager.playSound("getCoin");
            }
        }.bind(this));
    },

    //FB失败界面
    fbFail(type) {
        viewManager.popView("FbFail", true, function (view) {
            if (type == 1) {
                view.getChildByName("Bg").getChildByName("VideoText").active = true;
                view.getChildByName("Bg").getChildByName("ShareText").active = false;
            } else {
                view.getChildByName("Bg").getChildByName("VideoText").active = false;
                view.getChildByName("Bg").getChildByName("ShareText").active = true;
            }
            view.active = true;
        }.bind(this));

    },

    //提示窗
    warnTips(dID, closeCb) {
        viewManager.popView("TipsView", true, function (view) {
            var tipText = cc.find("Bg/Text", view).getComponent("LocalizedLabel");
            tipText.dataID = dID;
            tipText.node.active = true;
            tipText.node.runAction(cc.scaleTo(1, 1.2));
            this.scheduleOnce(function () {
                tipText.node.active = false;
                viewManager.popView("TipsView", false);
                tipText.node.scale = 0.8;
                if (closeCb != null) {
                    closeCb();
                }
            }.bind(this), 1.2);
        }.bind(this))
    },


    //互推按钮事件
    popClick(event, type) {
        SDK().switchGameAsync(type);
    },

    //获取当前时间
    getCurTime() {
        var nowTime = new Date().getTime() / 1000;
        return parseFloat(nowTime);
    },

    //计算时间
    countTime(time) {
        var tempMin = time / 60;
        var hor = 0;
        if (tempMin >= 60) {
            var count = Math.floor(tempMin / 60);
            hor = count;
            tempMin = (tempMin % 60);
        }
        var min = tempMin < 10 ? "0" + Math.floor(tempMin) : "" + Math.floor(tempMin);
        var sec = time % 60 < 10 ? "0" + Math.floor(time % 60) : "" + Math.floor(time % 60);
        if (time <= 0) {
            min = "00";
            sec = "00"
        }
        var string;
        if (hor > 0) {
            string = hor + ":" + min + ":" + sec;
        } else {
            string = min + ":" + sec;
        }
        return [string, hor, min, sec];
    },

    //计算单位
    countUnit(num) {
        var old = num;
        var unit = 0;
        while (num >= 10000) {
            num = num * 0.001;
            unit = unit + 1;
        }
        var money = num.toFixed(2);
        if (gameApplication.unitCof == null) {
            return [money, unit, "$" + old.toFixed(2), money];
        }
        return [money, unit, ("$" + money + gameApplication.unitCof[unit].unit), (money + gameApplication.unitCof[unit].unit)];
    },

    //互推按钮时间
    popClick(event, type) {
        SDK().switchGameAsync(type);
    },

    update(dt) {
        //监测时间
    },
});
