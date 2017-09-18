/**
 * 文 件 名：FastTool
 * 内    容：cocos快速开发工具
 * 功    能：快速开发
 * 作    者：Yusiyuan
 * 邮    箱：979797934@qq.com
 * 小    组：游戏研发部
 * 生成日期：2014/11/11
 * 版 本 号：v1.0
 * 修改日期：
 * 修改日志：
 * 版权说明：随便改
 */
var FT = FT || {};

FT.Res = FT.Res || {};
/**
 * 加载资源
 * @param resources {[String]} g_resources资源组
 * @param option {Function|{}|null} 加载进度执行方法(接收百分比%)
 * @param cb {Function|{}} 加载完成执行方法
 * @desc 一般用于静默加载
 */
FT.Res.loadRES = function (resources, callbacks, callbackEnd) {
    cc.loader.load(resources, function (result, count, loadedCount) {
        var percent = (loadedCount / count * 100) | 0;
        percent = Math.min(percent, 100);
        if (callbacks && callbacks != null) callbacks.call(null, percent);
    }, function () {
        if (callbackEnd) callbackEnd.call();
    });
};
/**
 * 资源释放
 * @param resources {[String]|String} 资源组或资源
 */
FT.Res.destroyRES = function (resources) {
    if (cc.isArray(resources)) {
        for (var i in resources) {
            cc.loader.release(resources[i]);
        }
    } else {
        cc.loader.release(resources);
    }
};
//FT.Res.frameLoad(node,function(){cc.log("start!");},[function(){FT.cacheArmature();}],function(){cc.log("frame end");});
FT.Res.frameLoad = function (node, callbackStart, callbacks, callbackEnd) {
    callbackStart();
    /*node.scheduleOnce(function () {
     console.log("callbacks len:" + callbacks.length);
     if (callbacks.length > 0) {
     callbacks[0]();
     callbacks.splice(0, 1);
     node.scheduleOnce(arguments.callee.bind(this), 0);//
     }
     else {
     callbackEnd();
     }
     }.bind(this), 0);*/
    //node.removeFromParent(true);

    //node.runAction(cc.sequence(cc.delayTime(0),cc.callFunc(function () {
    //    console.log("callbacks len:" + callbacks.length);
    //    if (callbacks.length > 0) {
    //        callbacks[0]();
    //        callbacks.splice(0, 1);
    //        node.runAction(cc.sequence(cc.delayTime(0),cc.callFunc(arguments.callee.bind(this))));
    //    }
    //    else {
    //        callbackEnd();
    //    }
    //}.bind(this))));

    P_Tool.scheduleOnceTorunAction(node, function () {
        console.log("callbacks len:" + callbacks.length);
        if (callbacks.length > 0) {
            callbacks[0]();
            callbacks.splice(0, 1);
            P_Tool.scheduleOnceTorunAction(node, arguments.callee.bind(this), 0);
        }
        else {
            callbackEnd();
        }
    }.bind(this), 0);
};
FT.Res.CleanUnusedResource = function () {
    //cc.TextureCache.getInstance().dumpCachedTextureInfo();
    //cc.SpriteFrameCache.getInstance().removeUnusedSpriteFrames();

    cc.TextureCache.getInstance().removeUnusedTextures();
    cc.SpriteFrameCache.getInstance().removeSpriteFrames();

    //cc.TextureCache.getInstance().removeUnusedTextures();
    //cc.TextureCache.getInstance().removeAllTextures();

    ccs.ArmatureDataManager.purge();
    //sys.garbageCollect();
    //sys.dumpRoot();
};
FT.Effect = FT.Effect || {};
//用裁剪的方式留底

/* *
 * @function 缺点有锯齿 原理画一张纯色图 FT.Effect.shaderColor(nodeRoot,imgStencilPath,clor);
 * @param {cc.Node}   nodeRoot  要插入的根节点
 * @param {cc.Rect}   imgStencilPath  遮罩图片路径
 * @param {Number}   color  要渲染的颜色
 * @return {cc.Node}
 * */
FT.Effect.shaderColor = function (nodeRoot, imgStencilPath, color) {
    var stencil = new cc.Sprite(imgStencilPath);
    stencil.tag = 1;
    stencil.x = 0;
    stencil.y = 0;
    var clipper = new cc.ClippingNode();
    clipper.tag = 2;
    clipper.anchorX = 0.5;
    clipper.anchorY = 0.5;
    clipper.x = 0;
    clipper.y = 0;
    clipper.stencil = stencil;
    clipper.alphaThreshold = 0.05;
    var shape = new cc.Sprite(res.btn_null_white_png);
    //shape.setBlendFunc(cc.ONE,cc.ONE);
    shape.setScaleX(stencil.getContentSize().width);
    shape.setScaleY(stencil.getContentSize().height);
    shape.setOpacity(230);
    var content = shape;
    content.x = 0;
    content.y = 0;
    clipper.addChild(content);
    clipper['content'] = content;

    nodeRoot.addChild(clipper);
    return clipper;
};

/*FT.Object.updateFunc = function (node,func) {
 node.scheduleUpdate();
 node.update = function (dtH, speed, callFunc, dt) {
 func();
 }.bind(this);
 };*/
//震屏特效
/**
 *
 * @function
 * @param {cc.Node}   node  要震动的节点
 * @param {cc.Rect}   rect  左、右、上、下
 * @param {Number}   shakeTimes 震动10次
 * @param {Number}   shakeTime  震动一次说消耗的时间
 * @param {cc.Action}   slowAction 缓动类型 cc.easeOut
 * @param {Number}   tag   删除上一个action的标志
 * @param {cc.p}   fixStartPos   修正坐标
 * @return {cc.Node}
 **/
/*FT.Effect.shake(
 WinLayer.thisBundle.csdNode,
 cc.rect(-150,150,-150,150),
 10,
 0.21,
 cc.easeBackOut(),
 88
 );*/
FT.Effect.shake = function (node, rect, shakeTimes, shakeTime, slowAction, tag, fixStartPos, isOnce) {
    try {
        var sizeWidth = cc.size(rect.x, rect.y);
        var sizeHeight = cc.size(rect.width, rect.height);
        if (!tag) {
            tag = 88;
        }
        if (fixStartPos) {
            node.stopActionByTag(tag);
            node.setPosition(fixStartPos);
        }
        var initPos = node.getPosition();
        var arrMoveTo = [];

        shakeTime = shakeTime / 3;
        for (var i = 0; i < shakeTimes; i++) {
            var func = function (i) {
                var disW = FT.Calc.random(sizeWidth.width, sizeWidth.height, true);
                var disH = FT.Calc.random(sizeHeight.width, sizeHeight.height, true);
                var newPos = cc.pAdd(initPos, cc.p(disW, disH));
                var reversePos = cc.pAdd(initPos, cc.p(-disW, -disH));
                if (isOnce) {
                    var moveTo = cc.sequence(cc.moveTo(shakeTime, newPos).easing(slowAction), cc.moveTo(shakeTime, initPos).easing(slowAction), cc.callFunc(function (i) {
                        node.stopActionByTag(tag);
                        if (arrMoveTo[i]) {
                            arrMoveTo[i]();
                        }
                        else {
                            //last fixed position
                            node.setPosition(initPos);
                        }
                    }.bind(this, i + 1, arrMoveTo)));
                }
                else {
                    var moveTo = cc.sequence(cc.moveTo(shakeTime, newPos).easing(slowAction), cc.moveTo(shakeTime, reversePos).easing(slowAction), cc.moveTo(shakeTime, initPos).easing(slowAction), cc.callFunc(function (i) {
                        if (node) {
                            node.stopActionByTag(tag);
                            if (arrMoveTo[i]) {
                                arrMoveTo[i]();
                            }
                            else {
                                //last fixed position
                                node.setPosition(initPos);
                            }
                        }

                    }.bind(this, i + 1, arrMoveTo)));
                }
                moveTo.setTag(tag);
                node.runAction(moveTo);
            }.bind(this, i);
            arrMoveTo.push(func);
        }
        if (arrMoveTo[0]) {
            arrMoveTo[0]();
        }
        return node;
    } catch (e) {
    }

};
/*
 FT.Effect.clippingSp({
 'Dir':"L2R",//四格方向 L2R R2L T2B B2T
 'ClippingImgRes':res.clipping,//要裁剪的图片资源路径
 'StencilImg':res.png,//裁剪图片
 'InitRate':0,//初始比例
 'EndRate':1,//最终比例
 'TotalTimes':1,//总次数
 'ClippingSize':cc.size(100,100),//裁剪区域
 'UseTime':1,//耗时
 'NodeRoot':this.rootNode,//插入的根节点
 'IsInverted':0,//是否反转裁剪图片
 'FuncStartUnit':function(curTime){
 },//每次进度开始执行的函数
 'FuncEndUnit':function(curTime){
 }//每次到头执行的函数
 });*/
