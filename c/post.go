package c

import (
	"log"

	"github.com/huyinghuan/lottery/database"
	"github.com/huyinghuan/lottery/database/schema"
)

func Post() {
	log.Println(111)
	db := database.Get()
	var awardList []schema.Award
	err := db.Where("category = ?", "cash").Find(&awardList)
	if err != nil {
		log.Println(err)
		return
	}
	log.Println(222)
	for _, award := range awardList {

		var luckyList []schema.LuckyPeople

		err := db.Where("award_id = ?", award.ID).Find(&luckyList)

		if err != nil {
			log.Println(err)
			continue
		}
		var ids []int64
		for _, user := range luckyList {
			ids = append(ids, user.UserId)
		}
		log.Printf("获取的 %s 的用户有 %v", award.Name, ids)
	}

}
