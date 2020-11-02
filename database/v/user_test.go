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

func TestGetLuckyUserPoolByPool(t *testing.T) {
	list, err := GetLuckyUserPoolByPool("Pool_U", 1500)
	if err != nil {
		log.Println(err)
	}
	log.Println(len(list))
}

func TestShuffle(t *testing.T) {
	var a []int64
	for i := 0; i < 10000; i++ {
		a = append(a, int64(i))
	}
	shuffle(a)
	log.Println(a)
}
