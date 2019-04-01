/**
 * Computes the heliocentric velocity (km/s) correction for a given time and location.
 *
 * A translation of AutoZ code, originally written written by S. Burles & D. Schlegel
 *
 * @param ra - right ascension (degrees)
 * @param dec - declination (degrees)
 * @param jd - decimal julian data.
 * @param longitude - longitude of observatory [default to AAT: 149.0661]
 * @param latitude - latitude of observatory [default to AAT: -31.27704]
 * @param altitude - altitude of observatory (m) [default to AAT: 1164]
 * @param epoch - epoch of observation [defaults to 2000]
 * @param radecsys - the system for RA and DEC. Set to true if FK5, false for FK4 [default to FK5: true]
 */
import {defaultFor} from "./methods";

export function getHeliocentricVelocityCorrection(ra, dec, jd, longitude, latitude, altitude, epoch, fk5, cmb) {
    longitude = defaultFor(longitude, 149.0661);
    latitude = defaultFor(latitude, -31.27704);
    altitude = defaultFor(altitude, 1164);
    epoch = defaultFor(epoch, 2000);
    fk5 = defaultFor(fk5, true);



    // Compute baryocentric velocity
    const vBarycentric = getBarycentricCorrection(jd, epoch, ra, dec);

    // Compute rotational velocity of observer on the Earth
    const DRADEG = 180.0 / Math.PI;
    let latrad = latitude / DRADEG;
    // Reduction of geodetic latitude to geocentric latitude (radians).
    // DLAT is in arcseconds.

    const dlat = -(11.0 * 60.0 + 32.743) * math.sin(2.0 * latrad) + 1.1633 * math.sin(4.0 * latrad) -0.0026 * math.sin(6.0 * latrad);
    latrad  = latrad + (dlat / 3600.0) / DRADEG;

    // R is the radius vector from the Earth's center to the observer (meters).
    // VC is the corresponding circular velocity
    // (meters/sidereal day converted to km / sec).
    // (sidereal day = 23.934469591229 hours (1986))

    const r = 6378160.0 * (0.998327073 + 0.001676438 * math.cos(2.0 * latrad)
        - 0.00000351 * math.cos(4.0 * latrad) + 0.000000008 * math.cos(6.0 * latrad)) + altitude;
    const vc = 2.0 * Math.PI * (r / 1000.0)  / (23.934469591229 * 3600.0);

    // Compute the hour angle, HA, in degrees
    let LST = ct2lst(longitude, jd);
    LST = 15. * LST; // convert from hours to degrees
    const HA = LST - ra;

    // Project the velocity onto the line of sight to the star.
    const vrotate = vc * math.cos(latrad) * math.cos(dec/DRADEG) * math.sin(HA/DRADEG);



    const vTotal = vrotate + vBarycentric;
    //console.log("RA: " + ra + " DEC:" + dec + " HELIO: " + vTotal);
    return vTotal;
}

export /**
 * Returns the velocity correction to shift from celestial frame to CMB frame, via the galactic frame, in km/s
 *
 * @param ra - right ascension of target, in degrees
 * @param dec - declination of target, in degrees
 * @param epoch - epoch of observation. Normally 2000.
 * @param fk5 - true or false boolean value. False for FK4
 * @returns {number}
 */
function getCMBCorrection(ra, dec, epoch, fk5) {

    const lb = celestialToGalactic(ra, dec, epoch, fk5);
    const l = lb[0], b = lb[1];

    const lapex = 264.14;
    const bapex = 48.26;
    const vapex = 371.0;

    const degToRad = Math.PI / 180.0;

    const frac = Math.sin(b * degToRad) * Math.sin(bapex * degToRad) + Math.cos(b * degToRad) * Math.cos(bapex * degToRad) * Math.cos((l - lapex) * degToRad);

    return frac * vapex;
}
