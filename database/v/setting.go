package v

import (
	"encoding/json"
	"fmt"

	"github.com/jx3box/lottery/database"
	"github.com/jx3box/lottery/database/schema"
)

func formatRuleContent(content string, awardIDMap map[int64]schema.Award) ([]schema.SettingRule, error) {
	var rules []schema.SettingRule
	if e := json.Unmarshal([]byte(content), &rules); e != nil {
		return rules, e
	}
	for i, rule := range rules {
		if award, exists := awardIDMap[rule.AwardId]; exists {
			rule.AwardImage = award.Image
			rule.AwardName = award.Name
			rules[i] = rule
		} else {
			return rules, fmt.Errorf("找不到奖品 %d", rule.AwardId)
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
	var awardIDMap map[int64]schema.Award
	awardIDMap, err = getAwardIDMap()
	if err != nil {
		return list, err
	}
	for i, item := range list {
		var rules []schema.SettingRule
		rules, err = formatRuleContent(item.RuleContent, awardIDMap)
		if err != nil {
			return
		}
		item.Rule = rules
		list[i] = item
	}
	return
}
func getAwardIDMap() (map[int64]schema.Award, error) {
	db := database.Get()
	var awardList []schema.Award
	if err := db.Find(&awardList); err != nil {
		return nil, err
	}
	awardIDMap := make(map[int64]schema.Award)
	for _, award := range awardList {
		awardIDMap[award.ID] = award
	}
	return awardIDMap, nil
}

// 获取一次抽奖规则
func GetNextSetting(settingId int64) (setting schema.Setting, err error) {
	db := database.Get()
	_, err = db.Where("status = ?", 0).Where("id = ?", settingId).Get(&setting)
	if setting.ID != 0 {
		var rules []schema.SettingRule
		var awardIDMap map[int64]schema.Award
		awardIDMap, err = getAwardIDMap()
		if err != nil {
			return setting, err
		}
		rules, err = formatRuleContent(setting.RuleContent, awardIDMap)
		if err != nil {
			return
		}
		setting.Rule = rules
	}
	return
}

// 获取一次抽奖规则
func GetSetting(settingId int64) (setting schema.Setting, err error) {
	db := database.Get()
	_, err = db.Where("id = ?", settingId).Get(&setting)
	if setting.ID != 0 {
		var rules []schema.SettingRule
		var awardIDMap map[int64]schema.Award
		awardIDMap, err = getAwardIDMap()
		if err != nil {
			return setting, err
		}
		rules, err = formatRuleContent(setting.RuleContent, awardIDMap)
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
