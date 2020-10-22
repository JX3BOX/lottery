package v

import (
	"github.com/huyinghuan/lottery/database"
	"github.com/huyinghuan/lottery/database/schema"
)

// 获取待抽奖的用户池
func GetUserListByPool(pool string) (list []schema.User, err error) {
	db := database.Get()
	err = db.Where("pool = ? and status = 0", pool).Find(&list)
	return
}
