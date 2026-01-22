//js和jsx的交互接口
var csInterface = new CSInterface();
var appId = csInterface.getApplicationID();
var extId = csInterface.getExtensionID();
var selectEventId = 0;
var deleteEventId = 0;
var isOpenDeleteNotice = false;

function AddButtonListener(buttonId, func) {
    var button = document.getElementById(buttonId);
    button.addEventListener('click', () => {
        csInterface.evalScript(func);
    });
}

function AddToggleListener(toggleId, func){
    var toggle = document.getElementById(toggleId);
    toggle.addEventListener("change", function(event) {
        func(event);
    });
}

function InitButtonListener(){
    AddButtonListener("checkFontButton", "checkFont()");
    AddButtonListener("checkExportLayer", "checkExportLayer()");
    AddButtonListener("standardizeButton", "standardizeLayerNames()");
    AddButtonListener("checkSameNameImageButton", "checkSameNameImage()");
    AddButtonListener("checkSmartObjectFilterFXButton", "checkSmartObjectFilterFX()");
    AddButtonListener("checkGroupEffectButton", "checkGroupEffect()");
    AddButtonListener("deleteEmptyLayerButton", "deleteEmptyLayer()");
    AddButtonListener("amendModeButton", "amendMode()");
    AddButtonListener("checkSameLayerIdButton", "checkSameLayerId()");
    AddButtonListener("checkTextEffectButton", "checkTextEffect()");
    document.getElementById("openSpecificationButton").addEventListener("click", () => {
        csInterface.openURLInDefaultBrowser("https://doc.weixin.qq.com/doc/w3_AVgA3waFAOwWRTtxGSiSfCZryFZ7B?scode=AOwAYgeoAAkFbnVxkZAVgA3waFAOw");
    });
}

function RegisterEvent(charId, callback) {
    csInterface.evalScript(`app.charIDToTypeID('${charId}')`, function (data) {
        var eventId = data;
        var csEvent = new CSEvent();
        csEvent.type = 'com.adobe.PhotoshopRegisterEvent';
        csEvent.scope = 'APPLICATION';
        csEvent.appId = appId;
        csEvent.extensionId = extId;
        csEvent.data = data;
        csInterface.dispatchEvent(csEvent);
        callback(eventId);
    });
}

function ParseSelectLayerName(){
    csInterface.evalScript("activeDocument.activeLayer.name", (name) => {
        document.getElementById("listType").value = GetListTypeByLayerName(name);
        var match = name.match(/^([^{}]+)\{([^{}]+)\}(.+)?$/);
        var specialLayoutParamStr = match[2];
        var paramStr = specialLayoutParamStr.split(',');
        var parmDict = {};
        for (var index = 0; index < paramStr.length; index++) {
            var pair = paramStr[index].split(':');
            parmDict[pair[0]] = pair[1];
        }
        for(var key in parmDict){
            document.getElementById(key).value = parseInt(parmDict[key]);
        }
    })
}

function GetListTypeByLayerName(name) {
    if(name == "TabGroup") {
        return 3
    } else {
        var match = name.match(/^([^{}]+)\{([^{}]+)\}(.+)?$/);
        var layerName = match[1];
        return (layerName == "ListView") ? 1 : 2;
    }
}

function AddPSCallbackListener(){
    csInterface.addEventListener("com.adobe.PhotoshopJSONCallback" + extId, function(result) {
        var data = result.data.replace(/ver1,/, '');
        var obj = JSON.parse(data);
        if (parseInt(obj.eventID) === parseInt(selectEventId)) {
            OnLayerSelect();
        }
        if (parseInt(obj.eventID) === parseInt(deleteEventId)) {
            OnLayerDelete(obj.eventData.layerID);
        }
    });
}

function OnLayerSelect(){
    csInterface.evalScript("IsSpecialLayoutLayer(activeDocument.activeLayer.name) || IsTabGroup(activeDocument.activeLayer.name)", (result) => {
        if (result == "true"){
            ParseSelectLayerName();
        }
    });
}

function OnLayerDelete(layerIds){
    layerIds.forEach(layerId => {
        if(isOpenDeleteNotice){
            alert("删除了图层：" + layerId);
        }
    });
}

function loadJSX(fileName) {
    var extensionRoot = csInterface.getSystemPath(SystemPath.EXTENSION) + "/jsx/";// 这里是指插件目录下的 jsx 文件夹，可自行设为任意目录   
    csInterface.evalScript('$.evalFile("' + extensionRoot + fileName + '")');
}

function AddHandleListener(){
    RegisterEvent('slct', (id) => {
        selectEventId = id;
    });
    RegisterEvent('Dlt ', (id) => {
        deleteEventId = id;
    });
    AddPSCallbackListener();
}

//核心。面板加载回调
window.addEventListener('load', () => {
    InitButtonListener();
    AddHandleListener();
    AddToggleListener("deleteNoticeToggle", function(event){
        var isChecked = event.target.checked;
        isOpenDeleteNotice = isChecked
    })
    loadJSX("common/utils.jsx");
    loadJSX("common/layer.jsx");
    loadJSX("common/layoutInfo.jsx");
    loadJSX("function/check_layer.jsx");
    loadJSX("function/layer_utils.jsx");
    loadJSX("function/layout.jsx");
});