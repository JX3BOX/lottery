package data

import (
	"encoding/json"
	"io/ioutil"
	"log"
	"math/rand"
	"os"
	"strconv"
	"time"

	"github.com/huyinghuan/lottery/database/schema"
)

// GenerateDemoData 生成测试数据
func GenerateDemoData() {
	if err := os.MkdirAll("conf", 0775); err != nil {
		log.Fatal(err)
	}
	// 生成2个用户池
	userPoolNames := []string{"Pool_U", "Pool_T"}
	var userPool []schema.User
	for _, pool := range userPoolNames {
		for i := 1; i <= 5000; i++ {
			userPool = append(userPool, schema.User{
				Name:   pool + "__" + strconv.Itoa(i),
				Avatar: "/demo.png",
				Pool:   pool,
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
	awardCategoryCount := 10
	for i := 1; i <= awardCategoryCount; i++ {
		awardQueue = append(awardQueue, schema.Award{
			ID:    int64(i),
			Name:  "奖品_" + strconv.Itoa(i),
			Image: "/demo.png",
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

	rand.Seed(time.Now().UnixNano())
	var doLotterySettingItems []schema.Setting
	for i := 0; i < 10; i++ {
		poolName := userPoolNames[i%len(userPoolNames)]

		var rules []schema.SettingRule
		// 每次抽奖，抽取3个内类型的奖品
		for j := 0; j < rand.Intn(3)+1; j++ {
			rules = append(rules, schema.SettingRule{
				AwardId: int64(rand.Intn(awardCategoryCount) + 1),
				Count:   10,
			})
		}
		doLotterySettingItems = append(doLotterySettingItems, schema.Setting{
			Pool: poolName,
			Rule: rules,
		})
	}
	body, err = json.Marshal(doLotterySettingItems)
	if err != nil {
		log.Fatalln(err)
	}
	if err := ioutil.WriteFile("conf/setting.json", body, 0666); err != nil {
		log.Fatalln(err)
	}
	log.Println("demo 抽奖规则 10轮 数据配置初始化完成!")
}
