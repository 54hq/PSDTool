//js和jsx的交互接口
var csInterface = new CSInterface();
var appId = csInterface.getApplicationID();
var extId = csInterface.getExtensionID();
var selectEventId = 0;
var deleteEventId = 0;
var isOpenDeleteNotice = false;

function AddButtonListener(buttonId, func) {
    var button = document.getElementById(buttonId);
    if (button) {
        button.addEventListener('click', () => {
            csInterface.evalScript(func);
        });
    }
}

function InitButtonListener(){
    AddButtonListener("checkFontButton", "checkFont()");
    AddButtonListener("checkExportLayer", "checkExportLayer()");
    AddButtonListener("standardizeButton", "standardizeLayerNames()");
    AddButtonListener("checkSameNameImageButton", "checkSameNameImage()");
    AddButtonListener("checkSmartObjectFilterFXButton", "checkSmartObjectFilterFX()");
    AddButtonListener("deleteEmptyLayerButton", "deleteEmptyLayer()");
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

function loadJSX(fileName) {
    var extensionRoot = csInterface.getSystemPath(SystemPath.EXTENSION) + "/jsx/";// 这里是指插件目录下的 jsx 文件夹，可自行设为任意目录   
    csInterface.evalScript('$.evalFile("' + extensionRoot + fileName + '")');
}

//核心。面板加载回调
window.addEventListener('load', () => {
    InitButtonListener();
    // Load necessary scripts
    loadJSX("common/utils.jsx");
    loadJSX("common/layer.jsx");
    loadJSX("function/check_layer.jsx");
    loadJSX("function/layer_utils.jsx");
    // Removed unused scripts: layoutInfo.jsx, layout.jsx
});