FT.Effect.clippingSp = function (data, midTotalTimes) {
    //最后的次数为0
    if (midTotalTimes === 0) {
        return;
    }
    var dir = data['Dir'];//方向 L2R R2L T2B B2T
    var clippingImgRes = data['ClippingImgRes'];//要裁剪的图片资源路径
    var stencilImgRes = data['StencilImg'];//裁剪图片
    var initRate = data['InitRate'];//初始比例
    var endRate = data['EndRate'];//最终比例
    var totalTimes = data['TotalTimes'];//总次数
    var clippingSize = data['ClippingSize'];//裁剪区域
    var useTime = data['UseTime'];//耗时
    var nodeRoot = data['NodeRoot'];//插入的根节点
    var funcStartUnit = data['FuncStartUnit'];//每次进度开始执行的函数
    var funcEndUnit = data['FuncEndUnit'];//每次结束执行的函数
    var isInverted = Number(data['IsInverted']);//是否反转裁剪图片
    var numCurTimes = midTotalTimes || totalTimes;//当前运行次数 第一次为总次数 之后递减
    if (midTotalTimes) {
        numCurTimes = midTotalTimes;
    }
    //总次数大于等于2
    if (totalTimes >= 2) {
        //倒数第1次
        if (numCurTimes == 1) {
            initRate = 0;
        }
        //当前次数大于等于2
        else if (numCurTimes >= 2) {
            //的第一次
            if (numCurTimes == totalTimes) {
                endRate = 1;
            }
            //的倒数第1次之前的次数
            else {
                initRate = 0;
                endRate = 1;
            }
        }
    }
    nodeRoot.removeAllChildren(true);
    var stencil = new cc.Sprite(stencilImgRes);
    stencil.tag = 0;
    stencil.x = 0;
    stencil.y = 0;
    stencil.anchorX = 0.5;
    stencil.anchorY = 0.5;
    var clipper = new cc.ClippingNode();
    clipper.tag = 1;
    clipper.anchorX = 0.0;
    clipper.anchorY = 0.0;
    clipper.x = 0;
    clipper.y = 0;
    clipper.stencil = stencil;
    nodeRoot.addChild(clipper);
    if (isInverted) {
        clipper.inverted = true;
    }
    clipper.alphaThreshold = 0.05;
    var content = new cc.Sprite(clippingImgRes);
    content.x = 0;
    content.y = 0;
    clipper.addChild(content);
    if (initRate) {
        switch (dir) {
            case "L2R":
                stencil.setPosition(initRate * clippingSize.width, 0);
                break;
            case "R2L":
                stencil.setPosition(-initRate * clippingSize.width, 0);
                break;
            case "T2B":
                stencil.setPosition(0, -initRate * clippingSize.height);
                break;
            case "B2T":
                stencil.setPosition(0, initRate * clippingSize.height);
                break;
        }
    }
    var actionTo = null;//得到actionTo
    switch (dir) {
        case "L2R":
            actionTo = cc.moveTo(useTime, cc.p(endRate * clippingSize.width, 0));
            break;
        case "R2L":
            actionTo = cc.moveTo(useTime, cc.p(-endRate * clippingSize.width, 0));
            break;
        case "T2B":
            actionTo = cc.moveTo(useTime, cc.p(0, -endRate * clippingSize.height));
            break;
        case "B2T":
            actionTo = cc.moveTo(useTime, cc.p(0, endRate * clippingSize.height));
            break;
    }
    var seq = cc.sequence(
        cc.callFunc(function () {
            funcStartUnit(this);
        }.bind(numCurTimes)),
        actionTo,
        cc.callFunc(function () {
            funcEndUnit(this);
        }.bind(numCurTimes)),
        cc.callFunc(arguments.callee.bind(this, data, --numCurTimes)));
    stencil.runAction(cc.sequence(seq));
};
//猪猪猪 特效 自增长特效
/*
 FT.Effect.growAnimByCCB({
 "direction": "LeftToRight",//方向
 "clippingContent": "BarExp1",//裁剪CCB
 "clippingContentSize":cc.size(1136,640),
 "initRate": initRate,//初始比例0~1
 "unitTime": unitTime,//每次增长用的时间
 "finalRate": finalRate,//最终比例 0~1
 "growTimes": count, //总增长几次
 "parent": this.nodeExpBar,//ccb
 "tag": 999,//tag 下次会按次tag删除上次的ccb
 "callBacks":function(i){//每次增长前执行回调 i 为0~增长几次-1
 cc.log("--- callBacks:"+i);
 this.lblLevel.setString("lv."+(bLevel+i));
 }.bind(this),
 "callBack":function(){//执行完动画执行的回调
 cc.log("--- callBack end!");
 }.bind(this)
 });*/
//方向 direction（LeftToRight） 裁剪哪个ccb clippingContent 初始比例 0~100 initRate  增长了几次 growTime  最终比例 finalRate   每一次所用的时间 unitTime
FT.Effect.growAnimByCCB = function (data) {
    var direction = data['direction'];
    var clippingContent = data['clippingContent'];
    var clippingContentSize = data['clippingContentSize'];
    var imgRes = data['imgRes'];
    var initRate = data['initRate'];
    initRate > 1 ? initRate = 1 : 1;
    var unitTime = data['unitTime'];
    var finalRate = data['finalRate'];
    finalRate > 1 ? finalRate = 1 : 1;
    var growTimes = data['growTimes'];
    var parent = data['parent'];
    var tag = data['tag'];
    var pos = data['pos'];
    //全部执行完动画
    var callBack = data['callBack'];
    //每一个动画执行时执行的方法
    var callBacks = data['callBacks'];
    //parent.unscheduleAllCallbacks();
    //direction, clippingContent,clippingContentSize, 0, unitTime, save_finalRate, growTimes, parent, tag, pos, i + 1, callBack, callBacks, save_initRate, save_finalRate
    var func = function (direction, clippingContent, clippingContentSize, initRate, unitTime, finalRate, growTimes, parent, tag, pos, i, callBack, callBacks, save_initRate, save_finalRate) {
        if (direction == "LeftToRight" || direction == "RightToLeft" || direction == "BottomToTop" || direction == "TopToBottom") {
            cc.log("tttttttttttag:" + tag);
            cc.log("arg:" + JSON.stringify(arguments));
            if (tag && parent.getChildByTag(tag)) {
                parent.getChildByTag(tag).removeFromParent(true);
                cc.log("sadafsdfasf");
            }
            if (imgRes) {
                clippingContent = new cc.Sprite(imgRes);
            }
            else {

            }
            var totalNode = new cc.Node();
            var ccb = clippingContent;//cc.BuilderReader.load(clippingContent);
            var content = clippingContentSize;//ccb.getContentSize();
            var layer = new cc.Layer();
            var sc = new cc.ScrollView(content, layer);
            sc.setTouchEnabled(false);
            var node = new cc.Node();
            node.addChild(ccb);
            sc.addChild(node);
            sc.setName("scrollView");
            totalNode.addChild(sc);
            ccb.setAnchorPoint(0, 0.0);
            if (direction == "LeftToRight") {
                sc.setPositionX(-content.width);
                ccb.setPositionX(content.width);
            }
            else if (direction == "RightToLeft") {
                sc.setPositionX(content.width);
                ccb.setPositionX(-content.width);
            }
            else if (direction == "BottomToTop") {
                sc.setPositionY(-content.height);
                ccb.setPositionY(content.height);
            }
            else if (direction == "TopToBottom") {
                sc.setPositionY(content.height);
                ccb.setPositionY(-content.height);
            }

            if (direction == "LeftToRight") {
                //初始增长距离
                var growDis = initRate * content.width;
                //最终增长距离
                var finalDis = finalRate * content.width;
            }
            else if (direction == "RightToLeft") {
                //初始增长距离
                var growDis = initRate * content.width;
                //最终增长距离
                var finalDis = finalRate * content.width;
            }
            else if (direction == "BottomToTop") {
                //初始增长距离
                var growDis = initRate * content.height;
                //最终增长距离
                var finalDis = finalRate * content.height;
            }
            else if (direction == "TopToBottom") {
                //初始增长距离
                var growDis = initRate * content.height;
                //最终增长距离
                var finalDis = finalRate * content.height;
            }
            //sc初始坐标
            var initPos_sc = sc.getPosition();//cc.p();
            if (direction == "LeftToRight") {
                //sc初始最终坐标
                var initFinalPos_sc = cc.p(initPos_sc.x + growDis, initPos_sc.y);
                //sc最终坐标
                var finalPos_sc = cc.p(initPos_sc.x + finalDis, initPos_sc.y);
            }
            else if (direction == "RightToLeft") {
                //sc初始最终坐标
                var initFinalPos_sc = cc.p(initPos_sc.x - growDis, initPos_sc.y);
                //sc最终坐标
                var finalPos_sc = cc.p(initPos_sc.x - finalDis, initPos_sc.y);
            }
            else if (direction == "BottomToTop") {
                //sc初始最终坐标
                var initFinalPos_sc = cc.p(initPos_sc.x, initPos_sc.y + growDis);
                //sc最终坐标
                var finalPos_sc = cc.p(initPos_sc.x, initPos_sc.y + finalDis);
                cc.log("initFinalPos_sc:" + JSON.stringify(initFinalPos_sc) + "  finalPos_sc:" + JSON.stringify(finalPos_sc));
            }
            else if (direction == "TopToBottom") {
                //sc初始最终坐标
                var initFinalPos_sc = cc.p(initPos_sc.x, initPos_sc.y - growDis);
                //sc最终坐标
                var finalPos_sc = cc.p(initPos_sc.x, initPos_sc.y - finalDis);
            }
            //=====
            //ccb初始坐标
            var initPos_ccb = ccb.getPosition();//cc.p();
            if (direction == "LeftToRight") {
                //ccb初始最终坐标
                var initFinalPos_ccb = cc.p(initPos_ccb.x - growDis, initPos_ccb.y);
                //ccb最终坐标
                var finalPos_ccb = cc.p(initPos_ccb.x - finalDis, initPos_ccb.y);
            }
            else if (direction == "RightToLeft") {
                //ccb初始最终坐标
                var initFinalPos_ccb = cc.p(initPos_ccb.x + growDis, initPos_ccb.y);
                //ccb最终坐标
                var finalPos_ccb = cc.p(initPos_ccb.x + finalDis, initPos_ccb.y);
            }
            else if (direction == "BottomToTop") {
                //ccb初始最终坐标
                var initFinalPos_ccb = cc.p(initPos_ccb.x, initPos_ccb.y - growDis);
                //ccb最终坐标
                var finalPos_ccb = cc.p(initPos_ccb.x, initPos_ccb.y - finalDis);
                cc.log("initFinalPos_ccb:" + JSON.stringify(initFinalPos_ccb) + "  finalPos_ccb:" + JSON.stringify(finalPos_ccb));
            }
            else if (direction == "TopToBottom") {
                //ccb初始最终坐标
                var initFinalPos_ccb = cc.p(initPos_ccb.x, initPos_ccb.y + growDis);
                //ccb最终坐标
                var finalPos_ccb = cc.p(initPos_ccb.x, initPos_ccb.y + finalDis);
            }
            //每次增长的函数
            if ("[object Function]" != Object.prototype.toString.call(callBacks)) {
                callBacks = function () {
                };
            }
            if ("[object Function]" != Object.prototype.toString.call(callBack)) {
                callBack = function () {
                };
            }
            var growTimesFunc = cc.callFunc(function (i) {
                callBacks(i);
            }.bind(this, i));
            var growFinishFunc = cc.callFunc(function (i) {
                callBack(i);
            }.bind(this, i));
            var nullFunc = cc.callFunc(function () {
            });
            var seq_sc, seq_ccb, callFuncContinue = null;
            /*
             cc.log("growTimes:"+growTimes+"   unitTime:"+unitTime +"   i:"+i+"   ");
             cc.log("finalPos_sc:"+JSON.stringify(finalPos_sc)+"   finalPos_ccb:"+JSON.stringify(finalPos_ccb));
             cc.log("initFinalPos_sc:"+JSON.stringify(initFinalPos_sc)+"   initFinalPos_ccb:"+JSON.stringify(initFinalPos_ccb));*/
            //最后结算函数
            //当增长次数为1  增长时间为0时  直接定位位置
            if (growTimes == 1 && unitTime == 0) {
                sc.setPosition(finalPos_sc);
                ccb.setPosition(finalPos_ccb);
                //sc.scheduleOnce(function () {
                //    callBacks(i);
                //    callBack(i);
                //});

                P_Tool.scheduleOnceTorunAction(sc, function () {
                    callBacks(i);
                    callBack(i);
                }, 0);
            }
            else {
                sc.setPosition(initFinalPos_sc);
                ccb.setPosition(initFinalPos_ccb);
                //最后一次
                if (i == growTimes - 1) {
                    seq_sc = cc.sequence(growTimesFunc, cc.moveTo(unitTime, finalPos_sc), growFinishFunc);
                    seq_ccb = cc.sequence(nullFunc, cc.moveTo(unitTime, finalPos_ccb), nullFunc);
                }
                //除第一次跟最后一次以外的
                else {
                    if (i + 1 == growTimes - 1) {
                        callFuncContinue = cc.callFunc(arguments.callee.bind(this, direction, clippingContent, clippingContentSize, 0, unitTime, save_finalRate, growTimes, parent, tag, pos, i + 1, callBack, callBacks, save_initRate, save_finalRate));
                    }
                    //三次以上
                    else {
                        callFuncContinue = cc.callFunc(arguments.callee.bind(this, direction, clippingContent, clippingContentSize, 0, unitTime, 1, growTimes, parent, tag, pos, i + 1, callBack, callBacks, save_initRate, save_finalRate));

                    }
                    seq_sc = cc.sequence(growTimesFunc, cc.moveTo(unitTime, finalPos_sc), callFuncContinue);
                    seq_ccb = cc.sequence(nullFunc, cc.moveTo(unitTime, finalPos_ccb), nullFunc);
                }
                sc.runAction(seq_sc);
                ccb.runAction(seq_ccb);
            }
            totalNode.setTag(tag);
            parent.addChild(totalNode);
            totalNode.setPosition(pos || cc.p(0, 0));
            return totalNode;
        }
    };
    //计算第一次 初始值到 最终值
    if (growTimes == 1) {
        return func(direction, clippingContent, clippingContentSize, initRate, unitTime, finalRate, growTimes, parent, tag, pos, 0, callBack, callBacks, initRate, finalRate);

    }
    else {
        return func(direction, clippingContent, clippingContentSize, initRate, unitTime, 1, growTimes, parent, tag, pos, 0, callBack, callBacks, initRate, finalRate);
    }
};

