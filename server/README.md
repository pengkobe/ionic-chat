#node server for ionic chat
> record build process

## 数据库设计
设计参考:
1. MONGODB使用记录 http://yipeng.info/p/56d06eed9f0894e066cf8c91
2. MONGOOSE遇坑记 http://yipeng.info/p/56e145aa04c316d64b566763

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

## 使用mongoose subdoc
见代码

## Redis
Redis 是一个开源的，先进的 key-value 存储可用于构建高性能，可扩展的 Web 应用程序的解决方案。
key全部都是字符串，value可以是集合、hash、list等等,Redis是通过MULTI/DISCARD/EXEC/WATCH这4个命令来实现事务功能。  
官网: https://redis.io/  
注意: Redis 官方不支持 Windows 版本, Windows 在 [Github](https://github.com/MSOpenTech/redis) 
上可供下载(也可以通过其源码编译出32位版本)。  
> We officially support the 64-bit version only. Although you can build the 32-bit version from source if desired. 

Win32 安装参考: https://my.oschina.net/lujianing/blog/204103   

### 用途
1. 单纯的做存储，因为是内存数据库，可以增加访存速度。
2. 基于 Redis Channel 可以做异构的发布/订阅，案例可参考:http://www.tuicool.com/articles/26ny6r6


## Node with Redis
地址: https://github.com/NodeRedis/node_redis  


## MongoDB with Redis
好文：Caching a MongoDB Database with Redis  
https://www.sitepoint.com/caching-a-mongodb-database-with-redis/


## 集群实现参考
> 集群后带来的主要问题就是异地服务器和多进程间的通讯问题，如果是基于单进程颗粒的，则不需要考虑这个问题.  

ref:https://github.com/TOP-Chao/push，由于其基于koa2，要做改动或者另开项目,有说到支持多核.

### socket.io-redis
地址: https://github.com/socketio/socket.io-redis
> By running socket.io with the socket.io-redis adapter you can run multiple socket.io instances 
in different processes or servers that can all broadcast and emit events to and from each other   

```javascript
var io = require('socket.io')(3000);
var redis = require('socket.io-redis');
// 其中{ host: 'localhost', port: 4444 } 为redis server
io.adapter(redis({ host: 'localhost', port: 4444 }));
```

### socket.io-emitter
如果你要从socket.io进程发消息给非socket.io进程，如http，则需要这一个中间件
[socket.io-emitter](https://github.com/socketio/socket.io-emitter)

```javascript
// 其中{ host: '127.0.0.1', port: 4444 } socket.io server
var io = require('socket.io-emitter')({ host: '127.0.0.1', port: 4444 });
setInterval(function(){
  io.emit('datetime', new Date);
}, 5000);
```

### pm2
pm2 是一个带有负载均衡功能的Node应用的进程管理器.

### cluster
node多进程管理工具，可以帮助我们简化多进程并行化程序的开发难度，
轻松构建一个用于负载均衡的集群。


### 疑问
1. socket 可否加入多个房间 ：可以


## 参考
* Socket.io的集群方案
  https://my.oschina.net/swingcoder/blog/527648
