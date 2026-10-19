# 可公开的合成测试

synthetic.cjs仅构造合成规则及最低限度的验证输入，不是私人比赛方案或策略推荐。f01-r02.test.cjs为31项专项，browser.cjs为隔离Edge验收脚本。全部源码不含个人依赖绝对路径。

在仓库根目录执行`node --test tests/f01-r02.test.cjs`或`npm test`。浏览器测试先安装package.json声明的开发依赖和本机Edge，再执行`npm run test:browser`；使用SAFE_CUSTOM_DIR=optional/safe-custom时覆盖备用版，具体PowerShell写法见上层TESTING.md。

浏览器默认生成的browser-results.json是本机报告，已被忽略；不要将含本机位置的原始日志直接提交。历史106项的私人夹具没有加入此目录，可公开重跑的项目与第二阶段历史统计须区分。
