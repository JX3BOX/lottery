package c

import (
	"encoding/json"
	"log"

	"github.com/huyinghuan/lottery/database"
	"github.com/huyinghuan/lottery/database/schema"
	"github.com/huyinghuan/lottery/database/v"
	"github.com/kataras/iris/v12"
)

func PrepareSetting(ctx iris.Context) {
	id, _ := ctx.Params().GetInt64("id")
	setting, err := v.GetNextSetting(id)
	if err != nil {
		log.Println(err)
		ctx.JSON(map[string]interface{}{
			"code": 501,
			"msg":  err.Error(),
		})
		return
	}
	if setting.ID == 0 {
		ctx.JSON(map[string]interface{}{
			"code": 404,
			"msg":  "该抽奖规则不存在，或者已完成抽奖",
		})
		return
	}
	list, err := v.GetLuckyUserPoolByPool(setting.Pool, 1000)
	if err != nil {
		log.Println(err)
		ctx.JSON(map[string]interface{}{
			"code": 501,
			"msg":  err.Error(),
		})
		return
	}
	ctx.JSON(map[string]interface{}{
		"code": 0,
		"data": map[string]interface{}{
			"setting":  setting,
			"userList": list,
		},
	})
}

func GetAllSettings(ctx iris.Context) {
	s, err := v.GetAllSettings()
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
		"data": s,
	})
}

func AddSettings(ctx iris.Context) {
	var s schema.Setting

	if err := ctx.ReadJSON(&s); err != nil {
		log.Println(err)
		ctx.JSON(map[string]interface{}{
			"code": 500,
			"msg":  err.Error(),
		})
		return
	}
	db := database.Get()

	if b, err := json.Marshal(s.Rule); err != nil {
		log.Fatal(err)
	} else {
		s.RuleContent = string(b)
	}
	effect, err := db.Insert(&s)
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
