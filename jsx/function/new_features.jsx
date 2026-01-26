//#region 检查同名图层是否内容相同
function CheckSameNameLayerContent() {
    var nameDict = {};
    var errorLayerList = [];
    var result = { status: "success", items: [] };

    // 第一次遍历，建立名称到图层的映射
    Layer.loopLayers(function(layer) {
        if (Layer.isNoExportLayer(layer) || layer.kind() != 1) { // 仅检查图片图层
            return;
        }
        var name = layer.name();

        // 排除图层命名#9和Temp开头的
        if (name.indexOf("#9") === 0 || name.indexOf("Temp") === 0) {
            return;
        }

        if (!nameDict[name]) {
            nameDict[name] = [];
        }
        nameDict[name].push(layer);
    });

    // 遍历字典，检查同名图层
    for (var name in nameDict) {
        var layers = nameDict[name];
        if (layers.length > 1) {
            var baseLayer = layers[0];
            // 简单比较尺寸是否一致，更深入的内容比较可能需要像素级比对，这里暂对比尺寸
            // 如果需要像素级比对，通常需要栅格化或导出后对比，ExtendScript中比较困难
            // 这里先实现尺寸对比作为“内容不同”的依据之一
            for (var i = 1; i < layers.length; i++) {
                var compareLayer = layers[i];
                if (!CompareLayerSize(baseLayer, compareLayer)) {
                    errorLayerList.push(baseLayer);
                    errorLayerList.push(compareLayer);
                    result.items.push({ id: baseLayer.id, name: baseLayer.name(), desc: "尺寸不同(参照)" });
                    result.items.push({ id: compareLayer.id, name: compareLayer.name(), desc: "尺寸不同" });
                    break; // 只要有一对不同，就记录并跳出当前名字的检查
                }
            }
        }
    }

    if (errorLayerList.length > 0) {
        result.status = "warning";
        result.message = "以下同名图层尺寸不同";
        Layer.selectLayers(errorLayerList);
    } else {
        result.message = "所有同名图层尺寸一致";
    }
    return JSON.stringify(result);
}
//#endregion

//#region 检查图片是否超出画布
function CheckImageOutOfBounds() {
    var docWidth = app.activeDocument.width.as("px");
    var docHeight = app.activeDocument.height.as("px");
    var errorLayerList = [];
    var result = { status: "success", items: [] };

    Layer.loopLayers(function(layer) {
        if (Layer.isNoExportLayer(layer) || layer.kind() != 1) { // 仅检查图片图层
            return;
        }
        var bounds = layer.bounds();
        // bounds: {x: left, y: top, width: width, height: height}
        // 计算右下角坐标
        var right = bounds.x + bounds.width;
        var bottom = bounds.y + bounds.height;

        // 检查是否超出文档边界
        // 允许一定的误差，这里使用严格判断
        if (bounds.x < 0 || bounds.y < 0 || right > docWidth || bottom > docHeight) {
            errorLayerList.push(layer);
            result.items.push({ id: layer.id, name: layer.name(), desc: "超出画布" });
        }
    });

    if (errorLayerList.length > 0) {
        result.status = "warning";
        result.message = "发现 " + errorLayerList.length + " 个图层超出画布范围";
        Layer.selectLayers(errorLayerList);
    } else {
        result.message = "没有图层超出画布范围";
    }
    return JSON.stringify(result);
}
//#endregion

//#region 选中命名含 icon 的图层（不区分大小写）
function SelectImgPrefixLayers() {
    var targetLayers = [];
    var result = { status: "success", items: [] };
    
    Layer.loopLayers(function(layer) {
        var name = layer.name();
        if (name.toLowerCase().indexOf("icon") !== -1) {
            targetLayers.push(layer);
            result.items.push({ id: layer.id, name: name, desc: "含icon" });
        }
    });

    if (targetLayers.length > 0) {
        Layer.selectLayers(targetLayers);
        result.status = "info";
        result.message = "已选中 " + targetLayers.length + " 个Icon图层";
    } else {
        result.message = "未找到命名含 icon 的图层";
    }
    return JSON.stringify(result);
}
//#endregion

//#region 选中带图层效果或特殊混合模式的图层
function SelectEffectOrModeLayers() {
    var targetLayers = [];
    var result = { status: "success", items: [] };
    
    Layer.loopLayers(function(layer) {
        if (Layer.isNoExportLayer(layer)) return;
        
        // 检查图层效果
        var hasEffect = layer.haveLayerEffect();
        
        // 检查混合模式 (除了 Normal 之外的)
        // Layer类中没有直接获取mode的方法，需要扩展 Layer.prototype.mode
        // 这里先假设需要添加获取mode的方法，或者通过 ActionDescriptor 获取
        var mode = layer.mode(); 
        var isSpecialMode = (mode && mode !== "normal" && mode !== "passThrough"); // passThrough 是组的默认穿透

        if (hasEffect || isSpecialMode) {
            targetLayers.push(layer);
            var desc = [];
            if(hasEffect) desc.push("效果");
            if(isSpecialMode) desc.push("模式:" + mode);
            result.items.push({ id: layer.id, name: layer.name(), desc: desc.join(" ") });
        }
    });

    if (targetLayers.length > 0) {
        Layer.selectLayers(targetLayers);
        result.status = "info";
        result.message = "已选中 " + targetLayers.length + " 个带效果或特殊模式的图层";
    } else {
        result.message = "未找到带效果或特殊模式的图层";
    }
    return JSON.stringify(result);
}
//#endregion

//#region 检查所有图层是否打开（显示）
function CheckAllLayersOpen() {
    var closedLayers = [];
    var result = { status: "success", items: [] };
    
    Layer.loopLayers(function(layer) {
        if (!layer.visible()) {
            closedLayers.push(layer);
            layer.show(); // 打开图层
            result.items.push({ id: layer.id, name: layer.name(), desc: "已打开图层" });
        }
    });

    if (closedLayers.length > 0) {
        result.status = "info";
        result.message = "发现 " + closedLayers.length + " 个未打开的图层，已全部打开";
    } else {
        result.message = "所有图层均已打开";
    }
    return JSON.stringify(result);
}
//#endregion
