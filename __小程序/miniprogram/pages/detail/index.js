Page({
    data: {
        title: '',
        content: '',
        url: ''
    },
    onLoad: function(options) {
        let _this = this
        wx.showLoading({
            title: '加载中...'
        })
        let article = wx.getStorageSync('article')
        wx.setNavigationBarTitle(article.title)
        this.setData({
            title: article.title,
            url: article.url
        })
        wx.cloud.callFunction({
            name: 'loadArticle',
            data: {
                url: article.url
            }
        }).then(res => {
            _this.setData({
                content: res.result
            })
            wx.hideLoading()
        }).catch(err => {
            wx.showToast({
                title: '加载文章失败',
                icon: 'none'
            })
        })
    }
})