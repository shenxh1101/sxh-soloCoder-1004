export default defineAppConfig({
  pages: [
    'pages/index/index',
    'pages/booking/index',
    'pages/message/index',
    'pages/admin/index',
    'pages/venue-detail/index'
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#ffffff',
    navigationBarTitleText: '社区运动场',
    navigationBarTextStyle: 'black'
  },
  tabBar: {
    color: '#86909c',
    selectedColor: '#165dff',
    backgroundColor: '#ffffff',
    borderStyle: 'black',
    list: [
      {
        pagePath: 'pages/index/index',
        text: '首页'
      },
      {
        pagePath: 'pages/booking/index',
        text: '我的预约'
      },
      {
        pagePath: 'pages/message/index',
        text: '消息'
      },
      {
        pagePath: 'pages/admin/index',
        text: '管理'
      }
    ]
  }
})
