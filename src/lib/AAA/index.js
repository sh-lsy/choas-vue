import AAA from './AAA'

// 支持按需引用
AAA.install = function (Vue) {
    Vue.component(AAA.name, AAA);
};

export default AAA;
