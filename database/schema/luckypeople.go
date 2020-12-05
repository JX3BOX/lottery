package schema

// 中奖名单
type LuckyPeople struct {
	ID        int64 `xorm:"'id' unique autoincr index pk" json:"id"`
	UserId    int64 `xorm:"'user_id'" json:"user_id"`       // 用户id
	AwardId   int64 `xorm:"'award_id'" json:"award_id"`     //奖品
	SettingId int64 `xorm:"'setting_id'" json:"setting_id"` // 第几次抽奖中的奖
}

type LuckyPeopleExtend struct {
	LuckyPeople `xorm:"extends"`
	UID         int64  `xorm:"uid"`
	Name        string `xorm:"name"`
}

func (l LuckyPeople) TableName() string {
	return "lucky_people"
}
