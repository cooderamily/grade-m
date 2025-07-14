# 🎨 主题切换指南

本项目使用 [shadcn/ui 官方主题](https://ui.shadcn.com/themes) 设计系统，提供多种精美的配色方案。

## 🎯 当前主题

现在使用的是 **Zinc 主题** - 一个现代化、专业的深色配色方案。

## 🌈 可用主题

1. **Zinc** (当前) - 现代专业风格
2. **Rose** - 优雅玫瑰色调
3. **Blue** - 经典蓝色主题
4. **Green** - 清新绿色主题
5. **Orange** - 活力橙色主题
6. **Violet** - 神秘紫色主题

## 🔧 如何切换主题

### 方法 1: 修改 HTML 类名 (推荐)

在浏览器开发者工具中，找到 `<html>` 标签，添加主题类名：

```html
<!-- Zinc 主题 (默认) -->
<html class="theme-zinc">

<!-- Rose 主题 -->
<html class="theme-rose">

<!-- Blue 主题 -->
<html class="theme-blue">

<!-- Green 主题 -->
<html class="theme-green">

<!-- Orange 主题 -->
<html class="theme-orange">

<!-- Violet 主题 -->
<html class="theme-violet">
```

### 方法 2: 修改 CSS 文件

直接修改 `src/app/globals.css` 中的 `:root` 部分，替换为你喜欢的主题颜色。

## 🎪 主题预览

### Zinc 主题 (当前)
- 主色: 深灰色 `240 5.9% 10%`
- 适合: 专业、企业级应用

### Rose 主题
- 主色: 玫瑰红 `346.8 77.2% 49.8%`
- 适合: 温暖、友好的界面

### Blue 主题
- 主色: 蓝色 `221.2 83.2% 53.3%`
- 适合: 可信赖、稳定的感觉

### Green 主题
- 主色: 绿色 `142.1 76.2% 36.3%`
- 适合: 自然、健康相关应用

### Orange 主题
- 主色: 橙色 `24.6 95% 53.1%`
- 适合: 活力、创意型应用

### Violet 主题
- 主色: 紫色 `262.1 83.3% 57.8%`
- 适合: 创新、科技感应用

## 💡 自定义主题

你也可以创建自己的主题：

1. 在 `src/styles/themes.css` 中添加新的主题类
2. 定义所有必要的 CSS 变量
3. 在 HTML 中应用你的主题类名

## 🌙 深色模式

每个主题都支持深色模式，只需在 HTML 标签中添加 `dark` 类：

```html
<html class="dark theme-rose">
```

## 📱 响应式支持

所有主题都完美支持响应式设计，在不同设备上都有良好的显示效果。

## 🚀 实时预览

要实时查看主题效果：

1. 打开浏览器开发者工具 (F12)
2. 在控制台中运行：
   ```javascript
   document.documentElement.className = 'theme-rose'
   ```
3. 立即看到主题变化！

---

**享受你的新主题！** 🎉 