package main

import (
	"context"
	"flag"
	"log"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/huyinghuan/lottery/data"
	"github.com/huyinghuan/lottery/database"
	"github.com/huyinghuan/lottery/database/v"
	"github.com/kataras/iris/v12"
)

var Version = "Dev"
var BuildTime = time.Now().Format("2006-01-02 15:04:05")

func GetApp() *iris.Application {
	log.Println("启动服务")
	app := iris.New()
	app.HandleDir("/", "static")

	api := app.Party("/api", func(ctx iris.Context) {
		// 禁止其他ip TODO
		ctx.Next()
	})
	api.Get("/prepare/setting/{id:int64}", func(ctx iris.Context) {
		id, _ := ctx.Params().GetInt64("id")
		setting, err := v.GetNextSetting(id)
		if err != nil {
			log.Println(err)
			ctx.JSON(map[string]interface{}{
				"code": 501,
				"msg":  err.Error(),
			})
			return
		}
		if setting.ID == 0 {
			ctx.JSON(map[string]interface{}{
				"code": 404,
				"msg":  "该抽奖规则不存在，或者已完成抽奖",
			})
			return
		}
		list, err := v.GetUserListByPool(setting.Pool)
		if err != nil {
			log.Println(err)
			ctx.JSON(map[string]interface{}{
				"code": 501,
				"msg":  err.Error(),
			})
			return
		}
		ctx.JSON(map[string]interface{}{
			"code": 0,
			"data": map[string]interface{}{
				"setting":  setting,
				"userList": list,
			},
		})
	})
	return app
}

var InitData = ""
var DemoData = ""

func main() {
	var port string
	var initData, genDemoData bool
	flag.StringVar(&port, "port", "", "端口号【生产环境可用】")
	flag.BoolVar(&initData, "init", false, "初始化数据")
	flag.BoolVar(&genDemoData, "demo", false, "生成测试用json配置")
	flag.Parse()

	log.Println("Program Version  : ", Version)
	log.Println("Program BuildTime: ", BuildTime)
	log.Println("Program Author   : ", "ec.huyinghuan@gmail.com")

	if genDemoData || DemoData == "true" {
		data.GenerateDemoData()
	}

	database.InitDriver()
	if initData || InitData == "true" {
		// 初始化用户数据和奖品数据
		data.InitData()
	}

	app := GetApp()

	targetPort := ":" + port
	if targetPort == ":" {
		targetPort = ":14422"
	}
	gracefulStop := make(chan os.Signal)
	signal.Notify(gracefulStop, syscall.SIGTERM)
	signal.Notify(gracefulStop, syscall.SIGINT)
	go func() {
		<-gracefulStop
		log.Println("服务关闭中...")
		app.Shutdown(context.Background())
		time.Sleep(time.Second)
	}()
	if err := app.Listen(targetPort); err != nil {
		log.Fatalln(err)
	}

}
