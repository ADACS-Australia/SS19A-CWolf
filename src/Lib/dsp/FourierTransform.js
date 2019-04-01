// Fourier Transform Module used by DFT, FFT, RFFT
class FourierTransform {
    constructor(bufferSize, sampleRate) {
        this.bufferSize = bufferSize;
        this.sampleRate = sampleRate;
        this.bandwidth = 2 / bufferSize * sampleRate / 2;

        this.spectrum = new Float32Array(bufferSize / 2);
        this.real = new Float32Array(bufferSize);
        this.imag = new Float32Array(bufferSize);

        this.peakBand = 0;
        this.peak = 0;
    }

    /**
     * Calculates the *middle* frequency of an FFT band.
     *
     * @param {Number} index The index of the FFT band.
     *
     * @returns The middle frequency in Hz.
     */
    getBandFrequency(index) {
        return this.bandwidth * index + this.bandwidth / 2;
    };

    conjugate() {
        for (let i = 0; i < this.imag.length; i++) {
            this.imag[i] *= -1;
        }
    };

    calculateSpectrum() {
        let spectrum = this.spectrum,
            real = this.real,
            imag = this.imag,
            bSi = 2 / this.bufferSize,
            sqrt = Math.sqrt,
            rval,
            ival,
            mag;

        for (let i = 0, N = this.bufferSize / 2; i < N; i++) {
            rval = real[i];
            ival = imag[i];
            mag = bSi * sqrt(rval * rval + ival * ival);

            if (mag > this.peak) {
                this.peakBand = i;
                this.peak = mag;
            }

            spectrum[i] = mag;
        }
    };
}

export default FourierTransform;