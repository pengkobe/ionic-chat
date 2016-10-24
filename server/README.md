#node server for ionic chat  
> record build process

## 数据库设计
> 设计参考: http://yipeng.info/p/56d06eed9f0894e066cf8c91   

``` 
个人(0-数千)：Users
群(0-数千)：Groups
好友(0-数千)：内嵌id放置至users中的friends(id)字段
所在群：内嵌id放置至users中的groups(id)字段
群成员：(0-数千)：内嵌id放置至groups中的members(id)字段

邀请加为好友(0-数千)：内嵌id放置至users中的requset_friends(to,time)字段
被邀添加为好友(0-数千)：内嵌id放置至users中的response_friends(from,time)字段
请求好友加群(0-数千)：内嵌id放置至users中的requset_groups(to,time)字段
好友邀请加群(0-数千)：内嵌id放置至users中的response_groups(from,time)字段

好友消息(10万+) FriendMessages(from,to,time,content,type)
群消息(100万+) GroupMessage(from,group,time,content,type)
系统消息(100+) SystemMessage(to,time,content,type)
``` 


