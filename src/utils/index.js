import _ from 'lodash'

/**
 * @name markListDataIdentify 标记数据标识
 * @param data 数据源
 * @param startId 起始节点
 * */
export const markListDataIdentify = (data, startId = '') => {
  if (Object.prototype.toString.call(data) !== '[object Array]') {
    return;
  }
  data.forEach((item, index) => {
    item._c_tree_parent_id = startId;
    item._c_tree_self_id = startId ? startId + '-' + index : +index + '';
    if ((item.children || []).length) {
      markListDataIdentify(item.children, item._c_tree_self_id)
    }
  });
  return data;
};

/**
 * @name addZero 字符加零
 * @param value 数据源
 * */
export const addZero = (value) => {
  return value > 9 ? value + '' : '0' + value;
};

/**
 * @name findDirtyValue 递归查找对象
 * @param value 查找的对象
 * @param listData 数据源
 * @param key 键值
 * */

export const findDirtyValue = (value, listData = [], key) => {
  for (let i = 0; i < listData.length; i++) {
    if (listData[i][key] === value[key]) {
      return listData[i]
    }
    if ((listData[i].children || []).length) {
      findDirtyValue(value, listData[i].children, key);
    }
  }
};

/**
 * @name markIdentifyIfNotHave 标记数据当他没有被标记时
 * @param listData 数据源
 * */

export const markIdentifyIfNotHave = (listData) => {
  let copyListData;
  if (listData[0] && listData[0]._c_tree_self_id) {
    copyListData = _.cloneDeep(listData);
  } else {
    copyListData = markListDataIdentify(_.cloneDeep(listData));
  }
  return copyListData
};

/**
 * @name removeDirtyKey 移除脏数据
 * @param value 数据源
 * @param keys 数据源
 * @return pureCopyValue
 * */

export const removeDirtyKey = (value, keys) => {
  const pureCopyValue = _.cloneDeep(value);
  pureCopyValue.forEach(item => {
    keys.forEach(key => {
      delete item[key];
    });
    delete item._c_tree_parent_id;
    delete item._c_tree_self_id;
    delete item.checked;
    delete item.halfChecked;
    delete item.children;
    delete item.expand;
  });
  return pureCopyValue;
};

/**
 * @name syncTreeListData 同步数据
 * @param context 上下文
 * @param changeParentsParams 内部函数向上递归父元素
 * @param changeChildrenParams 内部函数向下递归子元素
 * @param selectedData 初始选中值
 * @param valueKey 对比的键值
 * @param multiple 是否多选
 * */
export const syncTreeListData = (context,changeParentsParams, changeChildrenParams, selectedData, valueKey, multiple) => {
  if (Object.prototype.toString.call(changeChildrenParams) !== '[object Array]') {
    return;
  }
  if (Object.prototype.toString.call(selectedData) !== '[object Array]') {
    return;
  }
  changeChildrenParams.forEach(item => {
    const index = selectedData.findIndex(selected => selected[valueKey] === item[valueKey]);
    if (index > -1) {
      // 移除选中副本 减少遍历次数
      selectedData.splice(index, 1);
      context.$set(item, 'checked', true);
      context.$set(item, 'halfChecked', false);
    }else{
      context.$set(item, 'checked', false);
      context.$set(item, 'halfChecked', false);
    }
    // 修改当前值
    if (multiple) {
      // 向上修改父类
      changeParentNodeStatus(context,changeParentsParams, item._c_tree_parent_id);
      // 向下修改子类
      changeChildrenNodeStatus(context,item, item.checked);
    }
    if (selectedData.length) {
      syncTreeListData(context,changeParentsParams, item.children || [], selectedData, valueKey, multiple);
    }
  })
};

/**
 * @name changeChildrenNodeStatus 修改子节点
 * @param context 上下文
 * @param data 内部函数向上递归父元素
 * @param checked 选中属性
 * */

export const changeChildrenNodeStatus = (context,data, checked) => {
  (data.children || []).forEach(item => {
    context.$set(item,'halfChecked',false);
    context.$set(item,'checked',checked);
    changeChildrenNodeStatus(context,item, checked)
  })
};

/**
 * @name changeChildrenNodeStatus 向上修改父节点
 * @param context 上下文
 * @param lisData
 * @param parentPath 父节点信息值  lodash
 * @param deep 是否递归
 * */

export const changeParentNodeStatus = (context,lisData, parentPath='', deep = true) => {
  const parentValue = _.get(lisData, parentPath.split('-').join('.children.'), null);
  if (parentValue) {
    if (parentValue.children.every(item => !item.checked && !item.halfChecked)) {
      context.$set(parentValue, 'checked', false);
      context.$set(parentValue, 'halfChecked', false);
    } else if (parentValue.children.every(item => item.checked)) {
      context.$set(parentValue, 'halfChecked', false);
      context.$set(parentValue, 'checked', true);
    } else {
      context.$set(parentValue, 'checked', false);
      context.$set(parentValue, 'halfChecked', true);
    }
    if (deep) {
      changeParentNodeStatus(context, lisData, parentValue._c_tree_parent_id, deep)
    }
  }
};

