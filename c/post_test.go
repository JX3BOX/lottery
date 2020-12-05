package c

import (
	"os"
	"testing"

	"github.com/jx3box/lottery/database"
)

func TestMain(m *testing.M) {
	database.InitDriver()
	os.Exit(m.Run())
}
func TestPost(t *testing.T) {
	Post(6)
}
