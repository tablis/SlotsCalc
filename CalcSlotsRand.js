#!/usr/bin/env node

/*此为随机模式老虎机*/
var slotscalRand = {
    mode: 1,//铜银金 三种模式
    _numBet: 100,//押注数
    _numWinMoney: 0,//赢的钱
    _numWinTimes: 0,//赢的次数
    _numSlotsID: 801,//跑哪台老虎机
    _debugInfo: {},//策划要的数据
    _spcData: "",//该台老虎机的特殊数据特殊数据
    isSelfFreeSpin: false,//是否fs标志
    _arrReelData: [],//该老虎机所有reelData
    FT: require("./FastTool"),
    _arrReelItems: [
        {
            "Items": ["7_low", "fr_high", "bar_high", "7_med", "fr_med", "bar_med", "fr_low", "bar_low", "7_high", "bar_high", "fr_med", "bar_low", "7_low", "bar_high", "sp_hit", "fr_low", "7_med", "bar_high", "bar_med", "7_high", "sp_hit", "fr_low", "bar_low", "bar_med", "fr_high", "bar_med", "wild*1", "fr_med", "bar_high", "bar_low", "fr_high", "bar_med", "7_med", "bar_high", "fr_low", "bar_med", "fr_high", "bar_med", "sp_hit", "fr_med", "7_low", "bar_low", "fr_high", "fr_low", "7_high", "bar_low", "fr_med", "bar_high"],
            "ReelSymbolCount": "3"
        }
    ],
    _arrSymData: [
        {"SymbolID": "sp_hit", "Rate": "1", "alias": [""]},
        {
            "SymbolID": "wild*1",
            "Rate": "1",
            "alias": ["wild*1", "7_high", "7_med", "7_low", "fr_high", "fr_med", "fr_low", "bar_high", "bar_med", "bar_low"]
        }
    ],
    _arrPaytable: [{"Symbols": ["bar_low", "bar_low", "bar_low"], "BigWinMultiplier": null, "Multiplier": "0.08"}],
    _arrPayline: [["1_2", "2_2", "3_2", "4_2", "5_2"], ["1_3", "2_3", "3_3", "4_3", "5_3"], ["1_1", "2_1", "3_1", "4_1", "5_1"], ["1_3", "2_2", "3_1", "4_2", "5_3"], ["1_1", "2_2", "3_3", "4_2", "5_1"], ["1_2", "2_3", "3_3", "4_3", "5_2"], ["1_2", "2_1", "3_1", "4_1", "5_2"], ["1_3", "2_3", "3_2", "4_1", "5_1"], ["1_1", "2_1", "3_2", "4_3", "5_3"], ["1_2", "2_1", "3_2", "4_3", "5_2"], ["1_2", "2_3", "3_2", "4_1", "5_2"], ["1_3", "2_3", "3_1", "4_3", "5_3"], ["1_1", "2_1", "3_3", "4_1", "5_1"], ["1_3", "2_2", "3_3", "4_2", "5_3"], ["1_1", "2_2", "3_1", "4_2", "5_1"], ["1_2", "2_2", "3_3", "4_2", "5_2"], ["1_2", "2_2", "3_1", "4_2", "5_2"], ["1_3", "2_1", "3_2", "4_1", "5_3"], ["1_1", "2_3", "3_2", "4_3", "5_1"], ["1_3", "2_1", "3_1", "4_1", "5_3"], ["1_1", "2_3", "3_3", "4_3", "5_1"], ["1_2", "2_1", "3_3", "4_1", "5_2"], ["1_2", "2_3", "3_1", "4_3", "5_2"], ["1_3", "2_2", "3_2", "4_2", "5_3"], ["1_1", "2_2", "3_2", "4_2", "5_1"]],

    /**
     * @function 初始化本台老虎机 策划需要的字段
     **/
    initDebugInfo: function () {
        //this._debugInfo['freespin次数']=0;
    },
    /**
     * @function 权重决定停在那个位置多  自动转SymbolsWeight1_Freespin 有则读没有默认
     * @param {Number} rangeIndex 那个倍数区间
     **/
    calcSymbolsWeight: function () {
        var FT = this.FT;
        var arrResultIdx = [];
        //当该列存在
        for (var i = 1; i <= this._arrReelData.length; i++) {

            var _arrReelData = this._arrReelData[i - 1]['SymbolsWeight' + this.mode];
            if (_arrReelData) {
                var splitData = _arrReelData.split("&");
                var weightIndex = FT.Calc.weightIndex(splitData[0].split("@"));
                var symName = splitData[1].split("@")[weightIndex];
                var arrLocIndex = [];
                // console.log("this._arrReelItems['Items']:"+this._arrReelItems['Items']);
                //取出该列中所有该格子的位置数组
                for (var j = 0; j < this._arrReelItems[i - 1]['Items'].length; j++) {
                    if (this._arrReelItems[i - 1]['Items'][j] == symName) {
                        arrLocIndex.push(j);
                    }
                }
                if (arrLocIndex.length == 0) {
                    cc.error("计算权重 SymbolsWeight计算出错：第" + i + "列，" + "随机数：" + weightIndex + " 标签名:" + symName + " 在列中未找到!");
                }
                var resultIndex = arrLocIndex[FT.Calc.random(0, arrLocIndex.length)];
                if (resultIndex == null) {
                    //error.log("SymbolsWeight计算出错：");

                    console.log("计算权重出错 calcSymbolsWeight weightIndex:" + weightIndex + " symName:" + symName + " reelIdx:" + i);
                }

                arrResultIdx.splice(i - 1, 1, resultIndex);
            }
        }
        return arrResultIdx;
    },

    /**
     * @function 是否重新计算索引 按照权重
     * @return {Array} 按照权重算的 结果停留值
     **/
    reCalcIdxWeight: function () {
        return this.calcSymbolsWeight();

    },
    /**
     * @function 获取格子的属性
     * @param {String} strSymName 格子的名称
     **/
    getSymData: function (strSymName) {
        for (var i = 0, lenI = this._arrSymData.length; i < lenI; i++) {
            if (this._arrSymData[i]['SymbolID'] == strSymName) {
                return this._arrSymData[i];
            }
        }
        return null;
    },

    /**
     * @function 获取老虎机数据
     **/
    getSlotsData: function (numSlotsID) {
        var SlotsData_Test = require('./GD_SlotsData_Test');
        return SlotsData_Test.filter(function (data) {
            return data['SlotsID'] == (numSlotsID || this._numSlotsID);
        }.bind(this))[0];
    },

    /**
     * @function 初始化当前老虎机的特殊数据
     * SymbolSpecialConfig 特殊Config
     **/
    initSpcData: function () {
        var SymbolSpecialTypeData_Test = require('./GD_SymbolSpecialTypeData_Test');
        this._spcData = SymbolSpecialTypeData_Test.filter(function (data) {
            return data['SlotsID'] == this._numSlotsID;
        }.bind(this))[0];
        if (this._spcData) {
            this._spcData = this._spcData['SymbolSpecialConfig'];
        }
    },


    /**
     * @function 初始化本台老虎机需要的reel数组
     **/
    initArrReelData: function () {
        //列数据
        var ReelsData_Test = require('./GD_ReelsData_Test');

        this._arrReelData = ReelsData_Test.filter(function (data) {
            return data['SlotsID'] == this._numSlotsID;
        }.bind(this));
    },
    /**
     * @function 初始化本台老虎机需要的reel数组
     * @param {boolean} isFsData 是否会取freespin
     **/
    initArrReelItems: function (mode) {
        console.log("initArrReelItemsinitArrReelItems:" + mode);
        //列数据
        var ReelsData_Test = require('./GD_ReelsData_Test');
        this._arrReelItems = [];
        this._arrReelItems = ReelsData_Test.filter(function (data) {
            return data['SlotsID'] == this._numSlotsID;
        }.bind(this));
        var arrTmp = [];
        for (var i = 0, lenI = this._arrReelItems.length; i < lenI; i++) {
            var json = {
                Items: 0,
                ReelSymbolCount: 0
            };
            for (var j in json) {
                if (j == 'Items') {
                    if (mode == 2) {
                        json[j] = this._arrReelItems[i]['Items'].split("&");
                        //中间都变成wild
                        if (i == 1) {
                            for (var k = 0, lenK = json[j].length; k < lenK; k++) {
                                json[j][k] = "wild*1";
                            }
                        }
                    }

                    else if (mode == 3) {
                        json[j] = this._arrReelItems[i]['Items'].split("&");
                        if (i == 0 || i == 2) {
                            for (var k = 0, lenK = json[j].length; k < lenK; k++) {
                                json[j][k] = "wild*1";
                            }
                            console.log("json[j][k] :" + json[j]);
                        }
                    }
                    else {
                        json[j] = this._arrReelItems[i][j].split("&");
                    }
                }
                else {
                    json[j] = this._arrReelItems[i][j];
                }
            }
            arrTmp.push(json);
        }
        this._arrReelItems = arrTmp;
        console.log("this._arrReelItems:" + JSON.stringify(this._arrReelItems));
    },
    /**
     * @function 初始化本台老虎机需要的sym数据
     **/
    initArrSymItems: function () {
        //格子数据
        var SymbolsData_Test = require('./GD_SymbolsData_Test');
        this._arrSymData = SymbolsData_Test.filter(function (data) {
            return data['SlotsID'] == this._numSlotsID;
        }.bind(this));
        var arrTmp = [];
        for (var i = 0, lenI = this._arrSymData.length; i < lenI; i++) {
            var json = {
                SymbolID: 0,
                Rate: 0,
                alias: 0,
                IfExistIsPayLine: 0
            };
            for (var j in json) {
                if (j == 'alias') {
                    json[j] = this._arrSymData[i][j].split("&");
                }
                else {
                    json[j] = this._arrSymData[i][j];
                }
            }
            arrTmp.push(json);
        }
        this._arrSymData = arrTmp;
        console.log("this._arrSymData:" + JSON.stringify(this._arrSymData) + '\n' + JSON.stringify(this.getSymData("wild*1")));
    },

    /**
     * @function 初始化本台老虎机的paytable数据
     **/
    initArrPaytable: function () {
        //该老虎机的paytable数据
        var SlotsPayTable_Test = require('./GD_SlotsPayTable_Test');
        this._arrPaytable = SlotsPayTable_Test.filter(function (data) {
            return data['SlotsID'] == this._numSlotsID;
        }.bind(this));
        var arrTmp = [];
        for (var i = 0, lenI = this._arrPaytable.length; i < lenI; i++) {
            var json = {
                Symbols: 0,
                BigWinMultiplier: 0,
                Multiplier: 0
            };
            for (var j in json) {
                if (j == 'Symbols') {
                    json[j] = this._arrPaytable[i][j].split("&");
                }
                else {
                    json[j] = this._arrPaytable[i][j];
                }
            }

            arrTmp.push(json);
        }
        this._arrPaytable = arrTmp;
        console.log("this._arrPaytable:" + JSON.stringify(this._arrPaytable));
    },
    /**
     * @function 初始化本台老虎机的payline数据
     **/
    initArrPayline: function () {
        //该老虎机的payline数据
        var paylineType = this.getSlotsData()['PayLineType'];
        var SlotsPayLineData_Test = require('./GD_SlotsPayLineData_Test');
        this._arrPayline = SlotsPayLineData_Test.filter(function (data) {
            return data['PayLineType'] == paylineType;
        }.bind(this));
        var arrTmp = [];
        for (var i = 0, lenI = this._arrPayline.length; i < lenI; i++) {
            var arr = this._arrPayline[i]['Position'].split("&");
            //[1_2,2_2,3_3]

            for (var j = 0, lenJ = arr.length; j < lenJ; j++) {
                arr[j] = arr[j].split("_");
                for (var k = 0, lenK = arr[j].length; k < lenK; k++) {
                    arr[j][k] = Number(arr[j][k]) - 1;
                }
            }
            //[[1,2],2_2,3_3]
            arrTmp.push(arr);
        }
        this._arrPayline = arrTmp;
        //1_2&2_2&3_2&4_2&5_2
        console.log("this._arrPayline:" + JSON.stringify(this._arrPayline));
    },

    /**
     * @function 计算paytable
     * @param {Array} arrIdx 位置索引数组
     **/
    calcPaytable: function (arrIdx) {
        //得到该位置的对应的所有payline

        var arrReels = [];
        for (var i = 0, lenI = this._arrReelItems.length; i < lenI; i++) {
            var arrReel = [];
            var reelLen = this._arrReelItems[i]['Items'].length;
            for (var j = 0, lenJ = this._arrReelItems[i]['ReelSymbolCount']; j < lenJ; j++) {
                var idx = (arrIdx[i] + j) % reelLen;
                arrReel.push(this._arrReelItems[i]['Items'][idx]);
            }
            arrReels.push(arrReel);
        }
        //console.log("arrReels1:"+JSON.stringify(arrReels));
        /*[
         ["7_low","fr_high","bar_high"],
         ["7_low","fr_high","bar_high"],
         ["7_low","fr_high","bar_high"],
         ["7_low","fr_high","bar_high"],
         ["7_low","fr_high","bar_high"]
         ]*/
        //根据payline算对应的位置row column
        var arrPaylines = [];
        /* for (var i = 0, lenI = this._arrPayline.length; i < lenI; i++) {
         var arrPayline = [];
         for (var j = 0, lenJ = this._arrPayline[i].length; j < lenJ; j++) {
         var slt = this._arrPayline[i][j].split("_");
         var idxColumn = slt[0] - 1;
         var idxRow = slt[1] - 1;
         arrPayline.push(arrReels[idxColumn][idxRow]);
         }
         arrPaylines.push(arrPayline);
         }*/
        for (var i = 0, lenI = this._arrPayline.length; i < lenI; i++) {
            var arrPayline = [];
            for (var j = 0, lenJ = this._arrPayline[i].length; j < lenJ; j++) {
                arrPayline.push(arrReels[this._arrPayline[i][j][0]][this._arrPayline[i][j][1]]);
            }
            arrPaylines.push(arrPayline);
        }
        //console.log("arrPaylines:"+JSON.stringify(arrPaylines));
        //[["fr_high","fr_high","fr_high","fr_high","fr_high"],["bar_high","bar_high","bar_high","bar_high","bar_high"],["7_low","7_low","7_low","7_low","7_low"],["bar_high","fr_high","7_low","fr_high","bar_high"],["7_low","fr_high","bar_high","fr_high","7_low"],["fr_high","bar_high","bar_high","bar_high","fr_high"],["fr_high","7_low","7_low","7_low","fr_high"],["bar_high","bar_high","fr_high","7_low","7_low"],["7_low","7_low","fr_high","bar_high","bar_high"],["fr_high","7_low","fr_high","bar_high","fr_high"],["fr_high","bar_high","fr_high","7_low","fr_high"],["bar_high","bar_high","7_low","bar_high","bar_high"],["7_low","7_low","bar_high","7_low","7_low"],["bar_high","fr_high","bar_high","fr_high","bar_high"],["7_low","fr_high","7_low","fr_high","7_low"],["fr_high","fr_high","bar_high","fr_high","fr_high"],["fr_high","fr_high","7_low","fr_high","fr_high"],["bar_high","7_low","fr_high","7_low","bar_high"],["7_low","bar_high","fr_high","bar_high","7_low"],["bar_high","7_low","7_low","7_low","bar_high"],["7_low","bar_high","bar_high","bar_high","7_low"],["fr_high","7_low","bar_high","7_low","fr_high"],["fr_high","bar_high","7_low","bar_high","fr_high"],["bar_high","fr_high","fr_high","fr_high","bar_high"],["7_low","fr_high","fr_high","fr_high","7_low"]]
        //计算总赢钱数
        var isWin = false;
        for (var i = 0, lenI = arrPaylines.length; i < lenI; i++) {
            var arrPayline = arrPaylines[i];
            var isFindPt = false;
            for_calcPt:for (var j = 0, lenJ = this._arrPaytable.length; j < lenJ; j++) {
                var numIdxAlias = 0;
                var tmpPlSymName = null;
                var arrPtSymbols = this._arrPaytable[j]['Symbols'];
                //console.log("arrPtSymbols:"+JSON.stringify(arrPtSymbols));
                var numMultiplier = this._arrPaytable[j]['Multiplier'];
                var numBigWinMultiplier = this._arrPaytable[j]['BigWinMultiplier'];
                //遍历paytable中的每一个对比
                for (var k = 0, lenK = arrPtSymbols.length; k < lenK; k++) {
                    //每个payline的sym
                    var plSymName = tmpPlSymName || arrPayline[k];
                    //每个paytable的sym
                    var ptSymName = arrPtSymbols[k];
                    if (plSymName == ptSymName) {
                        numIdxAlias = 0;
                        tmpPlSymName = null;
                        //找到了paytable 查找下一个payline的paytable
                        if (k == lenK - 1) {
                            isFindPt = true;
                            //console.log("ptSymName:"+ptSymName);
                            //2*5*2类型的超级大奖
                            if (numBigWinMultiplier) {
                                isWin = true;
                                //console.log("winCombi:"+JSON.stringify(arrPayline.join("&"))+" winNum:"+(this._numBet*numBigWinMultiplier));
                                this._numWinMoney += this._numBet * numBigWinMultiplier;
                            }
                            //普通奖
                            else if (numMultiplier) {
                                //可能存在组合线 其中某个格子在翻倍的情况
                                var numRate = 1;
                                for (var l = 0, lenL = arrPayline.length; l < lenL; l++) {
                                    var symData = this.getSymData(arrPayline[l]);
                                    if (symData['Rate']) {
                                        numRate *= symData['Rate'];
                                    }
                                }
                                isWin = true;
                                //console.log("winCombi:"+JSON.stringify(arrPayline.join("&"))+" winNum:"+(this._numBet*numMultiplier*numRate));
                                this._numWinMoney += this._numBet * numMultiplier * numRate;
                            }
                            break for_calcPt;
                        }
                    }
                    //一旦从左到右有一个不一样 查找下一个paytable
                    else {
                        var alias = this.getSymData(arrPayline[k])['alias'];
                        //发现有alias 按顺序遍历alias所填字段再次遍历paytable
                        if (alias) {
                            if (alias[numIdxAlias]) {
                                tmpPlSymName = alias[numIdxAlias];
                                numIdxAlias++;
                                k--;
                            }
                            //如果超出界限
                            else {
                                break;
                            }
                        }
                        else {
                            break;
                        }
                    }
                }
            }
            //没有在paytable中找到
            if (!isFindPt) {
                //单线机器就算没有在paytable中找到 但其中任意一个格子存在 IfExistIsPayLine 也算赢钱
                var numRate = 0;
                for (var j = 0, lenJ = arrPayline.length; j < lenJ; j++) {
                    var symData = this.getSymData(arrPayline[j]);
                    if (symData['IfExistIsPayLine']) {
                        if (numRate === 0) {
                            numRate = 1;
                        }
                        numRate *= symData['Rate'];
                    }
                }
                //如果存在rate算出赢钱数
                if (numRate) {
                    isWin = true;
                    //console.log("winCombi:"+JSON.stringify(arrPayline.join("&"))+" winNum:"+(this._numBet*numRate));
                    this._numWinMoney += this._numBet * numRate;
                }
            }
        }
        if (isWin) {
            this._numWinTimes++;
        }

    },
    /**
     * @function 设置slots关键的数据
     **/
    setSlotsData: function () {
        var FT = require("./FastTool");
        FT.Calc.bindPaytableFunc(this._numSlotsID);
        this.initDebugInfo();
        this.initArrReelData();
        this.initArrReelItems(this.mode);
        this.initArrSymItems();
        this.initArrPaytable();
        this.initArrPayline();
        this.initSpcData();
    }
};
var _runTimes = 0;
/**
 * @function 设置slots关键的数据
 * @param {Number} dealtimes 随机跑多少次
 **/
