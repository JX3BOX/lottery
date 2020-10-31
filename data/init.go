package data

import (
	"encoding/json"
	"io/ioutil"
	"log"
	"os"
	"path"

	"github.com/huyinghuan/lottery/database/schema"

	"github.com/huyinghuan/lottery/database"
)

func getFilePath(u string) string {
	if w := os.Getenv("WORKSPACE"); w != "" {
		return path.Join(w, u)
	}
	return u
}

func initUserData() {
	db := database.Get()

	db.Where("id > 0").Delete(new(schema.User))

	userBody, err := ioutil.ReadFile(getFilePath("conf/user.json"))
	if err != nil {
		log.Fatal(err)
	}
	var userList []schema.User
	json.Unmarshal(userBody, &userList)
	userCount := len(userList)
	if userCount > 0 {
		i := 0
		for {
			start := i * 50
			end := (i + 1) * 50

			if end > userCount {
				if start == userCount {
					break
				}
				if _, err := db.Insert(userList[start:userCount]); err != nil {
					log.Fatal(err)
				}
				break
			} else {
				if _, err := db.Insert(userList[start:end]); err != nil {
					log.Fatal(err)
				}
			}
			i++
		}
	}
	insertSuccessCount, err := db.Count(new(schema.User))
	if err != nil {
		log.Fatal(err)
	}
	if insertSuccessCount != int64(userCount) {
		log.Fatalf("插入用户数量 %d != %d 实际配置数据", insertSuccessCount, userCount)
	} else {
		log.Printf("成功插入用户数据 %d 条\n", insertSuccessCount)
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
	initUserData()
	initAwardData()
	initSettingData()
}

func ReadConfig() {

}
