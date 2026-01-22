//#region 隐藏不导出图层
function HideIgnoreLayer(layers) {
    for (var i = 0; i < layers.length; i++) {
        var layer = layers[i];
        if (IsNoExportLayer(layer) && layer.visible === true) {
            layer.visible = false;
        }
        if (layer.typename === "LayerSet") {
            HideIgnoreLayer(layer.layers);
        }
    }
}
//#endregion

//#region 自动忽略选中图层
function IgnoreSelectLayer() {
    var selectLayerIds = GetSelectedLayerIds();
    for (var i = 0; i < selectLayerIds.length; i++) {
        var layerId = selectLayerIds[i];
        var layer = GetLayerByLayerId(app.activeDocument.layers, layerId);
        var ignoreName = GetIgnoreName(layer.name);
        layer.name = ignoreName;
    }
}

function GetIgnoreName(layerName) {
    if (layerName.indexOf("ignore_") < 0) {
        return "ignore_" + layerName;
    } else {
        return layerName.replace(/ignore_/g, "");
    }
}

function GetLayerByLayerId(layers, layerId) {
    for (var i = 0; i < layers.length; i++) {
        var layer = layers[i];
        if (layer.id == layerId) {
            return layer;
        }
        if (layer.typename === "LayerSet") {
            var layer = GetLayerByLayerId(layer.layers, layerId);
            if (layer) {
                return layer;
            }
        }
    }
}
//#endregion

//#region 打印当前选中图层尺寸
function PrintSelectLayerSize(){
    var curSelectLayer = GetCurActiveLayer()
    var itemSize = GetItemSize(curSelectLayer);
    var itemWidth = itemSize.itemWidth;
    var itemHeight = itemSize.itemHeight;
    alert("高：" + itemHeight + "宽：" + itemWidth)
}
//#endregion

//#region 对比两个PSD的编号
function ComparePsds() {
    var docs = app.documents;
    if (docs.length > 2) {
        alert("当前对比的PSD数量大于2个，请关闭不需要对比的PSD文件");
        return;
    }
    var psd1 = docs[0];
    var psd2 = docs[1];
    var layerList1 = GetPsdLayerList(psd1.layers);
    var layerList2 = GetPsdLayerList(psd2.layers);
    var newList = [];
    for (var i = 0; i < layerList1.length; i++) {
        var layer = layerList1[i];
        if (!IsLayerInLayerList(layer, layerList2)) {
            newList.push(layer);
        }
    }
    var lostList = [];
        for (var i = 0; i < layerList2.length; i++) {
        var layer = layerList2[i];
        if (!IsLayerInLayerList(layer, layerList1)) {
            lostList.push(layer);
        }
    }
    var newReport;
    if (newList.length > 0) {
        newReport = "左边的PSD比右边的PSD新增了这些图层:\n";
        for (var i = 0; i < newList.length; i++) {
            newReport +=  newList[i].name + "\n";
        }
    }
    var lostReport;
    if (lostList.length > 0) {
        lostReport = "左边的PSD比右边的PSD减少了这些图层:\n";
        for (var i = 0; i < lostList.length; i++) {
            lostReport +=  lostList[i].name + "\n";
        }
    }
    alert(newReport + "\n" + lostReport);
}

function GetPsdLayerList(layers) {
    var layerList = [];
    for (var i = 0; i < layers.length; i++) {
        var layer = layers[i];
        if (IsNoExportLayer(layer)) {
            continue;
        }
        layerList.push(layer)
        if (layer.typename === "LayerSet") {
            var list = GetPsdLayerList(layer.layers);
            for (var j = 0; j < list.length; j++) {
                layerList.push(list[j]);
            }
        }
    }
    return layerList;
}

function IsLayerInLayerList(layer, layerList) {
    for (var i = 0; i < layerList.length; i++) {
        if (layerList[i].id == layer.id){
            return true;
        }
    }
    return false;
}
//#endregion

