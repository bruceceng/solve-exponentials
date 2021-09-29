import brentSolver from './brent-solver.mjs';

const evaluateExponentFormula = (formula, x) => {
    return (formula.reduce( (total, partFormula) => total + partFormula.A * Math.exp(x*partFormula.B), 0));
}

const findRoot = (xMin, xMax, curve) => {
    let tolerance = 1e-12;
    let method = ' brent';
    if (method === 'brent') {
        let yMin = evaluateExponentFormula(curve, xMin);
        let yMax = evaluateExponentFormula(curve, xMax);
        if (yMin * yMax >= 0) {return(null);} //same sign, no roots.
        let solver = brentSolver.setup(xMin,yMin,xMax,yMax);
        //brentSolver.setTolerance(solver, tolerance);
        for (let i=0; i<30; i++) {
            let xGuess = brentSolver.getX(solver);
            let yGuess = evaluateExponentFormula(curve, xGuess);
            if (Math.abs(yGuess) < tolerance) {
                //console.log('brent converged in ' + i + ' iterations.');
                return(xGuess);
            }
            brentSolver.setY(solver, yGuess);
        }
        console.log('No covergence.');
    }
    else {
        return(bisection(xMin, xMax, tolerance, curve));
    }
}

//only call this if we are sure there is a single root in the range.
const bisection = (xMin, xMax, tolerance, curve) => {
    let yMin = evaluateExponentFormula(curve, xMin);
    let yMax = evaluateExponentFormula(curve, xMax);
    if (yMin * yMax >= 0) {return(null);} //same sign, no roots.
    let x=0;
    for (let i=0; i<30; i++) {
        x = (xMin + xMax)/2;
        let y = evaluateExponentFormula(curve, x);
        if (Math.abs(y) < tolerance) {
            //console.log('bisection converged in ' + i + ' iterations.');
            return(x);
        }
        if (yMin * y >= 0) {
            xMin = x; //can't be between xMin and x since they have same sine
        } else {
            xMax = x;
        }
    }
    return(x);
}

function findPossibleRange(curve) {
    // find a bounded range in which all possible intersections must occur.
    // moving towards positive x, this is bounded by the point at which the fastest growing term has a larger magnitude than opposite signed terms combined
    // moving towards negative x, this is bounded by the point at which the slowest shrinking term has a larger magnitude than opposite signed terms combined

    // order by exponent
    curve = curve.sort((partFormula1, partFormula2) => partFormula1.B - partFormula2.B);

    // find number of terms with opposite sign as the largest term
    let maxExponentTerm = curve.length-1;
    let oppositeSignTerms = curve.filter(partFormula => partFormula.A*curve[maxExponentTerm].A < 0);
    let numberWithOppositeSign = oppositeSignTerms.length;

    // for each term with the opposite sign, see when the largest term is atleast P times larger where P is the number of terms with opposite sign.
    // above the maximum of these, the largest term is growing faster than all combined terms of the opposite sign.
    let xMaxForTerm = oppositeSignTerms.map(partFormula => Math.log(numberWithOppositeSign*Math.abs(partFormula.A/curve[maxExponentTerm].A))/(curve[maxExponentTerm].B - partFormula.B));
    let xRootMax = Math.max(...xMaxForTerm);

    let minExponentTerm = 0;
    let shrinkingOppositeSignTerms = curve.filter(partFormula => partFormula.A*curve[minExponentTerm].A < 0);
    let shrinkingNumberWithOppositeSign = shrinkingOppositeSignTerms.length;
    let xMinForTerm = shrinkingOppositeSignTerms.map(partFormula => Math.log(shrinkingNumberWithOppositeSign*Math.abs(partFormula.A/curve[minExponentTerm].A))/(curve[minExponentTerm].B - partFormula.B));
    let xRootMin = Math.min(...xMinForTerm);

    return({min: xRootMin, max: xRootMax});
}

