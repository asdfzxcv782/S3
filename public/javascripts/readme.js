// POPUP, 對話窗，輸入窗
// 安裝
POPUP.install(10000); // zIndex, POPUP.install 已加於index.js中
// 輸入窗
POPUP.show({
    confirmBox: false, // 是否為對話窗
    colorDegree: '220', // 改變顏色
    title: '標題',
    content: '內文',
    input: {
        type: 'input 類型',
        value: 'input 預設數值',
        placeholder: 'input placeholder',
    },
    confirmText: '確定鈕(右方)文字',
    cancelText: '取消鈕(左方)文字',
    confirm: function (value) {
        console.log('按下確定鈕呼叫函數, input 數值:', value);
    },
    cancel: function (value) {
        console.log('按下取消鈕呼叫函數, input 數值:', value);
    },
});
// 對話窗，不會顯示 input 以及 取消鈕
POPUP.show({
    confirmBox: true, // 是否為對話窗
    colorDegree: '220', // 改變顏色
    title: '標題',
    content: '內文',
    confirmText: '確定鈕(右方)文字',
    confirm: function (value) {
        console.log('按下確定鈕呼叫函數, input 數值:', value);
    }
});
// 隱藏POPUP
POPUP.hide();