/**
 * @name getCheckedValue 树形节点多选时 获取列表选择值
 * @name listData 获取列表选择值
 * @name selectedValue 获取列表选择值
 * */

export const getCheckedValue = (listData,selectedValue = [],multiple=true) => {
  for (let i = 0; i < (listData || []).length; ++i) {
    let itemData = listData[i];
    if (itemData.checked) {
      selectedValue.push(itemData);
    }
    if(!multiple){
      if(selectedValue.length){
        return
      }
      getCheckedValue(itemData.children, selectedValue,multiple);
    }else{
      if (itemData.checked || itemData.halfChecked) {
        if ((itemData.children || []).length) {
          getCheckedValue(itemData.children, selectedValue,multiple);
        }
      }
    }
  }
};


/**
 * @name createSingleIcon 向上修改父节点
 * @param data slotsData
 * @param h $createElement
 * @param obj 追加属性
 * @param args 追加参数
 * */

export const createSingleIcon = (data, h, obj = {}, args) => {
  if (!data) {
    return null
  }
  const {tag, listeners = {}, propsData} = data[0].componentOptions || {};
  const {slot} = data[0].data || {};
  if (tag) {
    const bindListener = {...listeners};
    // 绑定值
    if (args) {
      Object.keys(listeners).forEach(key => {
        bindListener[key] = listeners[key].bind(null, args)
      });
    }
    return h(tag,
        {
          props: {
            ...propsData,
            ...obj.props
          },
          slot,
          ...data.data,
          on: {
            ...bindListener,
            ...obj.on
          }
        }
    );
  }
  return null
};

/**
 * @name isInArray 上否在数组中
 * @param listData 列表
 * @param value 值
 * @param key 属性
 * */
export const isInArray = (listData, value, key) => {
  if (!key) {
    return listData.findIndex(list => list === value)>-1;
  }
  return listData.findIndex(list => list[key] === value[key])>-1;
};

/**
 * @name findIndexInArray 上否在数组中
 * @param listData 列表
 * @param value 值
 * @param key 属性
 * */
export const findIndexInArray = (listData, value, key) => {
  if (!key) {
    return listData.find(list => list === value);
  }
  return listData.find(list => list[key] === value[key]);
};

/**
 * @name treeSelectListChangeHandle 用于移除tree形组件中的某些值
 * @param context 上下文
 * @param itemData 值
 * */
export const treeSelectListChangeHandle=(context, itemData)=> {
  const {conditionProps, multiple, dirtySelectedData, markDownListData,reflectKey} = context;
  const valueName = reflectKey['value'];
  if (!multiple) {
    // 单选情况简单处理
    if (itemData.disabled || itemData[conditionProps]) {
      return false;
    }
    if (isInArray(dirtySelectedData, itemData, valueName)) {
      const itemDataInTree = _.get(context.markDownListData,itemData._c_tree_self_id.split('-').join('.children.'),{});
      context.$set(itemDataInTree, 'checked', false);
      context.$set(itemDataInTree, 'halfChecked', false);
      context.$set(context, 'dirtySelectedData', []);
    } else {
      const preData = dirtySelectedData[0];
      if (preData) {
        const itemDataInTree = _.get(context.markDownListData,preData._c_tree_self_id.split('-').join('.children.'),{});
        context.$set(itemDataInTree, 'checked', false);
        context.$set(itemDataInTree, 'halfChecked', false);
      }
      const itemDataInTree = _.get(context.markDownListData,itemData._c_tree_self_id.split('-').join('.children.'),{});
      if (itemDataInTree._c_tree_self_id) {
        context.$set(itemDataInTree, 'checked', true);
        context.$set(itemDataInTree, 'halfChecked', false);
        context.$set(context, 'markDownListData', context.markDownListData);
        context.$set(context, 'dirtySelectedData', [itemDataInTree]);
      } else {
        context.$set(itemData, 'checked', true);
        context.$set(itemData, 'halfChecked', false);
        context.$set(context, 'markDownListData', context.markDownListData);
        context.$set(context, 'dirtySelectedData', [itemData]);
      }
    }
  } else {
    const itemDataInTree = _.get(context.markDownListData,itemData._c_tree_self_id.split('-').join('.children.'),{});
    context.$set(itemDataInTree, 'checked', !itemData.checked);
    context.$set(itemDataInTree, 'halfChecked', false);
    // 多选
    //  向上遍历副元素 点选情况判断父元素是否半选或者全选 同时修改list
    //  再向下遍历子元素 向下依次全选 或者半选父元素 同时修改list
    const lists = [];
    changeParentNodeStatus(context, markDownListData, itemDataInTree._c_tree_parent_id);
    changeChildrenNodeStatus(context, itemDataInTree, itemDataInTree.checked);
    context.$set(context, 'markDownListData', markDownListData);
    getCheckedValue(markDownListData, lists, multiple);
    context.$set(context, 'dirtySelectedData', lists);
  }
};
