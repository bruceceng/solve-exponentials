# solve-exponentials

## Purpose
The goal is to find all real valued solutions to the form of any equation of the form 
<img src="https://render.githubusercontent.com/render/math?math=f(x) = A_1 e^{B_1x} + A_2 e^{B_2x} + \ldots + A_N e^{B_Nx} = 0">
$$f(x) = A_1 e^{B_1x} + A_2 e^{B_2x} + \ldots + A_N e^{B_Nx} = 0$$ where all $A \in \mathbb{R}$ and all $B \in \mathbb{R}$. (Next step would be to extend it to handle complex numbers or complex conjugates.) Note that is one of the B terms is 0, then the term is constant.

These equations frequently arise in physics from solutions of systems of differential equations. In my case I needed to solve the to simulate a heat exchanger.

## Method

As far as I know, the method used has not been described elsewhere, so I will christen it *"Eng's method"* after yours truly. 

The basic method is as follows:
1. Sort the terms by ascending value of exponent: $B_1 < B_2 < \ldots < B_N$
2. Find a range where there could possibly be a root. To do so, consider that as x increases, the Nth term will begin growing faster than all other terms, so find a value of x where $$ |A_N e^{B_Nx}| > |\sum_{i=1}^{N-1}A_ie^{B_ix}|  $$
    Actually we will do the following. Count the number of terms with an opposite sign as $A_n$. Call this number $P$. For all $P$ terms $A_n$, calculate 
    $$|A_N e^{B_Nx_i}| = P\cdot|A_i e^{B_ix_i}|$$
    $$x_i = \frac{\ln(P\cdot|A_i/A_N|)}{B_N - B_i} $$
    $$x_{max} = max(x_i)$$
    So basically at $x_{max}$ we have guaranteed that the fastest growing term is growing $P$ times faster than any other term with opposite sign. So there will definitely not be a root for $x > x_{max}$.
3. Using the same sort of reasoning, looking at the slowest growing term $A_1e^{b_1x}$ and find an x where this term is $Q$ times more than all other terms with opposite sign. The minimum such term is $x_{min}$. Since the slowest growing term is also the slowest to shrink as we move towards $x = -\infty $, we can confidentially say that for $x < x_{min}$ the sign of the first term will dominate and we will never cross $f(x) = 0$.
4. Take repeated derivatives (k of them) of $f(x)$. 
   $$\frac{d^{k}}{d x^k}f(x) = B_1^{k}A_1e^{B_1x} + B_2^{k}A_2e^{b_2x} + \ldots + B_N^{k}A_Ne^{B_Nx}$$
   Note that the more derivatives we take, the faster the coefficients grow for the terms with the larger $|B_i|$. For a large enough value of k, we can see that one of two things will happen:
   $$|B_N^{k}A_Ne^{b_Nx_{min}}| > |\sum_{i=1}^{N-1}B_i^{k}A_ie^{b_ix_{min}}| or $$ 
   $$|B_1^{k}A_1e^{b_1x_{min}}| > |\sum_{i=2}^{N}B_i^{k}A_ie^{b_ix_{max}}|$$
   Basically, what ends up happening is that either the fastest growing exponential term (Nth term since we order them this way) ends up starting out dominant over the range of interest or the slowest shrinking term ends up dominant over the range of interest. (This can happen if we have something like $-40e^{-0.73x}+5e^{-0.67x}-0.1e^{0.125x}-0.2=0$).
   In either case, we can keep increasing k until one of these two conditions is met.

5. At this point we know that for the kth derivative a single term is dominant over the entire range where there could possibly be a root. What this means is that the sign of the kth derivative is either always positive or always negative for $x_{min} < x < x_{max}$. Therefore it follows that the (k-1)th derivative must be monatomic over this range. This is great news because for a monatomic function we can find numerically find roots using algorithms like bisection of Brent's method. In fact, all we have to do is evaluate the (k-1)th derivative at $x=x_{min}$ and at $x=x_{max}$. If these endpoints are the same sign, then we know that the (k-1)th derivative is also the same sign over the entire range. However, if they are the same sign, then we can use bisection to find the root of the (k-1)th derivative with guaranteed convergence to any desired degree of accuracy. If we can find $x_{d-root}$ where $\frac{d^{k-1}}{d x^{k-1}}f(x_{d-root}) = 0$ then this will leave us with two range, $x_{min} < x < x_{k-1}$ and $x_{k-1} < x < x_{max}$. 

6. Now we either know there is one range where the (k-1)th derivative has a consistent sign or two ranges where the (k-1)th derivative has a consistent sign for the whole range (but one range is positive and the other is negative). Either way, we know that on these one or two ranges we can use bisection (or another bracketed root finding method) to find if and where $\frac{d^{k-2}}{d x^{k-2}}f(x) = 0$.

7. We continue in this manner, breaking our original range into smaller ranges when we find that the current Kth derivative is 0 and then proceeding to use bracketed root finding at one less level derivative. At some point, we will keep *backing out* of layers of derivatives until we are just doing bracketed root finding on the original function.

TLDR;

* Find a range where roots could possibly occur. 
* Take a bunch (N) derivatives until its obvious that one term is dominant in the range where roots occur. 
  * With exponents this always happens eventually. 
  * This tells us that the (N-1)th derivative is a monatomic function so we can find a root (if it has one) via bisection. 
* Now we have some more regions on which we know the the (N-2) derivative is a monatomic function. 
* Apply logic recursively until we have regions of the original curve where we can find roots using bisection. This way we won't miss any roots.

## API

Sum of exponent functions are defined as arrays of terms:
````[{A: 1, B: 1}]```` would correspond to $1\cdot e^{1\cdot x}$ and ````[{A: 1, B: 1},{A: -2, B: 0}]```` corresponds to $1\cdot e^{1\cdot x} - 2$

Two functions are provided, ````evaluateExponentFormula```` and ````findRootOfExponents````

````evaluateExponentFormula(formula, x)```` takes a formula returns it evaluated it at x.
````findRootOfExponents(xMin, xMax, formula)```` takes a formula and returns all the roots between xMin and xMax (you could use -Infinity and Infinity to get them all).

## Usage

````> node solve-exponentials-tests.mjs````

*Warning: at this point, this is a proof of concept and provided as is. I am sure there are many unhandled edge cases.*