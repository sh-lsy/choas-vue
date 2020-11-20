<template>
    <span>
        <template v-if="!canBeEdited">
            <div class="input-like-wrap">
                <div class="input-like input-like-unedited">
                    <template v-if="filterDirtySelectedDataByCondition.length">
                        <CTag v-for="(item, index) of filterDirtySelectedDataByCondition"
                              :key="index + item[reflectKey['value']]"
                        >
                            {{ item[[reflectKey['key']]] }}
                        </CTag>
                    </template>
                </div>
            </div>
        </template>
        <template v-else>
          <div class="input-like-wrap">
              <div class="input-like" @click="inputClick">
                      <template v-if="filterDirtySelectedDataByCondition.length && multiple">
                          <CTag v-for="(item, index) of filterDirtySelectedDataByCondition"
                                :key="index + item[reflectKey['value']]"
                                size="small"
                                @close="(e)=>listChangeHandle(item, e)"
                                active-color="#ff5e5c"
                          >
                          {{ item[[reflectKey['key']]] }}
                          </CTag>
                      </template>
                      <template v-if="filterDirtySelectedDataByCondition.length && !multiple">
                          <CTag v-for="(item, index) of filterDirtySelectedDataByCondition"
                                :key="index + item[reflectKey['value']]"
                                size="small"
                                @close="(e)=>listChangeHandle(item, e)"
                                active-color="#ff5e5c"
                          >
                          {{ item[[reflectKey['key']]] }}
                          </CTag>
                      </template>
                  <template v-if="!filterDirtySelectedDataByCondition.length">
                      <span class="placeholder-span">{{ placeholder }}</span>
                  </template>
              </div>
              <CButton
                      class-name="input-button"
                      v-if="buttonTxt"
                      @click="isModalShow = !isModalShow">{{buttonTxt}}</CButton>
          </div>
        </template>
        <CTreeModal ref="cTreeModal"
                    :list-data="markDownListData"
                    v-model="dirtySelectedData"
                    :title="title"
                    :is-show="isModalShow"
                    @toggleShow="v => this.isModalShow= v"
                    :condition-props="conditionProps"
                    :cascade-condition-props="cascadeConditionProps"
                    :add-tree-node="$listeners.addTreeNode? addTreeNode : null"
                    :reflect-key="reflectKey"
                    :multiple="multiple"
                    :checkbox="checkbox"
                    :controllers="controllers"
                    isAlreadyMarked
                    @getDirtySelectedData="getDirtySelectedData"
                    @getMarkDownListData="getMarkDownListData"

                    :width="width"
                    :height="height"
                    :top="top"
                    :left="left"
                    :mask="mask"
                    :line="line"
                    :file-icon="fileIcon"
                    :cancel="cancel"
                    :draggable="draggable"
                    :controllerColor="controllerColor"
                    :activeColor="activeColor"
                    :placeholder="placeholder"
        />
    </span>
