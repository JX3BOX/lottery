package c

import (
	"fmt"
	"log"

	"github.com/huyinghuan/lottery/database/v"

	"github.com/kataras/iris/v12"
)

type LuckyRule struct {
	AwardId    int64   `json:"award_id"`
	UserIdList []int64 `json:"user_id_list"`
}

type LuckyPeopleListForm struct {
	SettingId int64       `json:"setting_id"`
	LuckyRule []LuckyRule `json:"lucky_rule"`
}

func PostLuckyPeople(ctx iris.Context) {
	var form LuckyPeopleListForm
	if err := ctx.ReadJSON(&form); err != nil {
		log.Println(err)
		ctx.JSON(map[string]interface{}{
			"code": 500,
			"msg":  err.Error(),
		})
	}
	// 默认情况下 浏览器提交的数据不用校验，因为只有本地运行，不允许篡改

	// 校验基本数据
	setting, err := v.GetSetting(form.SettingId)
	if err != nil {
		log.Println(err)
		ctx.JSON(map[string]interface{}{
			"code": 500,
			"msg":  err.Error(),
		})
	}

	if setting.ID == 0 {
		ctx.JSON(map[string]interface{}{
			"code": 404,
			"msg":  "本次抽奖无效，找不到相关抽奖记录",
		})
		return
	}
	if setting.Status == 1 {
		ctx.JSON(map[string]interface{}{
			"code": 405,
			"msg":  "本次抽奖已完成，无法重复抽奖",
		})
		return
	}
	code := 0
	msg := ""
	for _, luckRule := range form.LuckyRule {
		matchAward := false
		matchCount := false
		for _, rule := range setting.Rule {
			if luckRule.AwardId == rule.AwardId {
				matchAward = true
				if len(luckRule.UserIdList) <= rule.Count {
					matchCount = true
				}
				break
			}
		}
		if !matchAward || !matchCount {
			code = 406
			if !matchAward {
				msg = "提交抽奖奖品错误，当前抽奖设定找不到该奖品."
			}
			if !matchCount {
				msg = msg + "提交的中奖人数大于预设值"
			}
			break
		}
	}
	if code != 0 {
		ctx.JSON(map[string]interface{}{
			"code": code,
			"msg":  msg,
		})
		return
	}

	count := int64(0)

	// 插入数据
	for _, luckRule := range form.LuckyRule {
		effect, err := v.InsertLuckyPeople(setting.ID, luckRule.AwardId, luckRule.UserIdList)
		if err != nil {
			log.Println(err)
			ctx.JSON(map[string]interface{}{
				"code": 500,
				"msg":  err.Error(),
			})
			return
		}
		count = count + effect
	}

	// 更新已完成抽奖
	if _, err := v.UpdateSettingStatusToUsed(setting.ID); err != nil {
		log.Println(err)
		ctx.JSON(map[string]interface{}{
			"code": 500,
			"msg":  err.Error(),
		})
		return
	}

	ctx.JSON(map[string]interface{}{
		"code": 0,
		"msg":  fmt.Sprintf("本次中奖人数为:%d", count),
		"data": map[string]interface{}{
			"effect": count,
		},
	})

}

func GetLuckPeopleList(ctx iris.Context) {
	id, _ := ctx.Params().GetInt64("id")
	list, err := v.GetLuckyPeopleBySettingId(id)
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
		"data": list,
	})
}
