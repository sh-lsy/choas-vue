<template>
  <CModal v-model="isModalShow"
          :width="width"
          :height="height"
          :mask="mask"
          :cancel="cancel"
          :draggable="draggable"
          :controllerColor="controllerColor"
          :activeColor="activeColor"
          ref="treeModal"
  >
    <slot slot="header">
      <div class="modal-header"
           :style="{
                    background: `url('${titleImg}') left center/100% 100%`
                 }"
      >
        {{title}}
      </div>
    </slot>

    <div :class="getWrapBoxClass">
      <div :class="getTreeBoxClass">
        <div :class="getTreeFootBoxClass"></div>
        <div class="search-box-wrap">
          <CInput type="text" v-model="searchStr" :placeholder="noticeTxt" size="small"/>
        </div>
        <div class="content-box">
          <div v-if="markDownListData.length">
            <CTree
                    :file-icon="fileIcon"
                    :multiple="multiple"
                    :checkbox="checkbox"
                    :line="line"
                    v-model="dirtySelectedData"
                    :list-data="markDownListData"
                    :reflect-key="reflectKey"
                    :search-str="searchStr"
                    :condition-props="conditionProps"
                    :controllers="controllers"
                    isAlreadyMarked
                    @getDirtySelectedData="getDirtySelectedData"
                    @getMarkDownListData="getMarkDownListData"
            />
          </div>
          <div v-else class="empty-box">
            当前没有可选数据
          </div>
        </div>
      </div>
      <div class="selected-box">
        <div v-if="multiple" :class="{getTreeFootBoxClass,showStyle:filterDirtySelectedDataByCondition.length}">
          已选<span style="color:#1890ff">{{filterDirtySelectedDataByCondition.length}}</span>项 
          <span v-if="getScore">已选<span style="color:#1890ff">{{ getScore }}</span>分</span>
        </div>
        <div class="selected-content">
          <p v-for="item of filterDirtySelectedDataByCondition"
             :key="item[reflectKey['value']]"
          >
            <b>{{item[reflectKey['key']]}}</b>
            <CIcon icon-name="choas-fill-close"
                   width="20"
                   height="20"
                   color="#666"
                   active-color="#ff5e5c"
                   :style="{
                                    lineHeight: '100%'
                               }"
                   @click="listChangeHandle(item)"
            ></CIcon>
          </p>
        </div>
      </div>
    </div>
    <slot slot="footer">
      <div class="modal-footer">
        <CButton type="danger" @click="cancelHandle">取&nbsp;&nbsp;消</CButton>
        <CButton @click="confirmHandle">确&nbsp;&nbsp;认</CButton>
      </div>
    </slot>
  </CModal>
</template>

