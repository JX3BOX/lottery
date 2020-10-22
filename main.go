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
	"github.com/kataras/iris/v12"
)

var Version = "Dev"
var BuildTime = time.Now().Format("2006-01-02 15:04:05")

func GetApp() *iris.Application {
	log.Println("启动服务")
	app := iris.New()
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

	if initData || InitData == "true" {
		// 初始化用户数据和奖品数据
		data.InitData()
	}

	database.InitDriver()

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
