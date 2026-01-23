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

//#region 图层命名规范
function StandardizeNames() {
    var errorLayerInfoList = [];
    Layer.loopLayers(function(layer){
        if(Layer.isNoExportLayer(layer) || layer.isGroupMark()){
            return;
        }
        var originalName = layer.name();
        var standardizedName = GetNodeStandizeName(layer, originalName);
        if(originalName == standardizedName){
            return;
        }
        layer.setName(standardizedName);
        errorLayerInfoList.push({
            oldName : originalName,
            newName : standardizedName
        })
    })
    return ShowInvalidLayers(errorLayerInfoList);
}

function ShowInvalidLayers(invalidLayerNames) {
    var result = { status: "success", items: [] };
    if (invalidLayerNames.length > 0) {
        result.status = "warning";
        result.message = "以下图层名称被规范化:";
        for (var i = 0; i < invalidLayerNames.length; i++) {
             result.items.push({
                 name: invalidLayerNames[i].oldName,
                 desc: "-> " + invalidLayerNames[i].newName
             });
        }
    } else {
        result.message = "所有图层名称都符合规范。";
    }
    return JSON.stringify(result);
}

function GetNodeStandizeName(layerObject, originalName){
    if(layerObject.isText()){
        return GetStandizeTextLayerName(originalName);
    }
    else if(layerObject.isImage()){
        return GetStandizeImageLayerName(originalName);
    }
    else if(layerObject.isGroup()){
        return GetStandizeGroupLayerName(originalName);
    }
    else{
        layerObject.select();
        // alert(originalName + "是非法输出图层"); // 禁止 alert
        return originalName;
    }
}

function GetStandizeTextLayerName(name){
    var match = GetNodeNameMatch(name);
    return "Text" + match[2] + match[3];
}

function GetStandizeGroupLayerName(name){
    if(IsSpecialLayoutLayer(name)){
        return name;
    }
    return name.replace(/[^a-zA-Z0-9]/g, '');
}

function GetStandizeImageLayerName(name){
    var prefix = name.slice(0, 2);
    var hasCPrefix = (prefix === "C_");
    var dashIndex = name.lastIndexOf('-');
    if (dashIndex != -1) {
        var front = name.slice(0, dashIndex);
        var back = name.slice(dashIndex + 1);
        if (hasCPrefix) {
            front = prefix + front.slice(2).replace(/[^a-zA-Z0-9_]/g, '');
        } else {
            front = front.replace(/[^a-zA-Z0-9]/g, '');
        }
        back = back.replace(/\D/g, '');
        return back ? front + "-" + back : front;
    } else {
        if (hasCPrefix) {
            return prefix + name.slice(2).replace(/[^a-zA-Z0-9_]/g, '');
        }
        return name.replace(/[^a-zA-Z0-9]/g, '');
    }
}
//#endregion

//#region 检查字体
function GetUnlawfulFountLayerList(canonicalFontNameList, layers) {
    var layerList = []
    for (var i = 0; i < layers.length; i++) {
        var layer = layers[i];
        if (IsNoExportLayer(layer)) {
            continue;
        }
        if (layer.kind == LayerKind.TEXT && !IsListContainVale(canonicalFontNameList, layer.textItem.font)) {
            layerList.push(layer.id);
        }
        if (layer.typename === "LayerSet") {
            var list = GetUnlawfulFountLayerList(canonicalFontNameList, layer.layers)
            for (var j = 0; j < list.length; j++) {
                layerList.push(list[j]);
            }
        }
    }
    return layerList
}
//#endregion

//#region 检查导出图图片图层
function GetUnlawfulLayerList(layers) {
    var layerList = [];
    for (var i = 0; i < layers.length; i++) {
        var layer = layers[i];
        if (IsNoExportLayer(layer)) {
            continue;
        }
        if (layer.kind != LayerKind.TEXT && layer.typename != "LayerSet") {
            var isNoHandleLayer = (layer.kind == LayerKind.SOLIDFILL || layer.kind == LayerKind.SMARTOBJECT);
            if (isNoHandleLayer || HaveLayerEffect(layer) || HaveLayerMask(layer)) {
                layerList.push(layer.id);
            }
        }
        if (layer.typename === "LayerSet") {
            var list = GetUnlawfulLayerList(layer.layers);
            for (var j = 0; j < list.length; j++) {
                layerList.push(list[j]);
            }
        }
    }
    return layerList;
}
//#endregion

//#region 检查同名不同图
function GetDifferentImageSameNameList(nameDict){
    var errorNameList = [];
    Layer.loopLayers(function(layer){
        var layerA = layer
        if (Layer.isNoExportLayer(layerA)) {
            return;
        }
        if (layerA.kind() != 1) {
            return;
        }
        var name = GetNodeName(layerA.name()).toLowerCase();
        if (nameDict[name]) {
            return;
        }
        nameDict[name] = true;
        Layer.loopLayers(function(layerB){
            if (Layer.isNoExportLayer(layerB)) {
                return;
            }
            if (layerB.kind() == 1 && IsSameNameLayer(layerA, layerB)) {
                if (!CompareLayerSize(layerA, layerB)) {
                    errorNameList.push(name);
                }
            }
        })
    })
    return errorNameList
}

function IsSameNameLayer(layerA, layerB){
    var checkImageName = GetNodeName(layerA.name()).toLowerCase();
    var layerImageName = GetNodeName(layerB.name()).toLowerCase();
    return (checkImageName == layerImageName && layerA.id != layerB.id);
}

function CompareLayerSize(layerA, layerB){
    var boundsA = layerA.bounds()
    var boundsB = layerB.bounds()
    return (boundsA.width == boundsB.width) && (boundsA.height == boundsB.height)
}
//#endregion

//#region 检查是否存在智能滤镜图层
function CheckSmartObjectFilterFX() {
    var list = [];
    Layer.loopLayers(function(layer){
        if(layer.haveFilterFX()){
            list.push(layer);
        }
    })
    var result = { status: "success", items: [] };
    if(list.length == 0){
        result.message = "无此类图层";
    } else {
        result.status = "warning";
        result.message = "PSD导出工具暂不支持解析智能滤镜效果,请使用生成无忽略PSD文件后解析";
        Layer.selectLayers(list);
        for(var i=0; i<list.length; i++){
            result.items.push({
                id: list[i].id,
                name: list[i].name(),
                desc: "智能滤镜"
            });
        }
    }
    return JSON.stringify(result);
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

//#region 删除空白图层
function DeleteEmptyLayer() {
    var list = [];
    Layer.loopLayers(function(layer){
        if (!Layer.isNoExportLayer(layer) && layer.isEmptyLayer()) {
            list.push(layer.name());
            Layer.deleteLayer(layer.id);
        }
    })
    return list;
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
