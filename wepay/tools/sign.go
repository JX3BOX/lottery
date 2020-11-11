package tools

import (
	"crypto/md5"
	"encoding/hex"
	"net/url"
	"sort"
	"strings"
)

// Sign 参数签名
func Sign(apiKey string, values url.Values) string {
	var keyArray []string
	for key := range values {
		if values.Get(key) == "" {
			continue
		}
		keyArray = append(keyArray, key)
	}
	var keyValueArray []string
	sort.Strings(keyArray)

	for _, key := range keyArray {
		keyValueArray = append(keyValueArray, key+"="+values.Get(key))
	}
	keyValueArray = append(keyValueArray, "key="+apiKey)
	beSignStr := strings.Join(keyValueArray, "&")
	hash := md5.Sum([]byte(beSignStr))
	return strings.ToUpper(hex.EncodeToString(hash[:]))
}
