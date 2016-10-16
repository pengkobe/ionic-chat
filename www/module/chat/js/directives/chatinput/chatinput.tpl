<section class="message-input-area" ng-class="{'message-bar-height':showPhonebar}">
            <!-- 切换输入方式(键盘vs音频) -->
            <div class="rj-footer-btn-wrap">
                <span class="voice" ng-click="switchInputMethod($event)">
                    <i class="ic" ng-class="{'ic-voice': !isVoiceMethod, 'ic-keyboard-grey': isVoiceMethod}"></i>
                 </span>
            </div>
            <div class="item item-input rj-footer-input">
                <!-- 按住说话 -->
                <span class="hold-tips" on-touch="onVoiceHold()" on-release="onVoiceRelease()" ng-class="{'active': isStartRecord}" ng-show="isVoiceMethod">按住我说话
                </span>
                <!-- 文本输入框 -->
                <textarea msd-elastic id="text_content" ng-model="send_content" ng-show="!isVoiceMethod"></textarea>
                <!-- 表情按钮 -->
                <div class="buttons">
                    <button class="rj-footer-btn button button-icon icon ion-happy-outline" ng-click="onShowFace()" ng-show="!isVoiceMethod"></button>
                </div>
            </div>
            <div class="rj-footer-btn-wrap">
                <!-- 显示工具栏按钮+ -->
                <div class="buttons" ng-show="!send_content || send_content === ''">
                    <button class="button button-icon icon ion-ios-plus-outline rj-footer-btn-left"
                    ng-click="onShowPhonebar()">
                    </button>
                </div>
                <!-- 发送按钮 -->
                <div class="rj-send-button" ng-hide="!send_content || send_content === ''" ng-click="onSendMessage()">
                    <p>发送</p>
                </div>
            </div>
</section>
