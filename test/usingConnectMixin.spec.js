var assert = require('chai').assert,
    sinon = require('sinon'),
    connect = require('../src/connect'),
    _ = require('../src/utils'),
    Reflux = require('../src');

describe('using the connect(...) mixin',function(){

    it("should be exposed in Reflux",function(){
        assert.equal(connect, Reflux.connect);
    });

    describe("when calling without key",function(){
        function triggerObject(){
	}
	triggerObject.prototype.ping = function(ping){
            return ping === "ping" ? "pong" : undefined;
        };
        var defaultdata = "DEFAULTDATA",
            triggerdata = new triggerObject(),
            listenable = {
                listen: sinon.spy(),
                getDefaultData: sinon.stub().returns(defaultdata)
            },
            context = {setState: sinon.spy()},
            result = _.extend(context,connect(listenable));
        triggerdata.foo = "bar";

        it("should add componentDidMount and WillUnmount",function(){
            assert.isFunction(context.componentDidMount);
            assert.isFunction(context.componentWillUnmount);
            assert.equal(context.componentWillUnmount,Reflux.ListenerMethods.stopListeningToAll);
        });

        result.componentDidMount();

        it("should call listen on the listenable correctly",function(){
            assert.equal(1,listenable.listen.callCount);
            assert.equal(context.setState,listenable.listen.firstCall.args[0]);
            assert.equal(context,listenable.listen.firstCall.args[1]);
        });

        it("should pass default data to state",function(){
            assert.deepEqual([defaultdata],context.setState.firstCall.args);
        });

        it("should store the subscription object correctly",function(){
            assert.equal(listenable,context.subscriptions[0].listenable);
        });

        it("should send listenable callback which assigns state correctly",function(){
            listenable.listen.firstCall.args[0](triggerdata);
            //console.log(context.setState.secondCall.args);
            assert.equal("bar",context.setState.secondCall.args[0].foo);
            assert.equal("pong",context.setState.secondCall.args[0].ping("ping"));
        });

    });

    describe("when calling with key",function(){
        var defaultdata = "DEFAULTDATA",
            triggerdata = "TRIGGERDATA",
            key = "KEY",
            listenable = {
                listen: sinon.spy(),
                getDefaultData: sinon.stub().returns(defaultdata)
            },
            context = {setState: sinon.spy()},
            result = _.extend(context,connect(listenable,key));

        result.componentDidMount();

        it("should call listen on the listenable correctly",function(){
            assert.equal(1,listenable.listen.callCount);
            assert.isFunction(listenable.listen.firstCall.args[0]);
            assert.equal(context,listenable.listen.firstCall.args[1]);
        });

        it("should pass default data to state correctly",function(){
            assert.deepEqual([{KEY:defaultdata}],context.setState.firstCall.args);
        });

        it("should send listenable callback which calls setState correctly",function(){
            listenable.listen.firstCall.args[0](triggerdata);
            assert.deepEqual([_.object([key],[triggerdata])],context.setState.secondCall.args);
        });
    });
    describe("when calling with falsy key",function(){
        var triggerdata = "TRIGGERDATA",
            key = 0,
            listenable = {listen: sinon.spy()},
            context = {setState: sinon.spy()},
            result = _.extend(context,connect(listenable,key));
        result.componentDidMount();
        it("should send listenable callback which calls setState correctly",function(){
            listenable.listen.firstCall.args[0](triggerdata);
            assert.deepEqual([_.object([key],[triggerdata])],context.setState.firstCall.args);
        });
    });
});
