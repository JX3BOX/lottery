package v

import (
	"encoding/json"
	"fmt"

	"github.com/huyinghuan/lottery/database"
	"github.com/huyinghuan/lottery/database/schema"
)

func formatRuleContent(content string) ([]schema.SettingRule, error) {
	var rules []schema.SettingRule
	db := database.Get()
	if e := json.Unmarshal([]byte(content), &rules); e != nil {
		return rules, e
	}
	for i, rule := range rules {
		var award schema.Award
		if exist, err := db.Where("id = ?", rule.AwardId).Get(&award); err != nil {
			return rules, err
		} else if !exist {
			return rules, fmt.Errorf("找不到奖品 %d", rule.AwardId)
		} else {
			rule.AwardImage = award.Image
			rules[i] = rule
		}
	}
	return rules, nil
}

//获取所有抽奖规则
func GetAllSettings() (list []schema.Setting, err error) {
	db := database.Get()
	err = db.Find(&list)
	if err != nil {
		return
	}
	for i, item := range list {
		var rules []schema.SettingRule
		rules, err = formatRuleContent(item.RuleContent)
		if err != nil {
			return
		}
		item.Rule = rules
		list[i] = item
	}
	return
}

// 获取一次抽奖规则
func GetNextSetting(settingId int64) (setting schema.Setting, err error) {
	db := database.Get()
	_, err = db.Where("status = ?", 0).Where("id = ?", settingId).Get(&setting)
	if setting.ID != 0 {
		var rules []schema.SettingRule
		rules, err = formatRuleContent(setting.RuleContent)
		if err != nil {
			return
		}
		setting.Rule = rules
	}
	return
}

// UpdateSettingStatusToUser
func UpdateSettingStatusToUsed(id int64) (int64, error) {
	db := database.Get()
	return db.Where("id = ?", id).Cols("status").Update(schema.Setting{Status: 1})
}
