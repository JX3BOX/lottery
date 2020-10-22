## 抽奖

## 直接使用

下载`release`文件， 然后 参考 ` 配置文件说明` 进行配置

### window

直接双击运行 `init.exe` 然后 双击 `app.exe`.

重置抽奖双击 `init.exe`

### `linux`或`mac`

终端执行 `./app --init` 然后 `./app`

重置抽奖: `./app --init`


## 二次开发
### 编译运行

`Linux` 或 `Mac` 执行:

```shell
chmod +x build.sh 
./build.sh
./app --init #初始化配置文件
./app #运行抽奖服务
```

`window` 下自己编译。

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