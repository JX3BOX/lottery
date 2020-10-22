package data

import (
	"encoding/json"
	"io/ioutil"
	"log"
	"os"
	"strconv"

	"github.com/huyinghuan/lottery/database/schema"
)

// GenerateDemoData 生成测试数据
func GenerateDemoData() {
	if err := os.MkdirAll("conf", 0666); err != nil {
		log.Fatal(err)
	}
	// 生成2个用户池
	userPoolNames := []string{"Pool_U", "Pool_T"}
	var userPool []schema.User
	for _, pool := range userPoolNames {
		for i := 1; i < 5000; i++ {
			userPool = append(userPool, schema.User{
				Name:   pool + "__" + strconv.Itoa(i),
				Avatar: "/image/demo.png",
			})
		}
	}
	body, err := json.Marshal(userPool)
	if err != nil {
		log.Fatalln(err)
	}
	if err := ioutil.WriteFile("conf/user.json", body, 0666); err != nil {
		log.Fatalln(err)
	}
	log.Println("demo 用户 数据配置初始化完成!")
	// 奖品配置
	var awardQueue []schema.Award
	for i := 1; i < 10; i++ {
		awardQueue = append(awardQueue, schema.Award{
			ID:    int64(i),
			Name:  "奖品_" + strconv.Itoa(i),
			Image: "/image/demo.png",
		})
	}
	body, err = json.Marshal(awardQueue)
	if err != nil {
		log.Fatalln(err)
	}
	if err := ioutil.WriteFile("conf/award.json", body, 0666); err != nil {
		log.Fatalln(err)
	}
	log.Println("demo 奖品 数据配置初始化完成!")

}
