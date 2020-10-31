package c

import (
	"github.com/huyinghuan/lottery/data"
	"github.com/kataras/iris/v12"
)

func Demo(ctx iris.Context) {
	data.GenerateDemoData()
}

func ReadConfig(ctx iris.Context) {
	data.InitData()
}
