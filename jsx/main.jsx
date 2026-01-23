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
