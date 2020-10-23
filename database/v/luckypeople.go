package v

import (
	"github.com/huyinghuan/lottery/database"
	"github.com/huyinghuan/lottery/database/schema"
)

func InsertLuckyPeople(settingId int64, awardId int64, userIds []int64) (int64, error) {
	var queue []schema.LuckyPeople
	for _, userId := range userIds {
		queue = append(queue, schema.LuckyPeople{
			AwardId:   awardId,
			SettingId: settingId,
			UserId:    userId,
		})
	}
	db := database.Get()
	return db.Insert(queue)
}

type LuckyPeopleExtend struct {
	schema.LuckyPeople `xorm:"extends"`
	AwardName          string `xorm:"award_name" json:"award_name"` //
	AwardImage         string `xorm:"award_image" json:"award_image"`
}

func GetAllLuckyPeople() ([]LuckyPeopleExtend, error) {
	db := database.Get()
	var list []LuckyPeopleExtend
	err := db.Table("lucky_people").
		Join("LEFT", "award", "lucky_people.award_id = award.id").
		Cols("lucky_people.*", "award.name as award_name", "award.image as award_image").
		Find(&list)
	return list, err
}
