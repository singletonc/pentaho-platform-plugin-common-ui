/*! ******************************************************************************
 *
 * Pentaho
 *
 * Copyright (C) 2024 by Hitachi Vantara, LLC : http://www.pentaho.com
 *
 * Use of this software is governed by the Business Source License included
 * in the LICENSE.TXT file.
 *
 * Change Date: 2029-07-20
 ******************************************************************************/

define([
  "pentaho/action/impl/Target",
  "pentaho/action/Base",
  "pentaho/action/Execution",
  "pentaho/lang/Base",
  "tests/pentaho/util/errorMatch"
], function(TargetMixin, BaseAction, Execution, Base, errorMatch) {

  "use strict";

  describe("pentaho.action.impl.Target", function() {

    var CustomTarget;
    var SyncAction;
    var AsyncAction;
    var SubActionExecution;

    beforeAll(function() {

      // A derived non-abstract class.
      SubActionExecution = Execution.extend({
        constructor: function(action, target) {

          this.base();

          this.__action = action;
          this.__target = target;
        },

        get action() {
          return this.__action;
        },

        get target() {
          return this.__target;
        }
      });

      // A derived non-abstract class, adding nothing new.
      SyncAction = BaseAction.extend({
      }, {
        get id() {
          return "syncAction";
        },
        get isSync() {
          return true;
        }
      });

      // Idem.
      AsyncAction = BaseAction.extend({
      }, {
        get id() {
          return "asyncAction";
        },
        get isSync() {
          return false;
        }
      });

      // A Complex type with the Target mixin applied.
      CustomTarget = Base.extend().mix(TargetMixin);
    });

    describe(".ActionExecution", function() {

      it("should get the constructor of an Execution subtype", function() {

        expect(typeof CustomTarget.ActionExecution).toBe("function");
        expect(CustomTarget.ActionExecution.prototype instanceof Execution).toBe(true);
      });

      it("should throw if action is not specified", function() {

        var target = new CustomTarget();

        expect(function() {

          var ae = new CustomTarget.ActionExecution(null, target);

        }).toThrow(errorMatch.argRequired("action"));
      });

      it("should throw if target is not specified", function() {

        var action = new SyncAction();

        expect(function() {

          var ae = new CustomTarget.ActionExecution(action);

        }).toThrow(errorMatch.argRequired("target"));
      });

      it("should not throw if both action and target are specified", function() {

        var action = new SyncAction();
        var target = new CustomTarget();

        var ae = new CustomTarget.ActionExecution(action, target);

        expect(ae instanceof CustomTarget.ActionExecution).toBe(true);
      });

      it("should have #action be a clone of the specified action argument", function() {

        var action = new SyncAction();
        var target = new CustomTarget();

        spyOn(action, "clone").and.callThrough();

        var ae = new CustomTarget.ActionExecution(action, target);

        expect(action.clone).toHaveBeenCalled();

        expect(ae.action).not.toBe(action);
      });

      describe("#_onPhaseInit", function() {

        it("should call the associated target's _emitActionPhaseInitEvent method", function() {
          var target = new CustomTarget();
          var ae = new CustomTarget.ActionExecution(new SyncAction(), target);

          spyOn(target, "_emitActionPhaseInitEvent");

          ae._onPhaseInit();

          expect(target._emitActionPhaseInitEvent).toHaveBeenCalledTimes(1);
          expect(target._emitActionPhaseInitEvent).toHaveBeenCalledWith(ae);
        });
      });

      describe("#_onPhaseWill", function() {

        it("should call the associated target's _emitActionPhaseWillEvent method", function() {
          var target = new CustomTarget();
          var ae = new CustomTarget.ActionExecution(new SyncAction(), target);

          spyOn(target, "_emitActionPhaseWillEvent");

          ae._onPhaseWill();

          expect(target._emitActionPhaseWillEvent).toHaveBeenCalledTimes(1);
          expect(target._emitActionPhaseWillEvent).toHaveBeenCalledWith(ae);
        });
      });

      describe("#_onPhaseDo", function() {

        it("should call the associated target's _emitActionPhaseDoEvent method", function() {
          var target = new CustomTarget();
          var ae = new CustomTarget.ActionExecution(new SyncAction(), target);

          spyOn(target, "_emitActionPhaseDoEvent");

          ae._onPhaseDo();

          expect(target._emitActionPhaseDoEvent).toHaveBeenCalledTimes(1);
          expect(target._emitActionPhaseDoEvent).toHaveBeenCalledWith(ae);
        });

        it("should return what _emitActionPhaseDoEvent returns", function() {
          var target = new CustomTarget();
          var ae = new CustomTarget.ActionExecution(new SyncAction(), target);
          var promise = Promise.resolve();
          spyOn(target, "_emitActionPhaseDoEvent").and.returnValue(promise);

          var result = ae._onPhaseDo();

          expect(result).toBe(promise);
        });
      });

      describe("#_onPhaseFinally", function() {

        it("should call the associated target's _emitActionPhaseFinallyEvent method", function() {
          var target = new CustomTarget();
          var ae = new CustomTarget.ActionExecution(new SyncAction(), target);

          spyOn(target, "_emitActionPhaseFinallyEvent");

          ae._onPhaseFinally();

          expect(target._emitActionPhaseFinallyEvent).toHaveBeenCalledTimes(1);
          expect(target._emitActionPhaseFinallyEvent).toHaveBeenCalledWith(ae);
        });
      });
    });

    describe("#_createActionExecution(action)", function() {

      it("should return an instance of ActionExecution", function() {

        var target = new CustomTarget();
        var ae = target._createActionExecution(new SyncAction());

        expect(ae instanceof CustomTarget.ActionExecution).toBe(true);
      });

      // Should return an action execution with the given action - actually, it will be a clone of the given action.
    });

    describe("#act", function() {

      it("should accept an Action argument", function() {

        var target = new CustomTarget();
        target.act(new SyncAction());
      });

      it("should create and return an action execution", function() {

        var target = new CustomTarget();
        var ae = target.act(new SyncAction());

        expect(ae instanceof Execution).toBe(true);
      });

      it("should create an action execution with itself as target", function() {

        var target = new CustomTarget();
        var ae = target.act(new SyncAction());

        expect(ae.target).toBe(target);
      });

      it("should call #execute of the created action execution", function() {

        var target = new CustomTarget();

        var ae = jasmine.createSpyObj("execution", ["execute"]);
        spyOn(target, "_createActionExecution").and.returnValue(ae);

        target.act(new SyncAction());

        expect(ae.execute).toHaveBeenCalled();
      });
    });

    describe("#_emitActionPhaseInitEvent", function() {

      itsEmitActionPhase("init", /* isSync: */ true, /* hasKeyArgs: */true);
    });

    describe("#_emitActionPhaseWillEvent", function() {

      itsEmitActionPhase("will", /* isSync: */ true, /* hasKeyArgs: */true);
    });

    describe("#_emitActionPhaseDoEvent", function() {

      describe("with a synchronous action", function() {

        itsEmitActionPhase("do", /* isSync: */ true, /* hasKeyArgs: */true);

        it("should return null", function() {

          var target = new CustomTarget();

          spyOn(target, "_emitGeneric");

          var action = new SyncAction();

          var ae = new SubActionExecution(action, target);

          // Call the being tested method.
          var result = target._emitActionPhaseDoEvent(ae);

          // Expect the method being delegated to to have been called.
          expect(result).toBe(null);
        });
      });

      describe("with an asynchronous action", function() {

        itsEmitActionPhase("do", /* isSync: */ false, /* hasKeyArgs: */true);

        it("should return the result of #_emitGenericAllAsync", function() {

          var target = new CustomTarget();
          var promise = Promise.resolve();
          spyOn(target, "_emitGenericAllAsync").and.returnValue(promise);

          var action = new AsyncAction();

          var ae = new SubActionExecution(action, target);

          var result = target._emitActionPhaseDoEvent(ae);

          expect(result).toBe(promise);
        });
      });
    });

    describe("#_emitActionPhaseFinallyEvent", function() {

      itsEmitActionPhase("finally", /* isSync: */ true, /* hasKeyArgs: */false);
    });

    function itsEmitActionPhase(phase, isSync, hasKeyArgs) {

      var call;
      var target;
      var ae;

      // The Target method being tested.
      var emitMethodName;
      switch(phase) {
        case "init": emitMethodName = "_emitActionPhaseInitEvent"; break;
        case "will": emitMethodName = "_emitActionPhaseWillEvent"; break;
        case "do": emitMethodName = "_emitActionPhaseDoEvent"; break;
        case "finally": emitMethodName = "_emitActionPhaseFinallyEvent"; break;
        default: throw new Error("Unsupported phase name '" + phase + "'.");
      }

      // The EventSource method that it delegates to.
      var emitGenericMethodName = isSync ? "_emitGeneric" : "_emitGenericAllAsync";

      var action;

      beforeEach(function() {
        target = new CustomTarget();

        spyOn(target, emitGenericMethodName);

        var ActionClass = isSync ? SyncAction : AsyncAction;

        action = new ActionClass();

        ae = new SubActionExecution(action, target);

        // Call the being tested method.
        target[emitMethodName](ae);

        // Expect the method being delegated to to have been called.
        expect(target[emitGenericMethodName]).toHaveBeenCalledTimes(1);

        // Capture the call, for further testing.
        call = target[emitGenericMethodName].calls.first();
      });

      it("should call #" + emitGenericMethodName + " with target as the event source", function() {

        // Target as event source
        expect(call.args[0]).toBe(target);
      });

      it("should call #" + emitGenericMethodName + " with action execution and " +
          "action as event listener args", function() {
        // ae and action as event listener arguments
        var listenerArgs = call.args[1];
        expect(listenerArgs instanceof Array).toBe(true);
        expect(listenerArgs[0]).toBe(ae);
        expect(listenerArgs[1]).toBe(ae.action);
      });

      it("should call #" + emitGenericMethodName + " with action.eventName as event type", function() {
        expect(call.args[2]).toBe(action.eventName);
      });

      it("should call #" + emitGenericMethodName + " with phase '" + phase + "'", function() {
        expect(call.args[3]).toBe(phase);
      });

      if(hasKeyArgs) {
        it("should call #" + emitGenericMethodName + " with keyArgs " +
            "containing errorHandler and isCanceled", function() {

          var keyArgs = call.args[4];
          expect(keyArgs.constructor).toBe(Object);
          expect(typeof keyArgs.errorHandler).toBe("function");
          expect(typeof keyArgs.isCanceled).toBe("function");
        });

        it("should call #" + emitGenericMethodName + " with an errorHandler that " +
            "calls the actionExecution.reject method with the given error", function() {

          var keyArgs = call.args[4];
          var errorHandler = keyArgs.errorHandler;
          var ae = jasmine.createSpyObj("actionExecution", ["reject"]);
          var error = new Error();

          errorHandler(error, [ae, {}]);

          expect(ae.reject).toHaveBeenCalledTimes(1);
          expect(ae.reject).toHaveBeenCalledWith(error);
        });

        it("should call #" + emitGenericMethodName + " with an isCanceled that " +
            "returns the isCanceled property of the given actionExecution", function() {

          var keyArgs = call.args[4];
          var isCanceled = keyArgs.isCanceled;

          var ae2 = {};
          var getIsCanceled = jasmine.createSpy("get isCanceled");
          Object.defineProperty(ae2, "isCanceled", {
            get: getIsCanceled
          });

          isCanceled(ae2);

          expect(getIsCanceled).toHaveBeenCalledTimes(1);
        });
      } else {
        // !hasKeyArgs

        it("should call #" + emitGenericMethodName + " without keyArgs", function() {
          expect(call.args.length).toBeLessThan(5);
        });
      }
    }
  });
});
