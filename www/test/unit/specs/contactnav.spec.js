/* globals inject */
describe('contactNav Directive', function () {
    var scope;
    var element;

    beforeEach(function () {
        module('chat.directive');
    });

    beforeEach(inject(function ($rootScope, $compile) {
        scope = $rootScope.$new();
        scope.showWXFace = true;
        var tpl = $compile('<contact-nav delegate-handle-name="contactsScroll" char-click-cb="navCallBack" nav-char-list="navCharArray"></contact-nav>')(scope);
        element = tpl.find('ul');
    }));

    it('contact-nav test start!', function () {
        scope.$digest();
        expect(element.hidePromptBox).toEqual(undefined);
    });

    it('contact-nav test dom!', function () {
        scope.$digest();
        expect(element.attr('disabled')).not.toBeDefined();
        expect(angular.element(element).attr('class')).toEqual("alpha-nav");
    });


});
