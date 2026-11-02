// 公共导航的顺序与文案；to 相对于 router basename，由 NavLink 计算当前项。
export const navigation = [
  // 首页只精确匹配根路径，避免访问任意子页面时仍高亮首页。
  { to: "/", label: "首页", end: true },
  { to: "/products", label: "产品" },
  { to: "/solutions", label: "方案" },
  { to: "/about", label: "关于" },
  { to: "/contact", label: "联系" },
];
