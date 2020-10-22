package schema

type SettingRule struct {
	AwardId int64 `json:"award_id"` // 奖品id
	Count   int64 `json:"count"`    // 抽取个数
}

// 抽奖次数和每轮奖品设置
type Setting struct {
	ID          int64         `xorm:"'id' unique autoincr index pk" json:"id"`
	RuleContent string        `xorm:"'rule_content'" json:"-"` // 抽奖配置json 字符串
	Pool        string        `xorm:"pool" json:"pool"`        // 用户池
	Rule        []SettingRule `xorm:"-" json:"rule"`           // 抽奖规则
	Status      int           `xorm:"'status'" json:"status"`  // 是否完成抽奖
}

func (s Setting) TableName() string {
	return "lottery_setting"
}
