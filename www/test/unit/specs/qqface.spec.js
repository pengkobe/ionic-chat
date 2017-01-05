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
        // spyOn(element[0], '');// chooseFace
    }));

    it('test unit test!', function () {
        scope.showWXFace = true;
        scope.$digest();
        // expect(element[0].chooseFace).not.toHaveBeenCalled();
        expect(element[0].chooseFace).toEqual(undefined);
    });
});
