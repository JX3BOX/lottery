package v

import (
	"log"
	"testing"
)

func TestGetAllSettings(t *testing.T) {
	list, err := GetAllSettings()
	if err != nil {
		t.Fatal(err)
	}
	log.Println(list)
}

func TestGetNextSetting(t *testing.T) {
	one, err := GetNextSetting()
	if err != nil {
		t.Fatal(err)
	}
	log.Println(one)
}
