/**
 * Adjusts (returns) a redshift with heliocentric velocity to include the heliocentric correction
 * @param z - uncorrected redshift
 * @param helio - km/s heliocentric velocity
 * @param cmb - km/s velocity wrt 3K background
 * @returns {number}
 */
import {defaultFor} from "./methods";

export function adjustRedshift(z, helio, cmb) {
    helio = defaultFor(helio, null);
    cmb = defaultFor(cmb, null);
    if (helio == null && cmb == null) {
        return z;
    }
    const ckps = 299792.458;
    let zz = (1 + z);
    if (helio != null) {
        zz /= (1 - (helio / ckps));
    }
    if (cmb != null) {
        zz /= (1 - (cmb / ckps));
    }
    return zz - 1;
}