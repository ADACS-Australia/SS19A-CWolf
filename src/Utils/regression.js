/**
 * @license
 *
 * Regression.JS - Regression functions for javascript
 * http://tom-alexander.github.com/regression-js/
 *
 * copyright(c) 2013 Tom Alexander
 * Licensed under the MIT license.
 *
 **/

export function gaussianElimination(a, o) {
    let j = 0, k = 0, maxrow = 0, tmp = 0;
    const n = a.length - 1, x = new Array(o);
    for (let i = 0; i < n; i++) {
        maxrow = i;
        for (j = i + 1; j < n; j++) {
            if (Math.abs(a[i][j]) > Math.abs(a[i][maxrow]))
                maxrow = j;
        }
        for (k = i; k < n + 1; k++) {
            tmp = a[k][i];
            a[k][i] = a[k][maxrow];
            a[k][maxrow] = tmp;
        }
        for (j = i + 1; j < n; j++) {
            for (k = n; k >= i; k--) {
                a[k][j] -= a[k][i] * a[i][j] / a[i][i];
            }
        }
    }
    for (j = n - 1; j >= 0; j--) {
        tmp = 0;
        for (k = j + 1; k < n; k++)
            tmp += a[k][j] * x[k];
        x[j] = (a[n][j] - tmp) / a[j][j];
    }
    return (x);
}

export function linear(data) {
    let n = 0;
    const sum = [0, 0, 0, 0, 0], results = [];

    for (; n < data.length; n++) {
        if (data[n][1]) {
            sum[0] += data[n][0];
            sum[1] += data[n][1];
            sum[2] += data[n][0] * data[n][0];
            sum[3] += data[n][0] * data[n][1];
            sum[4] += data[n][1] * data[n][1];
        }
    }

    const gradient = (n * sum[3] - sum[0] * sum[1]) / (n * sum[2] - sum[0] * sum[0]);
    const intercept = (sum[1] / n) - (gradient * sum[0]) / n;
    //  const correlation = (n * sum[3] - sum[0] * sum[1]) / Math.sqrt((n * sum[2] - sum[0] * sum[0]) * (n * sum[4] - sum[1] * sum[1]));

    for (let i = 0, len = data.length; i < len; i++) {
        const coordinate = [data[i][0], data[i][0] * gradient + intercept];
        results.push(coordinate);
    }

    const string = 'y = ' + Math.round(gradient * 100) / 100 + 'x + ' + Math.round(intercept * 100) / 100;

    return {equation: [gradient, intercept], points: results, string: string};
}

export function exponential(data) {
    const sum = [0, 0, 0, 0, 0, 0], results = [];
    let n = 0;

        for (const len = data.length; n < len; n++) {
        if (data[n][1]) {
            sum[0] += data[n][0];
            sum[1] += data[n][1];
            sum[2] += data[n][0] * data[n][0] * data[n][1];
            sum[3] += data[n][1] * Math.log(data[n][1]);
            sum[4] += data[n][0] * data[n][1] * Math.log(data[n][1]);
            sum[5] += data[n][0] * data[n][1];
        }
    }

    const denominator = (sum[1] * sum[2] - sum[5] * sum[5]);
    const A = Math.pow(Math.E, (sum[2] * sum[3] - sum[5] * sum[4]) / denominator);
    const B = (sum[1] * sum[4] - sum[5] * sum[3]) / denominator;

    for (let i = 0, len = data.length; i < len; i++) {
        const coordinate = [data[i][0], A * Math.pow(Math.E, B * data[i][0])];
        results.push(coordinate);
    }

    const string = 'y = ' + Math.round(A * 100) / 100 + 'e^(' + Math.round(B * 100) / 100 + 'x)';

    return {equation: [A, B], points: results, string: string};
}

export function logarithmic(data) {
    const sum = [0, 0, 0, 0], results = [];
    let n = 0;

    for (const len = data.length; n < len; n++) {
        if (data[n][1]) {
            sum[0] += Math.log(data[n][0]);
            sum[1] += data[n][1] * Math.log(data[n][0]);
            sum[2] += data[n][1];
            sum[3] += Math.pow(Math.log(data[n][0]), 2);
        }
    }

    const B = (n * sum[1] - sum[2] * sum[0]) / (n * sum[3] - sum[0] * sum[0]);
    const A = (sum[2] - B * sum[0]) / n;

    for (let i = 0, len = data.length; i < len; i++) {
        const coordinate = [data[i][0], A + B * Math.log(data[i][0])];
        results.push(coordinate);
    }

    const string = 'y = ' + Math.round(A * 100) / 100 + ' + ' + Math.round(B * 100) / 100 + ' ln(x)';

    return {equation: [A, B], points: results, string: string};
}

export function power(data) {
    const sum = [0, 0, 0, 0], results = [];
    let n = 0;

    for (const len = data.length; n < len; n++) {
        if (data[n][1]) {
            sum[0] += Math.log(data[n][0]);
            sum[1] += Math.log(data[n][1]) * Math.log(data[n][0]);
            sum[2] += Math.log(data[n][1]);
            sum[3] += Math.pow(Math.log(data[n][0]), 2);
        }
    }

    const B = (n * sum[1] - sum[2] * sum[0]) / (n * sum[3] - sum[0] * sum[0]);
    const A = Math.pow(Math.E, (sum[2] - B * sum[0]) / n);

    for (let i = 0, len = data.length; i < len; i++) {
        const coordinate = [data[i][0], A * Math.pow(data[i][0], B)];
        results.push(coordinate);
    }

    const string = 'y = ' + Math.round(A * 100) / 100 + 'x^' + Math.round(B * 100) / 100;

    return {equation: [A, B], points: results, string: string};
}

