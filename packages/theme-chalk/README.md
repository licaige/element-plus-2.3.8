# element-theme-chalk

> element component chalk theme.

## Installation

```shell
npm i element-plus
```

## Usage

Use Sass import

```css
@use 'element-plus/lib/theme-chalk/index.scss';
```

Or Use vite/webpack

```javascript
import 'element-plus/lib/theme-chalk/index.css'
```

Or

```html
<link
  rel="stylesheet"
  href="https://unpkg.com/element-plus/lib/theme-chalk/index.css"
/>
```

## Import on demand

```javascript
import 'element-plus/lib/theme-chalk/input.css'
import 'element-plus/lib/theme-chalk/select.css'

// ...
```
├── packages
│   ├── theme-chalk
│   │   ├── src
│   │   │   ├── common
│   │   │   │   └── var.scss // SCSS 变量配置文件
│   │   │   ├── mixins
│   │   │   │   ├── _var.scss // CSS 变量相关的 SCSS 自定义函数
│   │   │   │   ├── config.scss // 配置文件
│   │   │   │   ├── function.scss // 全局的 SCSS 自定义函数
│   │   │   │   └── mixins.scss  // BEM 相关函数
│   │   │   ├── base.scss // 基础必须要引用的文件
│   │   │   ├── index.scss // 全量导入组件库的 CSS 入口文件
│   │   │   ├── var.scss   // CSS 变量配置文件
│   │   │   ├── reset.scss // 默认样式重置配置文件
│   │   │   ├── button.scss // 按需导入组件的 CSS 文件
│   │   └── package.json // 主题包的 npm 配置文件
