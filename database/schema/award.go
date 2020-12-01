package schema

// 奖品
type Award struct {
	ID       int64  `xorm:"'id' unique index pk" json:"id"`
	Name     string `xorm:"'name'" json:"name"`
	Image    string `xorm:"'image'" json:"image"`
	Amount   string `xorm:"'amount'" json:"amount"`
	Category string `xorm:"'category'" json:"category"`
}

func (a Award) TableName() string {
	return "award"
}
