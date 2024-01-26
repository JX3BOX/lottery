package data

import (
	"encoding/json"
	"io/ioutil"
	"log"
	"os"
	"path"

	"github.com/jx3box/lottery/database"
	"github.com/jx3box/lottery/database/schema"
)

func getFilePath(u string) string {
	if w := os.Getenv("WORKSPACE"); w != "" {
		return path.Join(w, u)
	}
	return u
}

func initPoolUserData() {
	os.MkdirAll(getFilePath("static/avatar"), 0777)
	db := database.Get()
	db.Where("id > 0").Delete(new(schema.User))
	initUserData("conf/user.json")
}

func initUserData(filename string) {
	db := database.Get()
	userBody, err := ioutil.ReadFile(getFilePath(filename))
	if err != nil {
		log.Fatal(err)
	}
	var userList []schema.User
	json.Unmarshal(userBody, &userList)
	poolMap := make(map[string]int)
	for _, user := range userList {
		download(&user, getFilePath("static/avatar"))
		if _, err := db.Insert(user); err != nil {
			log.Println(err)
		}
		poolMap[user.Pool] = poolMap[user.Pool] + 1
	}
	for pool, count := range poolMap {
		log.Printf("%s 成功插入用户数据 %d 条\n", pool, count)
	}
}
func initAwardData() {
	db := database.Get()
	db.Where("id > 0").Delete(new(schema.Award))

	userBody, err := ioutil.ReadFile(getFilePath("conf/award.json"))
	if err != nil {
		log.Fatal(err)
	}
	var list []schema.Award
	json.Unmarshal(userBody, &list)
	count := len(list)
	if count > 0 {
		i := 0
		for {
			start := i * 50
			end := (i + 1) * 50
			if end > count {
				if start == count {
					break
				}
				if _, err := db.Insert(list[start:count]); err != nil {
					log.Fatal(err)
				}
				break
			} else {
				if _, err := db.Insert(list[start:end]); err != nil {
					log.Fatal(err)
				}
			}
			i++
		}
	}
	insertSuccessCount, err := db.Count(new(schema.Award))
	if err != nil {
		log.Fatal(err)
	}
	if insertSuccessCount != int64(count) {
		log.Fatalf("奖品 插入数量 %d != %d 实际配置数据", insertSuccessCount, count)
	} else {
		log.Printf("奖品 成功插入数据 %d 条\n", insertSuccessCount)
	}
}
func initSettingData() {
	db := database.Get()
	db.Where("id > 0").Delete(new(schema.Setting))

	body, err := ioutil.ReadFile(getFilePath("conf/setting.json"))
	if err != nil {
		log.Fatal(err)
	}
	var list []schema.Setting
	json.Unmarshal(body, &list)
	for _, item := range list {
		if b, err := json.Marshal(item.Rule); err != nil {
			log.Fatal(err)
		} else {
			item.RuleContent = string(b)
		}
		if _, err := db.Insert(item); err != nil {
			log.Fatal(err)
		}
	}

	insertSuccessCount, err := db.Count(new(schema.Setting))
	if err != nil {
		log.Fatal(err)
	}
	if insertSuccessCount != int64(len(list)) {
		log.Fatalf("抽奖规则 插入数量 %d != %d 实际配置数据", insertSuccessCount, len(list))
	} else {
		log.Printf("抽奖规则 成功插入数据 %d 条\n", insertSuccessCount)
	}
}
func InitData() {
	//if err := os.Remove(getFilePath("lottery.db")); err != nil {
	//	log.Println(err)
	//}
	initPoolUserData()
	initAwardData()
	initSettingData()
}

func Reset() {
	db := database.Get()
	db.Where("id > 0").Delete(new(schema.LuckyPeople))
	db.Where("id > 0").Cols("status").Update(schema.Setting{Status: 0})
}
