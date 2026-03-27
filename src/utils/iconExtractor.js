/**
 * 图标类名提取工具
 * 自动从CSS文件中提取图标类名
 */

export class IconExtractor {
    /**
     * 从CSS文本中提取图标类名
     * @param {string} cssText - CSS文本内容
     * @returns {Array} 图标类名数组
     */
    static extractFromCssText(cssText) {
        const iconClasses = []
        const iconPattern = /\.(icon-[^{}]*)\s*\{[^{}]*\}/g

        let match
        while ((match = iconPattern.exec(cssText)) !== null) {
            const className = match[1]
            if (className !== 'iconfont') {
                iconClasses.push(className)
            }
        }

        return iconClasses
    }

    /**
     * 从CSS规则中提取图标类名
     * @param {CSSRule} rule - CSS规则对象
     * @returns {string|null} 图标类名
     */
    static extractFromCssRule(rule) {
        if (rule.selectorText && rule.selectorText.startsWith('.icon-')) {
            const className = rule.selectorText.substring(1) // 去掉点号
            if (className !== 'iconfont') {
                return className
            }
        }
        return null
    }

    /**
     * 从样式表中提取所有图标类名
     * @returns {Array} 图标类名数组
     */
    static extractFromStyleSheets() {
        const iconClasses = []
        const styleSheets = document.styleSheets

        for (let i = 0; i < styleSheets.length; i++) {
            const sheet = styleSheets[i]
            try {
                const rules = sheet.cssRules || sheet.rules
                for (let j = 0; j < rules.length; j++) {
                    const rule = rules[j]
                    const className = this.extractFromCssRule(rule)
                    if (className) {
                        iconClasses.push(className)
                    }
                }
            } catch (e) {
                // 跨域限制，跳过
                console.warn('无法访问样式表:', sheet.href, e)
            }
        }

        return [...new Set(iconClasses)] // 去重
    }

    /**
     * 获取图标名称（从类名转换）
     * @param {string} className - 图标类名
     * @returns {string} 图标名称
     */
    static getIconName(className) {
        return className
            .replace('icon-', '')
            .replace(/-/g, ' ')
            .replace(/\b\w/g, l => l.toUpperCase())
    }

    /**
     * 获取完整的图标列表
     * @returns {Array} 图标对象数组
     */
    static getIconList() {
        const classNames = this.extractFromStyleSheets()
        return classNames.map(className => ({
            class: className,
            name: this.getIconName(className),
            displayName: className.replace('icon-', '')
        }))
    }

    /**
     * 手动定义的图标列表（备用方案）
     */
    static getManualIconList() {
        return [
            { class: 'icon-tingchechang', name: '停车场' },
            { class: 'icon-xiyiji', name: '洗衣机' },
            { class: 'icon-dianshiji01', name: '电视机' },
            { class: 'icon-huiyi', name: '会议室' },
            { class: 'icon-gonggongweishengjian', name: '公共卫生间' },
            { class: 'icon-canyin', name: '餐饮' },
            { class: 'icon-gonggongquyujiankong', name: '公共区域监控' },
            { class: 'icon-tubiao-ditu-huozaibaojingqi', name: '火灾报警器' },
            { class: 'icon-tuoxie', name: '拖鞋' },
            { class: 'icon-bingxiang', name: '冰箱' },
            { class: 'icon-yugang', name: '浴缸' },
            { class: 'icon-kongtiao', name: '空调' },
            { class: 'icon-shafa', name: '沙发' },
            { class: 'icon-ganyiji', name: '干衣机' },
            { class: 'icon-yule', name: '娱乐' },
            { class: 'icon-yanhuiting', name: '宴会厅' },
            { class: 'icon-miehuoqi', name: '灭火器' },
            { class: 'icon-gongyuzizhucanting', name: '公寓自助餐厅' },
            { class: 'icon-qipaishi', name: '棋牌室' },
            { class: 'icon-hanglijicun', name: '行李寄存' },
            { class: 'icon-dianhua', name: '电话' },
            { class: 'icon-cz-', name: '插座' },
            { class: 'icon-dianti', name: '电梯' },
            { class: 'icon-jiuba', name: '酒吧' },
            { class: 'icon-chongdianzhuang', name: '充电桩' },
            { class: 'icon-maojin', name: '毛巾' },
            { class: 'icon-chuifengji', name: '吹风机' },
            { class: 'icon-spa', name: 'SPA' },
            { class: 'icon-wenquanxiyuxianxing', name: '温泉洗浴' },
            { class: 'icon-yanwubaojingqi3x', name: '烟雾报警器' },
            { class: 'icon-a-474', name: 'A-474' },
            { class: 'icon-huaxue', name: '化学' },
            { class: 'icon-a-yingditangchi', name: '英帝汤池' },
            { class: 'icon-camara', name: '摄像头' },
            { class: 'icon-kecheng', name: '课程' },
            { class: 'icon-taxi-bus', name: '出租车/公交' },
            { class: 'icon-kafei', name: '咖啡' },
            { class: 'icon-anquanbaojingqi', name: '安全报警器' },
            { class: 'icon-icon_kuaisuruzhutuifang', name: '快速入住退房' },
            { class: 'icon-duomeitiyanshixitong_duogongnengting', name: '多媒体演示系统多功能厅' }
        ]
    }
}

export default IconExtractor