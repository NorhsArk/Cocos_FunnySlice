cc.Class({
    extends: cc.Component,

    properties: {
        //槽UI
        slotUIList: {
            default: [],
            visible: false,
        },
        //池UI
        poolUI: {
            default: null,
            visible: false,
        },
        //圆UI
        poolCircleUI: {
            default: null,
            visible: false,
        },
        //预见UI
        proviewUI: {
            default: null,
            visible: false,
        },
        proviewData:{
            default: {},
            visible: false,
        },
        //槽数据
        slotList: {
            default: [],
            visible: false,
        },
        //池数据
        pool: {
            default: [],
            visible: false,
        },
        //圆的预制件
        circlePrefab: {
            default: null,
            visible: false,
        },
        //普通进度
        normalPro: {
            default: null,
            visible: false,
        },
        //下一块的数据
        nextCircleData: {
            default: [],
            visible: false,
        },
        //等级进度条
        levelPro: {
            default: null,
            visible: false,
        },
        //当前等级
        curLevel: {
            default: 0,
            visible: false,
        },
        //下一个等级
        nextLevelText: {
            default: null,
            visible: false,
        },
        //当前一个等级
        curLevelText: {
            default: null,
            visible: false,
        },
        //当前分数
        curScore: {
            default: 0,
            visible: false,
        },
        //当前分数UI
        curScoreText: {
            default: null,
            visible: false,
        },
        //挑战进度
        challengeProUI: {
            default: null,
            visible: false,
        },
        //挑战图标
        challengeSprite: {
            default: null,
            visible: false,
        },
        //挑战的进度Text
        challengeText: {
            default: null,
            visible: false,
        },
        //配置
        spriteCof: {
            default: null,
            visible: false,
        },
        canMove: {
            default: false,
            visible: false,
        },
        //挑战的进度
        challengePro: {
            default: 0,
            visible: false,
        },
        //挑战的关卡
        challengeIdx: {
            default: 0,
            visible: false,
        },
        isFirstOne:{
            default: false,
            visible: false,
        },
    },

    onLoad: function () {
        window.mainScript = this;
    },

    onEnable() {
        this.isFirstOne = true;
        this.schedule(this.refreashVal, 0.5);
    },
    onDisable() {
        if (this.challengeProUI != null) {
            this.challengeProUI.active = false;
        }
        if (this.normalPro != null) {
            this.normalPro.active = false;
        }
        window.challenge = 0;
        this.unschedule(this.refreashVal);
    },
    //刷新数据
    refreashVal() { },

    start() {
        player.getData("firstRank", function (val) {
            if (val == 0 || val == null || val == undefined) {
                SDK().setRankScore(2, 0, "{}");
                player.setData("firstRank", 1);
            }
        }.bind(this));
    },

    //初始化开始
    initStart() {
        window.challenge = 0;
        this.nextCircleData = [1, 0, 0, 0, 0, 0];
        this.initUI();
        resManager.loadConfig("level", function (cof) {
            this.spriteCof = cof.json;
            player.getData("Level", function (val) {
                if (val == null || val == undefined) {
                    val = 0;
                }
                this.curLevel = val;
                this.curLevelText.string = this.curLevel;
                this.nextLevelText.string = this.curLevel + 1;
                this.gameStart();
            }.bind(this))
        }.bind(this));
    },

    //初始化点击事件
    initSelect(i) {
        this.slotUIList[i].off("click");
        this.slotUIList[i].on("click", function (event) {
            event.num = i;
            this.menuClick(event, "select");
        }.bind(this), this);
    },

    //初始化UI
    initUI() {
        //槽和池UI
        for (var i = 0; i < 6; i = i + 1) {
            this.slotUIList[i] = cc.find("Game/Solt/" + i, this.node);
            this.initSelect(i);
        }
        this.poolUI = cc.find("Game/Pool", this.node);
        this.proviewUI = cc.find("Game/Text/Proview", this.node).getComponent(cc.Sprite);
        this.org = this.proviewUI.node.position;
        var next = cc.find("Game/Text", this.node).getComponent("LocalizedLabel");
        next.dataID = "lang.nextText";
        this.scheduleOnce(function () {
            next.node.active = true;
        }.bind(this), 1)
        this.circlePrefab = cc.find("Circle", this.node);

        this.normalPro = cc.find("UI/ProsBg", this.node);
        this.nextLevelText = cc.find("UI/ProsBg/Next", this.node).getComponent(cc.Label);
        this.curLevelText = cc.find("UI/ProsBg/Cur", this.node).getComponent(cc.Label);
        this.curScoreText = cc.find("UI/ProsBg/Score", this.node).getComponent(cc.Label);
        this.levelPro = cc.find("UI/ProsBg/Pro", this.node).getComponent(cc.Sprite);

        //挑战模式的UI
        this.challengeProUI = cc.find("UI/Challenge", this.node);
        this.challengeSprite = cc.find("UI/Challenge/Sprite", this.node).getComponent(cc.Sprite);
        this.challengeText = cc.find("UI/Challenge/Sprite/Text", this.node).getComponent(cc.Label);


        //适配UI
        var standerPer = 640 / 1136;
        var curPer = cc.winSize.width / cc.winSize.height;
        if (curPer > standerPer) {
            var newScale = cc.winSize.height / 1136;
            this.scale = newScale;
        } else {
            var newScale = cc.winSize.width / 640;
            this.scale = newScale;
        }
    },

    //初始化数据
    initData() {
        this.curScore = 0;
        for (var i = 0; i < 6; i = i + 1) {
            this.slotList[i] = [0, 0, 0, 0, 0, 0];
            this.pool[i] = 0;
        }
    },

    //清理UI
    clearUI() {
        for (var i = 0; i < 6; i = i + 1) {
            this.slotUIList[i].removeAllChildren(true);
        }
        this.poolUI.removeAllChildren(true);
        this.levelPro.fillRange = 0;
        this.curScoreText.string = 0;
    },

    //设置爆炸的粒子样式
    setBoomParticleType() {
        var spriteName = "Texture2d/Boom/" + this.spriteCof.spriteName[this.curLevel];
        if (window.challenge == 1) {
            spriteName = "Texture2d/Boom/" + this.spriteCof.spriteName[this.challengeIdx];
        }
        cc.loader.loadRes(spriteName, cc.Texture2D, function (err, spriteAtlas) {
            effectManager.particleList[0].getComponent(cc.ParticleSystem).texture = spriteAtlas;
        }.bind(this))
    },

    //开始游戏
    gameStart() {
        this.setBoomParticleType();
        if (window.challenge == 1) {
            this.normalPro.active = false;
            this.challengePro = 0;
            player.getData("collectionIdx", function (val) {
                if (val == null || val == undefined) {
                    val = 0;
                }
                this.challengeIdx = val;
                var spriteName = "Game." + this.spriteCof.spriteName[this.challengeIdx];
                resManager.loadSprite(spriteName, function (spriteFrame) {
                    this.challengeSprite.spriteFrame = spriteFrame;
                    this.challengeText.string = "0/3";
                    this.challengeProUI.active = true;
                }.bind(this))
            }.bind(this));
        } else {
            this.challengeProUI.active = false;
            this.normalPro.active = true;
        }
        this.clearUI();
        this.initData();
        this.proCircle();
        this.poolCircle();
        this.canMove = true;
    },

    //生产圆块
    produceCircle(part) {
        var circle = cc.instantiate(this.circlePrefab);
        var sprite = cc.find("Sprite", circle).getComponent(cc.Sprite);
        circle.sprite = sprite;
        var spriteName = "Game." + this.spriteCof.spriteName[this.curLevel];
        if (window.challenge == 1) {
            spriteName = "Game." + this.spriteCof.spriteName[this.challengeIdx];
        }
        resManager.loadSprite(spriteName, function (spriteFrame) {
            sprite.spriteFrame = spriteFrame;
        }.bind(this))
        //设置块形状还有分数
        sprite.fillStart = part.fillStart;
        sprite.fillRange = part.fillRange;
        circle.score = part.score;
        return circle;
    },

    //块池生成一个圆
    poolCircle() {
        //圆UI生成
        var circle = this.produceCircle(this.proviewData);
        this.poolCircleUI = circle;
        circle.parent = this.poolUI;
        circle.scale = 0;
        circle.position = cc.v2(0, 0);
        circle.active = true;
        circle.runAction(cc.scaleTo(0.3, 1).easing(cc.easeBounceOut(1)));
        //池数据更新
        this.pool = this.nextCircleData;
        //刷新下一个圆
        this.proCircle();
        return circle;
    },

    //下一个圆的形状确定
    proCircle() {
        this.nextCircleData = [0, 0, 0, 0, 0, 0];
        this.proviewUI.node.stopAllActions();
        this.proviewUI.node.x =   200;
        this.proviewData.fillRange = 0;
        var isLink = false;
        var first = Math.floor(Math.random() * 5.99);
        var score = 0;
        var max = 3;
        for (var i = 0; i < 6; i = i + 1) {
            var curfirst = (first + i) > 5 ? (first + i) - 6 : (first + i);
            var random = Math.random();
            if ((random > 0.9 || !isLink) && max > 0) {
                if (!isLink) {
                    isLink = true;
                    var fixVal = 0.25 + (curfirst * (1 / 6));
                    this.proviewData.fillStart = fixVal > 1 ? fixVal - 1 : fixVal;
                    this.proviewData.fillRange = 1 / 6;
                    this.proviewUI.node.rotation = -60 + curfirst * -60;
                } else {
                    this.proviewData.fillRange = this.proviewData.fillRange + (1 / 6);
                    this.proviewUI.node.rotation = this.proviewUI.node.rotation - 60;
                }
                this.nextCircleData[curfirst] = 1;
                score = score + 1;
                max = max - 1;
            } else {
                break;
            }
        }
        //加载图片并移动
        resManager.loadSprite("Game.proview"+ (2 - max),function(sp){
            this.proviewUI.spriteFrame = sp;
            if(!this.isFirstOne){
                this.proviewUI.node.runAction(cc.moveTo(0.5, cc.v2(0,-80)));
            }else{
                this.isFirstOne = false;
            }
        }.bind(this))
        this.proviewData.score = score;
    },

    //设置圆
    setCircle(slotNum) {
        //设置到目标槽
        var pos = viewManager.getUIPosition(this.slotUIList[slotNum], this.poolCircleUI);
        var circle = this.poolCircleUI;
        var score = this.poolCircleUI.score;
        circle.stopAllActions();
        circle.runAction(
            cc.sequence(
                cc.moveTo(0.2, pos),
                cc.callFunc(function () {
                    circle.parent = this.slotUIList[slotNum];
                    circle.position = cc.v2(0, 0);
                    soundManager.playSound("Match");
                    this.checkBoom(slotNum, score);
                }.bind(this), this)
            )
        );
        //池清空
        this.pool = [0, 0, 0, 0, 0, 0];
        this.poolCircleUI = null;
        //池生成
        this.poolCircle();
    },

    //检查是否完整
    checkBoom(slotNum, score) {
        var isBoom = true;
        for (var i = 0; i < 6; i = i + 1) {
            if (this.slotList[slotNum][i] == 0) {
                isBoom = false;
                break;
            }
        }
        if (isBoom) {
            //挑战模式中
            if (window.challenge == 1) {
                this.challengePro = this.challengePro + 1;
                this.challengeText.string = this.challengePro + "/3";
                //判断是否完成
                if (this.challengePro >= 3) {
                    //今日挑战完成
                    gameApplication.checkDailyCount("challenge", true);
                    //状态回复
                    window.challenge = 0;
                    //挑战的ID向前递进
                    this.challengeIdx = this.challengeIdx + 1;
                    player.setData("collectionIdx", this.challengeIdx);
                    //弹出结束框并跳回收藏界面
                    gameApplication.warnTips("lang.challengeOver");
                    this.scheduleOnce(function () {
                        viewManager.showView("MainView", false, true);
                        viewManager.showView("HomeView", true, false);
                        viewManager.popView("CollectionView", true);
                    }.bind(this), 1)
                }
            }
            //上一个圆
            var pro = slotNum - 1 < 0 ? 5 : slotNum - 1;
            //下一个圆
            var next = slotNum + 1 > 5 ? 0 : slotNum + 1;
            var score = {};
            score[pro] = 0;
            score[next] = 0;
            score[slotNum] = 6;
            //检测前后槽的分数
            for (var i = 0; i < 6; i = i + 1) {
                if (this.slotList[pro][i] == 1) {
                    score[pro] = score[pro] + 1;
                }
                if (this.slotList[next][i] == 1) {
                    score[next] = score[next] + 1;
                }
            }
            //清空UI
            this.slotUIList[pro].removeAllChildren(true);
            this.slotUIList[next].removeAllChildren(true);
            this.slotUIList[slotNum].removeAllChildren(true);
            //清空数据
            this.slotList[pro] = [0, 0, 0, 0, 0, 0];
            this.slotList[next] = [0, 0, 0, 0, 0, 0];
            this.slotList[slotNum] = [0, 0, 0, 0, 0, 0];
            //爆炸特效
            if (score[pro] > 0) {
                effectManager.particleShow(this.slotUIList[pro], 0);
            }
            if (score[next] > 0) {
                effectManager.particleShow(this.slotUIList[next], 0);
            }
            effectManager.particleShow(this.slotUIList[slotNum], 0);
            soundManager.playSound("SliceBoom");
            //得分
            this.getScore(score[pro], pro, 1);
            this.getScore(score[next], next, 1);
            this.getScore(score[slotNum], slotNum, 2);
        } else {
            this.getScore(score, slotNum);
        }

        this.checkOver();
    },

    //炸掉全部
    blowAll() {
        var score = {};
        //检测前后槽的分数
        for (var i = 0; i < 6; i = i + 1) {
            score[i] = 0;
            for (var j = 0; j < 6; j = j + 1) {
                if (this.slotList[i][j] == 1) {
                    score[i] = score[i] + 1;
                }
            }
            //清空UI
            this.slotUIList[i].removeAllChildren(true);
            //清空数据
            this.slotList[i] = [0, 0, 0, 0, 0, 0];
            //爆炸特效
            if (score[i] > 0) {
                effectManager.particleShow(this.slotUIList[i], 0);
            }
            //得分
            this.getScore(score[i], i);
        }

    },

    //检查是否结束
    checkOver() {
        var isOver = true;
        for (var i = 0; i < 6; i = i + 1) {
            for (var j = 0; j < 6; j = j + 1) {
                if (this.slotList[i][j] == 1 && this.pool[j] == 1) {
                    break;
                }
                if (j == 5) {
                    isOver = false;
                }
            }
            if (!isOver) {
                break;
            }
        }
        if (isOver) {
            gameApplication.warnTips("lang.gameOver", function () {
                viewManager.popView("ReviveView", true);
            }.bind(this));
        }
    },

    //获得分数
    getScore(num, slotNum, isBig) {
        if (num > 0) {
            this.curScore = this.curScore + num;
            //等级提升
            if (this.curScore > (50 + (this.curLevel * 50)) && window.challenge != 1) {
                soundManager.playSound("LevelUp");
                gameApplication.warnTips("lang.finishLevel", null);
                this.curLevel = this.curLevel + 1;
                this.curLevelText.string = this.curLevel;
                this.nextLevelText.string = this.curLevel + 1;
                player.setData("Level", this.curLevel);
                SDK().setRankScore(2, this.curLevel, "{}");
                this.gameStart();
            }
            this.levelPro.fillRange = this.curScore / (50 + (this.curLevel * 50));
            if (isBig == 2) {
                effectManager.flyText("+" + num, this.slotUIList[slotNum], 120, 0, 0);
            } else if (isBig == 1) {
                effectManager.flyText("+" + num, this.slotUIList[slotNum], 80, 0, 0);
            } else {
                effectManager.flyText("+" + num, this.slotUIList[slotNum], 50, 100);
            }

        }
        this.curScoreText.string = this.curScore;
    },

    //点击事件处理
    menuClick(event, type) {
        if (type == "select") {
            if (!this.canMove) {
                return;
            }
            this.canMove = false;
            this.poolCircleUI.scale = 1;
            this.poolCircleUI.rotation = 0;
            var slotNum = event.num;
            var canSet = true;
            //记录设置了的idx
            var allReadySet = [];
            for (var i = 0; i < 6; i = i + 1) {
                if (this.slotList[slotNum][i] == 1 && this.pool[i] == 1) {
                    //将设置过的idx置为0
                    var seted = allReadySet.pop();
                    while (seted != null) {
                        this.slotList[slotNum][seted] = 0;
                        seted = allReadySet.pop();
                    };
                    //标记为不能设置，跳出循环
                    canSet = false;
                    break;
                } else if (this.pool[i] == 1 && this.slotList[slotNum][i] == 0) {
                    this.slotList[slotNum][i] = 1;
                    allReadySet.push(i);
                }
            }
            if (canSet) {
                this.setCircle(slotNum);
            } else {
                var pos = viewManager.getUIPosition(this.slotUIList[slotNum], this.poolCircleUI);
                this.poolCircleUI.stopAllActions();
                this.poolCircleUI.runAction(cc.sequence(
                    cc.moveTo(0.2, pos),
                    cc.callFunc(function () {
                        this.poolCircleUI.position = cc.v2(0, 0);
                        soundManager.playSound("NoMatch");
                    }.bind(this), this),
                    cc.rotateBy(0.2, 360),
                ))
            }
            this.scheduleOnce(function () {
                this.canMove = true;
            }.bind(this), 0.5);
        } else if (type == "pause") {
            soundManager.playSound("btnClick");
            window.pauseType = 1;
            viewManager.popView("PauseView", true);
        }
    },


    update(dt) { },
});
