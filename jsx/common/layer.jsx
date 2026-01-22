function Layer(id) {
    this.id = id;
}

Layer.getSelectedLayers = function () {
    // 创建一个ActionReference
    var selectedLayersReference = new ActionReference();
        // 给这个AR设置我们需要从AD中获取的属性值
        selectedLayersReference.putProperty(charIDToTypeID("Prpr"), stringIDToTypeID("targetLayersIDs"));
        // 目标对象是当前选中的文档
        selectedLayersReference.putEnumerated(charIDToTypeID("Dcmn"), charIDToTypeID("Ordn"), charIDToTypeID("Trgt"));
    var desc = executeActionGet(selectedLayersReference);   // 拿到一个ActionDescriptor
    var layers = [];
    if (desc.hasKey(stringIDToTypeID("targetLayersIDs"))) {
        // 拿到的是一个ID列表，我们遍历它把每个id拿出来，然后实例化Layer对象
        var list = desc.getList(stringIDToTypeID("targetLayersIDs"));
        for (var i=0; i<list.count; i++) {
            var ar = list.getReference(i);
            var layerId = ar.getIdentifier();
            layers.push(new Layer(layerId));
        }
    }
    return layers;
}

Layer.prototype.name = function() {
    var layerReference = new ActionReference();
        layerReference.putProperty(charIDToTypeID("Prpr"), charIDToTypeID("Nm  "));
        layerReference.putIdentifier(charIDToTypeID("Lyr "), this.id);
    var descriptor = executeActionGet(layerReference);
    return descriptor.getString(charIDToTypeID("Nm  "));
}

Layer.prototype.index = function () {
    var layerReference = new ActionReference();
        layerReference.putProperty(charIDToTypeID("Prpr"), charIDToTypeID("ItmI"));
        layerReference.putIdentifier(charIDToTypeID("Lyr "), this.id);
    var descriptor = executeActionGet(layerReference);
    return descriptor.getInteger(charIDToTypeID("ItmI"));
}

Layer.prototype.kind = function () {
    var layerReference = new ActionReference();
    layerReference.putProperty(charIDToTypeID("Prpr"), stringIDToTypeID("layerKind"));
    layerReference.putIdentifier(charIDToTypeID("Lyr "), this.id);
    var descriptor = executeActionGet(layerReference);
    return descriptor.getInteger(stringIDToTypeID("layerKind"));
}

Layer.prototype.parentLayerId = function () {
    var layerReference = new ActionReference();
    layerReference.putProperty(charIDToTypeID("Prpr"), stringIDToTypeID("parentLayerID"));
    layerReference.putIdentifier(charIDToTypeID("Lyr "), this.id);
    var descriptor = executeActionGet(layerReference);
    return descriptor.getInteger(stringIDToTypeID("parentLayerID"));
}

Layer.prototype.bounds = function () {
    var layerReference = new ActionReference();
        layerReference.putProperty(charIDToTypeID("Prpr"), stringIDToTypeID("bounds"));
        layerReference.putIdentifier(charIDToTypeID("Lyr "), this.id);
    var layerDescriptor = executeActionGet(layerReference);
    var rectangle = layerDescriptor.getObjectValue(stringIDToTypeID("bounds"));
    var left = rectangle.getUnitDoubleValue(charIDToTypeID("Left"));
    var top = rectangle.getUnitDoubleValue(charIDToTypeID("Top "));
    var right = rectangle.getUnitDoubleValue(charIDToTypeID("Rght"));
    var bottom = rectangle.getUnitDoubleValue(charIDToTypeID("Btom"));
    return {x: left, y: top, width: (right - left), height: (bottom - top)};
}

Layer.prototype.isEmptyLayer = function(){
    var bounds = this.bounds()
    return bounds.width == 0 && bounds.height == 0
}

Layer.prototype.visible = function () {
    var layerReference = new ActionReference();
        layerReference.putProperty(charIDToTypeID("Prpr"), charIDToTypeID("Vsbl"));
        layerReference.putIdentifier(charIDToTypeID("Lyr "), this.id);
    var descriptor = executeActionGet(layerReference);
    if(descriptor.hasKey(charIDToTypeID("Vsbl")) == false) return false;
    return descriptor.getBoolean (charIDToTypeID("Vsbl"));
}