FT.Effect.clipHighlight = function (data) {
    var objReference = data['objReference'];
    var stencilPath = data['stencilPath'];
    var lightPath = data['lightPath'];
    var lightInitPos = data['lightInitPos'];
    var lightMoveByPos = data['lightMoveByPos'];
    var lightMoveTime = data['lightMoveTime'];
    var lightWaitTime = data['lightWaitTime'];
    var stencilScale = data['stencilScale'] || 1;
    var stencil = new cc.Sprite(stencilPath);
    stencil.setScale(stencilScale);
    stencil.setPosition(objReference.getPosition());
    stencil.setAnchorPoint(objReference.getAnchorPoint());
    var clipper = cc.ClippingNode.create();
    clipper.setStencil(stencil);
    clipper.setInverted(false);
    clipper.setAlphaThreshold(0);
    objReference.getParent().addChild(clipper);
    var lightShadow = new cc.Sprite(lightPath);
    lightShadow.setPosition(lightInitPos);
    lightShadow.setBlendFunc(gl.ONE, gl.ONE);
    lightShadow.setOpacity(40);
    var moveBy = cc.MoveBy.create(lightMoveTime, lightMoveByPos);
    //光从左到右 等待2.5秒继续扫
    var seqMove = cc.repeatForever(cc.sequence(moveBy, cc.callFunc(
        function () {
            lightShadow.setPosition(lightInitPos);
        }.bind(this)
    ), cc.delayTime(lightWaitTime)));
    clipper.addChild(lightShadow);
    lightShadow.runAction(seqMove);
};


FT.Effect.setNodeColor = function (sp, color) {
    if (!sp) {
        return;
    }
    if (sp.getOpacity) {
        sp.setColor(color);
    }
    if (sp.getChildrenCount() > 0) {
        var children = sp.getChildren();
        for (var i in children) {
            if (children.hasOwnProperty(i))
                arguments.callee(children[i], color);
        }
    }
};

/**
 * @function 数字增长特效
 * FT.Effect.numPlus(FightPage.thisBundle.lblOurPrice, this["总身价"]["我方"], 0.3, 3, 0.0,function,isFormatNum,unitCallFunc); 走了3次 一共用了0.3秒
 * @param {cc.Node}   sp  要执行动画的节点
 * @param {Number} numEnd  最后多少钱
 * @param {Number}   time 消耗时间
 * @param {Number}   times  跳动次数
 * @param {Number}   wt  等待时间
 * @param {Function}   func   最后执行的方法
 * @param {Boolean}   isFormatNum   是否带逗号的美国符号
 * @param {Function}   unitFunc   每次跳动执行的方法
 * @return null
 **/
FT.Effect.numPlus = function (sp, numEnd, time, times, wt, func, isFormatNum, unitFunc) {
    if (isFormatNum) {
        var numStart = sp.getString();
        if (!numStart) {
            numStart = "0";
        }
        numStart = Number(numStart.split(",").join(""));
    }
    else {
        var numStart = Number(sp.getString());
        if (!numStart) {
            numStart = 0;
        }
    }
    sp.unscheduleAllCallbacks();
    sp.stopAllActions();
    numEnd = Number(numEnd);
    console.log("numStart:" + numStart + " numEnd:" + numEnd);
    if (Math.floor(numStart) == Math.floor(numEnd)) {

        return;
    }
    if (numStart > numEnd) {
        //return;
    }
    var diff = Number(numEnd) - Number(numStart);
    if (times > Math.abs(diff)) {
        times = Math.abs(diff);
    }
    var diffTime = time / times; //3/30
    var diffAdd = diff > 0 ? Math.floor(diff / times) : Math.ceil(diff / times); //100/30 //C by dai <- var diffAdd = Math.floor(diff / times);
    for (var i = 1; i <= times; i++) {
        sp.runAction(cc.sequence(cc.delayTime(wt + i * diffTime), cc.callFunc(function (sp, diffAdd, i) {
            if (unitFunc) {
                unitFunc();
            }
            //j结束强制设置为最后的字符串
            if (i == times) {
                if (isFormatNum) {
                    sp.setString(accounting.formatNumber(numEnd));
                }
                else {
                    sp.setString(numEnd);
                }

                if (func) {
                    func();
                }
                return;
            }
            if (isFormatNum) {
                sp.setString(accounting.formatNumber(numStart + diffAdd * i));
            }
            else {
                sp.setString(numStart + diffAdd * i);
            }
        }.bind(this, sp, diffAdd, i))));
        /* sp.scheduleOnce(function (sp, diffAdd, i) {

         if (unitFunc) {
         unitFunc();
         }
         //j结束强制设置为最后的字符串
         if (i == times) {
         if (isFormatNum) {
         sp.setString(accounting.formatNumber(numEnd));
         }
         else {
         sp.setString(numEnd);
         }

         if (func) {
         func();
         }
         return;
         }
         if (isFormatNum) {
         sp.setString(accounting.formatNumber(numStart + diffAdd * i));
         }
         else {
         sp.setString(numStart + diffAdd * i);
         }

         }.bind(this, sp, diffAdd, i), wt + i * diffTime);

         */
        //P_Tool.scheduleOnceTorunAction(sp, function (sp, diffAdd, i) {
        //
        //    if (unitFunc) {
        //        unitFunc();
        //    }
        //    //j结束强制设置为最后的字符串
        //    if (i == times) {
        //        if (isFormatNum) {
        //            sp.setString(accounting.formatNumber(numEnd));
        //        }
        //        else {
        //            sp.setString(numEnd);
        //        }
        //
        //        if (func) {
        //            func();
        //        }
        //        return;
        //    }
        //    if (isFormatNum) {
        //        sp.setString(accounting.formatNumber(numStart + diffAdd * i));
        //    }
        //    else {
        //        sp.setString(numStart + diffAdd * i);
        //    }
        //
        //}.bind(this, sp, diffAdd, i), wt + i * diffTime);
    }
};
FT.Convert = FT.Convert || {};
FT.Convert.toVertical = function (str) {
    var tmpStr = str.split("");
    var rStr = "";
    for (var i = 0, lenI = tmpStr.length; i < lenI; i++) {
        rStr = tmpStr[i] + "\n";
    }
    return rStr;
};
FT.Convert.hexNumToColor = function (strColor) {
    var nAr = strColor.substr(1).split("");
    var r = parseInt("0x" + nAr[0] + nAr[1]);
    var g = parseInt("0x" + nAr[2] + nAr[3]);
    var b = parseInt("0x" + nAr[4] + nAr[5]);
    return cc.color(r, g, b);
};

