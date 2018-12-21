import { isNumber, isString } from "util";

cc.Class({
    extends: cc.Component,

    properties: {
        //数组数据列表
        itemArrayList: {
            default: {},
            visible: false,
        },
        //数据列表
        dataList: {
            default: {},
            visible: false,
        },
        //姓名
        pName: {
            default: "",
            visible: false,
        },
        //性别
        pSex: {
            default: 0,
            type: cc.Integer,
            visible: false,
        },
        //年龄
        pAge: {
            default: 0,
            type: cc.Integer,
            visible: false,
        },
        //头像
        pAvatar: {
            default: "",
            visible: false,
        },
        //用户Id
        pId: {
            default: 0,
            type: cc.Integer,
            visible: false,
        },
        //世界id
        worldId: {
            default: 0,
            type: cc.Integer,
            visible: false,
        },
        fbPlayer: {
            default: null,
            visible: false,
        },
        playerCof: {
            default: null,
            visible: false,
        },
        config: {
            default: null,
            visible: false,
        },
        playerInitData: {
            default: null,
            visible: false,
        },
        initData: {
            default: null,
            visible: false,
        },
        fristInitPros: {
            default: 0,
            visible: false,
        },
        InitPros: {
            default: 0,
            visible: false,
        },
        isLoadRes: {
            default: false,
            visible: false,
        },
        isFirstCome: {
            default: false,
            visible: false,
        },
        isLostData: {
            default: false,
            visible: false,
        },
    },

    onLoad() {
        window.player = this;
        /* this.fbPlayer = SDK().getSelfInfo();
        SDK().getItem("isFirst", function (val) {
            //是否第一次进入游戏
            if (val == 0 || val == null) {
                this.isFirstCome = true;
                SDK().setItem({ isFirst: 1 });
            } else {
            }
        }.bind(this)); */
    },

    //设置单个数据
    setData(name, val, cb) {
        var realName = name;
        if (val != undefined && val != null) {
            this.dataList[realName] = val;
            dataManager.setData(realName, val, function () {
                if (cb != null) {
                    cb();
                }
            }.bind(this));
        }
    },

    //获取单个数据
    getData(name, cb, isRemote) {
        var realName = name;
        if (this.dataList[realName] == undefined) {
            dataManager.getData(realName, function (val) {
                this.dataList[realName] = val;
                if (cb != null) {
                    cb(this.dataList[realName]);
                }
            }.bind(this), isRemote);
        } else {
            if (cb != null) {
                cb(this.dataList[realName]);
            }
        }
        return this.dataList[realName];
    },

    //名字截取
    substrName(str, n) {
        if (str.replace(/[\u4e00-\u9fa5]/g, "**").length <= n) {
            return str;
        } else {
            var len = 0;
            var tmpStr = "";
            for (var i = 0; i < str.length; i++) {//遍历字符串
                if (/[\u4e00-\u9fa5]/.test(str[i])) {//中文 长度为两字节
                    len += 2;
                }
                else {
                    len += 1;
                }
                if (len > n) {
                    break;
                }
                else {
                    tmpStr += str[i];
                }
            }
            return tmpStr + " ...";
        }

    }

    // update (dt) {},
});
