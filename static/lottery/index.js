// 单个用户数据体
class UserBlock {
    constructor(x, y, vx, vy, bg, data) {
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.bg = bg;
        this.__data = data;
    }
}

// 
function generateUserBlockPool(canvas, userList) {
    var context = canvas.getContext('2d');
    var pool = [];
    for (var i = 0; i < userList.length; i++) {
        pool.push(new UserBlock())
    }

}

// Setup 1 获取用户
async function prepareSetting(id) {
    return fetch("/api/prepare/setting/" + id).then((response) => {
        if (response.status == 200) {
            return response.json()
        }
        throw new Error(response.statusText)
    }).then((data) => {
        if (data.code == 0) {
            return data.data
        }
        throw new Error(`code:${data.code}, msg:${data.msg}`)
    })
}

async function main() {

    const urlParams = new URLSearchParams(location.search.substring(1));
    const params = Object.fromEntries(urlParams);

    const id = params.id
    if (id == "") {
        alert("没有该抽奖规则!!")
        return
    }

    var screen = document.getElementById('screen');

    // Setup 1 获取用户 和抽奖 配置
    let setting = await prepareSetting(id)
    // 生成动画item池
    generateUserBlockPool(screen, setting.userList)
}