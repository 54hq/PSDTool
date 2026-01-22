//#region 工具方法
function GetNodeLayerId(name){
    var isSpecial = IsSpecialLayoutLayer(name);
    var match = isSpecial ? GetSpecialLayoutNameMatch(name, false) : GetNodeNameMatch(name, false);
    var index = isSpecial ? 4 : 3;
    if(match && match[index] != null){
        return match[index];
    }
    return -1;
}

function GetNodeNameMatch(name, isNeedError) {
    var match = name.match(/^(\w+)(-)?(\d+)?(\|)?([^\|]+)?$/);
    if (isNeedError && !match) {
        alert("名称" + name + "异常");
    }
    return match;
}

function GetSpecialLayoutNameMatch(name, isNeedError) {
    var match = name.match(/^([^{}]+)\{([^{}]+)\}(-)?(\d+)?$/);
    if (isNeedError && !match) {
        alert("名称" + name + "异常");
    }
    return match;
}

function IsNoExportLayer(layer) {
    var name = layer.name;
    if (name && name.toLowerCase().indexOf("ignore_") === 0) {
        return true;
    } else {
        return false;
    }
}

function IsAlreadyRename(layer) {
    var layerName = layer.name;
    var matchResult;
    var isSpecial = IsSpecialLayoutLayer(layerName)
    if (isSpecial) {
        matchResult = GetSpecialLayoutNameMatch(layerName, true);
    } else {
        matchResult = GetNodeNameMatch(layerName, true);
    }
    if (matchResult) {
        var digitGroupIndex = isSpecial ? 4 : 3;
        return !!matchResult[digitGroupIndex];
    }
    return false;
}

function IsSpecialLayoutLayer(layerName) {
    var match = GetSpecialLayoutNameMatch(layerName);
    if (match) {
        var layerNodeName = match[1];
        var isSpecialName = (layerNodeName == "ScrollView") || (layerNodeName == "ListView");
        return isSpecialName
    } else {
        return false;
    }
}

function IsListView(layerName){
    var match = GetSpecialLayoutNameMatch(layerName);
    if(match){
        var layerNodeName = match[1];
        return layerNodeName == "ListView";
    } else{
        return false;
    }
}

function IsTabGroup(layerName){
    return layerName == "TabGroup"
}

function IsNeedSynchronizationLayer(layer) {
    return IsSpecialLayoutLayer(layer.name) || layer.typename != "LayerSet";
}

function GetCurActiveLayer() {
    var activeDoc = app.activeDocument;
    return activeDoc.activeLayer;
}

function Move(layer, targetLayer) {
    var desc1 = new ActionDescriptor();
    var ref1 = new ActionReference();
    ref1.putIdentifier(charIDToTypeID("Lyr "), layer.id);
    desc1.putReference(charIDToTypeID("null"), ref1);
    var ref2 = new ActionReference();
    ref2.putIndex(charIDToTypeID("Lyr "), targetLayer.itemIndex - 1);
    desc1.putReference(charIDToTypeID("T   "), ref2);
    desc1.putBoolean(charIDToTypeID("Adjs"), false);
    desc1.putInteger(charIDToTypeID("Vrsn"), 5);
    var list1 = new ActionList();
    list1.putInteger(layer.id);
    desc1.putList(charIDToTypeID("LyrI"), list1);
    executeAction(charIDToTypeID("move"), desc1, DialogModes.NO);
}

function SelectLayers(layerList) {
    if (layerList.length == 0) {
        return
    }
    var layers = new Array();
    var desc1 = new ActionDescriptor();
    var ref1 = new ActionReference();
    for (var i = 0; i < layerList.length; i++) {
        layers[i] = charIDToTypeID("Lyr ");
        ref1.putIdentifier(layers[i], layerList[i]);
    }
    desc1.putReference(charIDToTypeID("null"), ref1);
    desc1.putBoolean(charIDToTypeID("MkVs"), false);
    executeAction(charIDToTypeID("slct"), desc1, DialogModes.NO);
}

function IsListContainVale(list, value) {
    for (var i = 0; i < list.length; i++) {
        if (list[i] == value) {
            return true
        }
    }
    return false
}