<script>
  import _ from 'lodash'
  import {
    getCheckedValue,
    markListDataIdentify,
    removeDirtyKey,
    syncTreeListData,
    treeSelectListChangeHandle
  } from "../../utils";
  import classNames from 'classnames'
  import defaultImg from './imgs/header.png'
  import {
    activeColorProps,
    cancelProps,
    checkboxProps,
    classNameProps,
    conditionPropsMix,
    controllerColorProps,
    controllersProps,
    draggableProps, fileIconProps,
    isAlreadyMarkedProps,
    lineProps,
    maskProps,
    multipleProps,
    prefixProps,
    reflectKeyProps,
  } from "../../consts/mixins";
  import {treeDirtyKeys} from "../../consts/consts";

  export default {
    name: 'CTreeModal',
    mixins: [
      reflectKeyProps,
      lineProps,
      multipleProps,
      checkboxProps,
      cancelProps,
      controllersProps,
      controllerColorProps,
      maskProps,
      conditionPropsMix,
      prefixProps,
      classNameProps,
      activeColorProps,
      draggableProps,
      isAlreadyMarkedProps,
      fileIconProps,
    ],
    props: {
      listData: {
        type: Array,
        default() {
          return []
        }
      },
      width: {
        type: String,
        default() {
          return '800'
        }
      },
      height: {
        type: String,
        default() {
          return '600'
        }
      },
      title: {
        type: String,
        default() {
          return ''
        }
      },
      isShow: {
        type: Boolean
      },
      titleImg: {
        default() {
          return defaultImg
        }
      },
      value: {
        type: Array,
        default() {
          return []
        }
      },
    },
    data() {
      return {
        isModalShow: this.isShow,
        dirtySelectedData: [],
        backupDirtySelectedData: [],
        searchStr: '',
        markDownListData: [],
        backUpListData: [],
        noticeTxt: '搜索节点'
      }
    },
    computed: {
      getScore() {
        let score = 0
        for (let index = 0; index < this.filterDirtySelectedDataByCondition.length; index++) {
          score += this.filterDirtySelectedDataByCondition[index].score
          
        }
        return score
      },
      filterDirtySelectedDataByCondition() {
        return this.dirtySelectedData.filter(item => !item[this.conditionProps])
      },
      getTreeFootBoxClass() {
        const prefix = this.prefix ? this.prefix + '-' : '';
        return classNames(
            {
              [prefix + 'tree-footer-box']: true
            }
        )
      },
      getTreeBoxClass() {
        const prefix = this.prefix ? this.prefix + '-' : '';
        return classNames(
            {
              [prefix + 'tree-box']: true
            }
        )
      },
      getWrapBoxClass() {
        const prefix = this.prefix ? this.prefix + '-' : '';
        return classNames(
            this.className,
            {
              [prefix + 'tree-box-wrap']: true
            }
        )
      }
    },
    mounted() {
      this.$emit('input', removeDirtyKey(this.dirtySelectedData, treeDirtyKeys));
    },
    methods: {
      getDirtySelectedData(v) {
        this.$set(this, 'dirtySelectedData', v);
      },
      getMarkDownListData(v) {
        this.$set(this, 'markDownListData', v);
      },
      confirmHandle() {
        // 
        this.searchStr = '';
        this.$emit('input', removeDirtyKey(this.filterDirtySelectedDataByCondition, treeDirtyKeys));
        this.$emit('getDirtySelectedData', this.dirtySelectedData);
        // this.$emit('getMarkDownListData', this.markDownListData);
        // this.$set(this, 'backUpListData', _.cloneDeep(this.markDownListData));
        this.$emit('toggleShow', false);
      },
      cancelHandle() {
        this.$emit('toggleShow', false);
        this.$set(this, 'markDownListData', _.cloneDeep(this.backUpListData));
        this.$set(this, 'dirtySelectedData', _.cloneDeep(this.backupDirtySelectedData));
      },
      // 右侧移除按钮
      listChangeHandle(itemData) {
        treeSelectListChangeHandle(this, itemData);
      },
    },
    watch: {
      listData: {
        handler(v) {
          // 标记数据
          const markDownListData = markListDataIdentify(_.cloneDeep(v));
          if (!this.isAlreadyMarked) {
            const {multiple, reflectKey, value} = this;
            syncTreeListData(this, markDownListData, markDownListData, _.cloneDeep(value), reflectKey['value'], multiple);
            this.$set(this, 'markDownListData', _.cloneDeep(markDownListData));
            this.$set(this, 'backUpListData', markDownListData);
            const lists = [];
            getCheckedValue(markDownListData, lists, multiple);
            this.$set(this, 'dirtySelectedData', lists);
            this.$set(this, 'backupDirtySelectedData', _.cloneDeep(lists));
          } else {
            this.$set(this, 'markDownListData', _.cloneDeep(markDownListData));
            this.$set(this, 'backUpListData', markDownListData);
          }
        },
        deep: true,
        immediate: true,
      },
      value: {
        handler(v, old) {
          if (!_.isEqual(v, old)) {
            let lists = v;
            if (!this.isAlreadyMarked) {
              lists = [];
              const {markDownListData, reflectKey, multiple} = this;
              // 根据已选值同步渲染树形数据
              syncTreeListData(markDownListData, markDownListData, _.cloneDeep(v), reflectKey['value'], multiple);
              this.$set(this, 'markDownListData', _.cloneDeep(markDownListData));
              this.$set(this, 'backUpListData', markDownListData);
              getCheckedValue(markDownListData, lists, multiple);
            }
            this.$set(this, 'dirtySelectedData', lists);
            this.$set(this, 'backupDirtySelectedData', _.cloneDeep(lists));
          }
        },
        deep: true,
        immediate: true
      },
      isShow(v) {
        this.isModalShow = v
      },
      isModalShow(v) {
        if (!v) {
          // 关闭清空
          this.$emit('toggleShow', false);
          this.searchStr = '';
        }
      }
    }
  }
