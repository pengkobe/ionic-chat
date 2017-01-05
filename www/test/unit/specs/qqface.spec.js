/* globals inject */
describe('qqFace Directive', function () {
    var scope;
    var element;

    beforeEach(function () {
        module('app.core');
    });

    beforeEach(inject(function ($rootScope, $compile) {
        scope = $rootScope.$new();
        scope.showWXFace = true;
        element = $compile('<qq-face ng-show="showWXFace" select-qq-face="selectQQFace"></qq-face>')(scope);
        // spy needs to be put before $digest
        spyOn(element[0], 'focus');
    }));

    it('should make element lose focus when attribute is false', function () {
        scope.showWXFace = false;
        scope.$digest();
        expect(element[0].selectQqFace).not.toHaveBeenCalled();
    });
});
