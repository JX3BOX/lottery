package v

import (
	"log"
	"testing"
)

func TestGetUserListByPool(t *testing.T) {
	list, err := GetUserListByPool("Pool_U")
	if err != nil {
		t.Fatal(err)
	}
	log.Println(len(list))
}
