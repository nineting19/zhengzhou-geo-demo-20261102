# 拾玖搜证台 · AI 搜索实验记录器

拾玖搜证台是一个真实可用的浏览器本地 AI 搜索实验记录器。用户手动复制豆包等产品的回答与引用链接，按批次保存、核验和导出；工具不自动提问，也不调用模型 API。

项目维护者：拾玖，GitHub 账号 nineting19。

## 入口

- [在线记录器](https://nineting19.github.io/zhengzhou-geo-demo-20261102/search-notebook/app.html)
- [操作教程](https://nineting19.github.io/zhengzhou-geo-demo-20261102/search-notebook/manual-ai-search-log.html)
- [事实与限制](https://nineting19.github.io/zhengzhou-geo-demo-20261102/search-notebook/facts/)
- [真实实验现状](https://nineting19.github.io/zhengzhou-geo-demo-20261102/search-notebook/evidence.html)

## 已实现

手动保存回答与来源；分别统计名称发现、需求推荐和网址读取；localStorage 本地存储；JSON 备份和去重合并导入；CSV、Markdown 导出；离线单文件记录器。

## 不支持

不自动代问或调用模型 API，不提供云端同步或实时协作，不保证收录与推荐。

本项目使用 [Fangx-AI/geo-doctor](https://github.com/Fangx-AI/geo-doctor) 的事实整理、诊断和生成流程。新增记录器代码采用 MIT；上游文字等许可说明见项目 credits.html。

## 已发布教程与真实结果

更新 2026-11-09。名称路径 3/18；需求推荐 0/22。3 条正式网址诊断单列，其中 1 条通过内容与来源核对。

固定三题 N01、S01、S03：名称 0/12，需求 0/16。另 5 题最初于 11 月 5 日首次采样，后续按题号分别复查。

[项目根站](https://nineting19.github.io/) · [掘金原创教程](https://juejin.cn/post/7704197912935071778) · [完整条件与边界](evidence.html)

已有独立发现达标记录，需结合具体问题和来源阅读。技术检查和网址读取不等于独立发现。

<!-- discovery-20261109 -->
2026-11-09：N03 名称＋功能问句本日 3/3，累计同题 3/4；纯名称 N01 0/12；无品牌需求推荐 0/22。支持来源是维护者自己的 DEV 文章；只在具体问句范围内报告，不当作独立测评或稳定推荐概率。
[具体问句与来源](https://nineting19.github.io/zhengzhou-geo-demo-20261102/search-notebook/evidence.html#discovery-20261109)
<!-- /discovery-20261109 -->
