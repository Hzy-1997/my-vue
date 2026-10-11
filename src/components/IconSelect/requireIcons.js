/*
 * @描述: 
 * @版本: 
 * @作者: 
 * @日期: ${year}-${month}-${day}
 * @最后编辑者: sueRimn
 * @最后编辑时间: ${year}-${month}-${day} ${hour}:${minute}:${second}
 */
// const req = require.context('../../assets/icons/svg', false, /\.svg$/)
// const requireAll = requireContext => requireContext.keys()

// const re = /\.\/(.*)\.svg/

// const icons = requireAll(req).map(i => {
//     return i.match(re)[1]
// })

// export default icons

// 使用 import.meta.glob 来动态导入所有 SVG 文件
// const iconModules = import.meta.glob('../../assets/icons/svg/*.svg')

// // 提取文件名（不包括路径和扩展名）
// const icons = Object.keys(iconModules).map(filePath => {

//     const match = filePath.match(/\.\/(.*)\.svg/)
//     console.log("match"da, match)
//     return match ? match[1] : null
// }).filter(Boolean)  // 过滤掉无效的匹配结果

// c

// export default icons./../assets/icons/svg/*.svg')

// // 提取文件名（不包括路径和扩展名）
// const icons = Object.keys(iconModules).map(filePath => {

//     // console.log("filePath是啥", filePath)

//     const match = filePath.match(/\.\/(..*)\.svg/)
//     // console.log("match是没啥", match)
//     // return match ? match[0] : null
//     return filePath
// }).filter(Boolean)  // 过滤掉无效的匹配结果



const iconModules = import.meta.glob("../../assets/icons/svg/*.svg");
// 提取文件名（不包括路径和扩展名）
const icons = Object.keys(iconModules).map((filePath) => {
    // 从路径中提取文件名，例如从 '../../assets/icons/svg/user.svg' 提取 'user'
    const parts = filePath.split("/");
    const fileName = parts[parts.length - 1];
    return fileName.replace(".svg", ""); // 去掉文件扩展名
});



export default icons;

