## Hack XPJ 重邮新版学评教批量打分脚本

> [!CAUTION]
> 此脚本仅用于学习交流，请勿用于其他用途。

<img width="550" height="592" alt="image" src="https://github.com/user-attachments/assets/b71c926a-487c-4da1-8625-e7720e92a8df" />


## 使用方法

### 第一步：伪造微信环境

由于学评教网站限制了必须使用微信浏览器登录，但又没使用任何微信的开放能力（不知道何意味），我们可以简单地伪造 UA 让服务端认为现在是微信环境。

对于小白用户来说，可以浏览器扩展商店安装 [ModHeader](https://chromewebstore.google.com/detail/modheader-modify-http-hea/idgpnmonknjnojddfkpgkljpfnnfcklj)，添加一个 `Request Header`，`name` 为 `User-Agent`，`value` 为：

```
Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)
AppleWebKit/605.1.15 (KHTML, like Gecko)
Mobile/15E148 MicroMessenger/8.0.0
```

然后用浏览器访问 [学评教网站](http://jwzxm.cqupt.edu.cn/mjwzx2022/tysfrz/index.php?re=xpj)，发现不受微信浏览器登录的限制了。

### 第二步：注入代码

F12 打开控制台 -> 将 [index.js](index.js) 中的代码粘贴到控制台中并执行。

## 实现原理

使用大模型理解混淆的 JavaScript 代码，设法构造提交打分的请求，因为是在浏览器控制台中执行，已经有请求的上下文（例如 cookie），所以可以成功提交。
