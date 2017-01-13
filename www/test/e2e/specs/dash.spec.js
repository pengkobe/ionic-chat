/* global $ */
'use strict';

// page object
var DashPage = function () {
    var self = this;

    self.url = '#/tab/chat';
    self.ele = _getAllElements();
    self.load = load;
    ////////
    function _getAllElements() {
        // var header = browser._.getHeader();
        return {
            //'headerLoginBtn': header.loginBtn,
            'box_blue_title': $('.item.item-divider'),
        };
    }
    function load() {
        browser._.gotoUrl(self.url);
    }
};

module.exports = new DashPage();

// test scenarios
describe('Dash Page:', function () {
    var page;
    beforeEach(function () {
        page = new DashPage();
        page.load();
    });

    afterEach(function () {
        browser._.takeScreenshotIfFail();
    });

    it('should display the correct title', function () {
        expect(page.ele.box_blue_title.getText()).toEqual('群组');
    });

    // it('should display correct header', function () {
    //     expect(page.ele.headerTitle.getText()).toEqual('Aio Angular App');
    //     expect(page.ele.headerLoginBtn.isDisplayed()).toBe(true);
    // });

    // it('should display correct tilte and sub title', function () {
    //     expect(page.ele.mainTitle.getText()).toEqual('Aio Angular App');
    //     expect(page.ele.subTitle.getText()).toEqual(
    //         'Awesome web app built on AngularJS & Material Design.');
    // });

    // it('should go to login page if click get started', function () {
    //     page.ele.getStartedBtn.click();
    //     browser._.expectUrlToMatch('login');
    // });
});
