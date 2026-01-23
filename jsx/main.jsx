var standardizeLayerNames = function() {
    try {
        return StandardizeNames();
    } catch (e) {
        return JSON.stringify({status: "error", message: e.toString()});
    }
}

var checkFont = function() {
    try {
        var canonicalFontNameList = ["AaJXH", "HYWenHei-HEW", "HYZhengYuan-GES"];
        var layerList = GetUnlawfulFountLayerList(canonicalFontNameList, app.activeDocument.layers);
        var result = {
            status: "success",
            items: []
        };
        
        if(layerList.length > 0){
             result.status = "warning";
             result.message = "存在异常字体图层";
             SelectLayers(layerList);
             for(var i=0; i<layerList.length; i++) {
                 var layerId = layerList[i];
                 var layer = new Layer(layerId);
                 result.items.push({
                     id: layerId,
                     name: layer.name(),
                     desc: "字体不规范"
                 });
             }
        } else {
             result.message = "检查完成，没有规范外字体";
        }
        return JSON.stringify(result);
    } catch (e) {
        return JSON.stringify({status: "error", message: e.toString()});
    }
}

var checkExportLayer = function() {
    try {
        var layerList = GetUnlawfulLayerList(app.activeDocument.layers);
        var result = {
            status: "success",
            items: []
        };
        if (layerList.length > 0) {
            SelectLayers(layerList);
            result.status = "warning";
            result.message = "以下图层存在异常效果问题";
            for (var i = 0; i < layerList.length; i++) {
                var layer = new Layer(layerList[i]);
                result.items.push({
                    id: layerList[i],
                    name: layer.name(),
                    desc: "异常效果"
                });
            }
        } else {
            result.message = "所有图层都符合规范";
        }
        return JSON.stringify(result);
    } catch (e) {
        return JSON.stringify({status: "error", message: e.toString()});
    }
}

var checkSameNameImage = function() {
    try {
        var nameDict = {};
        var nameList = GetDifferentImageSameNameList(nameDict);
        var result = {
            status: "success",
            items: []
        };
        
        if (nameList.length > 0) {
            result.status = "warning";
            result.message = "以下图层名称存在同名不同图问题";
            for (var i = 0; i < nameList.length; i++) {
                result.items.push({
                    name: nameList[i],
                    desc: "同名不同尺寸"
                });
            }
        } else {
            result.message = "所有图层都符合规范";
        }
        return JSON.stringify(result);
    } catch (e) {
        return JSON.stringify({status: "error", message: e.toString()});
    }
}

var checkSmartObjectFilterFX = function(){
    try {
        return CheckSmartObjectFilterFX();
    } catch (e) {
        return JSON.stringify({status: "error", message: e.toString()});
    }
}

var deleteEmptyLayer = function(){
    try {
        return DeleteEmptyLayer();
    } catch (e) {
        return JSON.stringify({status: "error", message: e.toString()});
    }
}

var amendMode = function(){
    try {
        AmendMode();
        return JSON.stringify({status: "success", message: "修正完成"});
    } catch (e) {
        return JSON.stringify({status: "error", message: e.toString()});
    }
}

var removePreviewLayout = function(){
    try {
        RemovePreviewLayout();
        return JSON.stringify({status: "success", message: "移除完成"});
    } catch (e) {
        return JSON.stringify({status: "error", message: e.toString()});
    }
}

var checkSameLayerId = function(){
    try {
        return CheckSameLayerId();
    } catch (e) {
        return JSON.stringify({status: "error", message: e.toString()});
    }
}

var clearLock = function(){
    try {
        ClearLock();
        return JSON.stringify({status: "success", message: "清除完成"});
    } catch (e) {
        return JSON.stringify({status: "error", message: e.toString()});
    }
}

var createIconSize = function(width, height){
    CreateIconSize(width, height);
}

var checkTextEffect = function(){
    try{
        return CheckTextEffect();
    }
    catch(e){
        return JSON.stringify({status: "error", message: e.toString()});
    }
}

var checkSameNameLayerContent = function() {
    try {
        return CheckSameNameLayerContent();
    } catch (e) {
        return JSON.stringify({status: "error", message: e.toString()});
    }
}

var checkImageOutOfBounds = function() {
    try {
        return CheckImageOutOfBounds();
    } catch (e) {
        return JSON.stringify({status: "error", message: e.toString()});
    }
}

var selectImgPrefixLayers = function() {
    try {
        return SelectImgPrefixLayers();
    } catch (e) {
        return JSON.stringify({status: "error", message: e.toString()});
    }
}

var selectEffectOrModeLayers = function() {
    try {
        return SelectEffectOrModeLayers();
    } catch (e) {
        return JSON.stringify({status: "error", message: e.toString()});
    }
}

var checkAllLayersOpen = function() {
    try {
        return CheckAllLayersOpen();
    } catch (e) {
        return JSON.stringify({status: "error", message: e.toString()});
    }
}
