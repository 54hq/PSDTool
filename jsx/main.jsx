var standardizeLayerNames = function() {
    try {
        alert("开始规范命名，中途请不要操作");
        StandardizeNames();
    } catch (e) {
        alert(e);
    }
}

var checkFont = function() {
    try {
        alert("开始检查字体，中途请不要操作");
        var canonicalFontNameList = ["AaJXH", "HYWenHei-HEW", "HYZhengYuan-GES"];
        var layerList = GetUnlawfulFountLayerList(canonicalFontNameList, app.activeDocument.layers);
        if(layerList.length > 0){
            alert("存在异常，已选中对应异常图层")
            SelectLayers(layerList);
        }
        else{
            alert("检查完成，没有规范外字体");
        }
    } catch (e) {
        alert(e);
    }
}

var checkExportLayer = function() {
    try {
        alert("开始检查");
        var layerList = GetUnlawfulLayerList(app.activeDocument.layers);
        SelectLayers(layerList);
        if (layerList.length > 0) {
            var report = "以下图层存在异常效果问题:\n";
            for (var i = 0; i < layerList.length; i++) {
                var layer = new Layer(layerList[i]);
                report += layer.name() + "\n";
            }
            alert(report);
        } else {
            alert("所有图层都符合规范。");
        }
    } catch (e) {
        alert(e)
    }
}

var checkSameNameImage = function() {
    try {
        alert("开始检查");
        var nameDict = [];
        var nameList = GetDifferentImageSameNameList(nameDict);
        if (nameList.length > 0) {
            var report = "以下图层名称存在同名不同图问题:\n";
            for (var i = 0; i < nameList.length; i++) {
                report += nameList[i] + "\n";
            }
            alert(report);
        } else {
            alert("所有图层都符合规范。");
        }
    } catch (e) {
        alert(e)
    }
}

var checkSmartObjectFilterFX = function(){
    CheckSmartObjectFilterFX();
}

var deleteEmptyLayer = function(){
    var nameList = DeleteEmptyLayer();
    if (nameList.length > 0) {
        var report = "删除了以下空白图层:\n";
        for (var i = 0; i < nameList.length; i++) {
            report += nameList[i] + "\n";
        }
        alert(report);
    } else {
        alert("没有空白图层");
    }
}

var amendMode = function(){
    alert("开始修正")
    AmendMode();
    alert("结束修正")
}

var removePreviewLayout = function(){
    RemovePreviewLayout();
    alert("移除完成");
}

var checkSameLayerId = function(){
    CheckSameLayerId();
}

var clearLock = function(){
    ClearLock();
    alert("清除完成")
}

var createIconSize = function(width, height){
    CreateIconSize(width, height);
}

var checkTextEffect = function(){
    try{
        CheckTextEffect();
    }
    catch(e){
        alert(e);
    }
}

var checkSameNameLayerContent = function() {
    try {
        CheckSameNameLayerContent();
    } catch (e) {
        alert(e);
    }
}

var checkImageOutOfBounds = function() {
    try {
        CheckImageOutOfBounds();
    } catch (e) {
        alert(e);
    }
}

var selectImgPrefixLayers = function() {
    try {
        SelectImgPrefixLayers();
    } catch (e) {
        alert(e);
    }
}

var selectEffectOrModeLayers = function() {
    try {
        SelectEffectOrModeLayers();
    } catch (e) {
        alert(e);
    }
}

var checkAllLayersOpen = function() {
    try {
        CheckAllLayersOpen();
    } catch (e) {
        alert(e);
    }
}