package wepay

import (
	"bytes"
	"crypto/tls"
	"encoding/xml"
	"fmt"
	"io/ioutil"
	"log"
	"net/http"
	"net/url"
	"strconv"
	"strings"
	"time"

	"github.com/google/uuid"
	"github.com/huyinghuan/lottery/database/schema"
	"github.com/huyinghuan/lottery/wepay/tools"
)

// 生成订单id
func genOrderId() string {
	return strings.Join([]string{time.Now().Format("20060102150405"), tools.RandomString(10)}, "")
}

func signParams(payKey string, we *schema.PayParams) {
	v := url.Values{}
	v.Set("nonce_str", we.NonceStr)
	v.Set("mch_billno", we.MchBillno)
	v.Set("mch_id", we.MchID)
	v.Set("wxappid", we.WxAppID)
	v.Set("send_name", we.SendName)
	v.Set("re_openid", we.ReOpenId)
	v.Set("total_amount", strconv.Itoa(we.TotalAmount))
	v.Set("total_num", strconv.Itoa(we.TotalNum))
	v.Set("wishing", we.Wishing)
	v.Set("client_ip", we.ClientIp)
	v.Set("act_name", we.ActName)
	v.Set("remark", we.Remark)
	v.Set("scene_id", we.SceneId)
	signStr := tools.Sign(payKey, v)
	we.Sign = signStr
}

/**
openssl pkcs12 -in cert.p12 \
    -clcerts -nokeys -out usercert.pem
openssl pkcs12 -in cert.p12 \
    -nocerts -out userkey.pem -nodes
*/

var (
	PayKey   = "xxx"            //支付key 需要二次修改
	MchID    = "TestMchID"      //需要二次修改
	WxAppID  = "WxAppID"        //需要二次修改
	SendName = "JX3BOX"         //需要二次修改
	ActName  = "JX3BOX PVE抽奖活动" //需要二次修改
)

func postToWePayServer(pp *schema.PayParams) (err error) {
	xmlBody, err := xml.Marshal(pp)
	if err != nil {
		return
	}
	req, err := http.NewRequest("POST", "https://api.mch.weixin.qq.com/mmpaymkttransfers/sendredpack", bytes.NewBuffer(xmlBody))
	if err != nil {
		return
	}
	cert, err := tls.LoadX509KeyPair("paycert/cert.pem", "paycert/key.pem")
	if err != nil {
		return
	}
	tr := &http.Transport{
		TLSClientConfig: &tls.Config{
			Certificates: []tls.Certificate{cert},
		},
	}
	client := &http.Client{Transport: tr}
	resp, err := client.Do(req)
	if err != nil {
		return
	}
	defer resp.Body.Close()

	if resp.StatusCode != 200 {
		err = fmt.Errorf("status code %d", resp.StatusCode)
		return
	}
	body, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		return
	}
	log.Println(string(body))
	return
}

// 微信发红包
// openid  用户openid
// totalAmount 发放金额
// remark 备注信息
func SendLottery(openid string, totalAmount int, remark string, wishing string) {
	pp := &schema.PayParams{
		NonceStr:    strings.ReplaceAll(uuid.New().String(), "-", ""),
		MchBillno:   genOrderId(),
		MchID:       MchID,
		WxAppID:     WxAppID,
		SendName:    SendName,
		ReOpenId:    openid,
		TotalAmount: totalAmount,
		TotalNum:    1,
		Wishing:     wishing,
		ClientIp:    "127.0.0.1",
		ActName:     ActName,
		Remark:      remark,
		SceneId:     "PRODUCT_2",
		CreatedAt:   time.Now(),
	}
	signParams(PayKey, pp)
	err := postToWePayServer(pp)
	if err != nil {
		log.Println(err)
	}
	// TODO
}
