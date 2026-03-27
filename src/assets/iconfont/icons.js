// 图标数据配置
export const iconList = [
  {
    name: '停车场',
    className: 'icon-tingchechang',
    unicode: '\e66b'
  },
  {
    name: '洗衣机',
    className: 'icon-xiyiji',
    unicode: '\e67d'
  },
  {
    name: '电视机',
    className: 'icon-dianshiji01',
    unicode: '\e675'
  },
  {
    name: '会议室',
    className: 'icon-huiyi',
    unicode: '\e62f'
  },
  {
    name: '公共卫生间',
    className: 'icon-gonggongweishengjian',
    unicode: '\e640'
  },
  {
    name: '餐饮',
    className: 'icon-canyin',
    unicode: '\e8a4'
  },
  {
    name: '公共区域监控',
    className: 'icon-gonggongquyujiankong',
    unicode: '\e63b'
  },
  {
    name: '火灾报警器',
    className: 'icon-tubiao-ditu-huozaibaojingqi',
    unicode: '\e673'
  },
  {
    name: '拖鞋',
    className: 'icon-tuoxie',
    unicode: '\e90a'
  },
  {
    name: '冰箱',
    className: 'icon-bingxiang',
    unicode: '\e90b'
  },
  {
    name: '浴缸',
    className: 'icon-yugang',
    unicode: '\e90c'
  },
  {
    name: '空调',
    className: 'icon-kongtiao',
    unicode: '\e90d'
  },
  {
    name: '沙发',
    className: 'icon-shafa',
    unicode: '\e61c'
  },
  {
    name: '干衣机',
    className: 'icon-ganyiji',
    unicode: '\e604'
  },
  {
    name: '娱乐',
    className: 'icon-yule',
    unicode: '\e63e'
  },
  {
    name: '宴会厅',
    className: 'icon-yanhuiting',
    unicode: '\e635'
  },
  {
    name: '灭火器',
    className: 'icon-miehuoqi',
    unicode: '\e60d'
  },
  {
    name: '公共自助餐厅',
    className: 'icon-gongyuzizhucanting',
    unicode: '\e74a'
  },
  {
    name: '棋牌室',
    className: 'icon-qipaishi',
    unicode: '\e654'
  },
  {
    name: '行李寄存',
    className: 'icon-hanglijicun',
    unicode: '\e660'
  },
  {
    name: '电话',
    className: 'icon-dianhua',
    unicode: '\e842'
  },
  {
    name: '插座',
    className: 'icon-cz-',
    unicode: '\e620'
  },
  {
    name: '电梯',
    className: 'icon-dianti',
    unicode: '\e624'
  },
  {
    name: '酒吧',
    className: 'icon-jiuba',
    unicode: '\e68d'
  },
  {
    name: '充电桩',
    className: 'icon-chongdianzhuang',
    unicode: '\e689'
  },
  {
    name: '毛巾',
    className: 'icon-maojin',
    unicode: '\e6b6'
  },
  {
    name: '吹风机',
    className: 'icon-chuifengji',
    unicode: '\e6b7'
  },
  {
    name: 'SPA',
    className: 'icon-spa',
    unicode: '\e626'
  },
  {
    name: '温泉洗浴',
    className: 'icon-wenquanxiyuxianxing',
    unicode: '\e60f'
  },
  {
    name: '烟雾报警器',
    className: 'icon-yanwubaojingqi3x',
    unicode: '\e648'
  },
  {
    name: 'A474',
    className: 'icon-a-474',
    unicode: '\ea8f'
  },
  {
    name: '化学',
    className: 'icon-huaxue',
    unicode: '\e61d'
  },
  {
    name: '影帝汤池',
    className: 'icon-a-yingditangchi',
    unicode: '\e684'
  },
  {
    name: '摄像头',
    className: 'icon-camara',
    unicode: '\e618'
  },
  {
    name: '课程',
    className: 'icon-kecheng',
    unicode: '\eb18'
  },
  {
    name: '出租车/公交',
    className: 'icon-taxi-bus',
    unicode: '\ef95'
  },
  {
    name: '咖啡',
    className: 'icon-kafei',
    unicode: '\u10121'
  },
  {
    name: '安全报警器',
    className: 'icon-anquanbaojingqi',
    unicode: '\e605'
  },
  {
    name: '快速入住退房',
    className: 'icon-icon_kuaisuruzhutuifang',
    unicode: '\e655'
  },
  {
    name: '多功能厅',
    className: 'icon-duomeitiyanshixitong_duogongnengting',
    unicode: '\e600'
  }
]

// 获取所有图标类名
export const getAllIconClassNames = () => {
  return iconList.map(icon => icon.className)
}

// 根据名称搜索图标
export const searchIcons = (keyword) => {
  return iconList.filter(icon =>
    icon.name.toLowerCase().includes(keyword.toLowerCase())
  )
}