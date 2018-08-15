# Matchvs_demo_creator
用Matchvs SDK 和 creator 开发的多人摘星星，用于演示多人匹配、数据传输、帧同步、消息订阅等功能，本demo开始使用的creator版本为1.9.3,因为creator修改了部分API，暂不支持。

## 1：加载插件

文件路径demo/assets/script/Matchvs.js

Matchvs.js文件主要用于加载插件以及在native环境下加载JSB。

## 2：Matcvhs SDK使用的封装

 1: 文件路径demo/assets/script/MatchvsEngine.js

主要封装了Matchvs SDK的主要功能请求。 例如 login ，registerUser等。

 2: 文件路径demo/assets/script/MatchvsDemoResponse.js

主要封装了Matchvs SDK的主要功能请求的异步回调，以及一部分通知。例如 loginResponse joinRoomNotify。 在这里收到对应的通知或通知以后，在通过 cocos的事件传递机制把对应的数据传递出去，

[cocos 事件传递机制参考地址 ](http://docs.cocos.com/creator/manual/zh/scripting/events.html?h=%E4%BA%8B%E4%BB%B6%E4%BC%A0%E9%80%92)

 3: 文件地址 demo-creator/assets/scripts/MatvhvsMessage.js

主要封装了事件传递所需的一些常量；

## 3：cocosCreatorDemo的使用

### 1：调试

 1：单浏览器调试：下载demo代码，在Creator运行使用浏览器调试，登陆成功以后，再次在creator点击预览，在demo 首页点击clera，在点击登陆，即可在一个浏览器工具上进行预览调试。
 2：多浏览器调试：下载demo代码，在Creator运行使用浏览器调试，拷贝预览url ，打开不同浏览器，输入url，即可进行调试。

### 2：demo assets文件夹下文件的含义。

anim放的是对应的动画文件。 

prefab放的是对应的预知体。

scripts 放的是对应的JS文件。

没有放入文件夹的是对应的场景文件。

### 3：功能性的JS文件。

 1：文件路径demo/assets/script/Glb.js

主要存放了一些全局变量，游戏的appKey  secret gameID。就存放在这里，如果需要改成自己创建的GameID，在此处修改。

 2：文件路径demo/assets/script/wxshare.js

主要存放了一些微信所需第三方方法，微信分享，获取微信头像等。

 3：文件路径demo/assets/script/Player.js

主要负责游戏场景人物的移动逻辑。

 4：文件路径demo/assets/script/md5.js

负责MD5加密。


### 4：demo运行的基本流程

login —> Lobby -> Match -> game -> result -> Lobby;

登陆 ——》大厅 ——》 随机匹配 ——》游戏场景 ——》 结算页面 ——》大厅。








