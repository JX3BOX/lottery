package database

import (
	"log"
	"os"
	"path"

	"github.com/jx3box/lottery/database/schema"
	_ "github.com/mattn/go-sqlite3"
	"xorm.io/xorm"
)

var engine *xorm.Engine

// InitDriver 初始化数据库驱动
func InitDriver() {
	var connectErr error
	dbPath := "lottery.db"
	if v := os.Getenv("WORKSPACE"); v != "" {
		dbPath = path.Join(v, dbPath)
	}
	engine, connectErr = xorm.NewEngine("sqlite3", dbPath)
	// engine.ShowSQL(true)
	if connectErr != nil {
		log.Fatal(connectErr)
	}
	if err := engine.Ping(); err != nil {
		log.Fatal("数据库链接失败", err)
	}
	if err := engine.Sync2(new(schema.User), new(schema.Setting), new(schema.Award), new(schema.LuckyPeople)); err != nil {
		log.Fatal(err)
	} else {
		log.Println("同步数据库结构成功")
	}
	log.Println("数据库连接成功")
}

func Get() *xorm.Engine {
	return engine
}