// 时间戳 -> 天数。 200 days 20:10:00
FT.Convert.formatTime1 = function (time) {

    var oneDay = 24 * 60 * 60;

    // days
    var dayNum = Math.floor(time / oneDay);

    // house
    var hourNum = Math.floor((time - dayNum * oneDay) / 3600);

    // min
    var minNum = Math.floor((time - dayNum * oneDay - hourNum * 3600) / 60);

    //
    var secNum = Math.floor(time - dayNum * oneDay - hourNum * 3600 - minNum * 60);

    var str1 = "";
    if (dayNum <= 1) {
        str1 = dayNum + "day"
    }
    else {
        str1 = dayNum + "days"
    }
    var str2 = hourNum;
    if (hourNum < 10) {
        str2 = "0" + hourNum
    }


    var str3 = minNum;
    if (minNum < 10) {
        str3 = "0" + minNum
    }


    var str4 = secNum;
    if (secNum < 10) {
        str4 = "0" + secNum
    }

    var str = str1 + " " + str2 + ":" + str3 + ":" + str4;

    return str;
};


FT.Draw = FT.Draw || {};

//画线
FT.Draw.line = function (points, imgPath, width) {
    width = Number(width);
    var batchNode = new cc.SpriteBatchNode(imgPath);
    var arrTmpS9 = [];
    for (var i = 1; i < points.length; i++) {
        var middlePos = cc.pMidpoint(points[i - 1], points[i]);
        var distance = cc.pDistance(points[i - 1], points[i]);
        var rotation = FT.Calc.getTwoPointShootAngle(points[i - 1], points[i]);//cc.pAngle(points[i-1],points[i]);//

        var width = width;
        var height = distance + 5;
        var capInsets = cc.rect(0, 0, width, height);
        var originRect = cc.rect(0, 0, width, height);
        var sprite9 = new cc.Scale9Sprite();
        sprite9.updateWithBatchNode(batchNode, originRect, false, capInsets);
        sprite9.setPosition(middlePos);
        //cc.log("middlePos:"+JSON.stringify(middlePos));
        sprite9.setAnchorPoint(0.5, 0.5);
        sprite9.setRotation(rotation);
        arrTmpS9.push(sprite9);

    }
    return arrTmpS9;
};
FT.Calc = FT.Calc || {};

//合并paytable
FT.Calc.bindPaytableFunc = function (slotsID) {

    //计算过了就不在计算了
    if (FT.config['IsCalcData' + slotsID]) {
        return;
    }
    console.log("GameCtr.DataCtr.prototype.bindPaytableFunc");
	var SlotsCombinationPayTable_Test=require('./GD_SlotsCombinationPayTable_Test');
	var SlotsPayTable_Test=require('./GD_SlotsPayTable_Test');

    var tmpCombinationPayTable = SlotsCombinationPayTable_Test;
    var tmpSlotsPayTable = SlotsPayTable_Test;

    var numLenBefore = tmpSlotsPayTable.length;
    console.log("进入" + slotsID + "台老虎机 准备计算paytable");
    console.log("paytable计算前的长度:" + numLenBefore);
    var arrCurSlotsCombiPt = [];
    for (var i = 0, lenI = tmpCombinationPayTable.length; i < lenI; i++) {
        if (tmpCombinationPayTable[i]['SlotsID'] == slotsID) {
            arrCurSlotsCombiPt.push(tmpCombinationPayTable[i]);
        }
    }
    var tmpSlotsCombinationPayTable = [arrCurSlotsCombiPt];//SlotsCombinationPayTable_Test
    var tmpPayTable = [tmpSlotsPayTable];
    for (var m = 0, lenM = tmpSlotsCombinationPayTable.length; m < lenM; m++) {
        for (var i = 0, lenI = tmpSlotsCombinationPayTable[m].length; i < lenI; i++) {//2 4 1111 1112 1121 1122 1211 1212 1221 1222

            var combiData = tmpSlotsCombinationPayTable[m][i];
            var arrFilterPT = tmpSlotsPayTable.filter(function (e) {
                return e['SlotsID'] == combiData['SlotsID'];
            });
            var funcSetKey = function (arrs) {

                for (var j = 0, lenJ = arrs.length; j < lenJ; j++) {
                    var tmpData = {
                        "SlotsID": "1",
                        "PayTableID": "1",
                        "Symbols": "wild&wild&wild&wild&wild",
                        "Multiplier": "3.5",
                        "IsOpenRandom": false
                    };
                    tmpData['SlotsID'] = combiData['SlotsID'];
                    tmpData['Multiplier'] = combiData['Multiplier'];
                    tmpData['IsOpenRandom'] = combiData['IsOpenRandom'];
                    tmpData['Symbols'] = arrs[j];// arrs[j].join("&"); //11111
                    //console.log("arrs[j]:"+JSON.stringify(arrs[j]));

                    tmpData['Weight'] = combiData['Weight'];
                    //出现过得不在计算
                    var isSame = false;
                    for (var k = 0, lenK = arrFilterPT.length; k < lenK; k++) {
                        if (tmpData['Symbols'] === arrFilterPT[k]['Symbols']) {
                            isSame = true;
                        }

                    }
                    !isSame && tmpPayTable[m].push(tmpData);
                }
            };
            var arrCombiID = combiData['CombinationID'];
            var arrCombiBID = combiData['ComboName'];
            var arrCombiLastID = combiData['ComboLastName'];
            var disCount = Number(combiData['DisCount']);
            //只有CombinationID 时 元素可以相同重复 111 222
            if (arrCombiID && !arrCombiBID) {
                var arrs = FT.Calc.arrCombi(disCount, arrCombiID.split("&"));//FT.Calc.randomArrsRange2(disCount, arrCombiID.split("&"), 0); //11111
                funcSetKey(arrs);
            }
            //有CombinationID 有ComboName 时 元素可以相同重复 111 222 必须包含 有CombinationID
            else if (arrCombiID && arrCombiBID) {
                var tmpArrKey = arrCombiID.split("&").concat(arrCombiBID.split("&"));
                tmpArrKey = FT.Calc.delRepeatArr(tmpArrKey);
                //console.log("tmpArrKey11:" + tmpArrKey);
                var mustCombiID = arrCombiID.split("&");
                var arrs = FT.Calc.arrCombi(disCount, tmpArrKey);//FT.Calc.randomArrsRange2(disCount, tmpArrKey, 0); //11111
                //剔除没包含arrCombiID的数组
                var arrFinal = [];
                for (var l = 0, lenL = arrs.length; l < lenL; l++) {
                    var findIndex = 0;
                    var arrSplitData = arrs[l].split("&"); ////11111
                    /*for (var j = 0; j < arrs[l].length; j++) {
                     for (var k = 0; k < mustCombiID.length; k++) {
                     if (arrs[l][j] == mustCombiID[k]) {
                     findIndex++;
                     break;
                     }
                     }
                     }*/
                    for (var j = 0, lenJ = arrSplitData.length; j < lenJ; j++) {
                        for (var k = 0, lenK = mustCombiID.length; k < lenK; k++) {
                            if (arrSplitData[j] == mustCombiID[k]) {
                                findIndex++;
                                break;
                            }
                        }
                    }
                    if (findIndex >= mustCombiID.length) {
                        arrFinal.push(arrs[l]);
                    }
                }
                funcSetKey(arrFinal);
            }
            //只存在 ComboLastName 第二台所有的paytable后面 加一个 arrCombiLastID
            else if (!arrCombiID && !arrCombiBID && arrCombiLastID) {
                //console.log("enter this place!");
                for (var j = 0; j < tmpPayTable[m].length; j++) {
                    var clonePayTable = FT.Object.clone(tmpPayTable[m][j]);
                    if (Number(tmpPayTable[m][j]['SlotsID']) == Number(combiData['SlotsID'])) {
                        for (var k = 0; k < arrCombiLastID.split("&").length; k++) {
                            var combiTmpData = arrCombiLastID.split("&")[k];
                            if (combiTmpData) {
                                if (k == 0) {
                                    tmpPayTable[m][j]['Symbols'] = tmpPayTable[m][j]['Symbols'].concat("&" + combiTmpData);
                                }
                                else {
                                    var tmpPayTableLine = FT.Object.clone(clonePayTable);
                                    tmpPayTableLine['Symbols'] = tmpPayTableLine['Symbols'].concat("&" + combiTmpData);
                                    tmpPayTable[m].splice(j + 1, 0, tmpPayTableLine);
                                }
                            }
                        }
                        j += arrCombiLastID.split("&").length;
                        j--;
                    }
                }
            }
        }
    }
    FT.config['IsCalcData' + slotsID]=true;
    //字符全部转成数组
    /*for (var i = 0, lenI = tmpPayTable.length; i < lenI; i++) {
        for (var j = 0, lenJ = tmpPayTable[i].length; j < lenJ; j++) {
            if ("[object String]" == Object.prototype.toString.call(tmpPayTable[i][j]['Symbols'])) {
                tmpPayTable[i][j]['Symbols'] = tmpPayTable[i][j]['Symbols'].split("&");
            }
        }

    }*/
    var numLenAft = tmpSlotsPayTable.length;
    console.log("paytable计算后的长度:" + numLenAft);
};
//计算二维数组的排列组合
FT.Calc.doExchange2 = function (doubleArrays) {
    // 二维数组，最先两个数组组合成一个数组，与后边的数组组成新的数组，依次类推，知道二维数组变成以为数组，所有数据两两组合
    var len = doubleArrays.length;
    if (len >= 2) {
        var arr1 = doubleArrays[0];
        var arr2 = doubleArrays[1];
        var len1 = arr1.length;
        var len2 = arr2.length;
        var newLen = len1 * len2;
        var temp = new Array(newLen);
        var index = 0;
        for (var i = 0; i < len1; i++) {
            for (var j = 0; j < len2; j++) {
                temp[index++] = arr1[i] + ',' + arr2[j];
            }
        }
        var newArray = new Array(len - 1);
        newArray[0] = temp;
        if (len > 2) {
            var _count = 1;
            for (var i = 2; i < len; i++) {
                newArray[_count++] = doubleArrays[i];
            }
        }
        return FT.Calc.doExchange2(newArray);
    } else {
        return doubleArrays[0];
    }
};
/**
 * 计算权重所在索引
 * @param doubleArrays {Array} 二维数组
 * 例:
 * var arr2 = [
 [1, 2, 3],
 [4, 5, 6],
 [7, 8, 9],
 [10,11,12,13]
 ];
 * @param strJoin {String} 是否加入拼接字符串
 * @returns doubleArrays {Array} 数组
 */
