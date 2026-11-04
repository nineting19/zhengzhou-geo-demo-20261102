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
