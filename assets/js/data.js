/* ==========================================================================
   data.js — 站点内容数据（主要编辑入口）
   --------------------------------------------------------------------------
   此处修改同步的首页精选、作品等
   联系方式与命令面板。所有字段说明见 docs/CONTENT.md。
   ========================================================================== */

window.SITE = {
  meta: {
    name: "QuantCoder_Wang",
    handle: "QuantCoder_Wang",
    roles: ["全栈工程师", "算法工程师", "数据工程师", "量化研究员"],
    email: "wangyuwen6@outlook.com",
    location: "中国 · 南昌",
    siteUrl: "https://QuantCoder_Wang.github.io/personalwebpage/"
  },

  socials: [
    { id: "github", label: "GitHub", url: "https://github.com/QuantCoderWang" },
    { id: "gitee", label: "Gitee", url: "https://gitee.com/QuantCoder_Wang" },
    { id: "email", label: "Email", url: "mailto:wangyuwen6@outlook.com" },
    { id: "phone", label: "Phone", url: "tel:13870916570" },
  ],

  projects: [
    {
      id: "deconstructed-stocks",
      title: "DeconstructedStocks",
      subtitle: "智能股市 · 情报分析系统",
      description:
        "纯 Python 编写的个人智能股市与情报分析系统：内置技术分析框架，配合自动新闻爬虫与可视化情报分析，把行情与消息面放进同一个视图。",
      cover: "assets/img/projects/deconstructed-stocks.svg",
      tags: ["金融", "Python", "数据分析"],
      stack: ["Python", "Pandas", "SQLite", "Scrapy"],
      status: "active",
      featured: true,
      repo: "https://gitee.com/QuantCoder_Wang/deconstructed-stocks",
      demo: ""
    },
    {
      id: "myoldwebprojects",
      title: "myoldwebprojects",
      subtitle: "Django 多系统整合门户",
      description:
        "用 Django 把驾培评估、客户档案（CAS）、MIS、DAS 数据分析、物业、人力行政与 TT 学堂等系统整合到一个站点，完整体现 Web 业务从建模到交付的能力。",
      cover: "assets/img/projects/myoldwebprojects.svg",
      tags: ["Python", "Django", "全栈"],
      stack: ["Python", "Django", "MySQL", "Bootstrap"],
      status: "archived",
      featured: true,
      repo: "https://gitee.com/QuantCoder_Wang/myoldwebprojects",
      demo: ""
    },
    {
      id: "compositor-flutter",
      title: "Compositor_flutter",
      subtitle: "Flutter 图像编辑器 · 对标 PS",
      description:
        "用 Flutter 重写的 Compositor，对标 Photoshop 复刻图层、蒙版、滤镜与历史记录等核心能力，目前仍在持续开发与打磨。",
      cover: "assets/img/projects/compositor-flutter.svg",
      tags: ["Flutter", "Dart", "图像处理"],
      stack: ["Flutter", "Dart", "CustomPainter"],
      status: "active",
      featured: false,
      repo: "https://gitee.com/QuantCoder_Wang/compositor_flutter",
      demo: ""
    },
    {
      id: "atmabook",
      title: "AtmaBook",
      subtitle: "离线旅行攻略地图",
      description:
        "以地图为主画布的 Flutter 离线旅行攻略：图文标记地点、自动聚类“必去”点生成游览片区与推荐路径，GPS 照片视频铺成地理相册，一键打包单文件攻略分享或备份。",
      cover: "assets/img/projects/atmabook.svg",
      tags: ["Flutter", "Dart", "地图"],
      stack: ["Flutter", "Dart", "SQLite", "GPS"],
      status: "active",
      featured: false,
      repo: "https://gitee.com/QuantCoder_Wang/atma-book",
      demo: ""
    },
    {
      id: "droiddesk-zh",
      title: "DroidDesk_zh",
      subtitle: "DroidDesk 全面汉化版",
      description:
        "基于 Dart / Flutter 的 DroidDesk 全面汉化与改进版：补齐中文界面与文案，重构国际化结构，让上游项目更容易被中文用户使用和参与。",
      cover: "assets/img/projects/droiddesk-zh.svg",
      tags: ["Flutter", "开源", "汉化"],
      stack: ["Dart", "Flutter", "i18n"],
      status: "maintained",
      featured: false,
      repo: "https://gitee.com/QuantCoder_Wang/droid-desk_zh",
      demo: ""
    },
    {
      id: "simplevault",
      title: "SimpleVault",
      subtitle: "本地双因素密码管理器",
      description:
        "纯 Python 的本地双因素密码管理器：主密码 + 密钥文件保护，账号密码加密存入 SQLite 且仅见密文；core 层由 PySide6 桌面端与 Kivy 安卓端复用，保险库跨端互通、数据永不上传。",
      cover: "assets/img/projects/simplevault.svg",
      tags: ["Python", "安全", "跨平台"],
      stack: ["Python", "PySide6", "Kivy", "SQLite"],
      status: "active",
      featured: true,
      repo: "https://gitee.com/QuantCoder_Wang/simple-vault",
      demo: ""
    }
  ]
};
