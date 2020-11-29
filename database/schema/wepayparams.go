package schema

import (
	"encoding/xml"
	"time"
)

type PayParams struct {
	XMLName     xml.Name  `xml:"xml" json:"-" xorm:"-"`
	NonceStr    string    `xml:"nonce_str" json:"nonce_str" xorm:"-"`
	Sign        string    `xml:"sign" json:"sign" xorm:"-"`
	MchBillno   string    `xml:"mch_billno" json:"mch_billno" xorm:"mch_billno"`
	MchID       string    `xml:"mch_id" json:"mch_id" xorm:"mch_id"`
	WxAppID     string    `xml:"wxappid" json:"wxappid" xorm:"wxappid"`
	SendName    string    `xml:"send_name" json:"send_name" xorm:"send_name"`
	ReOpenId    string    `xml:"re_openid" json:"re_openid" xorm:"re_openid"`
	TotalAmount int       `xml:"total_amount" json:"total_amount" xorm:"total_amount"`
	TotalNum    int       `xml:"total_num" json:"total_num" xorm:"total_num"`
	Wishing     string    `xml:"wishing" json:"wishing" xorm:"wishing"`
	ClientIp    string    `xml:"client_ip" json:"client_ip" xorm:"client_ip"`
	ActName     string    `xml:"act_name" json:"act_name" xorm:"act_name"`
	Remark      string    `xml:"remark" json:"remark" xorm:"remark"`
	SceneId     string    `xml:"scene_id" json:"scene_id" xorm:"scene_id"`
	CreatedAt   time.Time `xml:"-" json:"created_at"  xorm:"created_at"`
}

func (pp *PayParams) TableName() string {
	return "pay_logger"
}
