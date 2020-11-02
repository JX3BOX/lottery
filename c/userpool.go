package c

import (
	"log"

	"github.com/huyinghuan/lottery/database"
	"github.com/huyinghuan/lottery/database/schema"
	"github.com/kataras/iris/v12"
)

func UserPoolList(ctx iris.Context) {
	db := database.Get()
	var list []string
	if err := db.Table(new(schema.User)).Distinct("pool").Find(&list); err != nil {
		log.Println(err)
		ctx.JSON(map[string]interface{}{
			"code": 500,
			"msg":  err.Error(),
		})
		return
	}
	ctx.JSON(map[string]interface{}{
		"code": 0,
		"data": list,
	})
}
