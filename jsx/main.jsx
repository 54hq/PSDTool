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

// 聚合所有检查逻辑
var checkAllLayersAndExecuteChecks = function() {
    try {
        var allItems = [];
        var status = "success";
        
        // 1. 打开所有图层
        var openResult = JSON.parse(CheckAllLayersOpen());
        if(openResult.items && openResult.items.length > 0) {
             allItems = allItems.concat(openResult.items);
        }

        // 2. 同名内容不同
        var contentResult = JSON.parse(CheckSameNameLayerContent());
        if(contentResult.items && contentResult.items.length > 0) {
            status = "warning";
            allItems = allItems.concat(contentResult.items);
        }

        // 3. 超框图片
        var boundsResult = JSON.parse(CheckImageOutOfBounds());
        if(boundsResult.items && boundsResult.items.length > 0) {
            status = "warning";
            allItems = allItems.concat(boundsResult.items);
        }

        // 汇总结果
        var finalResult = {
            status: status,
            message: status === "success" ? "所有检查通过，未发现问题。" : "发现 " + allItems.length + " 个潜在问题，请查看列表。",
            items: allItems
        };
        
        // 如果有错误图层，选中所有相关图层方便用户查看
        var allIds = [];
        for(var i=0; i<allItems.length; i++) {
            if(allItems[i].id) allIds.push(new Layer(allItems[i].id));
        }
        if(allIds.length > 0) {
            Layer.selectLayers(allIds);
        }

        return JSON.stringify(finalResult);

    } catch(e) {
        return JSON.stringify({status: "error", message: "一键检查失败: " + e.toString()});
    }
}
