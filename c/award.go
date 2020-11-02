package c

import (
	"log"

	"github.com/huyinghuan/lottery/database"
	"github.com/huyinghuan/lottery/database/schema"
	"github.com/kataras/iris/v12"
)

func AwardList(ctx iris.Context) {
	db := database.Get()
	var list []schema.Award
	if err := db.Find(&list); err != nil {
		log.Println(err)
		ctx.JSON(map[string]interface{}{
			"code": 500,
			"msg":  err.Error(),
		})
		return
	}
}

func AddAward(ctx iris.Context) {
	var award schema.Award
	if err := ctx.ReadJSON(&award); err != nil {
		log.Println(err)
		ctx.JSON(map[string]interface{}{
			"code": 500,
			"msg":  err.Error(),
		})
		return
	}
	db := database.Get()
	effect, err := db.Insert(&award)
	if err != nil {
		log.Println(err)
		ctx.JSON(map[string]interface{}{
			"code": 500,
			"msg":  err.Error(),
		})
		return
	}
	ctx.JSON(map[string]interface{}{
		"code": 0,
		"data": map[string]interface{}{
			"effect": effect,
		},
	})
}