Layer.prototype.solidFill = function () {
    var kind = this.kind();
    if (kind === 4) { // 只有形状图层才能获取到图层填充属性
        var layerReference = new ActionReference();
            // 形状图层的填充和其它属性在adjuestment下面
            layerReference.putProperty(charIDToTypeID("Prpr"), stringIDToTypeID("adjustment"));
            layerReference.putIdentifier(charIDToTypeID("Lyr "), this.id);
        var descriptor = executeActionGet(layerReference);
        var adjustment = descriptor.getList(stringIDToTypeID("adjustment"));    // adjustment是一个ActionList
        var result = [];
        for (var i = 0;  i < adjustment.count; i++) {
            var item = adjustment.getObjectValue(i);
            var color = item.getObjectValue(stringIDToTypeID("color"));
            var red = color.getInteger(stringIDToTypeID("red"));
            var green = color.getInteger(stringIDToTypeID("grain"));
            var blue = color.getInteger(stringIDToTypeID("blue"));
            result.push({"red": red, "green": green,  "blue": blue});
        }
        return result;
    }
    return null;
}

Layer.prototype.strokeFx = function () {
    var layerReference = new ActionReference();
        // 所有的图层效果，都在layerEffects下面
        layerReference.putProperty(charIDToTypeID("Prpr"), stringIDToTypeID("layerEffects"));
        layerReference.putIdentifier(charIDToTypeID("Lyr "), this.id);
    var descriptor = executeActionGet(layerReference);
    var layerEffects = descriptor.getObjectValue(stringIDToTypeID("layerEffects"));
    if(!layerEffects.hasKey(stringIDToTypeID("frameFX"))){
        return null;
    }
    var frameFX = layerEffects.getObjectValue(stringIDToTypeID("frameFX"));
    var enabled = frameFX.getBoolean(stringIDToTypeID("enabled"));
    if (enabled) {
        var size = frameFX.getInteger(stringIDToTypeID("size"));
        var opacity = frameFX.getInteger(stringIDToTypeID("opacity"));
        var color = frameFX.getObjectValue(stringIDToTypeID("color"));
        var overPrint = frameFX.getBoolean(stringIDToTypeID("overprint"));
        var red = color.getInteger(stringIDToTypeID("red"));
        var green = color.getInteger(stringIDToTypeID("grain"));
        var blue = color.getInteger(stringIDToTypeID("blue"));
        return {
            size: size,
            opacity: opacity,
            overPrint: overPrint,
            color: {red: red, green: green, blue: blue}
        }
    } 
    return null;
}

Layer.prototype.dropShadow = function () {
    var layerReference = new ActionReference();
        layerReference.putProperty(charIDToTypeID("Prpr"), stringIDToTypeID("layerEffects"));
        layerReference.putIdentifier(charIDToTypeID("Lyr "), this.id);
    var descriptor = executeActionGet(layerReference);
    var layerEffects = descriptor.getObjectValue(stringIDToTypeID("layerEffects"));
    if(!layerEffects.hasKey(stringIDToTypeID("dropShadow"))){
        return null;
    }
    var dropShadow = layerEffects.getObjectValue(stringIDToTypeID("dropShadow"));
    var enabled = dropShadow.getBoolean(stringIDToTypeID("enabled"));
    if (enabled) {
        var distance = dropShadow.getInteger(stringIDToTypeID("distance"));
        var opacity = dropShadow.getInteger(stringIDToTypeID("opacity"));
        var angle = dropShadow.getInteger(stringIDToTypeID("localLightingAngle"));
        var color = dropShadow.getObjectValue(stringIDToTypeID("color"));
        var red = color.getInteger(stringIDToTypeID("red"));
        var green = color.getInteger(stringIDToTypeID("grain"));
        var blue = color.getInteger(stringIDToTypeID("blue"));
        return {
            distance: distance,
            opacity: opacity,
            angle: angle,
            color: {red: red, green: green, blue: blue}
        }
    } 
    return null;
}

Layer.prototype.haveFilterFX = function() {
    var kind = this.kind(); 
    if(kind != 5){//智能对象限定
        return false;
    }
    var layerReference = new ActionReference();
    layerReference.putProperty(charIDToTypeID("Prpr"), stringIDToTypeID("smartObjectMore"));
    layerReference.putIdentifier(charIDToTypeID("Lyr "), this.id);
    var descriptor = executeActionGet(layerReference);
    var smartObjectMore = descriptor.getObjectValue(stringIDToTypeID("smartObjectMore"));
    return smartObjectMore.hasKey(stringIDToTypeID("filterFX"))
}