FT.Calc.doExchange = function (doubleArrays, strJoin) {
    var len = doubleArrays.length;

   // console.log("doExchange temp:" + JSON.stringify(doubleArrays));
    if (len >= 2) {
        var len1 = doubleArrays[0].length;
        var len2 = doubleArrays[1].length;
        var newlen = len1 * len2;
        var temp = new Array(newlen);
        var index = 0;
        for (var i = 0; i < len1; i++) {
            for (var j = 0; j < len2; j++) {
                if (strJoin) {
                    temp[index] = "" + doubleArrays[0][i] + strJoin + doubleArrays[1][j];
                }
                else {
                    temp[index] = "" + doubleArrays[0][i] + doubleArrays[1][j];
                }
                index++;
            }
        }
        var newArray = new Array(len - 1);
        for (var i = 2; i < len; i++) {
            newArray[i - 1] = doubleArrays[i];
        }
        newArray[0] = temp;
        return FT.Calc.doExchange(newArray, strJoin);
    }
    else {
        return doubleArrays[0];
    }
};
//删除数组中相同的元素
FT.Calc.delRepeatArr = function (arr) {
    var newArray = [];
    var provisionalTable = {};
    for (var i = 0, item; (item = arr[i]) != null; i++) {
        if (!provisionalTable[item]) {
            newArray.push(item);
            provisionalTable[item] = true;
        }
    }
    return newArray;
};
FT.Calc.sortNum = function (data, operator) {
    data.sort(function (x, y) {
        if (operator == "从小到大") {
            //cc.log("从小到大");
            if (Number(x) < Number(y)) {
                return -1;
            }
            else {
                return 1;
            }
        }
        else if (operator == "从大到小") {
            //cc.log("从大到小");
            if (Number(x) > Number(y)) {
                return -1;
            }
            else if (Number(x == Number(y))) {
                return -1;
            }
            else {
                return 1;
            }
        }
    });
};
FT.Calc.sortDataByKey = function (data, key, operator) {
    data.sort(function (x, y) {
        if (operator == "从小到大") {
            //cc.log("从小到大");
            if (Number(x[key]) < Number(y[key])) {
                return -1;
            }
            else {
                return 1;
            }
        }
        else if (operator == "从大到小") {
            //cc.log("从大到小");
            if (Number(x[key]) > Number(y[key])) {
                return -1;
            }
            else if (Number(x[key] == Number(y[key]))) {
                return -1;
            }
            else {
                return 1;
            }
        }
    });
};
FT.Calc.bubbleSort3Arr = function (arr, returnArr, returnArr2) {
    //arr=FT.Object.clone(arr);
    for (var i = 0; i < arr.length - 1; i++) {//比较的次数是length-1
        for (var j = 0; j < arr.length - 1 - i; j++) {
            if (Number(arr[j]) < Number(arr[j + 1])) {
                var tmp = arr[j + 1];
                arr[j + 1] = arr[j];
                arr[j] = tmp;


                var tmp = returnArr[j];
                returnArr[j] = returnArr[j + 1];
                returnArr[j + 1] = tmp;
                var tmp = returnArr2[j];
                returnArr2[j] = returnArr2[j + 1];
                returnArr2[j + 1] = tmp;
            }
        }
    }
};
FT.Calc.getLocalTime = function (isTime) {
    return isTime ? Math.floor(Date.now() / 1000) : new Date().getTime();//
};
FT.Calc.random = function (begin, end, isFloat) {
    if (!isFloat) {
        //不包括end
        return Math.floor(Math.random() * (end - begin)) + begin;
    }
    else {
        return Math.random() * (end - begin) + begin;
    }
};
//参数传一个小于1的浮点型数据 计算0~1是否命中该概率
FT.Calc.floatRate = function (rate) {
    if (!rate) {
        return false;
    }
    var randomRate = FT.Calc.random(0, Number(1), true);
    if (randomRate < Number(rate)) {
        return true;
    }
    return false;
};
//随机true false
FT.Calc.randomIs = function () {
    var num = FT.Calc.random(0, 2);
    return num ? true : false;
};
/**
 * 计算权重所在索引 [1,3,4,5,100,1004]
 * @param arrWeight {Array}
 * @returns i {Number} 返回所在的权重区间索引 return值从0开始
 */
FT.Calc.weightIndex = function (arrWeight) {
    if (Object.prototype.toString.call(arrWeight) == "[object Array]") {
        var leftNum = Number(arrWeight.slice(0, 1));
        var rightNum = Number(arrWeight[arrWeight.length - 1]);
        //cc.log("leftNum:" + leftNum);
        //cc.log("rightNum:" + rightNum);
        var rNum = FT.Calc.random(leftNum, rightNum);
        for (var i = 0; i < arrWeight.length; i++) {
            if (arrWeight[i] && arrWeight[i + 1]) {
                var left = Number(arrWeight[i]);
                var right = Number(arrWeight[i + 1]);
                if (left <= rNum && right > rNum) {
                    return i;
                }
            }
        }
    }
};
/**
 * 计算短权重所在索引 [1,3,1,5,3,10,4]
 * @param arrWeight {Array} 数组或字符串
 * @returns i {Number} 返回所在的权重区间索引 return值从0开始
 */
FT.Calc.weightShortIndex = function (arrWeight) {
    if (Object.prototype.toString.call(arrWeight) == "[object String]") {
        if (arrWeight.indexOf("&") != -1) {
            arrWeight = arrWeight.split("&");
        }
    }
    if (Object.prototype.toString.call(arrWeight) == "[object Array]") {
        var tmpArrWeight = [];
        for (var i = 0, lenI = arrWeight.length; i < lenI; i++) {
            tmpArrWeight.push(Number(arrWeight[i]) + (tmpArrWeight.length && tmpArrWeight[tmpArrWeight.length - 1]));
        }
        cc.log("weightShortIndex:" + JSON.stringify(tmpArrWeight));
        var leftNum = Number(tmpArrWeight[0]);
        var rightNum = Number(tmpArrWeight[tmpArrWeight.length - 1]);
        //cc.log("leftNum:" + leftNum);
        //cc.log("rightNum:" + rightNum);
        var rNum = FT.Calc.random(leftNum, rightNum);
        for (var i = 0; i < tmpArrWeight.length; i++) {
            if (tmpArrWeight[i] && tmpArrWeight[i + 1]) {
                var left = Number(tmpArrWeight[i]);
                var right = Number(tmpArrWeight[i + 1]);
                if (left <= rNum && right > rNum) {
                    return i;
                }
            }
        }
    }
};
/**
 * 计算范围随机值 //不包括end
 * @param len {cc.Rect}
 * @param begin {Number}
 * @param end {Number}
 * @param isRepeat {boolean}
 * @returns {Array}
 */
