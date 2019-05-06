
import {expect} from "chai";
import {broadenError, maxMedianAdjust} from "../src/Utils/methods";
import cluster from 'cluster';

var testArray = [3,5,4,2,5,-3,6,3,9,5,3,2,4,3,-10,5,3,8,7,7,2,4];
var testArray2 = [3,5,4,2,5,-3,6,3,9,5,9e19,2,4,3,-10,5,3,8,7,7,2,4];
var testArray3 = [3, 5, 4, 2, 5, 3, 6, 3, 9, 5, 3, 2, 4, 3, 5, 3, 8, 7, 7, 2, 4];
const tol=0.000000000001;

if (cluster.isMaster) {
/**
 * Tests for basic algorithms
 */
describe("Tests for basic algorithms", () => {
    it("broadenError test", () => {
        const arr = testArray2.slice();
        broadenError(arr);
        const actual=arr;
        const expected=[5,5,5,5,5,6,6,9,9,9e19,9e19,9e19,4,4,5,5,8,8,8,7,7,4];
        expect(actual).to.eql(expected);
    });
    it("maxMedianAdjust2 test (1)", () => {
        const arr = testArray3.slice();
        maxMedianAdjust(arr, 3, 1.0);
        const actual=arr;
        const expected=[3, 5, 4, 4, 5, 5, 6, 6, 9, 5, 3, 3, 4, 4, 5, 5, 8, 7, 7, 4, 4];
        expect(actual).to.eql(expected);
    });
    it("maxMedianAdjust2 test (2)", () => {
        const arr = testArray3.slice();
        maxMedianAdjust(arr, 5, 1.1);
        const actual=arr;
        const expected=[3.3, 5, 4.4, 4.4, 5, 3.3, 6, 5.5, 9, 5, 4.4, 3.3, 4, 3.3, 5, 5.5, 8, 7.7, 7.7, 4.4, 4.4];
        actual.every((x, i) => expect(x).closeTo(expected[i],tol));
    });
});
}