Layer.prototype.haveLayerEffect = function() {
    var layerReference = new ActionReference();
    layerReference.putProperty(charIDToTypeID("Prpr"), stringIDToTypeID("layerEffects"));
    layerReference.putIdentifier(charIDToTypeID("Lyr "), this.id);
    var descriptor = executeActionGet(layerReference);
    return descriptor.hasKey(stringIDToTypeID("layerEffects"))
}

Layer.prototype.setGammaCorrection = function(value){
    var kind = this.kind();
    if(kind != 1){//图片图层限定
        return;
    }
    var desc2670 = new ActionDescriptor();
    var idpresetKind = stringIDToTypeID( "presetKind" );
    var idpresetKindType = stringIDToTypeID( "presetKindType" );
    var idpresetKindCustom = stringIDToTypeID( "presetKindCustom" );
    desc2670.putEnumerated( idpresetKind, idpresetKindType, idpresetKindCustom );
    var idExps = charIDToTypeID( "Exps" );
    desc2670.putDouble( idExps, 0.000000 );
    var idOfst = charIDToTypeID( "Ofst" );
    desc2670.putDouble( idOfst, 0.000000 );
    var idgammaCorrection = stringIDToTypeID( "gammaCorrection" );
    desc2670.putDouble( idgammaCorrection, value );
    executeAction( idExps, desc2670, DialogModes.NO );
}

Layer.prototype.select = function () {
    var current = new ActionReference();
        current.putIdentifier(charIDToTypeID("Lyr "), this.id);
    var desc  = new ActionDescriptor();
    desc.putReference (charIDToTypeID("null"), current);
    executeAction( charIDToTypeID( "slct" ), desc , DialogModes.NO );
}

Layer.prototype.show = function () {
    var desc1 = new ActionDescriptor();
    var list1 = new ActionList();
    var ref1 = new ActionReference();
        ref1.putIdentifier(charIDToTypeID("Lyr "), this.id);;
        list1.putReference(ref1);
    desc1.putList(charIDToTypeID("null"), list1);
    executeAction(charIDToTypeID("Shw "), desc1, DialogModes.NO);
}

Layer.prototype.hide = function () {
    var current = new ActionReference();
    var desc242 = new ActionDescriptor();
    var list10 = new ActionList();
    current.putIdentifier(charIDToTypeID("Lyr "), this.id);;
    list10.putReference( current );
    desc242.putList( charIDToTypeID( "null" ), list10 );
    executeAction( charIDToTypeID( "Hd  " ), desc242, DialogModes.NO );
}

Layer.prototype.rasterize = function () {
    var desc7 = new ActionDescriptor();
    var ref4 = new ActionReference();
    ref4.putIdentifier(charIDToTypeID("Lyr "), this.id);
    desc7.putReference( charIDToTypeID( "null" ), ref4 );
    executeAction( stringIDToTypeID( "rasterizeLayer" ), desc7, DialogModes.NO );
}

Layer.prototype.setName = function (newNameString) {
    var desc26 = new ActionDescriptor();
    var ref13 = new ActionReference();
        ref13.putIdentifier(charIDToTypeID("Lyr "), this.id);
    desc26.putReference( charIDToTypeID( "null" ), ref13 );
    var desc27 = new ActionDescriptor();
        desc27.putString( charIDToTypeID( "Nm  " ), newNameString);
    desc26.putObject( charIDToTypeID( "T   " ), charIDToTypeID( "Lyr " ), desc27 );
    executeAction( charIDToTypeID( "setd" ), desc26, DialogModes.NO );
}

Layer.prototype.setMode = function (mode) {
    var desc = new ActionDescriptor();
    var ref = new ActionReference();
    ref.putIdentifier(charIDToTypeID("Lyr "), this.id);
    desc.putReference(charIDToTypeID("null"), ref);
    var ldesc = new ActionDescriptor();
    ldesc.putEnumerated(charIDToTypeID("Md  "), charIDToTypeID("BlnM"), stringIDToTypeID(mode));
    desc.putObject(charIDToTypeID("T   "), charIDToTypeID("Lyr "), ldesc);
    executeAction(charIDToTypeID("setd"), desc, DialogModes.NO);
}

