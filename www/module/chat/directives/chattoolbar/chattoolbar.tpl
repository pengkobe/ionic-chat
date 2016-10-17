<div class="chat-toolbar">
    <div class="chattoolbar-div"
    ng-show="conversationType==='PRIVATE'">
        <img src="assets/img/icon/vediochat.png"
        class="chattoolbar-img"
        ng-click="onVoiceCall()">
        <div>视频</div>
    </div>
    <div class="chattoolbar-div" >
        <img src="assets/img/icon/camera.png"
        class="chattoolbar-img"
        ng-click="takePic(0)">
        <div>拍照</div>
    </div>
    <div class="chattoolbar-div" >
        <img src="assets/img/icon/photos.png"
        class="chattoolbar-img"
        ng-click="takePic(1)">
        <div>图片</div>
    </div>
    <div class="chattoolbar-div" >
    </div>
</div>
