<ol id="lstMessage">
	<li 
        ng-repeat="message in messageList track by $index" 
        class="rj-chatmessage-list" 
        id="msg_{{message.messageId}}" 
        data-messageid="{{message.messageId}}">
		<div ng-include src="buildUrl(message.objectName)"></div>
	</li>
</ol>