Layer.prototype.unlock = function(){
    var ref = new ActionReference();
    ref.putIdentifier(charIDToTypeID("Lyr "), this.id);
    var desc = new ActionDescriptor();
    var idnull = charIDToTypeID( "null" );
    desc.putReference(idnull, ref);
    var idlayerLocking = stringIDToTypeID( "layerLocking" );
    var desc2441 = new ActionDescriptor();
    var idprotectNone = stringIDToTypeID( "protectNone" );
    desc2441.putBoolean( idprotectNone, true );
    desc.putObject( idlayerLocking, idlayerLocking, desc2441 );
    var idapplyLocking = stringIDToTypeID( "applyLocking" );
    executeAction( idapplyLocking, desc, DialogModes.NO );
}

Layer.prototype.isText = function(){
    return this.kind() == 3;
}

Layer.prototype.isImage = function(){
    return this.kind() == 1;
}

Layer.prototype.isGroup = function(){
    return this.kind() == 7;
}

Layer.prototype.isGroupMark = function(){
    return this.kind() == 13;
}

Layer.loopLayers = function (callback) {
    var ref = new ActionReference();
        // 当前文档的图层数量属性key
        ref.putProperty(charIDToTypeID("Prpr"), charIDToTypeID('NmbL'));
        ref.putEnumerated( charIDToTypeID('Dcmn'), charIDToTypeID('Ordn'), charIDToTypeID('Trgt') );
    var desc = executeActionGet(ref);    
    var layerCount = desc.getInteger(charIDToTypeID('NmbL'));
    // 索引起始值，会受是否有背景图层影响，需要做一下处理
    var i = 0;
    try {
        activeDocument.backgroundLayer;
    } catch(e) {
        i = 1;
    }
    // 开始逐级遍历图层index，根据index来获取到图层实例
    for (i; i<layerCount; i++) {
        var ref = new ActionReference();
            ref.putIndex( charIDToTypeID( 'Lyr ' ), i );
        var desc = executeActionGet(ref);
        var id = desc.getInteger(stringIDToTypeID( 'layerID' ));
        var layer = new Layer(id);
        // 将遍历拿到的图层实例传递给回调函数，回调函数就可以根据自己的需要对图层进行操作了
        callback && callback(layer);
    }
}

Layer.isNoExportLayer = function(layerClass){
    var name = layerClass.name();
    if (name && name.toLowerCase().indexOf("ignore_") === 0) {
        return true;
    }
    var parentId = layerClass.parentLayerId();
    if(parentId != -1){
        var parentLayer = new Layer(parentId);
        return Layer.isNoExportLayer(parentLayer);
    }
    return false;
}

Layer.selectLayers = function(layerList){
    var layers = new Array();
    var desc1 = new ActionDescriptor();
    var ref1 = new ActionReference();
    for (var i = 0; i < layerList.length; i++) {
        layers[i] = charIDToTypeID("Lyr ");
        ref1.putIdentifier(layers[i], layerList[i].id);
    }
    desc1.putReference(charIDToTypeID("null"), ref1);
    desc1.putBoolean(charIDToTypeID("MkVs"), false);
    executeAction(charIDToTypeID("slct"), desc1, DialogModes.NO);
}

Layer.deleteLayer = function(id){
    var desc = new ActionDescriptor();
    var ref = new ActionReference();
    ref.putIdentifier(charIDToTypeID('Lyr '), id);
    desc.putReference( charIDToTypeID('null'), ref );
    executeAction( charIDToTypeID('Dlt '), desc, DialogModes.NO );
}

Layer.ChangeSmartObject = function(id){
    var idinvokeCommand = stringIDToTypeID( "invokeCommand" );
    var desc3695 = new ActionDescriptor();
    var idcommandID = stringIDToTypeID( "commandID" );
    desc3695.putInteger( idcommandID, id );
    var idkcanDispatchWhileModal = stringIDToTypeID( "kcanDispatchWhileModal" );
    desc3695.putBoolean( idkcanDispatchWhileModal, true );
    executeAction( idinvokeCommand, desc3695, DialogModes.NO );
}