function demo(dealtimes) {
    slotscalRand.setSlotsData();

    while (_runTimes < dealtimes) {
        //多线随机方式
        /*
         var arr = slotscalRand._arrReelItems;
         slotscalRand.calcPaytable([
         FT.Calc.random(0, arr[0]['Items'].length),
         FT.Calc.random(0, arr[1]['Items'].length),
         FT.Calc.random(0, arr[2]['Items'].length)]
         );*/
        //2332
        slotscalRand.calcPaytable(slotscalRand.reCalcIdxWeight());//单线按照权重来算的值方式
        _runTimes++;
    }
}

var para = process.argv.slice(2);
var paranumber = para.length;
var dealtimes = para[0];
slotscalRand._numBet = para[1];
var startTime = new Date().getTime();

demo(dealtimes);
var endTime = new Date().getTime();
//console.log("timepass:" + (n - caltime) + ",_numWinMoney:" + slotscalRand._numWinMoney + ",_numWinTimes:" + slotscalRand._numWinTimes + ",_runTimes:" + _runTimes);
var jsonResult = {
    'WinMoney': slotscalRand._numWinMoney,
    'WinTimes': slotscalRand._numWinTimes,
    "RunTimes": _runTimes,
    "CalcTime": (endTime - startTime)
};
console.log("Result:" + JSON.stringify(jsonResult));