function findRootOfExponents(xMin, xMax, curve) {

    //order by exponent
    curve = curve.sort((partFormula1, partFormula2) => partFormula1.B - partFormula2.B);

    //find number of terms with opposite sign as the largest term
    let maxExponentTerm = curve.length-1;
    let minExponentTerm = 0;

    let result = findPossibleRange(curve);
    let xRootMin = result.min;
    let xRootMax = result.max;

    //at this point, we know that any roots if they exist must be between 
    //xRootMin < x < xRootMax
    console.log(`All roots are bounded by ${xRootMin} < x < ${xRootMax}`);

    xMin = Math.max(xMin, xRootMin);
    xMax = Math.min(xMax, xRootMax);

    if (xMax < xMin) {
        console.log("No roots exist.");
        return;
    }

    if (xMax === xMin) {
        //see if the sign changes near the one possible root
        let tolerance = 1e-12;
        if (evaluateExponentFormula(curve, xMax - tolerance) * evaluateExponentFormula(curve, xMax + tolerance) < 0) {
            console.log('Roots: ', [xMax]);
            return([xMax]);
        } else {
            console.warn(`Only one root possible at ${xMin}. However, no sign change detected.`);
            return([]);
        }
    }

    //see how many derivatives we need to take before we can tell by simple inspection the sign of the equation over the entire range.
    
    //first determine the max exponent. (assume that all exponents are unique)
    let exponents = curve.map(x => x.B);  
    let coefficients = curve.map(x => x.A);
    //let maxExponentTerm = exponents.indexOf(Math.max(...exponents));

    const maxDerivatives = 40;
    let numberOfDerivatives = 0;
    for (let n=1; n<maxDerivatives; n++) {
        let currentCoeffients = coefficients.map((x,i) => x * exponents[i]**n);

        let maxGrowthAtMin = Math.abs(currentCoeffients[maxExponentTerm] * Math.exp(exponents[maxExponentTerm]*xMin));
        //add together all the curves with an opposite sign as the max exponent curve evaluated at xMin
        let sumOfOthers = currentCoeffients.reduce((total, A, i) => {
            if (i === maxExponentTerm) {
                return(total);
            };
            //same sign
            if (A*currentCoeffients[maxExponentTerm] > 0) {
                return(total);
            }
            return(total + A*Math.exp(exponents[i]*xMin));
        },0);
        //see if the biggest exponent term is already dominant at x=xMin. If so, it will remain dominant
        
        //console.log(n, maxGrowthAtMin, sumOfOthers);
        if (maxGrowthAtMin > Math.abs(sumOfOthers)) {
            numberOfDerivatives = n;
            //console.log(`Term ${maxExponentTerm} dominant after ${numberOfDerivatives} derivatives`);
            break;
        }

        //the other possibility is that the fast shrinking term is dominant at x=xMax. If so it will be dominant within the whole range
        let minGrowthAtMax = Math.abs(currentCoeffients[minExponentTerm] * Math.exp(exponents[minExponentTerm]*xMax));
        let sumOfOthers2 = currentCoeffients.reduce((total, A, i) => {
            if (i === minExponentTerm) {
                return(total);
            };
            //same sign
            if (A*currentCoeffients[minExponentTerm] > 0) {
                return(total);
            }
            return(total + A*Math.exp(exponents[i]*xMax));
        },0);
        //console.log(n, minGrowthAtMax, sumOfOthers2);
        if (minGrowthAtMax > Math.abs(sumOfOthers2)) {
            numberOfDerivatives = n;
            //console.log(`Term ${minExponentTerm} dominant after ${numberOfDerivatives} derivatives`);
            break;
        }
    }

    //when we have a dominant term, we have a monotomic range which means that it can have a most one root.
    let monotomicRangesOfDerivative = [{xMin: xMin, xMax: xMax}];
    let actualRoots = [];
    for (let currentDerivative = numberOfDerivatives-1; currentDerivative>=0; currentDerivative--) {
        let derivativeCurve = getDerivative(curve,currentDerivative);
        let newMonotomicRanges = [];
        for (let i=0; i<monotomicRangesOfDerivative.length; i++) {
            //go through the current range which has a monotomic derivative and see if it crosses the axis.
            let xMin = monotomicRangesOfDerivative[i].xMin;
            let xMax = monotomicRangesOfDerivative[i].xMax
            let yMin = evaluateExponentFormula(derivativeCurve, xMin);
            let yMax = evaluateExponentFormula(derivativeCurve, xMax);

            if (yMin * yMax > 0) {
                //no root on this function so we still have a monotomic range
                newMonotomicRanges.push({xMin: xMin, xMax: xMax});
            } 
            else {
                //find the root
                let xIntersection = findRoot(xMin, xMax, derivativeCurve);
                //there was a root so now the previous monotomic range is divided into two on either side of the root.
                //console.log(`Root of ${currentDerivative} derivative at x=${xIntersection}`);
                newMonotomicRanges.push({xMin: xMin, xMax: xIntersection});
                newMonotomicRanges.push({xMin: xIntersection, xMax: xMax});

                //if we are at the 0th derivative (function itself), then record the roots.
                if (currentDerivative==0) {
                    actualRoots.push(xIntersection);
                }
            }
        }
        //now we are decreasing the derivative using the new ranges.
        monotomicRangesOfDerivative = newMonotomicRanges;
    }

    console.log('Roots: ', actualRoots);

    return(actualRoots);
}

function getDerivative(curve, numberOfDerivatives) {
    if (numberOfDerivatives === 0) { //something about the constant term didn't work quite right...
        return(curve.map(partFormula => ({A: partFormula.A, B: partFormula.B})));
    }
    else {
        return(curve.filter(partFormula => partFormula.B !== 0).map(partFormula => ({A: partFormula.A*(partFormula.B)**numberOfDerivatives, B: partFormula.B})));
    }
}

export default {findRootOfExponents: findRootOfExponents, evaluateExponentFormula: evaluateExponentFormula}