</script>

<style lang="scss" scoped>
  @import '../scss/variable';
  @import '../scss/size';
  @import '../scss/functions';
  .showStyle{
    font-size:20px;
    color:#000;
    margin-top:30px;
    text-align: right;
  }
  .modal-header {
    width: 100%;
    height: 50px;
    color: #fff;
    font-size: 18px;
    font-weight: bold;
    letter-spacing: addPX($sm-letterSp);
  }

  .modal-footer {
    height: addPX($llg-height);
    line-height: addPX(llg-height);
  }

  .tree {
    &-box-wrap {
      height: 100%;
      display: flex;
      padding: 0 addPX($df-padding) 0 addPX($df-padding);
      box-sizing: border-box;
    }

    &-box {
      flex: 3;
      box-sizing: border-box;
      display: flex;
      flex-wrap: wrap;
      flex-direction: column;

      .search-box-wrap {
        padding-right: addPX($lg-padding);
        width: 100%;
        box-sizing: border-box;
        display: flex;
        justify-content: space-between;

        input {
          width: 60%;
          border: 1px solid $lineColor;
          height: addPX($df-height);
          line-height: addPX($df-height);
          box-sizing: border-box;
          border-radius: addPX($df-radius);
          padding-left: addPX($df-padding);

          &:focus {
            outline: none;
            border: 1px solid $primary;
          }
        }
      }

      .title-box {
        width: 100%;
        height: addPX($df-height);
        line-height: addPX($df-height);
        font-size: addPX($lg-fs);
        background: $primary;
        color: #fff;
        text-indent: addPX($df-fs * 2);
        letter-spacing: addPX($df-letterSp);
        border-radius: addPX($sm-radius) addPX($sm-radius) 0 0;
      }

      .cascade-box {
        padding: addPX($lg-padding) addPX($lg-padding) 0 0;
        display: flex;
        justify-content: center;
        align-items: center;
        flex-wrap: wrap;
        text-align: center;
      }

      .content-box {
        margin: addPX($lg-padding* 1.5) 0;
        width: 100%;
        flex: 1;
        box-sizing: border-box;
        overflow-y: auto;
        display: flex;

        .empty-box {
          width: 100%;
          align-self: center;
          text-align: center;
        }
      }
    }

    &-footer-box {
      width: 100%;
      height: addPX($sm-height);
      text-align: right;
      line-height: addPX($sm-height);
      text-indent: addPX($df-fs * 2);
      letter-spacing: addPX($df-letterSp);
      padding-right: addPX($lg-padding);
      box-sizing: border-box;
    }

  }

  .selected-box {
    flex: 2;
    word-break: break-all;
    display: flex;
    flex-wrap: wrap;
    box-sizing: border-box;
    flex-direction: column;

    & > .selected-content {
      width: 100%;
      height: 100%;
      flex: 1;
      box-sizing: border-box;
      display: flex;
      flex-direction: column;
      border-left: addPX($ssm-borderWt) solid $lineColor;
      overflow-y: auto;

      > p {
        width: 100%;
        line-height: addPX($ssm-height);
        box-sizing: border-box;
        text-align: left;
        margin: addPX($sm-margin) 0 0 0;
        padding-left: addPX($df-padding);
        display: flex;
        font-size: addPX($df-fs);
        align-items: center;

        > b {
          flex: 1;
          text-align: left;
        }

        &:hover {
          color: $primary;
        }
      }

    }
  }

</style>
