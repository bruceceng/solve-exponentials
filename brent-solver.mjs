//brent solver uses the Brent root finding Method.
//it starts with a range that is guaranteed (by the user) to contain one and only one root
//and performs bisection until it has a value on either side of the root
//then it continues with Brent's method until the root is found

var BrentSolver_setupWithPoints = function(x1, y1, x2, y2) {

	//make sure there is a root.
	if (x1 > x2 || y1 * y2 >= 0) {
		console.warn('no root.');
		return(false);
	}
	//biggest annoyance of my original implementation was the x1Negative, which was really if y1 was negative.
	//here we will be able to directly set it and then save an iteration since we already know one point.
	let solver = BrentSolver_setup(x1, x1 + (x2-x1)*2, y1<0?true:false);

	//since we set the initial range to have x2 as the midpoint, we will already know y2.
	let xFirstIteration = BrentSolver_getNextX(solver);
	//console.log('x?', xFirstIteration, x2); //hopefully these are the same.
	BrentSolver_setNextY(solver, y2);
	return(solver);
}

//this was my original implementation where you needed to know if it f(x1) was negative.
var BrentSolver_setup = function(x1, x2, x1Negative)
{
	var solver = {};
	//set all the defaults
	solver.readyForBrent=false; //at first we will start with bisection. Once we have evaluated points on either side of the root then we can start brent's method.
	solver.minXEvaluated=false; //have we evaluated the function at an x smaller than the root?
	solver.maxXEvaluated=false;
	solver.bisectionX=0.0; //what x value did we last use for bisection?
	solver.minY=0.0;
	solver.maxY=0.0;

	solver.getXStep = true;
	solver.minX = x1;
	solver.maxX = x2;
	solver.isX1Negative = x1Negative;

	solver.isError=false;
	solver.aIsSet=false;
	solver.bIsSet=false;
	solver.setYStep=false;
	solver.mFlag=false;
	solver.s=0.0;
	solver.a=0.0;
	solver.b=0.0;
	solver.c=0.0;
	solver.fa=0.0;
	solver.fb=0.0;
	solver.fc=0.0;
	solver.fd=0.0;
	solver.tolerance=1e-12; //I think this has something to do with the machine precision.
	
	return(solver);
};

var BrentSolver_setX1 = function(solver, x, y)
{    
	if (!solver.aIsSet)
	{
		solver.aIsSet = true;
		solver.a = x;
		solver.fa = y;

		if (solver.aIsSet && solver.bIsSet)
		{
			BrentSolver_start(solver);
		}
	}
	else
	{
		console.log("x1 is already set");
	}
};

var BrentSolver_setX2 = function(solver, x, y)
{
	if  (!solver.bIsSet)
	{
		solver.bIsSet = true;
		solver.b = x;
		solver.fb = y;

		if (solver.aIsSet && solver.bIsSet)
		{
			BrentSolver_start(solver);
		}
	}
	else
	{
		console.log("x2 is already set");
	}
}
	
var BrentSolver_start = function(solver)
{
	solver.readyForBrent = true;
	if (solver.fa * solver.fb >= 0.0)
	{
		console.log("BRENT ERROR: no root is bracketed");
		solver.isError = true;
	}

	var tempSwap=0.0;
	if (Math.abs(solver.fa) < Math.abs(solver.fb))
	{
		tempSwap = solver.fa;
		solver.fa = solver.fb;
		solver.fb = tempSwap;

		tempSwap = solver.a;
		solver.a = solver.b;
		solver.b = tempSwap;
	}

	solver.fc = solver.fa;
	solver.c = solver.a;

	solver.mFlag = true;

	solver.getXStep = true;
	solver.setYStep = false;
};

