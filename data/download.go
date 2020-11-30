package data

import (
	"crypto/md5"
	"encoding/hex"
	"errors"
	"fmt"
	"io"
	"log"
	"net/http"
	"net/url"
	"os"
	"path"

	"github.com/huyinghuan/lottery/database/schema"
)

func getMD5Hash(text string) string {
	hash := md5.Sum([]byte(text))
	return hex.EncodeToString(hash[:])
}
func download(user *schema.User, dir string) {
	if user.Avatar == "" {
		user.Avatar = fmt.Sprintf("%s_avatar.jpg", user.Pool)
		user.RemoteAvatar = user.Avatar
		return
	}
	u, err := url.Parse(user.Avatar)
	if err != nil {
		user.Avatar = fmt.Sprintf("%s_avatar.jpg", user.Pool)
		user.RemoteAvatar = user.Avatar
		log.Println(err)
		return
	}

	user.RemoteAvatar = user.Avatar
	if u.Host == "" {
		return
	}
	filename := getMD5Hash(user.Avatar)
	if _, err := os.Stat(path.Join(dir, filename)); err == nil {
		user.Avatar = filename
		//user.RemoteAvatar = user.Avatar
		log.Println(user.Name + " 头像已存在跳过下载")
		return
	}

	if err := downloadFile(user.Avatar, filename, dir); err != nil {
		log.Println(err)
		user.Avatar = fmt.Sprintf("%s_avatar.jpg", user.Pool)
		user.RemoteAvatar = user.Avatar
		return
	}
	log.Println(user.Name + " 头像下载完成")
	user.Avatar = filename

}
func downloadFile(URL, fileName, dir string) error {
	//Get the response bytes from the url
	response, err := http.Get(URL)
	if err != nil {
		return err
	}
	defer response.Body.Close()

	if response.StatusCode != 200 {
		return errors.New("Received non 200 response code")
	}
	//Create a empty file
	file, err := os.Create(path.Join(dir, fileName))
	if err != nil {
		return err
	}
	defer file.Close()

	//Write the bytes to the fiel
	_, err = io.Copy(file, response.Body)
	return err
}
