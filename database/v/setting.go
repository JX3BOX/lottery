package v

import (
	"encoding/json"

	"github.com/huyinghuan/lottery/database"
	"github.com/huyinghuan/lottery/database/schema"
)

//获取所有抽奖规则
func GetAllSettings() (list []schema.Setting, err error) {
	db := database.Get()
	err = db.Find(&list)
	if err != nil {
		return
	}
	for i, item := range list {
		var rules []schema.SettingRule
		if e := json.Unmarshal([]byte(item.RuleContent), &rules); e != nil {
			err = e
			return
		}
		item.Rule = rules
		list[i] = item
	}
	return
}

// 获取一次抽奖规则
func GetNextSetting() (setting schema.Setting, err error) {
	db := database.Get()
	_, err = db.Where("status = ?", 0).Asc("id").Get(&setting)
	if setting.ID != 0 {
		var rules []schema.SettingRule
		if e := json.Unmarshal([]byte(setting.RuleContent), &rules); e != nil {
			err = e
			return
		}
		setting.Rule = rules
	}
	return
}
