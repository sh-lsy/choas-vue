import CTreeModal from './TreeModal'

// 支持按需引用
CTreeModal.install = function (Vue) {
    Vue.component('C'+CTreeModal.name, CTreeModal);
};

export default CTreeModal;