FT.Calc.randomRange = function (len, begin, end, isRepeat) {
    var r = [];
    while (r.length < len) {
        var p = FT.Calc.random(begin, end);
        if (isRepeat) {
            r.push(p);
        }
        else {
            if (r.indexOf(p) == -1)r.push(p);
        }
    }
    return r;
};
//
/**
 * 10个数 取四个数
 * @param len {Number} 10个球
 * @param rlen {Number} 取3个球
 * @param isOrderRepeat {boolean} 是否顺序重复 false 即：123 321 算一个
 * @returns {Number}
 */
FT.Calc.mul = function (len, rlen, isOrderRepeat) {
    var result = 1;
    var rlenT = rlen;
    while (rlen) {
        rlen--;
        result = result * (len - rlen);
    }
    if (!isOrderRepeat) {
        var l = 1;
        var r = 1;
        while (l < rlenT) {
            l++;
            r = r * l;
        }
        result /= r;
    }
    return result;
};
/**
 * 10个数 取四个数
 * @param len {Number} 10个球
 * @param rlen {Number} 取3个球
 * @param repeatMode {boolean}0、可以相同重复 111 222 1、完全不同 123、321  2、完全不同 且不能顺序重复 false 即：123 321 算一个
 * @returns {Number}
 */
FT.Calc.mulNum = function (len, rlen, repeatMode) {
    len = Number(len);
    rlen = Number(rlen);
    var result = 1;
    var rlenT = rlen;
    if (repeatMode == 0) {
        return Math.pow(len, rlen);
    }
    if (repeatMode == 1) {
        while (rlen) {
            rlen--;
            result = result * (len - rlen);
        }
    }
    if (repeatMode == 2) {
        var l = 1;
        var r = 1;
        while (l < rlenT) {
            l++;
            r = r * l;
        }
        result /= r;
    }
    return result;
};
/**
 * 计算二维数组的排列组合
 * @param len {Number} 取长度为3的数组 3
 * @param arr {Number} 混合格子
 * @returns {Array}
 */
FT.Calc.arrCombi = function (len, arr) {
    var tmpArr = [];
    for (var i = 0, lenI = len; i < lenI; i++) {
        var tmpArr2 = [];
        for (var j = 0, lenJ = arr.length; j < lenJ; j++) {
            tmpArr2.push(arr[j]);
        }
        tmpArr.push(tmpArr2);
    }
    var arrAllCombi = FT.Calc.doExchange(tmpArr, "&");
    /*   for(var i = 0, lenI = arrAllCombi.length; i < lenI; i++)
     {
     arrAllCombi[i]=arrAllCombi[i].split("&");
     }*/
    return arrAllCombi;
};
/**
 * 计算范围随机数组 //不包括end
 * @param len {Number} 取长度为3的数组 3
 * @param arr {Number} 在该数组中取值  在arr中取长度为len的数组n个 （n为阶乘）
 * @param repeatMode {String} 是否允许数组内元素重复repeatMode {boolean}0、可以相同重复 111 222 1、完全不同 123、321  2、完全不同 且不能顺序重复 false 即：123 321 算一个
 * @param arrMustExist {Array} 必须包含的数组元素
 * @returns {Array}
 */
FT.Calc.randomArrsRange2 = function (len, arr, repeatMode, arrMustExist) {
    var mulNum = FT.Calc.mulNum(arr.length, len, repeatMode);
    var resultArrs = [];
    while (resultArrs.length < mulNum) {
        var r = [];
        while (r.length < len) {
            var p = FT.Calc.random(0, arr.length);
            if (repeatMode == 0) {
                r.push(arr[p]);
            }
            else if (repeatMode == 1 || repeatMode == 2) {
                if (r.indexOf(arr[p]) == -1)r.push(arr[p]);
            }
        }
        if (!FT.Calc.isSameArrRange(r, resultArrs, repeatMode))resultArrs.push(r);
    }
    if (arrMustExist) {
        for (var i = 0; i < resultArrs.length; i++) {
            if (arrMustExist.length <= resultArrs[i].length) {
                var count = 0;
                for (var j = 0; j < arrMustExist.length; j++) {
                    if (resultArrs[i].indexOf(arrMustExist[j]) != -1) {
                        count++;
                    }
                }
                if (count < arrMustExist.length) {
                    //删除不相等的数组
                    resultArrs.splice(i, 1);
                    i--;
                }
            }
            else {
                resultArrs.splice(i, 1);
                i--;
            }
        }
    }
    return resultArrs;
};
//
/**
 * 这个数组组合是否在  一个大数组中出现
 * @param arr {Array}
 * @param arrs {Array}
 * @param repeatMode {String} repeatMode {boolean}0、可以相同重复 111 222 1、完全不同 123、321  2、完全不同 且不能顺序重复 false 即：123 321 算一个
 * @returns {boolean}
 */
FT.Calc.isSameArrRange = function (arr, arrs, repeatMode) {
    if (repeatMode == 0 || repeatMode == 1) {
        for (var i = 0; i < arrs.length; i++) {
            if (arr.length == arrs[i].length) {
                var isSame = false;
                for (var j = 0; j < arrs[i].length; j++) {
                    if (arr[j] == arrs[i][j]) {
                        isSame = true;
                    }
                    else {
                        isSame = false;
                    }
                    if (!isSame) {
                        break;
                    }
                }
                if (isSame) {
                    return true;
                }
            }
        }
    }
    else if (repeatMode == 2) {
        for (var i = 0; i < arrs.length; i++) {
            if (arr.length == arrs[i].length) {
                //上面的方法也可用此方法
                if (arrs[i].sort().toString() == arr.sort().toString()) {
                    return true;
                }
            }
        }
    }
    return false;
};
/**
 * 矩形与矩形或点的碰撞检测
 * @param rect {cc.Rect} 矩形
 * @param rect2pos {cc.Rect || cc.Position} 点
 * @returns {boolean}
 */
FT.Calc.hitTestRect2 = function (rect, rect2pos) {
    try {
        if (rect2pos instanceof cc.Rect) {
            return cc.rectIntersectsRect(rect, rect2pos);
        } else {
            return cc.rectContainsPoint(rect, rect2pos);
        }
    }
    catch (e) {
    }
};

/**
 * 矩形与圆的碰撞检测
 * @param rect {cc.Rect}矩形
 * @param cx 圆心x坐标
 * @param cy 圆心y坐标
 * @param r 圆半径
 * @returns {boolean}
 */
FT.Calc.hitTestRectArc = function (rect, cx, cy, r) {
    /** 圆心与矩形中心的相对坐标*/
    var rx = cx - (rect.x + rect.width * 0.5);
    var ry = cy - (rect.y + rect.height * 0.5);
    var dx = Math.min(rx, rect.width * 0.5);
    var dx1 = Math.max(dx, -rect.width * 0.5);
    var dy = Math.min(ry, rect.height * 0.5);
    var dy1 = Math.max(dy, -rect.height * 0.5);
    return (dx1 - rx) * (dx1 - rx) + (dy1 - ry) * (dy1 - ry) <= r * r;
};

/**
 * 多边形碰撞
 * @param ax {Number} 第一个多边形的偏移x
 * @param ay {Number} 第一个多边形的偏移y
 * @param ashape {Array}第一个多边形的点数据
 * @param bx {Number}
 * @param by {Number}
 * @param bshape {Array}
 * @returns {boolean}
 */
FT.Calc.hitTestPolygon = function (ax, ay, ashape, bx, by, bshape) {
    for (var ia = 0, la = ashape.length; ia < la; ia++) {
        var ax0 = ashape[ia].x, ay0 = ashape[ia].y, ax1, ay1;
        if (ia == la - 1) {
            ax1 = ashape[0].x;
            ay1 = ashape[0].y;
        } else {
            ax1 = ashape[ia + 1].x;
            ay1 = ashape[ia + 1].y;
        }
        for (var ib = 0, lb = bshape.length; ib < lb; ib++) {
            var bx0 = bshape[ib].x, by0 = bshape[ib].y, bx1, by1;
            if (ib == lb - 1) {
                bx1 = bshape[0].x;
                by1 = bshape[0].y;
            } else {
                bx1 = bshape[ib + 1].x;
                by1 = bshape[ib + 1].y;
            }
            var hitTest = _hitTestPolygonLine(ax + ax0, ay + ay0, ax + ax1, ay + ay1, bx + bx0, by + by0, bx + bx1, by + by1);
            if (hitTest) return true;
        }
    }
    /**
     * 多边形碰撞中的一条边碰撞
     */
    function _hitTestPolygonLine(ax0, ay0, ax1, ay1, bx0, by0, bx1, by1) {
        return cc.pCross(cc.p(ax0 - bx0, ay0 - by0), cc.p(bx1 - bx0, by1 - by0)) * cc.pCross(cc.p(ax1 - bx0, ay1 - by0), cc.p(bx1 - bx0, by1 - by0)) <= 0 && cc.pCross(cc.p(bx0 - ax0, by0 - ay0), cc.p(ax1 - ax0, ay1 - ay0)) * cc.pCross(cc.p(bx1 - ax0, by1 - ay0), cc.p(ax1 - ax0, ay1 - ay0)) <= 0;
    }

    return false;
};
//FT.Calc.getRandomRangePoint([cc.p(648.0,301.6),cc.p(1284.0,295.6),cc.p(701.7,149.3),cc.p(1331.7,152.3)]);
//FT.Calc.getRandomRangePoint([cc.p(x1,y1),cc.p(x2,y2)...])
FT.Calc.getRandomRangePoint = function (points) {
    if (points) {
        //[cc.p(-568, 0), cc.p(-668, -400), cc.p(668, -400), cc.p(568, 0)]
        for (var i = 0, minx = Infinity, miny = Infinity, maxx = -Infinity, maxy = -Infinity; i < points.length; i++) {
            minx = Math.min(points[i].x, minx);//-668
            miny = Math.min(points[i].y, miny);//-400
            maxx = Math.max(points[i].x, maxx);//668
            maxy = Math.max(points[i].y, maxy);//0
        }
    }
    do
    {
        var point = cc.p(FT.Calc.random(minx, maxx, true), FT.Calc.random(miny, maxy, true));
        var is = FT.Calc.getIsPolygonRange(point, points);
    }
    while (is);
    return point;
};
//curPoint是你要判断的点 points是多边形的顶点集合
//FT.Calc.getIsPolygonRange(cc.p(x,y),[cc.p(x1,y1),cc.p(x2,y2)...])
FT.Calc.getIsPolygonRange2 = function (curPoint, points) {

    var counter = 0;
    for (var i = 0, p1, p2; i < points.length; i++) {
        p1 = points[i];
        p2 = points[(i + 1) % points.length];
        if (p1.y == p2.y || curPoint.y <= Math.min(p1.y, p2.y) || curPoint.y >= Math.max(p1.y, p2.y)) {
            continue;
        }
        var x = (curPoint.y - p1.y) * (p2.x - p1.x) / (p2.y - p1.y) + p1.x;
        if (x > curPoint.x) counter++;
    }

    return (counter % 2 == 0) ? (false) : (true);
};