var BrentSolver_getNextX = function(solver)
{
	if (solver.getXStep)
	{
		solver.getXStep = false;
		solver.setYStep = true;

		if (!solver.readyForBrent)
		{
			//console.log("Using bisection.");
			solver.bisectionX = (solver.minX + solver.maxX)/2.0;
			return(solver.bisectionX);
		}
		var cond1=false;
		var cond2=false;
		var cond3=false;
		var cond4=false;
		var cond5=false;
		if (solver.fa != solver.fc && solver.fb != solver.fc)
		{
			//console.log("used reverse quadratic");
			solver.s = (solver.a * solver.fb * solver.fc) / ((solver.fa - solver.fb) * (solver.fa - solver.fc)) + (solver.b * solver.fa * solver.fc) / ((solver.fb - solver.fa) * (solver.fb - solver.fc)) + (solver.c * solver.fa * solver.fb) / ((solver.fc - solver.fa) * (solver.fc - solver.fb));
		}
		else
		{
			solver.s = solver.b - solver.fb * (solver.b - solver.a) / (solver.fb - solver.fa);
		}

		cond1 = !(((solver.s > (3.0 * solver.a + solver.b) / 4.0) && (solver.s < solver.b)) || ((solver.s < (3.0 * solver.a +solver. b) / 4.0) && (solver.s > solver.b)));
		cond2 = solver.mFlag && Math.abs(solver.s - solver.b) >= Math.abs(solver.b - solver.c) / 2.0;
		cond3 = !(solver.mFlag) && Math.abs(solver.s - solver.b) >= Math.abs(solver.c - solver.d) / 2.0;
		cond4 = solver.mFlag && Math.abs(solver.b - solver.c) < Math.abs(solver.tolerance);
		cond5 = !(solver.mFlag) && Math.abs(solver.c - solver.d) < Math.abs(solver.tolerance);

		if (cond1 || cond2 || cond3 || cond4 || cond5)
		{
			solver.s = (solver.a + solver.b) / 2.0;
			solver.mFlag = true;
		}
		else
		{
			solver.mFlag = false;
		}

		return(solver.s);
	}
	else
	{
		//console.log("Not ready to get an x value yet.");
		return(0.0);
	}
}
	
var BrentSolver_setNextY = function(solver,fs)
{
	var tempSwap=0.0;
	if (solver.setYStep)
	{
		solver.setYStep = false;
		solver.getXStep = true;

		//see if we are still doing bisection
		if (!solver.readyForBrent)
		{
			if (fs * ((solver.isX1Negative)?1.0:-1.0)> 0.0)
			{
				solver.maxX = solver.bisectionX;
				solver.maxY = fs;
				solver.maxXEvaluated = true;
			}
			else
			{
				solver.minX = solver.bisectionX;
				solver.minY = fs;
				solver.minXEvaluated = true;
			}

			//if we have points on either side of the root then we can start brent's method.
			if (solver.maxXEvaluated && solver.minXEvaluated)
			{
				solver.readyForBrent = true;
				BrentSolver_setX1(solver,solver.minX,solver.minY);
				BrentSolver_setX2(solver,solver.maxX,solver.maxY);
			}
			return;
		}

		solver.d = solver.c; solver.fd = solver.fc;
		solver.c = solver.b; solver.fc = solver.fb;
		if (solver.fa * fs < 0.0)
		{
			solver.b = solver.s; solver.fb = fs;
		}
		else
		{
			solver.a = solver.s; solver.fa = fs;
		}
		if (Math.abs(solver.fa) < Math.abs(solver.fb))
		{
			tempSwap = solver.fa;
			solver.fa = solver.fb;
			solver.fb = tempSwap;

			tempSwap = solver.a;
			solver.a = solver.b;
			solver.b = tempSwap;
		}
	}
	else
	{
		console.log("Not ready to set a y yet.");
	}
}
	
var BrentSolver_reset = function(solver)
{
	solver.isError = false;
	solver.aIsSet = false;
	solver.bIsSet = false;
	solver.getXStep = false;
	solver.setYStep = false;
	solver.a = 0.0;
	solver.b = 0.0;
	solver.c = 0.0;
	solver.fa = 0.0;
	solver.fb = 0.0;
	solver.fc = 0.0;
	solver.tolerance = 0.0;
};

var BrentSolver_setTolerance = function(solver,tol)
{
	solver.tolerance = tol;
};

function testBrent() {
	let brentSolver = {setup: BrentSolver_setupWithPoints, getX: BrentSolver_getNextX, setY: BrentSolver_setNextY};
	let f_x = x => Math.exp(x)-14;
	let solver = brentSolver.setup(0,f_x(0),4,f_x(4));
	for (let i=0; i<8; i++) {
		let xGuess = brentSolver.getX(solver);
		let yGuess = f_x(xGuess);
		console.log(`x: ${xGuess}, y: ${yGuess}`);
		if (Math.abs(yGuess) < 1e-12) {break;}
		brentSolver.setY(solver, yGuess);
	}
	return;
}

export default {setup: BrentSolver_setupWithPoints, getX: BrentSolver_getNextX, setY: BrentSolver_setNextY, setTolerance: BrentSolver_setTolerance}