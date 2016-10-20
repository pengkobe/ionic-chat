<div>
    <ion-item rj-hold-active 
            class="message-list-item item-remove-animate item-avatar item-icon-right" 
            type="item-text-wrap"
            data-type="{{friend.conversationType}}" 
            ng-click="gotoChatDetils_local(friend, $index)" 
            on-hold="popupMessageOpthins(friend,$index)" id="rongyun_{{friend.targetId}}"
            ng-repeat="friend in friendsMessage" 
        >
        <img ng-src="{{friend.portrait||'assets/img/personPhoto.png'}}" width="30px">
        <h2>{{ friend.conversationTitle }}
            <span 
                class="badge badge-assertive unreadcount message-list-item-unreadcount"  
                ng-hide="friend.unreadMessageCount == '0'">
                {{ friend.unreadMessageCount }}
            </span>
        </h2>
        <p class="subTitle" ng-bind-html="friend.latestMessage"></p>
        <i class="icon ion-chevron-right icon-accessory"></i>
    </ion-item>
</div>