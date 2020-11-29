package data

import (
	"os"
	"testing"

	"github.com/huyinghuan/lottery/database"
)

func TestInsertUser(t *testing.T) {
	initPoolUserData()
}
func TestInsertAward(t *testing.T) {
	initAwardData()
}
func TestInsertSettings(t *testing.T) {
	initSettingData()
}
func TestMain(m *testing.M) {
	database.InitDriver()
	os.Exit(m.Run())
}
