const app = getApp()

Page({
    data: {
        userInfo: {}
    },
    onLoad() {
        if (!app.globalData.userInfo) {
            let _this = this
            wx.cloud.callFunction({
                name: 'login',
                success(res) {
                    console.log(res)
                    app.globalData.userInfo = res.result
                    _this.setData({
                        userInfo: app.globalData.userInfo
                    })
                }
            })
        }
    }
})