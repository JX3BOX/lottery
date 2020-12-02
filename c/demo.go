package c

import (
	"io/ioutil"

	"github.com/huyinghuan/lottery/data"
	"github.com/kataras/iris/v12"
)

func Demo(ctx iris.Context) {
	data.GenerateDemoData()
}

func ReadConfig(ctx iris.Context) {
	data.InitData()
}

func ResetDB(ctx iris.Context) {
	data.Reset()
}

func T(ctx iris.Context) {
	ioutil.ReadAll(ctx.Request().Body)
}
