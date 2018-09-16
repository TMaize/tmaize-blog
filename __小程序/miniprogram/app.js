//app.js
App({
    onLaunch: function () {
        // 初始化云环境
        wx.cloud.init({
            env: 'blog-99591f', // 指定云环境
            traceUser: true,
        })
        this.globalData = {}
    }
})