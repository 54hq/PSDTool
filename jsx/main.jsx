var standardizeLayerNames = function() {
    try {
        alert("开始规范命名，中途请不要操作");
        StandardizeNames();
    } catch (e) {
        alert(e);
    }
}

var renameLayersWithLayerId = function() {
    try {
        alert("开始编号，中途请不要操作");
        RenameLayers();
        alert("编号完成");
    } catch (e) {
        alert("编号失败，请规范图层命名\n" + e);
    }
}

var createLayoutList = function(listType, layoutType, maxColumn, maxRow, gapHorizontal, gapVertical, paddingTop, paddingLeft) {
    try {
        alert("开始生成结构，中途请不要操作");
        var layoutInfo = new LayoutInfo(layoutType, maxColumn, maxRow, gapHorizontal, gapVertical, paddingTop, paddingLeft)
        CreateLayoutList(listType, layoutInfo);
        alert("创建完成");
    } catch (e) {
        alert(e)
    }
}

var previewListLayout = function(layoutType, maxColumn, maxRow, gapHorizontal, gapVertical, paddingTop, paddingLeft) {
    try {
        alert("开始生成预览，中途请不要操作");
        var layoutInfo = new LayoutInfo(layoutType, maxColumn, maxRow, gapHorizontal, gapVertical, paddingTop, paddingLeft)
        PreviewListLayout(layoutInfo);
        alert("生成预览完成");
    } catch (e) {
        alert(e);
    }
}

var hideIgnoreLayer = function() {
    try {
        alert("开始隐藏图层，中途请不要操作");
        HideIgnoreLayer(app.activeDocument.layers);
        alert("隐藏完成");
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

var ignoreSelectLayerButton = function() {
    IgnoreSelectLayer();
}

var comparePsds = function() {
    alert("对比打开的两个PSD文件")
    ComparePsds();
}

var printSelectLayerSize = function() {
    PrintSelectLayerSize();
}

var CreateTempPurePSD = function () {
    if (app.documents.length <= 0) {
        return;
    }
    try {
        var originalDoc = app.activeDocument;
        var duplicatedDoc = originalDoc.duplicate();
        DeleteAllIgnoreLayer(duplicatedDoc);
        var tempFile = new File(Folder.temp + "/temp_pure_psd.psd");
        var saveOptions = new PhotoshopSaveOptions();
        saveOptions.layers = true;
        duplicatedDoc.saveAs(tempFile, saveOptions, true);
        duplicatedDoc.close(SaveOptions.DONOTSAVECHANGES);
        app.open(tempFile);
        alert("纯净PSD临时文件已生成：" + Folder.temp + "/temp_pure_psd.psd");
    }
    catch (e) {
        alert(e);
    }
}

var createScrollViewMask = function(){
    var activeLayer = app.activeDocument.activeLayer;
    var isSpecialLayoutGroup = IsSpecialLayoutLayer(activeLayer.name);
    if (!isSpecialLayoutGroup) {
        alert("没有选中ScrollView");
        return;
    }
    BuildSelectionBaseOnLayer(activeLayer)
    CreateLayerMask()
    BuildSelectionBaseOnLayer(activeLayer)
}

var genSpecifiedImage = function(){
    GenSpecifiedImage();
}

var previewFormat = function(){
    PreviewFormat();
}

var getLayerCount = function(){
    GetLayerCount();
}

var showAllLayer = function(){
    ShowAllLayer();
}

var checkSmartObjectFilterFX = function(){
    CheckSmartObjectFilterFX();
}

var checkGroupEffect = function(){
    CheckGroupEffect();
}

var gammaCorrection = function(value){
    alert("修正");
    try{
        GammaCorrection(value);
    }
    catch(e){
        alert(e);
    }
    alert("结束");
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