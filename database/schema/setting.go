package schema

type SettingRule struct {
	AwardId int64 `json:"award_id"` // 奖品id
	Count   int64 `json:"count"`    // 抽取个数
}

type SettingItem struct {
	Pool string        `json:"pool"` // 用户池
	Rule []SettingRule `json:"rule"` // 抽奖规则
}

// 抽奖次数和每轮奖品设置
type Setting struct {
	ID      int64         `xorm:"'id' unique autoincr index pk" json:"id"`
	Content string        `xorm:"'content'" json:"-"` // 抽奖配置json 字符串
	Setting []SettingItem `xorm:"-" json:"setting"`
	Status  int           `xorm:"'status'" json:"status"` // 是否完成抽奖
}

func (s Setting) TableName() string {
	return "lottery_setting"
}
