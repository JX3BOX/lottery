package c

import (
	"log"

	"github.com/jx3box/lottery/database"
	"github.com/jx3box/lottery/database/schema"
	"github.com/kataras/iris/v12"
)

func UserPoolList(ctx iris.Context) {
	db := database.Get()
	var list []string
	if err := db.Table(new(schema.User)).Distinct("pool").Find(&list); err != nil {
		log.Println(err)
		ctx.JSON(map[string]interface{}{
			"code": 500,
			"msg":  err.Error(),
		})
		return
	}
	ctx.JSON(map[string]interface{}{
		"code": 0,
		"data": list,
	})
}

type PostForm struct {
	Pool string `json:"pool"`
	URL  string `json:"url"`
}

func FetchUserPoolFromURL(ctx iris.Context) {
	var form PostForm
	if err := ctx.ReadJSON(&form); err != nil {

	}

	// http.NewRequest("GET", form.URL, body io.Reader)

}
