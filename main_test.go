package main

import (
	"encoding/json"
	"fmt"
	"log"
	"math/rand"
	"os"
	"testing"

	"github.com/huyinghuan/lottery/c"
	"github.com/huyinghuan/lottery/data"
	"github.com/huyinghuan/lottery/database"
	"github.com/huyinghuan/lottery/database/schema"
	"github.com/kataras/iris/v12/httptest"
)

func TestMain(m *testing.M) {
	database.InitDriver()
	log.Println("数据库重置...")
	data.InitData()
	log.Println("数据库重置完成!")
	os.Exit(m.Run())
}

func TestHttp(t *testing.T) {
	var settingList []schema.Setting
	testApp := GetApp()
	t.Run("获取抽奖设置", func(t *testing.T) {
		e := httptest.New(t, testApp)
		resp := e.GET("/api/setting").Expect()
		resp.Status(200)
		resp.JSON().Object().Value("code").Number().Equal(0)
		b, er := json.Marshal(resp.JSON().Object().Value("data").Raw())
		if er != nil {
			t.Fail()
		}
		if err := json.Unmarshal(b, &settingList); err != nil {
			log.Println(err, 9999)
			t.Fail()
		}
		if len(settingList) == 0 {
			t.Fail()
		}
	})
	if t.Failed() {
		t.Skip(t)
	}

	for i, setting := range settingList {
		if i != 0 {
			break
		}
		t.Run(fmt.Sprintf("抽奖规则:%d", setting.ID), func(t *testing.T) {
			e := httptest.New(t, testApp)
			resp := e.GET("/api/setting/prepare/{id}").WithPath("id", setting.ID).Expect()
			resp.Status(200)
			resp.JSON().Object().Value("code").Number().Equal(0)
			b, er := json.Marshal(resp.JSON().Object().Value("data").Object().Value("setting").Raw())
			if er != nil {
				t.Fail()
			}
			var s schema.Setting
			if err := json.Unmarshal(b, &s); err != nil {
				t.Fail()
			}
			var userList []schema.User
			b, er = json.Marshal(resp.JSON().Object().Value("data").Object().Value("userList").Raw())
			if er != nil {
				t.Fail()
			}
			if err := json.Unmarshal(b, &userList); err != nil {
				t.Fail()
			}
			if s.ID != setting.ID {
				t.Fail()
			}
			if len(userList) == 0 {
				t.Fail()
			}
			var form c.LuckyPeopleListForm
			form.SettingId = s.ID
			totalCount := 0
			for _, rule := range s.Rule {
				totalCount = totalCount + rule.Count
				form.LuckyRule = append(form.LuckyRule, c.LuckyRule{AwardId: rule.AwardId, UserIdList: getLuckPeopleList(rule.Count, userList)})
			}
			t.Run("提交中奖名单", func(t *testing.T) {
				e := httptest.New(t, testApp)
				log.Println(form)
				resp := e.POST("/api/lucky-people").WithJSON(form).Expect()
				resp.Status(200)
				resp.JSON().Object().Value("code").Number().Equal(0)
				resp.JSON().Object().Value("data").Object().Value("effect").Number().Equal(float64(totalCount))
				log.Println(resp.JSON().Object().Value("msg").String().Raw())
			})
			t.Run("获取中间名单", func(t *testing.T) {
				e := httptest.New(t, testApp)
				resp := e.GET("/api/lucky-people/at/setting/{id}").WithPath("id", s.ID).Expect()
				resp.Status(200)
				resp.JSON().Object().Value("code").Number().Equal(0)
				resp.JSON().Object().Value("data").Array().Length().Equal(totalCount)
			})
			t.Run("重复-提交中奖名单", func(t *testing.T) {
				e := httptest.New(t, testApp)
				log.Println(form)
				resp := e.POST("/api/lucky-people").WithJSON(form).Expect()
				resp.Status(200)
				resp.JSON().Object().Value("code").Number().Equal(405)
				log.Println(resp.JSON().Object().Value("msg").String().Raw())
			})
		})
	}
}

func getLuckPeopleList(count int, list []schema.User) []int64 {

	i := 0
	length := len(list)
	var queue []int64
	if count > length {
		for _, item := range list {
			queue = append(queue, item.ID)
		}
		return queue
	}
	var r = make(map[int64]bool)
	for i < count {
		idx := rand.Intn(length)
		if _, ok := r[list[idx].ID]; !ok {
			r[list[idx].ID] = true
			queue = append(queue, list[idx].ID)
			i++
		}
	}
	return queue
}
