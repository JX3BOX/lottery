package schema

// 抽奖次数和每轮奖品设置
type Setting struct {
	ID      int64  `xorm:"'id' unique autoincr index pk" json:"id"`
	AwardId string `xorm:"'award_id'" json:"award_id"` // 奖品id json数组
	Count   string `xorm:"'count'" json:"count"`       // 抽奖个数  json数组
	Status  int    `xorm:"'status'" json:"status"`     // 是否完成抽奖
}

func (s Setting) TableName() string {
	return "lottery_setting"
}
