## 联系人导航插件使用
##### 资源引入
```
<script src="lib/hydContactsNav/directive.js"></script>
<link rel="stylesheet" href="lib/hydContactsNav/contactNavStyle.css"/>
```
#####模块中引入
 资源名为:hyd.directives
#####控制器中使用
在控制器中注入contactsNavUtil工具类，调用方法sortByFirstCode方法，解释如下
```
contactsNavUtil.sortByFirstCode(data,attrName);
@data {Array} [待整理的用户数据数组]
@attrName {string} [表示根据对象的哪个属性进行分类排序]
返回值：分类整理好并排序完整的数组对象，此时和$scope绑定即可
```

#####前台标签使用
```
<ion-pane>  
    <ion-header-bar class="bar-stable">    
        <h1 class="title">联系人插件导航演示demo</h1>  
    </ion-header-bar>  
      <ion-content delegate-handle="contactsScroll">    
          <ion-list>      
              <div ng-repeat="friends in friendsArray">        
                  <a class="contacts_a" href="javascript:void(0)" id="{{friends.id}}">{{friends.firstCode}}</a>        
                  <ion-item ng-repeat="friend in friends.data">          
                      <h3>{{friend.name}}</h3>        
                  </ion-item>      
               </div>    
          </ion-list>  
      </ion-content>  
    <hyd-contacts-nav hyd-delegate-handle="contactsScroll" hyd-contacts-data="friendsArray"></hyd-contacts-nav>
</ion-pane> 
```
***
######注意处
1. hyd-contacts-nav标签有两个重要属性：
 hyd-delegate-handle用来关联ion-content的delegate-handle属性值
 hyd-contacts-data用来关联数组对象
2. 循环迭代中一般通过a标签来进行分隔，此时a标签的id属性必须和整理后对象的id进行绑定，因为指令时通过寻找这个元素来进行定位的。