export function polynomial2(datax, datay, order) {
    if (typeof order == 'undefined') {
        order = 2;
    }
    const lhs = [], rhs = [], results = [], k = order + 1;
    let a = 0, b = 0, i = 0;

    for (; i < k; i++) {
        for (let l = 0, len = datax.length; l < len; l++) {
            if (datay[l]) {
                a += Math.pow(datax[l], i) * datay[l];
            }
        }
        lhs.push(a);
        a = 0;
        const c = [];
        for (let j = 0; j < k; j++) {
            for (let l = 0, len = datax.length; l < len; l++) {
                if (datay[l]) {
                    b += Math.pow(datax[l], i + j);
                }
            }
            c.push(b);
            b = 0;
        }
        rhs.push(c);
    }
    rhs.push(lhs);

    const equation = gaussianElimination(rhs, k);

    for (let i = 0, len = datax.length; i < len; i++) {
        let answer = 0;
        for (let w = 0; w < equation.length; w++) {
            answer += equation[w] * Math.pow(datax[i], w);
        }
        results.push(answer);
    }

    let string = 'y = ';

    for (let i = equation.length - 1; i >= 0; i--) {
        if (i > 1) string += Math.round(equation[i] * 100) / 100 + 'x^' + i + ' + ';
        else if (i === 1) string += Math.round(equation[i] * 100) / 100 + 'x' + ' + ';
        else string += Math.round(equation[i] * 100) / 100;
    }

    return {equation: equation, points: results, string: string};
}

export function getDataPowered(datax, power) {
    const result = [];
    const dataLength = datax.length;
    const maxPower = 2 * power + 1;
    for (let i = 0; i < maxPower; i++) {
        const temp = new Array(datax.length);
        if (i === 0) {
            for (let j = 0; j < dataLength; j++) {
                temp[j] = 1.0;
            }
            result.push(temp);
        } else if (i === 1) {
            result.push(datax);
        } else {
            for (let j = 0; j < dataLength; j++) {
                temp[j] = datax[j] * result[i - 1][j];
            }
            result.push(temp);
        }
    }
    return result;
}

export function polynomial3(datax, datay, order, weights, dataPowered) {
    if (typeof order == 'undefined') {
        order = 2;
    }
    if (typeof dataPowered == 'undefined') {
        dataPowered = getDataPowered(datax, order);
    }
    if (typeof weights == 'undefined') {
        weights = new Array(datax.length);
        for (let i = 0, len = weights.length; i < len; i++) {
            weights[i] = true;
        }
    }
    const lhs = [], rhs = [], results = [], k = order + 1;
    let a = 0, b = 0, ij = 0;

    for (let i = 0; i < k; i++) {
        for (let l = 0, len = datax.length; l < len; l++) {
            if (datay[l] && weights[l]) {
                a += dataPowered[i][l] * datay[l];
            }
        }
        lhs.push(a);
        a = 0;
        const c = [];
        for (let j = 0; j < k; j++) {
            ij = i + j;
            for (let l = 0, len = datax.length; l < len; l++) {
                if (datay[l] && weights[l]) {
                    b += dataPowered[ij][l]
                }
            }
            c.push(b);
            b = 0;
        }
        rhs.push(c);
    }
    rhs.push(lhs);

    const equation = gaussianElimination(rhs, k);

    for (let i = 0, len = datax.length; i < len; i++) {
        let answer = 0;
        for (let w = 0; w < equation.length; w++) {
            answer += equation[w] * dataPowered[w][i];
        }
        results.push(answer);
    }

    let string = 'y = ';

    for (let i = equation.length - 1; i >= 0; i--) {
        if (i > 1) string += Math.round(equation[i] * 100) / 100 + 'x^' + i + ' + ';
        else if (i === 1) string += Math.round(equation[i] * 100) / 100 + 'x' + ' + ';
        else string += Math.round(equation[i] * 100) / 100;
    }

    return {equation: equation, points: results, string: string};
}

export function polynomial(data, order) {
    if (typeof order == 'undefined') {
        order = 2;
    }
    const lhs = [], rhs = [], results = [], k = order + 1;
    let a = 0, b = 0, i = 0;

    for (; i < k; i++) {
        for (let l = 0, len = data.length; l < len; l++) {
            if (data[l][1]) {
                a += Math.pow(data[l][0], i) * data[l][1];
            }
        }
        lhs.push(a);
        a = 0;
        const c = [];
        for (let j = 0; j < k; j++) {
            for (let l = 0, len = data.length; l < len; l++) {
                if (data[l][1]) {
                    b += Math.pow(data[l][0], i + j);
                }
            }
            c.push(b);
            b = 0;
        }
        rhs.push(c);
    }
    rhs.push(lhs);

    const equation = gaussianElimination(rhs, k);

    for (let i = 0, len = data.length; i < len; i++) {
        let answer = 0;
        for (let w = 0; w < equation.length; w++) {
            answer += equation[w] * Math.pow(data[i][0], w);
        }
        results.push([data[i][0], answer]);
    }

    let string = 'y = ';

    for (let i = equation.length - 1; i >= 0; i--) {
        if (i > 1) string += Math.round(equation[i] * 100) / 100 + 'x^' + i + ' + ';
        else if (i === 1) string += Math.round(equation[i] * 100) / 100 + 'x' + ' + ';
        else string += Math.round(equation[i] * 100) / 100;
    }

    return {equation: equation, points: results, string: string};
}
