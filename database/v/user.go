package v

import (
	"math/rand"
	"sort"
	"time"

	"github.com/jx3box/lottery/database"
	"github.com/jx3box/lottery/database/schema"
)

// 获取待抽奖的用户池
func GetUserListByPool(pool string) (list []schema.User, err error) {
	db := database.Get()
	err = db.Where("pool = ? and status = 0", pool).Find(&list)
	return
}

// 打乱数组 洗牌
func shuffle(list []int64) {
	rand.Seed(time.Now().UnixNano())
	var m = len(list)
	for m > 1 {
		m = m - 1
		i := rand.Intn(m)
		t := list[m]
		list[m] = list[i]
		list[i] = t
	}
	return
}

//  获取待抽奖的用户池 ,如果用户池过大,为保证前端动画可用性 那么先在后端挑选一部分权重高的数据，作为前端展示挑选幸运用户
// 随机性包括两部分。一，进入后台挑选的用户池，二是 前端 从后台挑选的用户里面 再次挑选
func GetLuckyUserPoolByPool(pool string, limitPoolSize int) (list []schema.User, err error) {
	db := database.Get()

	if limitPoolSize == 0 {
		return GetUserListByPool(pool)
	}
	total, err := db.Where("pool = ? and status = 0", pool).Count(new(schema.User))
	if err != nil {
		return
	}
	// 用户量不会溢出32位int
	if int(total) < limitPoolSize {
		err = db.Where("pool = ? and status = 0", pool).Find(&list)
		return
	}
	// 幸运权重优先选取，比如投票积极的，注册时间长的老用户等优先选取
	// 查看权重分组
	var weightGroup []int
	if err = db.Table("user").Distinct("weight").Where("pool = ? and status = 0", pool).Find(&weightGroup); err != nil {
		return
	}
	sort.Slice(weightGroup, func(i, j int) bool { return weightGroup[i] > weightGroup[j] })

	var targetIdPool []int64
	for _, weight := range weightGroup {
		var userIdGroupByWeight []int64
		err = db.Table("user").Where("pool = ? and status = 0 and weight = ?", pool, weight).Cols("id").Find(&userIdGroupByWeight)
		if err != nil {
			return
		}
		if len(userIdGroupByWeight) == limitPoolSize {
			targetIdPool = userIdGroupByWeight
			break
		}

		targetIdPoolSize := len(targetIdPool)
		// 当前权重的数量大于限制量
		if targetIdPoolSize+len(userIdGroupByWeight) > limitPoolSize {
			// 洗牌
			shuffle(userIdGroupByWeight)
			// 按顺序选 还差数据的元素
			targetIdPool = append(targetIdPool, userIdGroupByWeight[0:limitPoolSize-targetIdPoolSize]...)
			break
		}
		// 当前权重的数量+已选取的数量 < 限制量， 将当前权重全部放到 用户池
		for _, id := range userIdGroupByWeight {
			targetIdPool = append(targetIdPool, id)
		}

		// 用户吃是否已经满了？
		if len(targetIdPool) >= limitPoolSize {
			break
		}
	}
	err = db.In("id", targetIdPool).Find(&list)
	return
}
