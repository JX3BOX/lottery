## 抽奖

该抽奖程序 每次可以抽取多个不同奖品。

效果： TODO 补充B站地址

## 直接使用

下载`release`下单文件， 然后 参考 ` 配置文件说明` 进行配置

### window

直接双击运行 双击 `app.exe`.

### `linux`或`mac`

终端执行 `./app` 【mac没有编译需要自己编译 运行`build-for-mac.sh`，可执行文件在`release`目录下】


然后用 `chrome` 打开　`http://localhost:14422/` 即可。  `window` 和 `linux`下 按`F11`全屏， `mac`好像是 `cmd + shift + f`全屏

## 二次开发

`Linux` 或 `Mac` 执行:

```shell
go run main.go
# 新开终端
cd web-src
yarn install # npm install
yarn start # npm start
```

`window` 下建议使用`WSL`进行开发

### 动画配置

参数定义在： `web-src/lib/game.ts`的 `IAnimation`和`IEndingAnimation`
参数配置在： `web-src/Lottery.tsx`的`componentDidMount`的`new GameScreen`

使用IDE搜索即可找到具体代码

## 配置文件说明

`lottery/conf-demo`下有测试配置文件，复制`conf-demo`到`conf`即可运行demo

### 用户池 配置

修改文件 `lottery/conf/user.json`

```js
[
    {
        "name": "用户名",
        "avatar":"头像",
        "uuid":"用户唯一标识",
        "pool": "用户池" // 抽奖时 有多个用户池，可选，默认为
    },
    // ...
]
```

### 奖品列表 配置

修改文件 `lottery/conf/award.json`

```js
[
    {
        "id": 1 , // 奖品id，不重复
        "name": "奖品名称",
        "avatar":"奖品图片",
    },
    {
        "id": 2 , 
        "name": "...",
        "avatar":"...",
    }
    // ...
]
```

### 抽奖配置


文件 `setting.json` 放在`lottery/conf/setting.json`

抽奖将按配置依次进行。

```js
[
    // 第一条配置表示，第一轮 从用户池1 抽取 奖品1 10个，奖品2 5个
    {
        "pool":"用户池1", //可选
        "rule":[{
            "award_id": 1, // 奖品id, 请用 奖品配置 award.json 里面的id，
            "count": 10, // 抽多少个奖品，如果每轮抽奖有多个奖品，数组里面填多个奖品的抽奖数量,
        },
        {
            "award_id": 2, // 奖品id, 请用 奖品配置 award.json 里面的id， 如果每轮抽奖有多个奖品，数组里面填多个id
            "count": 5, // 抽多少个奖品，如果每轮抽奖有多个奖品，数组里面填多个奖品的抽奖数量， 
        }]
    },
    // 第二条配置表示，第二轮 从用户池2 抽取 奖品3 20个
    {
        "pool":"用户池2",
        "rule":[{
            "award_id": 3, 
            "count": 20,
        }]
    }
]
```

## License

MIT

## 打赏

如果对你有帮助，可以请喝咖啡。【备注github帐户】