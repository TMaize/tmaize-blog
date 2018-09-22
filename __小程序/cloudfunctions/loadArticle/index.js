const cloud = require('wx-server-sdk')
const util = require('./util.js')

cloud.init({
    env: 'blog-99591f' // 指定云环境
})
// const db = cloud.database()

// 云函数入口函数
exports.main = async(event, context) => {
    if (event.url) { //加载文章
        return await util.parseDetail(event.url)
    } else { // 加载列表
        return await util.parseList()
    }
}