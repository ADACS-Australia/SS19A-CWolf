import {expect} from "chai";
import {getMean, getMeanMask, getStdDev, getStdDevMask, absMax, absMean} from "../src/Utils/methods";
import {linearScale, interpolate} from "../src/Utils/methods";
import {boxCarSmooth} from "../src/Utils/methods";
import {addAllToSorted, getList, removeAddAndFindMedian, medianFilter} from "../src/Utils/methods";
import cluster from 'cluster';

const testArray = [3,5,4,2,5,3,6,3,9,5,3,2,4,3,5,3,8,7,7,2,4];
const testArray2 = [3,5,4,2,5,-3,6,3,9,5,3,2,4,3,-10,5,3,8,7,7,2,4];
const tol=0.000000000001;

if (cluster.isMaster) {
/**
 * Tests for basic functions like mean and stdDev
 */
describe("Basic tests", () => {
  it("getMean test", () => {
    expect(getMean(testArray)).to.equal(4.4285714285714288);
  });
  it("getMeanMask test", () => {
        var mask = [];
        for (var i = 0; i < testArray.length; i++) {
            mask.push(testArray[i] > 4)
        }
        expect(getMeanMask(testArray, mask)).to.equal(6.333333333333333);
  });
  it("getMeanMask test", () => {
    var mask = [];
    for (var i = 0; i < testArray.length; i++) {
        mask.push(testArray[i] > 4)
    }
    expect(getMeanMask(testArray, mask)).to.equal(6.333333333333333);
});
it("getStdDev test", () => {
    expect(getStdDev(testArray)).to.equal(1.965692137195266);
});
it("getStdDevMask test", () => {
    var mask = [];
        for (var i = 0; i < testArray.length; i++) {
            mask.push(testArray[i] > 4)
        }
    expect(getStdDevMask(testArray, mask)).to.equal(1.4142135623730951);
});
it("absMax test", () => {
    expect(absMax(testArray2)).to.equal(10);
});
it("absMean test", () => {
    expect(absMean(testArray2)).to.equal(4.6818181818181817);
});
});


/**
 * Linear tests
 */
describe("Linear tests", () => {
    it("linearScale test", () => {
        const actual=linearScale(0, 10, 11);
        const expected=[0.0,1,2,3,4,5,6,7,8,9,10];
        actual.every((x, i) => expect(x).closeTo(expected[i],tol));
    });
    it("interpolate test", () => {
        const x = [0,1,2,3,4,5,6,7,8,9,10,11];
        const y = [5,2,3,4,7,2,9,4,2,5,5,6];
        const x2 = [0.1, 1.5, 3.2, 3.3, 4, 5, 7.7, 8.5, 9.5, 10,11];
        const actual=interpolate(x2, x, y);
        const expected=[ 4.7,  2.5,  4.6,  4.9,  7. ,  2. ,  2.6,  3.5,  5. ,  5., 6.0 ]
        actual.every((x, i) => expect(x).closeTo(expected[i],tol));
    });
  });

/**
 * Basic boxcar smoothing
 */
describe("Basic boxcar smoothing", () => {
    it("boxCarSmooth test (1)", () => {
        const actual=boxCarSmooth(testArray, 3);
        const expected=[3.66666667,  4.        ,  3.66666667,  3.66666667,  3.33333333,
            4.66666667,  4.        ,  6.        ,  5.66666667,  5.66666667,
            3.33333333,  3.        ,  3.        ,  4.        ,  3.66666667,
            5.33333333,  6.        ,  7.33333333,  5.33333333,  4.33333333,
            3.33333333];
        actual.every((x, i) => expect(x).closeTo(expected[i],0.00000001));
    });
    it("boxCarSmooth test (2)", () => {
        const actual=boxCarSmooth(testArray, 5);
        const expected=[ 3.6,  3.4,  3.8,  3.8,  4. ,  3.8,  5.2,  5.2,  5.2,  4.4,  4.6,  3.4,  3.4,
            3.4,  4.6,  5.2,  6. ,  5.4,  5.6,  4.8,  4.2];
        actual.every((x, i) => expect(x).closeTo(expected[i],0.000000001));
    });
  });


/**
 *  Tests for the linked lists and median filter
 */
describe("Tests for the linked lists and median filter", () => {
    it("Linked List - addAllToSorted test", () => {
        const head = [null, null];
        addAllToSorted(head, [5,6,2,4,0,8,7,7,1]);
        const actual=getList(head);
        const expected=[ 0, 1, 2, 4, 5, 6, 7, 7, 8 ];
        expect(actual).to.eql(expected);
    });
    it("Linked List - removeAddAndFindMedian test (1)", () => {
        const head = [null, null];
        addAllToSorted(head, [5,6,2,4,0,8,7,7,1]);
        const median = removeAddAndFindMedian(head, 5, 10, 4);
        const actual = [median, getList(head)];
        const expected = [6, [0, 1, 2, 4, 6, 7, 7, 8, 10 ]];
        expect(actual).to.eql(expected);
    });
    it("Linked List - removeAddAndFindMedian test (2)", () => {
        const head = [null, null];
        addAllToSorted(head, [5,6,2,4,0,8,7,7,1]);
        const median = removeAddAndFindMedian(head, 5, -5, 4);
        const actual = [median, getList(head)];
        const expected = [4, [-5, 0, 1, 2, 4, 6, 7, 7, 8 ]];
        expect(actual).to.eql(expected);
    });
    it("Linked List - medianFilter test (1)", () => {
        const actual = medianFilter(testArray, 3);;
        const expected = [3, 4, 4, 4, 3, 5, 3, 6, 5, 5, 3, 3, 3, 4, 3, 5, 7, 7, 7, 4, 4];
        expect(actual).to.eql(expected);
    });
    it("Linked List - medianFilter test (2)", () => {
        const actual = medianFilter(testArray, 5);
        const expected = [3, 3, 4, 4, 4, 3, 5, 5, 5, 3, 4, 3, 3, 3, 4, 5, 7, 7, 7, 4, 4];
        expect(actual).to.eql(expected);
    });
    it("Linked List - medianFilter test (3)", () => {
        const actual = medianFilter(testArray, 7);;
        const expected = [3, 3, 3, 4, 4, 4, 5, 5, 3, 4, 3, 4, 3, 3, 4, 5, 5, 5, 4, 4, 4];
        expect(actual).to.eql(expected);
    });
    it("Linked List - medianFilter test (4)", () => {
        const actual = medianFilter(testArray, 9);;
        const expected = [3, 3, 3, 3, 4, 5, 4, 3, 4, 3, 4, 3, 4, 4, 4, 4, 4, 4, 4, 4, 4];
        expect(actual).to.eql(expected);
    });
  });
}