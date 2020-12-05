package c

import (
	"fmt"
	"io/ioutil"
	"log"
	"net/http"
	"strconv"

	"github.com/jx3box/lottery/database"
	"github.com/jx3box/lottery/database/schema"
)

func Post(id int64) {
	db := database.Get()
	var award schema.Award
	_, err := db.Where("id = ?", id).Get(&award)
	if err != nil {
		log.Println(err)
		return
	}

	var luckyList []schema.LuckyPeopleExtend
	db.Table(new(schema.LuckyPeople)).
		Cols("lucky_people.*", "user.uid as uid", "user.name as name").
		Join("LEFT", "user", "lucky_people.user_id = user.id").
		Where("lucky_people.award_id = ?", award.ID).Find(&luckyList)
	if err != nil {
		log.Println(err)
	}
	var ids []int64
	for _, user := range luckyList {
		ids = append(ids, user.UID)
	}
	amount, err := strconv.Atoi(award.Amount)
	if err != nil {
		log.Println(err)
		return
	}
	toServer(award.ID, award.Name, ids, int64(amount))

}

func toServer(awardId int64, awardName string, ids []int64, amount int64) {
	log.Printf("获取的 %s 的用户 %d 有 %v %d \n", awardName, len(ids), ids, amount)
	var idsStr []string
	for _, id := range ids {
		idsStr = append(idsStr, strconv.Itoa(int(id)))
	}
	url := "TODO:Remote Server"
	log.Println(url)
	method := "POST"

	client := &http.Client{}
	req, err := http.NewRequest(method, url, nil)

	if err != nil {
		fmt.Println(err)
		return
	}
	res, err := client.Do(req)
	if err != nil {
		fmt.Println(err)
		return
	}
	defer res.Body.Close()

	body, err := ioutil.ReadAll(res.Body)
	if err != nil {
		fmt.Println(err)
		return
	}
	fmt.Println(string(body))
}
