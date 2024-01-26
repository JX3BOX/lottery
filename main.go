package main

import (
	"context"
	"flag"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	gorillaWs "github.com/gorilla/websocket"
	"github.com/jx3box/lottery/c"
	"github.com/jx3box/lottery/data"
	"github.com/jx3box/lottery/database"
	"github.com/kataras/iris/v12"
	"github.com/kataras/iris/v12/websocket"
	"github.com/kataras/neffos/gorilla"
)

var Version = "Dev"
var BuildTime = time.Now().Format("2006-01-02 15:04:05")

func GetApp() *iris.Application {
	log.Println("启动服务")
	app := iris.New()

	var serverEvents = websocket.Namespaces{
		"default": websocket.Events{
			websocket.OnNamespaceConnected: func(nsConn *websocket.NSConn, msg websocket.Message) error {
				// with `websocket.GetContext` you can retrieve the Iris' `Context`.
				log.Println("websock 建立连接")
				return nil
			},
			"next": func(nsConn *websocket.NSConn, msg websocket.Message) error {
				// room.String() returns -> NSConn.String() returns -> Conn.String() returns -> Conn.ID()
				log.Printf("[%s] sent: %s", nsConn, string(msg.Body))

				// Write message back to the client message owner with:
				// nsConn.Emit("next", []byte("11111"))
				// Write message to all except this client with:
				nsConn.Conn.Server().Broadcast(nsConn, msg)
				return nil
			},
			"finish": func(nsConn *websocket.NSConn, msg websocket.Message) error {
				// room.String() returns -> NSConn.String() returns -> Conn.String() returns -> Conn.ID()
				log.Printf("[%s] sent: %s", nsConn, string(msg.Body))

				// Write message back to the client message owner with:
				// nsConn.Emit("next", []byte("11111"))
				// Write message to all except this client with:
				nsConn.Conn.Server().Broadcast(nsConn, msg)
				return nil
			},
		},
	}
	websocketServer := websocket.New(
		gorilla.Upgrader(gorillaWs.Upgrader{CheckOrigin: func(*http.Request) bool { return true }}), /* DefaultGobwasUpgrader can be used too. */
		serverEvents)

	app.HandleDir("/", "static")
	app.Get("/sync-action", websocket.Handler(websocketServer))
	api := app.Party("/api", func(ctx iris.Context) {
		// 禁止其他ip TODO
		ctx.Next()
	})
	api.Get("/award", c.AwardList)
	api.Post("/award", c.AddAward)
	// 增加用户池 TODO
	// api.Post("/user-pool/from-url", c.FetchUserPoolFromURL)

	// 获取用户池分组
	api.Get("/user-pool-list", c.UserPoolList)
	api.Get("/setting/prepare/{id:int64}", c.PrepareSetting)
	api.Get("/setting", c.GetAllSettings)
	api.Post("/setting", c.AddSettings)
	// 提交中奖名单
	api.Post("/setting/lucky-people/{id:int64}", c.PostLuckyPeople)
	// 获取中将名单
	api.Get("/lucky-people/at/setting/{id:int64}", c.GetLuckPeopleList)
	// demo数据
	api.Get("/setting/demo", c.Demo)
	// 读取配置文件初始化数据到数据库
	api.Get("/setting/config", c.ReadConfig)
	api.Get("/setting/config/reset", c.ResetDB)
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
		return
	}

	database.InitDriver()
	if initData || InitData == "true" {
		// 初始化用户数据和奖品数据
		data.InitData()
		return
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
