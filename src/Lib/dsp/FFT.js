import FourierTransform from "./FourierTransform";

class FFT extends FourierTransform {
    /**
     * FFT is a class for calculating the Discrete Fourier Transform of a signal
     * with the Fast Fourier Transform algorithm.
     *
     * @param {Number} bufferSize The size of the sample buffer to be computed. Must be power of 2
     * @param {Number} sampleRate The sampleRate of the buffer (eg. 44100)
     *
     * @constructor
     */
    constructor(bufferSize, sampleRate) {
        super(bufferSize, sampleRate);

        this.reverseTable = new Uint32Array(bufferSize);

        let limit = 1;
        let bit = bufferSize >> 1;

        let i;

        while (limit < bufferSize) {
            for (i = 0; i < limit; i++) {
                this.reverseTable[i + limit] = this.reverseTable[i] + bit;
            }

            limit = limit << 1;
            bit = bit >> 1;
        }

        this.sinTable = new Float32Array(bufferSize);
        this.cosTable = new Float32Array(bufferSize);

        for (i = 0; i < bufferSize; i++) {
            this.sinTable[i] = Math.sin(-Math.PI/i);
            this.cosTable[i] = Math.cos(-Math.PI/i);
        }
    }

    /**
     * Performs a forward transform on the sample buffer.
     * Converts a time domain signal to frequency domain spectra.
     *
     * @param {Array} buffer The sample buffer. Buffer Length must be power of 2
     *
     * @returns The frequency spectrum array
     */
    forward(buffer) {
        // Locally scope variables for speed up
        while(buffer.length < this.bufferSize) {
            buffer.push(0);
        }

        let bufferSize      = this.bufferSize,
            cosTable        = this.cosTable,
            sinTable        = this.sinTable,
            reverseTable    = this.reverseTable,
            real            = this.real,
            imag            = this.imag,
            spectrum        = this.spectrum;

        const k = Math.floor(Math.log(bufferSize) / Math.LN2);

        if (Math.pow(2, k) !== bufferSize) { throw "Invalid buffer size, must be a power of 2."; }
        if (bufferSize !== buffer.length)  { throw "Supplied buffer is not the same size as defined FFT. FFT Size: " + bufferSize + " Buffer Size: " + buffer.length; }

        let halfSize = 1,
            phaseShiftStepReal,
            phaseShiftStepImag,
            currentPhaseShiftReal,
            currentPhaseShiftImag,
            off,
            tr,
            ti,
            tmpReal,
            i;

        for (i = 0; i < bufferSize; i++) {
            real[i] = buffer[reverseTable[i]];
            imag[i] = 0;
        }

        while (halfSize < bufferSize) {
            //phaseShiftStepReal = Math.cos(-Math.PI/halfSize);
            //phaseShiftStepImag = Math.sin(-Math.PI/halfSize);
            phaseShiftStepReal = cosTable[halfSize];
            phaseShiftStepImag = sinTable[halfSize];

            currentPhaseShiftReal = 1;
            currentPhaseShiftImag = 0;

            for (let fftStep = 0; fftStep < halfSize; fftStep++) {
                i = fftStep;

                while (i < bufferSize) {
                    off = i + halfSize;
                    tr = (currentPhaseShiftReal * real[off]) - (currentPhaseShiftImag * imag[off]);
                    ti = (currentPhaseShiftReal * imag[off]) + (currentPhaseShiftImag * real[off]);

                    real[off] = real[i] - tr;
                    imag[off] = imag[i] - ti;
                    real[i] += tr;
                    imag[i] += ti;

                    i += halfSize << 1;
                }

                tmpReal = currentPhaseShiftReal;
                currentPhaseShiftReal = (tmpReal * phaseShiftStepReal) - (currentPhaseShiftImag * phaseShiftStepImag);
                currentPhaseShiftImag = (tmpReal * phaseShiftStepImag) + (currentPhaseShiftImag * phaseShiftStepReal);
            }

            halfSize = halfSize << 1;
        }

        return this.calculateSpectrum();
    };

    conjugate() {
        for (let i = 0; i < this.imag.length; i++) {
            this.imag[i] *= -1;
        }
    };

    multiply(fft2) {
        let r = 0, i = 0;
        const real = [];
        const imag = [];
        for (let j = 0; j < this.real.length; j++) {
            r = this.real[j] * fft2.real[j] - this.imag[j] * fft2.imag[j];
            i = this.real[j] * fft2.imag[j] + this.imag[j] * fft2.real[j];
            real.push(r);
            imag.push(i);
        }
        const result = new FFT(this.real.length, this.real.length);
        result.real = real;
        result.imag = imag;
        return result;
    };

    inverse(real, imag) {
        // Locally scope variables for speed up
        let bufferSize      = this.bufferSize,
            cosTable        = this.cosTable,
            sinTable        = this.sinTable,
            reverseTable    = this.reverseTable,
            spectrum        = this.spectrum;

        real = real || this.real;
        imag = imag || this.imag;

        let halfSize = 1,
            phaseShiftStepReal,
            phaseShiftStepImag,
            currentPhaseShiftReal,
            currentPhaseShiftImag,
            off,
            tr,
            ti,
            tmpReal,
            i;

        for (i = 0; i < bufferSize; i++) {
            imag[i] *= -1;
        }

        const revReal = new Float32Array(bufferSize);
        const revImag = new Float32Array(bufferSize);

        for (i = 0; i < real.length; i++) {
            revReal[i] = real[reverseTable[i]];
            revImag[i] = imag[reverseTable[i]];
        }

        real = revReal;
        imag = revImag;

        while (halfSize < bufferSize) {
            phaseShiftStepReal = cosTable[halfSize];
            phaseShiftStepImag = sinTable[halfSize];
            currentPhaseShiftReal = 1;
            currentPhaseShiftImag = 0;

            for (let fftStep = 0; fftStep < halfSize; fftStep++) {
                i = fftStep;

                while (i < bufferSize) {
                    off = i + halfSize;
                    tr = (currentPhaseShiftReal * real[off]) - (currentPhaseShiftImag * imag[off]);
                    ti = (currentPhaseShiftReal * imag[off]) + (currentPhaseShiftImag * real[off]);

                    real[off] = real[i] - tr;
                    imag[off] = imag[i] - ti;
                    real[i] += tr;
                    imag[i] += ti;

                    i += halfSize << 1;
                }

                tmpReal = currentPhaseShiftReal;
                currentPhaseShiftReal = (tmpReal * phaseShiftStepReal) - (currentPhaseShiftImag * phaseShiftStepImag);
                currentPhaseShiftImag = (tmpReal * phaseShiftStepImag) + (currentPhaseShiftImag * phaseShiftStepReal);
            }

            halfSize = halfSize << 1;
        }

        const buffer = new Float32Array(bufferSize); // this should be reused instead
        for (i = 0; i < bufferSize; i++) {
            buffer[i] = real[i] / bufferSize;
        }

        return buffer;
    };
}

export default FFT;