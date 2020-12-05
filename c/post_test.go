package c

import (
	"os"
	"testing"

	"github.com/huyinghuan/lottery/database"
)

func TestMain(m *testing.M) {
	database.InitDriver()
	os.Exit(m.Run())
}
func TestPost(t *testing.T) {
	Post()
}