function HaveLayerEffect(layer) {
    var ref = new ActionReference();
    ref.putIdentifier(charIDToTypeID("Lyr "), layer.id);
    var desc = executeActionGet(ref);
    return desc.hasKey(charIDToTypeID("Lefx"))
}

function HaveLayerMask(layer) {
    var ref = new ActionReference();
    ref.putIdentifier(charIDToTypeID("Lyr "), layer.id);
    var desc = executeActionGet(ref);
    return desc.hasKey(charIDToTypeID("UsrM"))
}

function GetLayerWidthAndHeight(layer) {
    var width = layer.bounds[2] - layer.bounds[0];
    var height = layer.bounds[3] - layer.bounds[1];
    return [width, height]
}

function GetNodeName(layerName) {
    if (IsSpecialLayoutLayer(layerName)) {
        var match = GetSpecialLayoutNameMatch(layerName, true);
        return match[1] + "{" + match[2] + "}";
    }
    var match = GetNodeNameMatch(layerName, true);
    return match[1]
}

function GetSelectedLayerIds() {
    var selectedLayersReference = new ActionReference();
    selectedLayersReference.putProperty(charIDToTypeID("Prpr"), stringIDToTypeID("targetLayersIDs"));
    selectedLayersReference.putEnumerated(charIDToTypeID("Dcmn"), charIDToTypeID("Ordn"), charIDToTypeID("Trgt"));
    var desc = executeActionGet(selectedLayersReference);
    var layers = [];
    if (desc.hasKey(stringIDToTypeID("targetLayersIDs"))) {
        var list = desc.getList(stringIDToTypeID("targetLayersIDs"));
        for (var i = 0; i < list.count; i++) {
            var ar = list.getReference(i);
            var layerId = ar.getIdentifier();
            layers.push(layerId);
        }
    }
    return layers;
}

function CreateLayerMask(){
    var desc1 = new ActionDescriptor();
    desc1.putClass( charIDToTypeID( "Nw  " ), charIDToTypeID( "Chnl" ) );
    var ref1 = new ActionReference();
    ref1.putEnumerated( charIDToTypeID( "Chnl" ), charIDToTypeID( "Chnl" ), charIDToTypeID( "Msk " ) );
    desc1.putReference( charIDToTypeID( "At  " ), ref1 );
    desc1.putEnumerated( charIDToTypeID( "Usng" ), charIDToTypeID( "UsrM" ), charIDToTypeID( "RvlS" ) );
    executeAction( charIDToTypeID( "Mk  " ), desc1, DialogModes.NO );
}

function BuildSelectionBaseOnLayer(layer){
    var bounds = GetItemBoundsWithoutIgnoreLayer(layer);
    var x1 = bounds[0].value;
    var y1 = bounds[1].value;
    var x2 = bounds[2].value;
    var y2 = bounds[3].value;
    app.activeDocument.selection.select([
        [x1, y1],
        [x2, y1],
        [x2, y2],
        [x1, y2]
    ]);
}

function SelectLayer(layer){
    var layerId = layer.id;
    var layerObject = new Layer(layerId);
    layerObject.select();
}

function GetGroupLayerBounds(group) {
    var minX = Infinity, minY = Infinity;
    var maxX = -Infinity, maxY = -Infinity;

    // 递归遍历所有子图层
    function traverse(layer) {
        if (layer.typename === "LayerSet") { // 如果是组，继续遍历子图层
            for (var i = 0; i < layer.layers.length; i++) {
                traverse(layer.layers[i]);
            }
        } else if (layer.bounds) { // 普通图层
            var bounds = layer.bounds;
            minX = Math.min(minX, bounds[0].value);
            minY = Math.min(minY, bounds[1].value);
            maxX = Math.max(maxX, bounds[2].value);
            maxY = Math.max(maxY, bounds[3].value);
        }
    }

    traverse(group);
    return {
        x: minX,
        y: minY,
        width: maxX - minX,
        height: maxY - minY
    };
}

function PrintAD(actionDescriptor){
    for(var i = 0; i < actionDescriptor.count; i++){
        var typeId = actionDescriptor.getKey(i);
        var stringId = typeIDToStringID(typeId);
        var typeString = actionDescriptor.getType(typeId);
        alert(stringId + ", " + typeString);
    }
}
//#endregion