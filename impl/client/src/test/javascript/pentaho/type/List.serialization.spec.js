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
  "pentaho/type/List",
  "pentaho/type/Number",
  "pentaho/type/SpecificationScope"
], function(List, PentahoNumber, SpecificationScope) {

  "use strict";

  describe("pentaho.type.List", function() {

    var NumberList;

    beforeAll(function() {
      NumberList = List.extend({
        $type: {
          of: PentahoNumber
        }
      });
    });

    describe("#toSpec(keyArgs)", function() {

      describe("when keyArgs.declaredType is unspecified", function() {

        it("should return an empty array for an empty list", function() {
          var list = new List();
          var spec = list.toSpec({});

          expect(spec).toEqual([]);
        });

        it("should return an array of serialized elements for a list of elements", function() {
          var list = new NumberList([1, 2, 3]);
          var spec = list.toSpec({});

          expect(spec).toEqual([1, 2, 3]);
        });

        describe("when keyArgs.forceType is true", function() {

          it("should return a spec with an inline type and an empty 'd' property, for an empty list", function() {

            var list = new List();
            var spec = list.toSpec({forceType: true});

            expect(spec).toEqual({_: jasmine.any(String), d: []});
          });

          it("should return a spec with an inline type and a 'd' property with an " +
              "array of serialized elements for a list of elements", function() {

            var list = new NumberList([1, 2, 3]);
            var spec = list.toSpec({forceType: true});

            expect(spec).toEqual({_: jasmine.any(Object), d: [1, 2, 3]});
          });
        });
      });

      describe("when keyArgs.declaredType is the list's type", function() {

        it("should return an empty array for an empty list", function() {

          var list = new List();
          var spec = list.toSpec({declaredType: list.$type});

          expect(spec).toEqual([]);
        });

        it("should return an array of serialized elements for a list of elements", function() {

          var list = new NumberList([1, 2, 3]);
          var spec = list.toSpec({declaredType: list.$type});

          expect(spec).toEqual([1, 2, 3]);
        });

        describe("when keyArgs.forceType is true", function() {

          it("should return a spec with an inline type and an empty 'd' property, for an empty list", function() {

            var list = new List();
            var spec = list.toSpec({forceType: true, declaredType: list.$type});

            expect(spec).toEqual({_: jasmine.any(String), d: []});
          });

          it("should return a spec with an inline type and a 'd' property with an " +
              "array of serialized elements for a list of elements", function() {

            var list = new NumberList([1, 2, 3]);
            var spec = list.toSpec({forceType: true, declaredType: list.$type});

            expect(spec).toEqual({_: jasmine.any(Object), d: [1, 2, 3]});
          });
        });
      });

      describe("when keyArgs.declaredType is the list's type's ancestor", function() {

        it("should return a spec with an inline type and an empty 'd' property, for an empty list", function() {

          var list = new List();
          var spec = list.toSpec({declaredType: list.$type.ancestor});

          expect(spec).toEqual({_: jasmine.any(String), d: []});
        });

        it("should return a spec with an inline type and a 'd' property with an " +
           "array of serialized elements for a list of elements", function() {

          var list = new NumberList([1, 2, 3]);
          var spec = list.toSpec({declaredType: list.$type.ancestor});

          expect(spec).toEqual({_: jasmine.any(Object), d: [1, 2, 3]});
        });
      });

      it("should include inline type specification for an element which " +
         "is not of the list's element type", function() {
        var MyNumber = PentahoNumber.extend();

        var list = new NumberList([1, new MyNumber(2), 3]);
        var spec = list.toSpec();

        expect(spec).toEqual([1, {_: jasmine.any(Object), v: 2}, 3]);
      });
    });

    describe("#toSpecInContext(keyArgs)", function() {

      // coverage
      it("should allow not specifying keyArgs", function() {
        var scope = new SpecificationScope();

        var list = new NumberList();

        list.toSpecInContext();

        scope.dispose();
      });
    });
  });
});
