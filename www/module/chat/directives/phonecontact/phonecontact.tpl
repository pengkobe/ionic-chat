<div>
    <ion-item class="item item-divider">
        联系人
    </ion-item>
    <ion-item 
        class="rj-item" 
        href="#/tab/friendInfo/{{friend.id}}/{{friend.name}}/PRIVATE"
        ng-repeat="friend in friendsList_local" >
        <a name="index_{{friend.alpha}}" 
            scrollTop="{{friend.scrollHeight}}"
            ng-if="cri.DataValue!=friend.alpha && 1?cri.DataValue=friend.alpha:0"
            class="rj-contacts-index-bar">{{friend.alpha}}</a>
        <div class="rj-contacts-pic">
            <img ng-src="{{friend.portrait||'/assets/img/personPhoto.png'}}">
        </div>
        <h2>{{friend.name}}
            <span class="rj-friend-offline" ng-if="friend.online=='0'">[离线]</span>
            <span class="rj-friend-online" ng-if="friend.online=='1'">[在线]</span>
        </h2>
        <button class="button button-small rj-inittalk" 
            ng-click='initTalk("{{friend.id}}","{{friend.name}}","PRIVATE",$event)'>
            发起聊天
        </button>
    </ion-item>
    <!-- 通讯录导航 -->
    <ul class="alpha_sidebar" ng-if="currentFeedsType==contacttab">
        <li ng-click="gotoList('{{letter}}')" ng-repeat="letter in alphabet">
            {{letter}}
        </li>
    </ul>
</div>