# 帳戶對照表

## 支出帳戶映射

| 關鍵字 | Account | Payee 預設 |
|--------|---------|-----------|
| 早餐 | Expenses:Food:Breakfast | 早餐店 |
| 午餐、便當 | Expenses:Food:Lunch | 餐廳 |
| 晚餐 | Expenses:Food:Dinner | 餐廳 |
| 買菜、超市、全聯 | Expenses:Food:Groceries | 超市 |
| 飲料、咖啡、茶 | Expenses:Food:Drinks | 飲料店 |
| 零食、點心 | Expenses:Food:Snacks | 便利商店 |
| 加油 | Expenses:Transport:Gas | 加油站 |
| 捷運、MRT | Expenses:Transport:MRT | 捷運 |
| 計程車、Uber | Expenses:Transport:Taxi | 計程車 |
| 停車 | Expenses:Transport:Parking | 停車場 |
| 日用品、衛生紙 | Expenses:Living:Daily | 日用品店 |
| 房租 | Expenses:Living:Rent | 房東 |
| 水電、電費、水費 | Expenses:Living:Utilities | 水電 |
| 網路、手機費 | Expenses:Living:Phone | 電信 |
| 訂閱 | Expenses:Living:Subscription | 訂閱服務 |
| 看醫生、掛號 | Expenses:Health:Medical | 診所 |
| 衣服、鞋子 | Expenses:Shopping:Clothing | 服飾店 |
| 電影、KTV | Expenses:Entertainment:Fun | 娛樂 |
| 遊戲、課金 | Expenses:Entertainment:Games | 遊戲 |
| 書、課程 | Expenses:Education:Books | 書店 |
| 紅包、禮物 | Expenses:Social:Gifts | 禮金 |
| 聚餐、請客 | Expenses:Social:Dining | 餐廳 |

## 資產帳戶

| 關鍵字 | Account |
|--------|---------|
| （預設） | Assets:Cash |
| 刷卡、信用卡 | Liabilities:CreditCard |
| 轉帳、銀行 | Assets:Bank:Checking |

## 收入帳戶

| 關鍵字 | Account |
|--------|---------|
| 薪水 | Income:Salary |
| 獎金 | Income:Bonus |
| （其他） | Income:Other |

## Payee 覆寫

如果訊息中包含具體店名（如「麥當勞」「星巴克」「全聯」），直接用該店名作為 payee。
