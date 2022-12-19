## 前言

更换主题的需求在移动端甚至一些有特殊需求的 pc 端都很常见了，大部分情况是由用户点击操作进行切换的

但如果，我们可以做到跟随系统当前是 `Light` 还是 `Dark` 来自适应网页的主题，看上去是不是很酷？

## 在这里，你可以 get 到

1. 如何基于原生的 `css variable` 来进行主题更换？
2. 怎么**感知**系统的主题切换并且触发主题更换？
3. 如何设计远程动态主题加载方案，以适应用户自定义主题配置？

> 想抢先看效果的看这里：https://ztstory.github.io/vue-theme/#/

## 思考与实践

#### 1、如何基于原生的 css 变量来进行主题更换？

说到前端的切换主题方案，有提到用`less variable、sass variable、css variable`等等，也都是比较成熟的方案了，我们主要聊一聊以 `css variable`为主的主题切换方案

> CSS 变量：https://developer.mozilla.org/zh-CN/docs/Web/CSS/--*

利用变量的特性，我们可以比较容易的定义出我们的基础主题样式 `Light`

```scss
// 定义基础色值，方便 UI 后期替换
:root {
    --zt-c-white: #ffffff;
    --zt-c-black: #181818;
    --zt-c-primary: rgb(56, 173, 122);

    --zt-c-text-light-1: #333;
    --zt-c-text-light-2: #666;
    --zt-c-text-dark-1: var(--zt-c-white);
    --zt-c-text-dark-2: rgba(235, 235, 235, 0.64);
}
// Light 默认主题色
:root {
    --color-background: var(--zt-c-white);
    --color-heading: var(--zt-c-primary);
    --color-text: var(--zt-c-text-light-1);
    --color-text-2: var(--zt-c-text-light-2);
}
```

再者，我们要准备一套 `Dark` 主题色

```
:root {
    --color-background: var(--zt-c-black);
    --color-heading: var(--zt-c-primary);
    --color-text: var(--zt-c-text-dark-1);
    --color-text-2: var(--zt-c-text-dark-2);
}
```

准备好之后，问题来了：我们怎么切换这两套变量呢？

目前来看是相互覆盖的，所以我们要借助 `css` **的优先级**来进行区别命中

我们只需要在 `body` 标签上**增加一个自定义属性**：`theme-mode="dark"`

然后通过这个属性值来匹配不同 `tag` 的主题色变量就完成基本的主题切换了

其他主题色切换同理

```js
// 上面的代码可以改造成这样 .css
:root body[theme-mode="dark"] {
    ...
}

// .js
document.body.setAttribute("theme-mode", "dark");
```

为了视觉上丝滑一点，我们可以给 `body` 增加点过渡动画，具体效果看上面的 demo 入口

```
body {
    min-height: 100vh;
    color: var(--color-text);
    background: var(--color-background);
    transition: color 0.5s, background-color 0.5s;
}
```

#### 2、如何感知系统的主题切换自动更换主题？

这里就要介绍一下 `prefers-color-scheme` 这个新的 css 特性，可能有很多小伙伴已经知道了，但也可能有很多小伙伴不知道，这里简单介绍一下。

[prefers-color-scheme](https://developer.mozilla.org/zh-CN/docs/Web/CSS/@media/prefers-color-scheme)是 `css` 媒体特性 `@media` 中用于检测用户是否有将系统的主题色设置为亮色或者暗色。

| 语法          | 描述                                                                      |
| ------------- | ------------------------------------------------------------------------- |
| light         | 表示用户已告知系统他们选择使用浅色主题的界面。                            |
| dark          | 表示用户已告知系统他们选择使用暗色主题的界面。                            |
| no-preference | 表示系统未得知用户在这方面的选项。在 boolean 值上下文中，执行结果为 false |

> 若结果为  `no-preference`，无法通过此媒体特性获知宿主系统是否支持设置主题色，或者用户是否主动将其设置为无偏好。
>
> 出于隐私保护等方面的考虑，用户或用户代理也可能在一些情况下在浏览器内部将其设置为  `no-preference`。

借助这个特性我们可以将上述代码改造一下

```scss
@media (prefers-color-scheme: dark) {
    :root {
        --color-background: var(--zt-c-black);

        --color-heading: var(--zt-c-primary);
        --color-text: var(--zt-c-text-dark-1);
        --color-text-2: var(--zt-c-text-dark-2);
    }
}
```

这样就可以保证系统切换暗黑模式时，我们的页面同样也变为暗黑模式啦~

#### 3. 如何设计远程动态主题加载方案，以适应用户自定义主题配置？

在做完上面的事情之后，我们基本上已经可以做到既能手动切换主题，也能自动切换主题了

但是，我又萌生了一个想法，如果是**用户自定义主题上传**，然后使用的话，那我们该怎么设计这个系统？

> 首先，我们要满足用户自定义主题，就得先将主题设置的变量都定义好，让用户需要按照我们规定的一些变量来进行创作，同时也方便代码维护

变量我们就以上面定义的背景色及文字颜色来表示，自定义主题也基本围绕着这几种变量来设计

> 其次，我们需要实现远程动态加载主题的方案

我的思路是利用动态添加 `<link rel='stylesheet' href='xxx' />`的方式

这个方案需要注意避免两个问题：

1. 设置主题的过程中需保证主题资源 link 不会重复添加
    - 不然真的会有很多很多个 link 标签出现，别问我怎么知道的
2. 新旧主题资源切换时需注意控制主题过渡
    - 开始没注意，没等新主题资源加载完成就删除了旧主题，导致页面瞬间变回默认的 Light 主题

> 最后，我们也要保证可以在远程主题与本地主题的刷新保留问题

前面的工作做好，我们已经可以实现各种姿势的主题切换了(代码可以看文末的 Demo)

但还有个问题没解决，就是刷新之后主题又会回归原样。

我的想法是**将 `themeTag` 持久化储存，每次刷新时同步该主题，这样基本上就保证了主题的一致性**

但如果是远程加载的主题的话，还是存在刷新后 `link` 标签丢失，需要重新添加的情况，所以会存在一定的体验问题，这个也希望各位看客们可以给一些意见共同讨论一下怎么设计比较好~

## Demo

示例：https://ztstory.github.io/vue-theme/#/

源码：https://github.com/ZTStory/vue-theme
