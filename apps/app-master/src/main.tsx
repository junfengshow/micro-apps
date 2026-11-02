// 异步边界让模块联邦先初始化共享作用域，避免 eager consumption 错误。
void import("./bootstrap").catch(console.error);
