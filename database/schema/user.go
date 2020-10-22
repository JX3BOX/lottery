package schema

// 用户库
type User struct {
	ID     int64  `xorm:"'id' unique autoincr index pk" json:"id,omitempty"`
	Name   string `xorm:"name" json:"name"`             //名称
	Avatar string `xorm:"'avatar'" json:"avatar"`       // 头像
	UUID   string `xorm:"'uuid'" json:"uuid,omitempty"` // 唯一编码 用来标示唯一用户，便于接入第三方用户数据
}

func (u User) TableName() string {
	return "user"
}
