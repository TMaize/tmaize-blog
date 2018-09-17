Page({
    data: {
        article: ''
    },
    onLoad: function(options) {
        let _this = this
        wx.setNavigationBarTitle({
            title: options.title
        })
        // 显示顶部刷新图标
        wx.showNavigationBarLoading();
        loadArticle(options.url).then(status => {
            if (status) {
                _this.setData({
                    article: wx.getStorageSync(options.url)
                })
            }
            // 隐藏顶部刷新图标
            wx.hideNavigationBarLoading()
        })
    }
})

async function loadArticle(url) {
    // 缓存
    if (wx.getStorageSync(url)) {
        wx.getStorageSync(url)
        return true
    }
    return wx.cloud.callFunction({
        name: 'loadArticle',
        data: {
            url: url
        }
    }).then(res => {
        wx.setStorageSync(url, res.result)
        return true
    }).catch(err => {
        console.error(err)
        return false
    })
}