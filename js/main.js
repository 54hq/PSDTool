//js和jsx的交互接口
var csInterface = new CSInterface();
var appId = csInterface.getApplicationID();
var extId = csInterface.getExtensionID();

function AddButtonListener(buttonId, func) {
    var button = document.getElementById(buttonId);
    if (button) {
        button.addEventListener('click', () => {
            // 清空之前的状态（可选，或者保留历史）
            // document.getElementById("resultList").innerHTML = '<div class="empty-state">检查中...</div>';
            csInterface.evalScript(func, (result) => {
                handleResult(result);
            });
        });
    }
}

function handleResult(resultStr) {
    if (!resultStr || resultStr === "undefined") return;
    
    try {
        var data = JSON.parse(resultStr);
        renderResults(data);
    } catch (e) {
        // Fallback for legacy string returns or errors
        console.error("JSON Parse Error", e);
        // 如果返回的不是JSON，可能是旧的alert内容或者空
        if(resultStr !== "null") {
             renderResults({
                 status: "info", 
                 message: resultStr, 
                 items: []
             });
        }
    }
}

function renderResults(data) {
    var listEl = document.getElementById("resultList");
    listEl.innerHTML = "";

    if (!data) return;

    // Show summary message
    if (data.message) {
        var msgDiv = document.createElement("div");
        msgDiv.style.padding = "5px";
        msgDiv.style.fontWeight = "bold";
        msgDiv.style.borderBottom = "1px solid #555";
        msgDiv.innerText = data.message;
        listEl.appendChild(msgDiv);
    }

    if (data.items && data.items.length > 0) {
        data.items.forEach(item => {
            var el = document.createElement("div");
            el.className = "result-item";
            
            var nameSpan = document.createElement("span");
            nameSpan.className = "layer-name";
            nameSpan.innerText = item.name || ("Layer ID: " + item.id);
            
            el.appendChild(nameSpan);

            if (item.desc) {
                var descSpan = document.createElement("span");
                descSpan.className = "error-type";
                descSpan.innerText = item.desc;
                el.appendChild(descSpan);
            }

            if (item.id) {
                el.addEventListener("click", () => {
                    selectLayer(item.id);
                });
                el.title = "点击选中图层";
            }
            
            listEl.appendChild(el);
        });
    } else if (data.status === "success" && !data.message) {
         var el = document.createElement("div");
         el.className = "result-item success";
         el.innerText = "检查通过，未发现问题";
         listEl.appendChild(el);
    }
}

function selectLayer(layerId) {
    // 调用 JSX 选中图层
    csInterface.evalScript(`selectLayerById(${layerId})`);
}

function InitButtonListener(){
    AddButtonListener("checkAllAndOpenButton", "checkAllLayersAndExecuteChecks()");
    AddButtonListener("checkSameNameContentButton", "checkSameNameLayerContent()");
    AddButtonListener("checkOutOfBoundsButton", "checkImageOutOfBounds()");
    AddButtonListener("selectImgPrefixButton", "selectImgPrefixLayers()");
    AddButtonListener("selectEffectModeButton", "selectEffectOrModeLayers()");
    AddButtonListener("openAllLayersButton", "checkAllLayersOpen()");
    
    document.getElementById("openSpecificationButton").addEventListener("click", () => {
        csInterface.openURLInDefaultBrowser("https://doc.weixin.qq.com/doc/w3_AVgA3waFAOwWRTtxGSiSfCZryFZ7B?scode=AOwAYgeoAAkFbnVxkZAVgA3waFAOw");
    });

    document.getElementById("clearResultsButton").addEventListener("click", () => {
        document.getElementById("resultList").innerHTML = '<div class="empty-state">请点击上方按钮进行检查</div>';
    });
}

function loadJSX(fileName) {
    var extensionRoot = csInterface.getSystemPath(SystemPath.EXTENSION) + "/jsx/";
    csInterface.evalScript('$.evalFile("' + extensionRoot + fileName + '")');
}

window.addEventListener('load', () => {
    InitButtonListener();
    // Load necessary scripts
    loadJSX("common/utils.jsx");
    loadJSX("common/layer.jsx");
    loadJSX("function/check_layer.jsx");
    loadJSX("function/layer_utils.jsx");
    loadJSX("function/new_features.jsx");
});
