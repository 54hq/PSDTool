// #region 根据参数创建列表结构
function CreateLayoutList(listType, layoutInfo) {
    var parentLayer = GetCurActiveLayer();
    if (!parentLayer) {
        alert("没有选择父节点");
        return;
    }
    if(parentLayer.typename != "LayerSet") {
        alert("请选择一个组图层");
        return;
    }
    if(listType == 1) {
        var view = CreateListViewLayerGroupBaseOnParentLayer(parentLayer)
        HandleListView(view, layoutInfo);
    } else if (listType == 2) {
        var view = CreateScrollViewLayerGroupBaseOnParentLayer(parentLayer)
        HandleListView(view, layoutInfo);
    } else {
        alert("未知的结构类型：" + listType);
    }
    AmendMode();
}

function HandleListView(view, layoutInfo){
    var paramStr = GetLayoutParamStr(layoutInfo);
    view.name = view.name + "{" + paramStr + "}";
    return view;
}

function GetLayoutParamStr(layoutInfo) {
    var column = layoutInfo.maxColumn
    var row = layoutInfo.maxRow
    return "layoutType:" + layoutInfo.layoutType + 
            ",maxColumn:" + column + 
            ",maxRow:" + row + 
            ",gapHorizontal:" + layoutInfo.gapHorizontal + 
            ",gapVertical:" + layoutInfo.gapVertical +
            ",paddingTop:" + layoutInfo.paddingTop +
            ",paddingLeft:" + layoutInfo.paddingLeft;
}

function CreateListViewLayerGroupBaseOnParentLayer(parentLayer) {
    var listView = parentLayer.layerSets.add();
    var listViewParent = parentLayer.layerSets.add();
    listView.name = "ListView";
    listViewParent.name = "ListViewParent";
    var item = listView.layerSets.add();
    item.name = "Item";
    Move(listView, listViewParent)
    return listView;
}

function CreateScrollViewLayerGroupBaseOnParentLayer(parentLayer) {
    var scrollView = parentLayer.layerSets.add();
    scrollView.name = "ScrollView";
    var mask = scrollView.layerSets.add();
    mask.name = "Mask";
    var content = mask.layerSets.add();
    content.name = "Content";
    var item = content.layerSets.add();
    item.name = "Item";
    return scrollView;
}
// #endregion


//#region 根据参数创建列表预览图层
function DeepFindLayerSetInGroup(group, itemName) {
    for (var i = 0; i < group.layers.length; i++) {
        var item = group.layers[i];
        if (item.name === itemName && item.typename === "LayerSet") {
            return item;
        } else if (item.typename === "LayerSet") {
            var subItem = DeepFindLayerSetInGroup(item, itemName);
            if (subItem) {
                return subItem;
            }
        }
    }
    return null;
}

function DeletePreviewItem(parentLayer) {
    for (var i = parentLayer.layers.length - 1; i >= 0; i--) {
        var layer = parentLayer.layers[i];
        if (layer.name.indexOf("ItemPreview") !== -1) {
            layer.remove();
        } else if (layer.typename === "LayerSet") {
            DeletePreviewItem(layer)
        }
    }
}

function GetItemSize(item) {
    var itemWidth = item.bounds[2] - item.bounds[0];
    var itemHeight = item.bounds[3] - item.bounds[1];
    return {
        itemWidth: itemWidth,
        itemHeight: itemHeight
    };
}

function GetItemSizeWithoutIgnoreLayer(item){
    var tempItem = item.duplicate();
    DeleteAllIgnoreLayer(tempItem);
    var sizeInfo = GetItemSize(tempItem);
    tempItem.remove();
    return sizeInfo
}

function GetItemBoundsWithoutIgnoreLayer(item){
    var tempItem = item.duplicate();
    DeleteAllIgnoreLayer(tempItem);
    var bounds = tempItem.bounds;
    tempItem.remove();
    return bounds
}

function DeleteAllIgnoreLayer(layerSet){
    for (var i = layerSet.layers.length - 1; i >= 0; i--) {
        var layer = layerSet.layers[i];
        if (layer.name.indexOf("ignore_") === 0) {
            layer.remove();
        } 
        else if (layer.typename === "LayerSet") {
            DeleteAllIgnoreLayer(layer);
        }
    }
}

function GetItemCenterOffset(item) {
    var itemSize = GetItemSize(item);
    var itemWidth = itemSize.itemWidth;
    var itemHeight = itemSize.itemHeight;
    var x = item.bounds[0] + itemWidth / 2;
    var y = item.bounds[1] + itemHeight / 2;
    return {
        x: x,
        y: y
    };
}

function CreatePreviewItem(item, itemName, layoutInfo) {
    var totalNum = layoutInfo.maxRow * layoutInfo.maxColumn
    var itemList = ClonePreviewItem(item, itemName, totalNum);
    var positionList = GetPreviewItemPositionList(item, layoutInfo);
    MoveItemPosition(itemList, positionList);
    return itemList
}

