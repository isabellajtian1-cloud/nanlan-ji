# 南澜记 V3.9.5 · GitHub Pages 上传说明

本包为可直接运行的静态网站，包含两卷剧情、六地块种植、山上果树、家庭用餐图像和新版工具栏。

1. 解压 ZIP，不要把 ZIP 本身上传。
2. 打开现有 nanlan-ji 仓库，选择 Add file → Upload files。
3. 把本包里面的文件和 assets 文件夹上传到仓库根目录（或 GitHub Pages 当前配置的发布目录）。index.html 必须直接位于该发布目录，不要多套 Nanlan_V395 文件夹。
4. 同名文件用本包版本覆盖，保留 assets 文件夹结构。浏览器上传若提示文件数量过多，可分批上传 assets 内容到 assets 对应目录，或使用 GitHub Desktop 上传整个目录。
5. Commit changes，提交说明：Update Nanlan Ji to v3.9.5 with farming and visual improvements
6. Settings → Pages：保持现有发布方式。如果采用 Deploy from a branch，选择 main 与 /(root)。若已有 Actions 发布流程，沿用现有流程并更新它实际发布的目录。
7. 等待部署成功，打开 Settings → Pages 显示的网址，刷新后确认左上角版本为 V3.9.5。

种植：M03整理首块小畦，其他菜畦需翻土；M07扩整后开放两块药田。选种后点击地块播种，再浇水。关闭操作面板后推进时间，或到卧房休息。收获存入行囊。

存档保存在浏览器中。继续使用同一网址和浏览器可读取原存档；从 ChatGPT 网站切换到 GitHub 网址时，请先在旧网站行囊导出进度，再在新网站启程页导入。上传游戏不会自动迁移不同网址的存档。

无需 npm、编译或后端。通过网站地址运行；不要双击本地 HTML 作为正式运行方式。
