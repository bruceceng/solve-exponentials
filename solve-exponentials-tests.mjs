import exponentSolver from './solve-exponentials.mjs';
function testSolveExponentials() {

	let curve = [

		{ A: 0.01, B: -0.125 },
		{ A: - 0.1, B: -0.25 },
		{ A: 1, B: -0.7},
	];
    let roots = exponentSolver.findRootOfExponents(0, 100, curve);	
	console.log(`f(${roots[0]}) = ${exponentSolver.evaluateExponentFormula(curve, roots[0])}`);
	console.log(`f(${roots[1]}) = ${exponentSolver.evaluateExponentFormula(curve, roots[1])}`);
    
	curve = [
		{ A: 0.1, B: 1/8 },
		{ A: - 0.01, B: 1/4 },
		{ A: 1e-6, B: 1/2 },
		{ A: -0.250631, B: 0 }
	];
    exponentSolver.findRootOfExponents(0, 100, curve);	
    console.log('Expected:',[12.90657838400523, 12.925436307025436, 36.407549397097796]);

	//hard case: 5*exp(-x/1.5) - 40*exp(-x/1.3)+0.1*exp(x/8)-0.01*exp(x/4)+0.000001*exp(x/2)-0.20;
	curve = [
		{ A: 5, B: -1/1.5 },
		{ A: -40, B: -1/1.3 },
		{ A: 0.1, B: 1/8 },
		{ A: -0.01, B: 1/4 },
		{ A: 1e-6, B: 1/2 },
		{ A: -0.20, B: 0 }
	];
    exponentSolver.findRootOfExponents(0, 100, curve);	
    console.log('Expected:', [9.413167505555736, 15.899768485242085, 36.40488240010849]);

	curve = [
		{A: 5, B: -1/1.5},
		{A: -2, B: 0}
	];
    exponentSolver.findRootOfExponents(0, 100, curve);
    console.log('Expected:', [1.3744360978112327]);

	curve = [
		{A: 5, B: -1/1.5},
		{A: -40, B: -1/1.3},
		{A: 2, B: 0}
	];
    exponentSolver.findRootOfExponents(0, 100, curve);
    console.log('Expected:', [3.6341457558955765]);

	curve = [
		{A: 5, B: -1/1.5},
		{A: -40, B: -1/1.3},
		{A: 1000, B: -1/1.2},
		{A: -2, B: 0}
	];
    exponentSolver.findRootOfExponents(0, 100, curve);
    console.log('Expected:', [7.399615694362909]);

	curve = [
		{A: 5, B: -1/1.5},
		{A: -40, B: -1/1.3},
		{A: 1000, B: -1/1.2},
		{A: -2, B: 0},
		{A: -1, B: 1/10},
		{A: 0.01, B: 1/5},
	];
    exponentSolver.findRootOfExponents(0, 100, curve);
    console.log('Expected:',[6.600359570724455, 46.245955278726214]);

	curve = [
		{A: 5, B: -1/1.5},
		{A: -40, B: -1/1.3},
		{A: 1000, B: -1/1.2},
		{A: 24.9999999, B: 0},
		{A: -1, B: 1/10},
		{A: 0.01, B: 1/5},
	];
    exponentSolver.findRootOfExponents(0, 100, curve);
	console.log('Expected:',[39.11959766395918, 39.120862404941654]);

	curve = [
		{A: 5, B: -1/1.5},
		{A: -40, B: -1/1.3},
		{A: 1000, B: -1/1.2},
		{A: 25, B: 0},
		{A: -1, B: 1/10},
		{A: 0.01, B: 1/5},
	];
	exponentSolver.findRootOfExponents(0, 100, curve);
    console.log('Expected: No roots');

	return;
}

//test in node.js
if (typeof window === 'undefined') {
    testSolveExponentials();
}