function ClonePreviewItem(item, itemName, totalNum) {
    var itemList = [];
    itemList.push(item)
    item.name = "ItemPreview0";
    for (var i = 1; i < totalNum; i++) {
        var newItem = item.duplicate();
        newItem.name = itemName + i;
        itemList.push(newItem);
    }
    return itemList;
}

function GetPreviewItemPositionList(item, layoutInfo) {
    var itemSize = GetItemSize(item);
    var itemWidth = itemSize.itemWidth;
    var itemHeight = itemSize.itemHeight;
    var basePosition = GetLayoutItemBasePosition(item, layoutInfo);
    var positions = [];
    for (var i = 1; i < layoutInfo.maxRow + 1; i++) {
        for (var j = 1; j < layoutInfo.maxColumn + 1; j++) {
            var posX = basePosition.x + (j - 1) * (itemWidth + layoutInfo.gapHorizontal);
            var posY = basePosition.y + (i - 1) * (itemHeight + layoutInfo.gapVertical);
            positions.push({
                x: posX,
                y: posY
            });
        }
    }
    return positions;
}

function MoveItemPosition(itemList, positionList) {
    var itemCenterOffset = GetItemCenterOffset(itemList[0]);
    for (var i = 0; i < itemList.length; i++) {
        var item = itemList[i];
        var offsetX = positionList[i].x - itemCenterOffset.x;
        var offsetY = positionList[i].y - itemCenterOffset.y;
        item.translate(offsetX, offsetY);
    }
}

function GetLayoutItemBasePosition(baseItem, layoutInfo){
    var itemCenterOffset = GetItemCenterOffset(baseItem);
    var baseX = itemCenterOffset.x + layoutInfo.paddingLeft;
    var baseY = itemCenterOffset.y + layoutInfo.paddingTop;
    return {
        x: baseX,
        y: baseY
    };
}

function UpdateParentNodeName(parentLayer, layoutInfo) {
    var match = GetSpecialLayoutNameMatch(parentLayer.name);
    if (!match) {
        alert("列表父图层名称格式错误");
        return;
    }
    var prefix = match[1];
    var suffix = match[3] || "";
    var layerId = match[4] || ""
    var newParams = GetLayoutParamStr(layoutInfo);
    var newName = prefix + "{" + newParams + "}" + suffix + layerId;
    parentLayer.name = newName;
}

function PreviewListLayout(layoutInfo) {
    var activeLayer = GetCurActiveLayer();
    var isSpecialLayoutGroup = IsSpecialLayoutLayer(activeLayer.name);
    if (!isSpecialLayoutGroup) {
        alert("当前没有选择一个 ScrollView/ListView 节点");
        return;
    }
    GenLayoutViewItem(activeLayer, layoutInfo);
    SelectLayer(activeLayer);
}

function GenLayoutViewItem(activeLayer, layoutInfo){
    if (layoutInfo.maxColumn * layoutInfo.maxRow < 2) {
        alert("当前的子项数量小于2个,无法构成布局结构");
        return;
    }
    var item = DeepFindLayerSetInGroup(activeLayer, "Item");
    if (!item) {
        alert("没有Item组图层");
        return;
    }
    DeletePreviewItem(activeLayer);
    var cloneItem = item.duplicate();
    item.visible = false;
    DeleteAllIgnoreLayer(cloneItem);
    var cloneItem = cloneItem.merge();
    var itemList = CreatePreviewItem(cloneItem, "ItemPreview", layoutInfo);
    var itemPreview = activeLayer.layerSets.add();
    itemPreview.name = "ignore_ItemPreview";
    for (var i = 0; i < itemList.length; i++) {
        Move(itemList[i], itemPreview);
    }
    UpdateParentNodeName(activeLayer, layoutInfo);
}
//#endregion

// #region 预览格式化位置
function PreviewFormat(){
    var activeLayer = GetCurActiveLayer();
    if(!IsListView(activeLayer.name)){
        alert("请选择一个ListView节点");
        return;
    }
    var parentLayer = activeLayer.parent
    var parentBounds = GetGroupLayerBounds(parentLayer);
    var curBounds = GetGroupLayerBounds(activeLayer);
    var leftOffset = curBounds.x - parentBounds.x;
    var topOffset = curBounds.y - parentBounds.y;
    activeLayer.translate(-leftOffset, -topOffset);
}
//#endregion

// #region 移除预览
function RemovePreviewLayout(){
    var activeLayer = GetCurActiveLayer();
    var isSpecialLayoutGroup = IsSpecialLayoutLayer(activeLayer.name);
    if (!isSpecialLayoutGroup) {
        alert("当前没有选择一个 ScrollView/ListView 节点");
        return;
    }
    DeletePreviewItem(activeLayer);
    var item = DeepFindLayerSetInGroup(activeLayer, "Item");
    if(item != null){
        item.visible = true;
    }
}
//#endregion