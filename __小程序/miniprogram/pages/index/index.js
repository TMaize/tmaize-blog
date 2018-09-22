const app = getApp()
Page({
    data: {
        articleList: []
    },
    onLoad() {
        let _this = this
        wx.showLoading({
            title: '加载中...'
        })
        loadList().then(status => {
            if (status) {
                _this.setData({
                    articleList: wx.getStorageSync('articleList')
                })
                wx.hideLoading()
            } else {
                wx.showToast({
                    title: '加载列表失败',
                    icon: 'none'
                })
            }
        })
    },
    onPullDownRefresh() {
        let _this = this
        loadList().then(status => {
            if (status) {
                _this.setData({
                    articleList: wx.getStorageSync('articleList')
                })
            }
            // 清除缓存
            wx.clearStorageSync()
            // 停止下拉动作
            wx.stopPullDownRefresh();
        })
    },
    jumpArticle: function(e) {
        let index = e.currentTarget.dataset.index
        let url = this.data.articleList[index].url
        let title = this.data.articleList[index].title
        wx.navigateTo({
            url: '/pages/detail/index?url=' + url + '&title=' + title
        })
    }
})

function loadList() {
    return wx.cloud.callFunction({
        name: 'loadArticle',
    }).then(res => {
        if (Array.isArray(res.result)) {
            wx.setStorageSync('articleList', res.result)
            return true
        }
        return false
    }).catch(err => {
        console.error(err)
        return false
    })
}