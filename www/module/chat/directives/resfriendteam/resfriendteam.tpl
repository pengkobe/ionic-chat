<div>
<!-- 好友请求 -->
    <ion-item rj-hold-active style="padding:10px 0px 0px 72px" 
    class="item-remove-animate item-avatar item-icon-right" 
    type="item-text-wrap"
        id="inviteinfo_{{message.id}}" 
        ng-repeat="message in friendsMessage_local">
        <img ng-src="{{message.portrait||'/assets/img/personPhoto.png'}}" 
        width="30px">
        <h2 class="rj-requst-title">{{ message.info }}
        </h2>
        <button class="button button-small rj-refuse" 
        ng-click='responseReq_local("{{message.id}}","{{message.name}}","{{message.type}}","-1",$index)'>
            拒绝
        </button>
         <button class="button button-small rj-agree"
          ng-click='responseReq_local("{{message.id}}","{{message.name}}","{{message.type}}","1",$index)'>
         同意
        </button>
    </ion-item>
            <!-- 群组请求 -->
    <ion-item rj-hold-active style="padding:10px 0px 0px 72px" class="item-remove-animate item-avatar item-icon-right" 
    type="item-text-wrap"
          id="inviteinfo_{{message.id}}" ng-repeat="message in groupinviteList_local">
           <img ng-src="{{message.portrait||'assets/img/personPhoto.png'}}" width="30px">
           <h2 class="rj-requst-title">{{ message.info }}
         </h2>
           <button class="button button-small rj-refuse" ng-click='responseReq_local("{{message.id}}","{{message.name}}","{{message.type}}","-1",$index)'>
            拒绝
        </button>
        <button class="button button-small rj-agree" ng-click='responseReq_local("{{message.id}}","{{message.name}}","{{message.type}}","1",$index)'>
            同意
        </button>
    </ion-item>
</div>