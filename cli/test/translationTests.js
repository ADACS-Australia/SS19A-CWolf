import { expect } from "chai";
import math from "mathjs";
import { getHeliocentricVelocityCorrection, precess, bprecess, celestialToGalactic, ct2lst, premat } from "../src/Utils/helio";
import cluster from 'cluster';
const tol = 0.000001;

if (cluster.isMaster) {
/**
 * Tests for heliocentric corrections
 */
describe("Tests for heliocentric corrections", () => {
    it("getHeliocentricVelocityCorrection test (1)", () => {
        const actual = getHeliocentricVelocityCorrection(20, 20, 2457356.5, 254.17958, 32.780361, 2788, 2000);
        const expected = -20.051029;
        expect(actual).closeTo(expected, tol);
    });
    it("getHeliocentricVelocityCorrection test (2)", () => {
        const actual = getHeliocentricVelocityCorrection(0, 0, 2457400, 100, -40, 4000, 1900);
        const expected = -28.284173;
        expect(actual).closeTo(expected, tol);
    });
    it("getHeliocentricVelocityCorrection test (3)", () => {
        const actual = getHeliocentricVelocityCorrection(0, 0, 2457400, 100, -40, 4000, 2000);
        const expected = -28.023990;
        expect(actual).closeTo(expected, tol);
    });
    it("getHeliocentricVelocityCorrection test (4)", () => {
        const actual = getHeliocentricVelocityCorrection(-30, -30, 2457400, 100, -40, 4000, 2000);
        const expected = -14.316080;
        expect(actual).closeTo(expected, tol);
    });
    it("getHeliocentricVelocityCorrection test (5)", () => {
        const actual = getHeliocentricVelocityCorrection(-30, -30, 2457400, 100, -40, 8000, 2000);
        const expected = -14.315910;
        expect(actual).closeTo(expected, tol);
    });
    it("getHeliocentricVelocityCorrection test (6)", () => {
        const actual = getHeliocentricVelocityCorrection(0, 0, 2457401.5, 254.179583, 32.780361, 4000, 2000);
        const expected = -27.856910;
        expect(actual).closeTo(expected, tol);
    });
    it("getHeliocentricVelocityCorrection test (7)", () => {
        const actual = getHeliocentricVelocityCorrection(80, -50, 2457400, 254.179583, -50, 2000, 2000);
        const expected = -6.0071908;
        expect(actual).closeTo(expected, tol);
    });
    it("getHeliocentricVelocityCorrection test (8)", () => {
        const actual = getHeliocentricVelocityCorrection(0, 0, 2457400, 254.179583, 32.780361, 4000, 2000);
        const expected = -28.248393;
        expect(actual).closeTo(expected, tol);
    });
    it("getHeliocentricVelocityCorrection test (9)", () => {
        const actual = getHeliocentricVelocityCorrection(14.2802944, -30.2514324, 2457302.0273, 149.0661, -31.27704, 1164, 2000);
        const expected = -6.1508151;
        expect(actual).closeTo(expected, tol);
    });
});
describe("Tests for heliocentric precess", () => {
    it("precess test (1)", () => {
        const actual = precess(0, 0, 2000, 2000, false);
        const expected = [0.0, 0.0];
        actual.every((x, i) => expect(x).closeTo(expected[i], tol));
    });
    it("precess test (2)", () => {
        const actual = precess(0, 0, 2000, 2000, true);
        const expected = [0.0, 0.0];
        actual.every((x, i) => expect(x).closeTo(expected[i], tol));
    });
    it("precess test (3)", () => {
        const actual = precess(40, -10, 1990, 2000, false);
        const expected = [40.121815, -9.9573874];
        actual.every((x, i) => expect(x).closeTo(expected[i], tol));
    });
    it("precess test (4)", () => {
        const actual = precess(40, -10, 1990, 2000, true);
        const expected = [40.121785, -9.9573976];
        actual.every((x, i) => expect(x).closeTo(expected[i], tol));
    });
    it("precess test (5)", () => {
        const actual = precess(40, -10, 2010, 2000, false);
        const expected = [39.878189, -10.042687];
        actual.every((x, i) => expect(x).closeTo(expected[i], tol));
    });
    it("precess test (6)", () => {
        const actual = precess(40, -10, 2010, 2000, true);
        const expected = [39.878219, -10.042677];
        actual.every((x, i) => expect(x).closeTo(expected[i], tol));
    });
    it("precess test (7)", () => {
        const actual = precess(383.2, 77.7, 2010, 2000, false);
        const expected = [22.971964, 77.648784];
        actual.every((x, i) => expect(x).closeTo(expected[i], tol));
    });
    it("precess test (8)", () => {
        const actual = precess(383.2, 77.7, 2010, 2000, true);
        const expected = [22.972019, 77.648797];
        actual.every((x, i) => expect(x).closeTo(expected[i], tol));
    });
});

describe("Tests for heliocentric bprecess", () => {
    it("bprecess test (1)", () => {
        const actual = bprecess(0.0, 0.0);
        const expected = [359.35927463427, -0.278349472209];
        actual.every((x, i) => expect(x).closeTo(expected[i], tol));
    });
    it("bprecess test (2)", () => {
        const actual = bprecess(10.0, 10.0);
        const expected = [9.35116153180137, 9.725621998403];
        actual.every((x, i) => expect(x).closeTo(expected[i], tol));
    });
    it("bprecess test (3)", () => {
        const actual = bprecess(100.0, 100.0);
        const expected = [280.9071874005737, 79.949490115037];
        actual.every((x, i) => expect(x).closeTo(expected[i], tol));
    });
    it("bprecess test (4)", () => {
        const actual = bprecess(100.0, 100.0);
        const expected = [280.9071874005737, 79.949490115037];
        actual.every((x, i) => expect(x).closeTo(expected[i], tol));
    });
    it("bprecess test (5)", () => {
        const actual = bprecess(100.0, -22.0);
        const expected = [99.470108816407, -21.952943409067];
        actual.every((x, i) => expect(x).closeTo(expected[i], tol));
    });
    it("bprecess test (6)", () => {
        const actual = bprecess(10.0, 10.0, 1990);
        const expected = [9.35116780677422, 9.72561014200179];
        actual.every((x, i) => expect(x).closeTo(expected[i], tol));
    });
    it("bprecess test (7)", () => {
        const actual = bprecess(10.0, 10.0, 2010);
        const expected = [9.3511552568280, 9.72563385480417];
        actual.every((x, i) => expect(x).closeTo(expected[i], tol));
    });
});

describe("Tests for celestialToGalactic", () => {
    it("celestialToGalactic test (1)", () => {
        const actual = celestialToGalactic(0.0, 0.0, 2000.0, true);
        const expected = [96.3372141633617, -60.18848302656439];
        actual.every((x, i) => expect(x).closeTo(expected[i], tol));
    });
    it("celestialToGalactic test (2)", () => {
        const actual = celestialToGalactic(0.0, 0.0, 2000.0, false);
        const expected = [96.33788885880096, -60.1886115962646];
        actual.every((x, i) => expect(x).closeTo(expected[i], tol));
    });
    it("celestialToGalactic test (3)", () => {
        const actual = celestialToGalactic(0.0, 0.0, 1990.0, true);
        const expected = [96.6182034830445673, -60.1881654987349748];
        actual.every((x, i) => expect(x).closeTo(expected[i], tol));
    });
    it("celestialToGalactic test (4)", () => {
        const actual = celestialToGalactic(0.0, 0.0, 1990.0, false);
        const expected = [96.6188099695406777, -60.1882924408349567];
        actual.every((x, i) => expect(x).closeTo(expected[i], tol));
    });
    it("celestialToGalactic test (5)", () => {
        const actual = celestialToGalactic(0.0, 0.0, 2010.0, true);
        const expected = [96.0562121269150424, -60.1882008352895284];
        actual.every((x, i) => expect(x).closeTo(expected[i], tol));
    });
    it("celestialToGalactic test (6)", () => {
        const actual = celestialToGalactic(0.0, 0.0, 2010.0, false);
        const expected = [96.0569549886245113, -60.1883313186408202];
        actual.every((x, i) => expect(x).closeTo(expected[i], tol));
    });
    it("celestialToGalactic test (7)", () => {
        const actual = celestialToGalactic(10.0, 10.0);
        const expected = [118.2743723329215300, -52.7682124150604324];
        actual.every((x, i) => expect(x).closeTo(expected[i], tol));
    });
    it("celestialToGalactic test (8)", () => {
        const actual = celestialToGalactic(10.0, -10.0);
        const expected = [113.4435690856713848, -72.6606623285910729];
        actual.every((x, i) => expect(x).closeTo(expected[i], tol));
    });
    it("celestialToGalactic test (9)", () => {
        const actual = celestialToGalactic(423.1, 88.80, 2001.0, true);
        const expected = [123.9597976503729910, 26.3515569418066349];
        actual.every((x, i) => expect(x).closeTo(expected[i], tol));
    });
});

describe("Tests for ct2lst", () => {
    it("ct2lst test (1)", () => {
        const actual = ct2lst(0.0, 0.0);
        const expected = 16.2228996455669403;
        expect(actual).closeTo(expected, tol);
    });
    it("ct2lst test (2)", () => {
        const actual = ct2lst(0.0, 2400000.5);
        const expected = 3.7173812857363373;
        expect(actual).closeTo(expected, tol);
    });
    it("ct2lst test (3)", () => {
        const actual = ct2lst(10.0, 0.0);
        const expected = 16.8895663097500801;
        expect(actual).closeTo(expected, tol);
    });
    it("ct2lst test (4)", () => {
        const actual = ct2lst(45.0, 2412345.5);
        const expected = 1.9051420227624476;
        expect(actual).closeTo(expected, tol);
    });
    it("ct2lst test (5)", () => {
        const actual = ct2lst(-45.0, 2412345.5);
        const expected = 19.9051420227624476;
        expect(actual).closeTo(expected, tol);
    });
    it("ct2lst test (6)", () => {
        const actual = ct2lst(445.0, 2412345.7);
        const expected = 9.3849506585393101;
        expect(actual).closeTo(expected, tol);
    });
});


describe("Tests for premat", () => {

    it("premat test (1)", () => {
        const actual = premat(2000.0, 2000.0, false).toArray();
        const expected = math.matrix([[1.0,0.0,0.0],[0.0,1.0,0.0],[0.0,0.0,1.0]]).toArray();
        for (let p in actual) {
            actual[p].every((x, i) => expect(x).closeTo(expected[p][i], tol));
        }
    });

    it("premat test (2)", () => {
        const actual = premat(2000.0, 2000.0, true).toArray();
        const expected = math.matrix([[1.0,0.0,0.0],[0.0,1.0,0.0],[0.0,0.0,1.0]]).toArray();
        for (let p in actual) {
            actual[p].every((x, i) => expect(x).closeTo(expected[p][i], tol));
        }
    });

    it("premat test (3)", () => {
        const actual = premat(1990.0, 2010.0, false).toArray();
        const expected = math.transpose(math.matrix([[0.9999881106223780,0.0044723266234603,0.0019434269885729],
            [-0.0044723266237506,0.9999899990878337,-0.0000043456965697],
            [-0.0019434269879047, -0.0000043459953602, 0.9999981115345443]])).toArray();
        for (let p in actual) {
            actual[p].every((x, i) => expect(x).closeTo(expected[p][i], tol));
        }
    });

    it("premat test (4)", () => {
        const actual = premat(1990.0, 2010.0, true).toArray();
        const expected = math.transpose(math.matrix([[0.9999881164478237, 0.0044712259919042, 0.0019429619818773],
            [-0.0044712259921946, 0.9999900040096701, -0.0000043435874016],
            [-0.0019429619812091, -0.0000043438863308, 0.9999981124381536]])).toArray();
        for (let p in actual) {
            actual[p].every((x, i) => expect(x).closeTo(expected[p][i], tol));
        }
    });
   
});
    }