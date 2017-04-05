<div class="angucomplete-holder">
    <input id="{{id}}_value" ng-model="searchStr" type="text" 
    autocomplete="off" placeholder="{{placeholder}}" class="{{inputClass}}"
        onmouseup="this.select();" 
        ng-focus="resetHideResults()" 
        ng-blur="hideResults()" />
    <div id="{{id}}_dropdown" class="angucomplete-dropdown" ng-if="showDropdown">
        <div class="angucomplete-searching" ng-show="searching">查找中...</div>
        <div class="angucomplete-searching" ng-show="!searching && (!results || results.length == 0)">没有找到</div>
        <div class="angucomplete-row" 
            ng-repeat="result in results"
            ng-mousedown="selectResult(result)" 
            ng-mouseover="hoverRow()"
            ng-class="{'angucomplete-selected-row': $index == currentIndex}">
            <div ng-if="imageField" class="angucomplete-image-holder">
                <img ng-if="result.image && result.image != ''" ng-src="{{result.image}}" class="angucomplete-image" />
                <div ng-if="!result.image && result.image != ''" class="angucomplete-image-default"></div>
            </div>
            <div class="angucomplete-title" ng-if="matchClass" ng-bind-html="result.title"></div>
            <div class="angucomplete-title" ng-if="!matchClass">{{ result.title }}</div>
            <div ng-if="result.description && result.description != ''"
             class="angucomplete-description">{{result.description}}</div>
        </div>
    </div>
</div>


