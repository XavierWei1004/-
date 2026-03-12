# 联系方式查询（静态站，无后端）

## 文件说明
- `dist/`：直接可部署的静态站目录
  - `index.html`：页面
  - `app.js`：查询逻辑（前端筛选）
  - `style.css`：样式
  - `data.json`：联系方式数据（由 Excel 转换生成）

## 本地预览
> 直接双击打开 HTML 在部分手机/微信内可能因跨域/文件协议限制而无法读取 data.json。

推荐用任意静态服务器预览（任选其一）：

### 方式 A：Node
```bash
cd dist
npx serve -l 4173
```

### 方式 B：Python（如果你电脑装了 python3）
```bash
cd dist
python3 -m http.server 4173
```

然后浏览器打开：`http://localhost:4173/`

## 部署（推荐 GitHub Pages，无后端）
1. 新建一个 GitHub 仓库（public）
2. 把 `dist/` 目录里的 4 个文件上传到仓库根目录
3. GitHub 仓库 Settings → Pages
   - Source: Deploy from a branch
   - Branch: main / root
4. 等 1-3 分钟，会得到一个 https://<user>.github.io/<repo>/ 的链接
5. 把这个链接放到公众号文章里（正文链接或“阅读原文”）

## 更新数据
- 用新的 Excel 覆盖后，重新生成 data.json：
```bash
cd ..
node build.js <你的excel路径>
```
- 然后把新的 `dist/data.json` 覆盖上传到托管即可。