</template>
<script>
  import _ from 'lodash';
  import {
    classNameProps,
    conditionPropsMix,
    placeholderProps,
    prefixProps,
    reflectKeyProps,
    maskProps,
    lineProps,
    multipleProps,
    checkboxProps,
    draggableProps,
    cancelProps,
    canBeEditedProps,
    controllerColorProps,
    activeColorProps,
    controllersProps, fileIconProps
  } from "../../consts/mixins";
  import {
    getCheckedValue,
    markListDataIdentify,
    removeDirtyKey,
    syncTreeListData, treeSelectListChangeHandle
  } from "../../utils";
  import {treeDirtyKeys} from "../../consts/consts";


  export default {
    name: 'CInputTreeModal',
    mixins: [
      conditionPropsMix, prefixProps, classNameProps,
      reflectKeyProps, placeholderProps, maskProps,
      lineProps, multipleProps, checkboxProps,
      draggableProps, cancelProps, canBeEditedProps,
      controllerColorProps, activeColorProps, controllersProps,
      fileIconProps,
    ],
    props: {
      cascadeConditionProps: {
        type: String,
        default() {
          return 'node'
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
      top: {
        type: String,
        default() {
          return ''
        }
      },
      left: {
        type: String,
        default() {
          return ''
        }
      },
      buttonTxt: {
        type: String,
        default() {
          return ''
        }
      },
      title: {
        type: String,
        default() {
          return ''
        }
      },
      titleImg: {
        default() {
          return null
        }
      },
      listData: {
        type: Array,
        required: true,
        default() {
          return []
        }
      },
      value: {
        type: Array,
        default() {
          return []
        }
      },
      controllerColor: {
        type: String,
        default() {
          return '#fff';
        }
      },
      activeColor: {
        type: String,
        default() {
          return '#ff5e5c';
        }
      }
    },
    data() {
      return {
        keyVal: 1,
        isModalShow: false,
        dirtySelectedData: [],
        markDownListData: [],
        orginData:[]
      }
    },
    computed: {
      filterDirtySelectedDataByCondition() {
        return this.dirtySelectedData.filter(item => !item[this.conditionProps])
      },
    },
    methods: {
      getDirtySelectedData(v) {
        this.$set(this, 'dirtySelectedData', v);
      },
      getMarkDownListData(v) {
        this.$set(this, 'markDownListData', v);
      },
      inputClick() {
        if (!this.buttonTxt) {
          this.isModalShow = true
        }
      },
      addTreeNode(v) {
        this.$emit('addTreeNode', v)
      },
      listChangeHandle(itemData, $event) {
        treeSelectListChangeHandle(this, itemData);
        $event.stopPropagation();
        $event.preventDefault();
      }
    },
    watch: {
      listData: {
        handler(v) {
          // 标记数据
          if (v.length) {
            this.orginData = v
          }
          const markDownListData = markListDataIdentify(_.cloneDeep(v));
          const {multiple, reflectKey, value} = this;
          syncTreeListData(this, markDownListData, markDownListData, _.cloneDeep(value), reflectKey['value'], multiple);
          this.$set(this, 'markDownListData', markDownListData);
          const lists = [];
          getCheckedValue(markDownListData, lists, multiple);
          this.$set(this, 'dirtySelectedData', lists);
        },
        deep: true,
        immediate: true,
      },
      value: {
        handler(v) {
          const pureSelectedValue = removeDirtyKey(this.dirtySelectedData.filter(item => !item[this.conditionProps]), treeDirtyKeys);
          if (!_.isEqual(v, pureSelectedValue)) {
            let lists = [];
            const {markDownListData, reflectKey, multiple} = this;
            syncTreeListData(this, markDownListData, markDownListData, _.cloneDeep(v), reflectKey['value'], multiple);
            this.$set(this, 'markDownListData', markDownListData);
            getCheckedValue(this.markDownListData, lists, multiple);
            this.$set(this, 'dirtySelectedData', lists);
          }
        },
        deep: true,
        immediate: true
      },
      dirtySelectedData: {
        handler(v) {
          const pureSelectedValue = removeDirtyKey(this.dirtySelectedData.filter(item => !item[this.conditionProps]), treeDirtyKeys);
          this.$emit('input', pureSelectedValue);
          const markDownListData = markListDataIdentify(_.cloneDeep(this.orginData));
          const {reflectKey, multiple} = this;
          syncTreeListData(this, markDownListData, markDownListData, _.cloneDeep(v), reflectKey['value'], multiple);
          this.$set(this, 'markDownListData', markDownListData);
        },
        deep: true,
      },
    }
  }
</script>

<style lang="scss" scoped>
  @import "../scss/normal-bg";
  @import "../scss/size";
  @import "../scss/variable";
  @import "../scss/functions";

  .input-like-wrap {
    font-size: addPX($df-fs);
    display: flex;

    .input-like {
      border: addPX($ssm-borderWt) solid #D9D9D9;
      border-radius: addPX($sm-radius);
      line-height: addPX($df-height);
      min-height: addPX($df-height);
      padding-left: addPX($sm-padding);
      display: flex;
      align-items: center;
      justify-content: flex-start;
      flex-wrap: wrap;
      cursor: pointer;
      flex: 1;

      &-unedited {
        border: none;
        cursor: not-allowed;
        display: flex;
      }

      .placeholder-span {
        color: #ccc;
      }
    }

    .input-button {
      margin-left: addPX($sm-margin);
    }
  }
</style>