FT.Calc.getIsPolygonRange = function (point, vs) {
    // ray-casting algorithm based on
    // http://www.ecse.rpi.edu/Homepages/wrf/Research/Short_Notes/pnpoly.html

    var x = point[0], y = point[1];

    var inside = false;
    for (var i = 0, j = vs.length - 1; i < vs.length; j = i++) {
        var xi = vs[i][0], yi = vs[i][1];
        var xj = vs[j][0], yj = vs[j][1];

        var intersect = ((yi > y) != (yj > y))
            && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
        if (intersect) inside = !inside;
    }

    return inside;
};
//给二点  判断从点1 射向 点2 时角度方法
FT.Calc.getTwoPointShootAngle = function (locPos, locToPos) {
    if (arguments.length == 2) {
        /*if(locPos.x==locToPos.x&&locPos.y==locToPos.y)
         {
         return 0;
         }*/
        var locPosX = locPos.x;
        var locPosY = locPos.y;
        var locToPosX = locToPos.x;
        var locToPosY = locToPos.y;
        //计算-通过反正切函数计算角度值
        var angle = Math.atan((locToPosY - locPosY) / (locToPosX - locPosX)) * 180 / Math.PI;
        //cc.log("计算之前的角度:" + angle + " " + "locToPosY:" + locToPosY + " " + "locToPosX:" + locToPosX + " " + "locPosY:" + locPosY + " " + "locPosX:" + locPosX);
        if (locToPosY >= locPosY) {
            if (locToPosX >= locPosX && locToPosY >= locPosY) {
                angle = 90 - angle;
            }
            else if (locToPosX < locPosX && locToPosY > locPosY) {
                angle = -(90 - Math.abs(angle));
            }
        }
        else if (locToPosY < locPosY) {
            if (locToPosX < locPosX && locToPosY < locPosY) {
                angle = 180 + (90 - angle);
            }
            else if (locToPosX >= locPosX && locToPosY <= locPosY) {
                angle = 180 - (90 - Math.abs(angle));
            }
        }
        else {
            cc.log("Error: getTwoPointShootAngle 角度不正常");
        }
        return angle;
    }
    else {
        cc.log("Error: getTwoPointShootAngle 参数个数不正确");
        return null;
    }
};


FT.Object = FT.Object || {};
/**
 * 前方补0
 * @param num 数字
 * @param digit 位数
 * @returns {string} 字符
 */
FT.Object.num2str = function (num, digit) {
    var str = num + "";
    var count = digit - str.length;
    var result = "";
    for (var i = 0; i < count; i++) {
        result += "0";
    }
    return result + str;
};
/*
 * FT.Object.getChildByName(this.rootNode,2);
 */
FT.Object.getChildByName = function (root, name) {
    if (!root)
        return null;
    try {
        if (root.getName() === name)
            return root;
        var arrayRootChildren = root.getChildren();
        var length = arrayRootChildren.length;
        for (var i = 0; i < length; i++) {
            var child = arrayRootChildren[i];
            var res = FT.Object.getChildByName(child, name);
            if (res)
                return res;
        }
        return null;
    }
    catch (e) {
    }
};
//克隆 深复制对象
FT.Object.clone = function (obj) {
    if (typeof(obj) == 'object') {
        var result = obj instanceof Array ? [] : {};
        for (var i in obj) {
            if (obj.hasOwnProperty(i)) {
                var attr = obj[i];
                if (attr === null) {
                    //当前执行的函数的引用
                    result[i] = null;
                }
                else {
                    //当前执行的函数的引用
                    result[i] = arguments.callee(attr);
                }

            }

        }
        return result;
    } else {
        return obj;
    }
};
FT.Data = FT.Data || {};
FT.Data.createArrByStr = function (data, key) {
    return data.split(key);
};
FT.Data.getSameKeyArr = function (data, key, sameKey) {
    if (!data) {
        data = [];
    }
    var curData = [];
    var i = 0;
    for (i = 0; i < data.length; i++) {
        if (data[i][key] == sameKey) {
            curData.push(data[i]);
        }
    }
    return curData;
};
/**
 * 判断元素是否在数组中
 * @param el {Object} 元素
 * @param arr {Array} 数组
 * @returns {boolean}
 */
FT.Data.isInArray = function (el, arr) {
    if (arr.indexOf(el) != -1) {
        return true;
    }
    return false;
};
/**
 * 2个数组中是否有相同元素
 * @param arr1 {Array} 数组1
 * @param arr2 {Array} 数组2
 * @returns {boolean}
 */
FT.Data.isSameElTwoArray = function (arr1, arr2) {
    for (var i = 0; i < arr1.length; i++) {
        var flag = FT.Data.isInArray(arr1[i], arr2);
        if (flag) return true;
    }
    return false;
};
FT.Data.getSameKeyObj = function (data, key, sameKey) {
    var i = 0;
    for (i = 0; i < data.length; i++) {
        if (data[i][key] == sameKey) {
            return data[i];
        }
    }
};
//删除数组中相同的元素
FT.Data.delRepeatArr = function (arr) {
    var newArray = [];
    var provisionalTable = {};
    for (var i = 0, item; (item = arr[i]) != null; i++) {
        if (!provisionalTable[item]) {
            newArray.push(item);
            provisionalTable[item] = true;
        }
    }
    return newArray;
};
////[[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,"2_2","3_2"],[0,"2_2","3_2"],[0,"2_2",0],[0,"2_2",0],["1_2",0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,"2_2",0],[0,"2_2",0],[0,"2_2",0],[0,"2_2",0],[0,0,0],["1_1","2_2",0],["1_3","2_2","3_2"]]
////取出从左到右 不为0的位置数组
//以上数组通过该方法 得到[ [1_3,2_2,3_2],[1_2],[1_1,2_2] ]
FT.Data.getOrderNo0Arr = function (arr2) {
    //读取到第一个0的序列后截取之前的数组
    for (var i = 0; i < arr2.length; i++) {
        var maxIndex = 0;

        for (var j = 0; j < arr2[i].length; j++) {
            if (arr2[i][j] == 0) {
                //
                arr2[i] = arr2[i].slice(0, j);
                //如果长度为0 删除
                if (arr2[i].length == 0) {
                    arr2.splice(i, 1);
                    i--;
                    break;

                }
            }
        }
    }
};
//取出【1，2，3，4，1】最大的数组索引
FT.Data.getMaxIndexInArr = function (arr) {
    var max = 0;
    for (var i = 0; i < arr.length; i++) {
        max = Math.max(max, arr[i]);
    }

    for (var i = 0; i < arr.length; i++) {
        if (max == arr[i]) {
            return i;
        }

    }
};
//取数组中每个元素的最大值 得到一个数组 [[0,0,0],[0,0,0],[0,0,1],[0,0,0]]
FT.Data.getMaxNumInArr = function (arr) {
    var tmpArr = [];
    var maxLen = 0;
    for (var i = 0; i < arr.length; i++) {
        maxLen = Math.max(maxLen, arr[i].length);
    }
    for (var i = 0; i < maxLen; i++) {
        tmpArr.push(0);
    }
    for (var i = 0; i < arr.length; i++) {
        for (var j = 0; j < arr[i].length; j++) {
            tmpArr[j] = Math.max(tmpArr[j], arr[i][j]);
        }
    }
    return tmpArr;
};
//获取到相同的key值 返回true
FT.Data.getIsHaveKey = function (data, key, sameKey) {
    var i = 0;
    for (i = 0; i < data.length; i++) {
        if (data[i][key] == sameKey) {
            return true;
        }
    }
    return false;
};
//数组中是否存在该值
FT.Data.isExistInArr = function (arr, key) {
    for (var i = 0, len = arr.length; i < len; i++) {
        if (arr[i] == key) {
            return true;
        }
    }
    return false;
};
//数组中取最大值
FT.Data.getArrMaxNum = function (arr) {
    var maxNum = -Infinity;
    for (var i = 0; i < arr.length; i++) {
        maxNum = Math.max(maxNum, Number(arr[i]));
    }
    return maxNum;
};
//删除json数组中  json中相同的key
FT.Data.delRepeatArrByKey = function (data, key) {
    var i, j = 0;
    for (i = 0; i < data.length; i++) {
        for (j = 0; j < data.length; j++) {
            if (i != j) {
                if (data[i]) {
                    if (data[i][key] == data[j][key]) {
                        //删除后面的
                        data.splice(j, 1);
                        i = 0;
                        break;
                    }
                }
            }
        }
    }
    return data;
};
//删除json数组中  json中相同的key
FT.Data.delRepeatArrBySomeKey = function (data, keyName, keyValue) {
    var i, j = 0;
    for (i = 0; i < data.length; i++) {
        if (data[i]) {
            if (data[i][keyName] == keyValue) {
                //删除后面的
                data.splice(i, 1);
                i = -1;
            }
        }

    }
    return data;
};
//删除嵌套数组中len为0的数组
FT.Data.del0LenInArrs = function (arrs) {
    for (var i = 0; i < arrs.length; i++) {
        if (arrs[i].length == 0) {
            arrs.splice(i, 1);
            i--;
        }
    }
    return arrs;
};
FT.Action = FT.Action || function () {
        defaultAttribute = {
            'tag': 80,
            'easeMove': null,//cc.EaseElastic,
            'speed': 1,
            'rType': null//cc.RepeatForever
        }
    };
