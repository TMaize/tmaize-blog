const app = getApp()
Page({
    data: {
        articles: []
    },
    onLoad() {
        let _this = this
        wx.showLoading({
            title: '加载中...'
        })
        wx.cloud.callFunction({
            name: 'loadArticle',
        }).then(res => {
            _this.setData({
                articles: res.result
            })
            wx.hideLoading()
        }).catch(err => {
            wx.showToast({
                title: '加载列表失败',
                icon: 'none'
            })
        })
    },
    jumpDetail: function(e) {
        let index = e.currentTarget.dataset.index
        // 使用Storage跨页面传输数据比较方便
        wx.setStorageSync('article', this.data.articles[index])
        wx.navigateTo({
            url: '/pages/detail/index'
        })
    }
})