//#region 生成指定图层
function GenSpecifiedImage(){
    var layerName = "GridItem"; // 指定图层名称
    var extensionRoot = new File($.fileName).parent.parent.parent;
    var imageRelativePath = "/img/GridItem.png";
    var imagePath = extensionRoot + imageRelativePath; // 指定图片路径
    var doc = app.activeDocument;
    try {
        var file = new File(imagePath);
        if (file.exists) {
            app.open(file); // 打开图片文件
            var tempDoc = app.activeDocument;
            tempDoc.selection.selectAll();
            tempDoc.selection.copy();
            tempDoc.close(SaveOptions.DONOTSAVECHANGES);
        
            // 粘贴到目标文档
            app.activeDocument = doc;
            doc.paste();
            doc.activeLayer.name = layerName;
        }
    
    } catch (e) {
        alert("导入失败: " + e.message);
    }
}
//#endregion

//#region 生成占位图
function CreateIconSize(width, height){
    var doc = app.activeDocument;
    var selectLayer = GetCurActiveLayer();
    var newLayer = doc.artLayers.add();
    newLayer.name = GetIconSizeName(width, height);
    MoveIconSizeLayer(selectLayer, newLayer);
    CreateColorSelectRegion(selectLayer, width, height);
}

function GetIconSizeName(width, height){
    var layerName = "IconSize"
    layerName = (width == height) ? layerName + width : layerName + (width + "x" + height);
    return layerName;
}

function MoveIconSizeLayer(selectLayer, iconSizeLayer){
    if(IsParentRoot(selectLayer)){
       return; 
    }
    Move(iconSizeLayer, selectLayer);
}

function IsParentRoot(selectLayer){
    var parentLayer = (selectLayer.typename == "LayerSet") ? selectLayer : selectLayer.parent;
    return (parentLayer == app.activeDocument);
}

function CreateColorSelectRegion(selectLayer, width, height){
    var doc = app.activeDocument;
    var region = GetSelectRegion(selectLayer, width, height);
    doc.selection.select(region);
    var fillDesc = new ActionDescriptor();
    fillDesc.putEnumerated(charIDToTypeID('Usng'), charIDToTypeID('FlCn'), charIDToTypeID('FrgC'));
    executeAction(charIDToTypeID('Fl  '), fillDesc, DialogModes.NO);
    doc.selection.deselect();
}

function GetSelectRegion(selectLayer, width, height){
    var positionInfo = GetLayerPositionInfo(selectLayer);
    var left = positionInfo.left + (positionInfo.width / 2 - width / 2);
    var top = positionInfo.top + (positionInfo.height / 2 - height / 2);
    var region = [
        [left, top],
        [left + width, top],
        [left + width, top + height],
        [left, top + height]
    ];
    return region;
}

function GetLayerPositionInfo(layer) {
    var bounds = layer.bounds;
    var isParentRoot = IsParentRoot(layer);
    var doc = app.activeDocument;
    return {
        left: isParentRoot ? 0 : bounds[0],
        top: isParentRoot ? 0 : bounds[1],
        width: isParentRoot ? doc.width : (bounds[2] - bounds[0]),
        height: isParentRoot ? doc.height : (bounds[3] - bounds[1])
    };
}
//#endregion

//#region 获得PSD图层数量
function GetLayerCount(){
    var allCount = 0;
    var vaildCount = 0;
    Layer.loopLayers(function(layer){
        var kind = layer.kind();
        if(kind == 1 || kind == 3){
            allCount += 1;
            if(!Layer.isNoExportLayer(layer)){
                vaildCount += 1;
            }
        }
    })
    alert("图+文字图层数量：" + allCount + "\n" + "导出图层数量：" + vaildCount);
}
//#endregion

//#region 展示所有图层
function ShowAllLayer(){
    Layer.loopLayers(function(layer){
        if(layer.visible() == false){
            layer.show();
        }
    })
}
//#endregion

//#region 伽马修正
function GammaCorrection(value){
    Layer.loopLayers(function(layer){
        var visible = layer.visible();
        layer.select();
        if(!layer.isEmptyLayer()){
            layer.setGammaCorrection(value);
        }
        if(visible == false){
            layer.hide();
        }
    })
}
//#endregion

//#region 清除锁定
function ClearLock(){
    Layer.loopLayers(function(layer){
        layer.unlock();
    })
}
//#endregion