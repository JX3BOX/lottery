package v

import (
	"github.com/jx3box/lottery/database"
	"github.com/jx3box/lottery/database/schema"
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
	session := db.NewSession()
	defer session.Close()

	// 已中奖人员不重复中奖
	if _, err := session.In("id", userIds).Cols("status").Update(schema.User{Status: 1}); err != nil {
		return 0, err
	}
	effect, err := session.Insert(queue)
	if err != nil {
		return 0, err
	}
	return effect, session.Commit()
}

type LuckyPeopleExtend struct {
	//AwardName          string `xorm:"award_name" json:"award_name"` //
	//AwardImage         string `xorm:"award_image" json:"award_image"`
	LuckyPeople schema.LuckyPeople `xorm:"extends" json:"lucky_people"`
	Award       schema.Award       `xorm:"extends" json:"award"`
	User        schema.User        `xorm:"extends" json:"user"`
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
func GetLuckyPeopleBySettingId(id int64) ([]LuckyPeopleExtend, error) {
	db := database.Get()
	var list []LuckyPeopleExtend
	err := db.Table("lucky_people").
		Join("LEFT", "award", "lucky_people.award_id = award.id").
		Join("LEFT", "user", "lucky_people.user_id = user.id").
		Where("lucky_people.setting_id = ?", id).
		Cols("lucky_people.*", "award.*", "user.*").
		Find(&list)
	return list, err
}
