//#region 图层编号
function RenameLayersWithID(layers) {
    for (var i = 0; i < layers.length; i++) {
        var layer = layers[i];
        var layerObject = new Layer(layer.id)
        if (Layer.isNoExportLayer(layerObject)) {
            continue;
        }
        if (!IsAlreadyRename(layer) && IsNeedSynchronizationLayer(layer)) {
            var layerID = layer.id;
            var originalName = GetNodeName(layer.name);
            var str = "";
            if (!IsSpecialLayoutLayer(layer.name)) {
                var match = GetNodeNameMatch(layer.name, true);
                str = (match[4] != null) ? match[4] + match[5] : "";
            }
            layer.name = originalName + "-" + layerID + str;
        }
        if (layer.typename == "LayerSet" && layer.layers.length > 0) {
            RenameLayersWithID(layer.layers);
        }
    }
}

function RenameLayers() {
    RenameLayersWithID(app.activeDocument.layers);
}
//#endregion

//#region 检查是否存在组图层有图层效果
function CheckGroupEffect() {
    var list = [];
    Layer.loopLayers(function(layer){
        if(layer.kind() == 7 && layer.haveGroupEffect()){
            list.push(layer);
        }
    })
    
    // NOTE: This function was mostly internal or unused in main.js calls? 
    // Wait, main.js does NOT call this. It calls checkSmartObjectFilterFX.
    // I'll leave it but updated if needed. It has alerts in original.
    
    if(list.length == 0){
        // alert("无此类图层");
        return JSON.stringify({status: "success", message: "无此类图层"});
    }
    else{
        var result = { status: "warning", message: "以下组图层存在异常效果问题", items: [] };
        for (var i = 0; i < list.length; i++) {
            result.items.push({
                id: list[i].id,
                name: list[i].name(),
                desc: "组效果"
            });
        }
        Layer.selectLayers(list);
        return JSON.stringify(result);
    }
}
//#endregion

//#region 修正组图层的混合模式
function AmendMode() {
    Layer.loopLayers(function(layer){
        if(layer.kind() == 7){
            layer.setMode("normal");
        }
    })
}
//#endregion

function CompareLayerSize(layerA, layerB){
    var boundsA = layerA.bounds()
    var boundsB = layerB.bounds()
    return (boundsA.width == boundsB.width) && (boundsA.height == boundsB.height)
}

//#region 检查重复编号图层
function CheckSameLayerId() {
    var layerIdDict = CollectLayerIdDict();
    var result = CollectErrorIdLayerList(layerIdDict);
    var resObj = { status: "success", items: [] };
    
    if(result.errorLayerList.length > 0){
        resObj.status = "warning";
        resObj.message = "已选中存在重复编号的图层";
        Layer.selectLayers(result.errorLayerList);
        for(var i=0; i<result.errorLayerList.length; i++){
            resObj.items.push({
                id: result.errorLayerList[i].id,
                name: result.errorLayerList[i].name(),
                desc: "重复编号"
            });
        }
    } else {
        resObj.message = "不存在重复编号图层";
    }
    return JSON.stringify(resObj);
}

function CollectLayerIdDict(){
    var layerIdDict = {};
    Layer.loopLayers(function(layer){
        var name = layer.name();
        var layerId = GetNodeLayerId(name);
        if(Layer.isNoExportLayer(layer) || layerId == -1){
            return;
        }
        if(!layerIdDict[layerId]){
            layerIdDict[layerId] = [];
        }
        layerIdDict[layerId].push(layer);
    })
    return layerIdDict
}

function CollectErrorIdLayerList(layerIdDict){
    var errorLayerList = [];
    var errorStr = "";
    for(var layerId in layerIdDict){
        var layerList = layerIdDict[layerId];
        var count = layerList.length;
        if(count > 1){
            errorStr += layerId + "\n";
            for(var index in layerList){
                errorLayerList.push(layerList[index]);
            }
        }
    }
    return {
        errorLayerList: errorLayerList,
        errorStr: errorStr
    };
}
//#endregion

//#region 检查字体效果
function CheckTextEffect(){
    var errorLayerList = CollectTextEffectErrorLayer();
    var result = { status: "success", items: [] };
    
    if(errorLayerList.length <= 0){
        result.message = "字体效果符合规范";
    } else {
        result.status = "warning";
        result.message = "以下字体效果不合规范";
        Layer.selectLayers(errorLayerList);
         for(var i=0; i<errorLayerList.length; i++){
            result.items.push({
                id: errorLayerList[i].id,
                name: errorLayerList[i].name(),
                desc: "效果参数错误"
            });
        }
    }
    return JSON.stringify(result);
}

function CollectTextEffectErrorLayer(){
    var errorLayerList = [];
    Layer.loopLayers(function(layer){
        if(!Layer.isNoExportLayer(layer) && layer.kind() == 3 && layer.haveLayerEffect()){
            if(!IsTextFrameFxSizeVaild(layer) || 
            !IsTextFrameFxOverPrintOff(layer) ||
            !IsTextDropShadowVaild(layer) || 
            !IsTextEffectColorVaild(layer) || 
            !IsTextEffectOpacityVaild(layer)){
                errorLayerList.push(layer);
            }
        }
    })
    return errorLayerList;
}

function PrintTextEffectError(errorLayerList){
    // Deprecated for direct use, logic moved to CheckTextEffect
}

function IsTextFrameFxSizeVaild(layer){
    var strokeFx = layer.strokeFx();
    if(strokeFx == null){
        return true;
    }
    var fxSize = strokeFx.size;
    return fxSize == 1 || fxSize == 2;
}

function IsTextFrameFxOverPrintOff(layer){
    var strokeFx = layer.strokeFx();
    if(strokeFx == null){
        return true;
    }
    return !strokeFx.overPrint;
}

function IsTextDropShadowVaild(layer){
    return IsTextDropShadowDistanceVaild(layer) || IsTextDropShadowAngleVaild(layer)
}

function IsTextDropShadowDistanceVaild(layer){
    var dropShadow = layer.dropShadow();
    if(dropShadow == null){
        return true;
    }
    return dropShadow.distance == 2 || dropShadow.distance == 3;
}

function IsTextDropShadowAngleVaild(layer){
    var dropShadow = layer.dropShadow();
    if(dropShadow == null){
        return true;
    }
    return dropShadow.angle == 130;
}

function IsTextEffectColorVaild(layer){
    var strokeFx = layer.strokeFx();
    var dropShadow = layer.dropShadow();
    if(strokeFx == null || dropShadow == null){
        return true;
    }
    return IsColorEqual(strokeFx.color, dropShadow.color);
}

function IsTextEffectOpacityVaild(layer){
    var strokeFx = layer.strokeFx();
    var dropShadow = layer.dropShadow();
    if(strokeFx == null || dropShadow == null){
        return true;
    }
    return strokeFx.opacity == dropShadow.opacity;
}

function IsColorEqual(colorA, colorB){
    return colorA.red == colorB.red && colorA.green == colorB.green && colorA.blue == colorB.blue;
}
//#endregion