FT.Action.defaultAttribute = {
    'tag': 80,
    'easeMove': null,//cc.EaseElastic,
    'speed': 1,
    'rType': null//cc.RepeatForever
};
/*
 * FT.Action.setNodeOpacity(this.rootNode,255);
 */
FT.Action.setNodeOpacity = function (parent, opacity, data) {

    if (data && parent.getOpacity && parent.getOpacity() == data['isNoOpacityValue']) {
        return;
    }

    if (parent.getOpacity) {
        parent.setOpacity(opacity);
    }
    if (parent.getChildrenCount() > 0) {
        var children = parent.getChildren();
        for (var i in children) {
            if (children.hasOwnProperty(i))
                arguments.callee(children[i], opacity, data);
        }
    }// PVP WENZI
};
/*
 * FT.fade(this.sp,cc.fadeTo,[0.5,255],0);
 * FT.fade(this.sp,cc.fadeTo,0.5,0,{'tag':80,'speed':1,'easeMove':cc.EaseElastic,'rType':cc.RepeatForever});
 */
FT.Action.fade = function (sp, type, ft, wt, data) {
    if (sp.getOpacity) {
        var action = null;
        if (data && data['isNoOpacityValue']) {
            if (sp.getOpacity() == data['isNoOpacityValue']) {
                return;
            }
        }
        if (!data) {
            data = FT.Action.defaultAttribute;
        }
        if (!data['tag']) {
            data['tag'] = FT.Action.defaultAttribute.tag;
        }
        if (!data['speed']) {
            data['speed'] = 1;
        }
        if (data['easeMove']) {
            if (type == cc.fadeTo) {
                action = data['easeMove'](type(ft[0], ft[1]));
            }
            else {
                action = data['easeMove'](type(ft));
            }
        } else {
            if (type == cc.fadeTo) {
                action = type(ft[0], ft[1]);
            }
            else {
                action = type(ft);
            }
        }
        if (data['rType']) {
            action = data['rType'](cc.sequence(cc.delayTime(wt), action));
        } else {
            action = cc.sequence(cc.delayTime(wt), action);
        }
        action = sp.runAction(cc.speed(action, data['speed']));
        action.setTag(data['tag']);
    }
    if (sp.getChildrenCount() > 0) {
        var children = sp.getChildren();
        for (var i in children) {
            if (children.hasOwnProperty(i))
                arguments.callee(children[i], type, ft, wt, data);
        }
    }
};
//设置本地存储 //需唯一的本地标识 
FT.storage = {
    setLocalData: function (_key, _data) {
        sys.localStorage.setItem(_key, _data);
    },
    getLocalData: function (_key) {
        var _data = sys.localStorage.getItem(_key);

        //null 或者 undefined
        if (_data == null)//if (!_data)
        {
            return null;
        }
        return _data;

    }
};
/**
 * 显示提示信息
 * @param scene {ui.Scene | cc.Scene | null} 场景
 * @param str {String} 文字
 * @param time {*|number} 秒
 * @param y {*|number} y坐标
 * @param x {*|number} x坐标
 */
FT.showTip = function (str, time, y, x) {
    var t = time ? time : 1.5;
    var _x = x ? x : FT.config.ui.w;
    var _y = y ? y : FT.config.ui.h / 2;
    var scene = cc.director.getRunningScene();
    if (!scene) return FT.log("tip显示错误", "找不到scene!");
    var tipBox = new cc.DrawNode();
    scene.addChild(tipBox);
    var tf = new cc.LabelTTF(str, "微软雅黑", 28, cc.size(0, 0), cc.TEXT_ALIGNMENT_CENTER);
    tipBox.setPosition(FT.config.w, -tf.getContentSize().height * 2);
    tipBox.drawSegment(cc.p(tf.x - tf.getContentSize().width / 2, tf.y), cc.p(tf.x + tf.getContentSize().width / 2, tf.y), tf.getContentSize().height / 1.2, cc.hexToColor("#4D4D4D"));
    tipBox.addChild(tf);
    tipBox.setOpacity(0);
    var moveTo = cc.moveTo(0.3, cc.p(_x, _y)).easing(cc.easeBackOut());
    var action = cc.sequence(moveTo, cc.delayTime(t), cc.removeSelf(true));
    tipBox.runAction(action);
};
/**
 * 控制台输出
 * @param message {String} 提示或错误信息
 * @param reason {*|String} 提示或原因信息
 */
FT.log = function (message, reason) {
    /** 开启调试才输出 */
    if (cc.game.config[cc.game.CONFIG_KEY.debugMode] == 1) {
        if (cc.sys.isNative) {
            reason ? console.log(message + "======>" + reason) : console.log(message);
        } else {
            try {
                throw new Error();
            } catch (e) {
                var loc = e.stack.replace(/Error\n/).split(/\n/)[1].replace(/^\s+|\s+$/, "");
                var url = loc.substring(loc.indexOf('(') + 1, loc.length - 1);
                reason ? console.debug(message + "======>" + reason) : console.debug(message);
                console.log(url);
            }
        }
    }
};
//配置
FT.config = {
    ui: {
        w: 1136,
        h: 640
    },
    soundKey: ["isMusicOn", "isEffectsOn", "musicVolume", "effectsVolume"],
    soundDefaultValue: [1, 1, 1, 1]
};
//初始化配置
FT.initSetting = {
    sound: function () {
        //设置初始音效
        for (var i = 0; i < FT.config.soundKey.length; i++) {
            if (!FT.storage.getLocalData(FT.config.soundKey[i])) {
                FT.storage.setLocalData(FT.config.soundKey[i], FT.config.soundDefaultValue[i]);
            }
        }
    }
};

//更改配置
FT.setConfig = {
    sound: {
        setIsMusicOn: function (is) {
            FT.storage.setLocalData(FT.config.soundKey[0], is);
        },
        setIsEffectsOn: function (is) {
            FT.storage.setLocalData(FT.config.soundKey[1], is);
        },
        setMusicVolume: function (volume) {
            FT.storage.setLocalData(FT.config.soundKey[2], volume);
        },
        setEffectsVolume: function (volume) {
            FT.storage.setLocalData(FT.config.soundKey[3], volume);
        }
    }
};
//音效控制 管理
FT.sound = {
    curMusic: null,
    playMusic: function (file, loop) {
        if (FT.storage.setLocalData(FT.config.soundKey[0]) == 1) {
            var volume = FT.storage.getLocalData(FT.config.soundKey[2]);
            if (file && volume != cc.audioEngine.getMusicVolume()) {
                cc.audioEngine.setMusicVolume(Math.max(0, Math.min(1, volume)));
            }
            if (file != this.curMusic) {
                cc.audioEngine.stopMusic(true);
                cc.audioEngine.playMusic(file, loop);
                this.curMusic = file;
            }
        }
    },
    stopMusic: function () {
        cc.audioEngine.stopMusic();
        this.curMusic = null;
    },
    playEffect: function (file, loop) {
        if (FT.storage.setLocalData(FT.config.soundKey[1]) == 1) {
            if (file) {
                var volume = FT.storage.getLocalData(FT.config.soundKey[3]);
                if (volume !== cc.audioEngine.getEffectsVolume()) {
                    cc.audioEngine.setEffectsVolume(Math.max(0, Math.min(1, volume)));
                }
                return cc.audioEngine.playEffect(file, loop);
            }
        }
    },
    stopAllEffects: function () {
        cc.audioEngine.stopAllEffects();
    },
    stopMicAndEfts: function () {
        this.stopMusic();
        this.stopAllEffects();
    },
    /**
     * 音效
     * @param soundName {string} 音效路径
     * @param loop {Boolean} 是否循环
     * @example
     * (null) 关闭所有音效
     * (null,fase) 暂停背景音乐
     * (null,true) 恢复背景音乐
     * (soundName,true) 播放背景音乐
     * (soundName,fase) 播放音效
     * (soundName) 播放音效
     */
    play: function (soundName, loop) {
        if (soundName == null) {
            cc.isUndefined(loop) ? cc.audioEngine.end() : loop == true ? cc.audioEngine.resumeMusic() : cc.audioEngine.pauseMusic();
        } else {
            (cc.isUndefined(loop) || loop == false) ? cc.audioEngine.playEffect(soundName, loop) : cc.audioEngine.playMusic(soundName, loop);
        }
    }
};

module.exports = FT;
