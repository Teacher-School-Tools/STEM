

const scriptsInEvents = {

	async EventSheet1_Event20_Act1(runtime, localVars)
	{
		const CA = localVars.CA;
		const CB = localVars.CB;
		const S = localVars.S;
		
		const Ka = 1.8e-5;
		const Kb = 1.8e-5;
		const Kw = 1e-14;
		
		function chargeBalance(logH) {
		    const H = Math.pow(10, logH);
		    const OH = Kw / H;
		
		    const A = CA * Ka / (Ka + H);
		    const BH = CB * Kb / (Kb + OH);
		
		    return H + BH - OH - A - S;
		}
		
		function calculatePH() {
		    let low = -30;
		    let high = 3;
		
		    for (let i = 0; i < 150; i++) {
		        const mid = (low + high) / 2;
		        const value = chargeBalance(mid);
		
		        if (value > 0) {
		            high = mid;
		        } else {
		            low = mid;
		        }
		    }
		
		    const logH = (low + high) / 2;
		
		    return -logH;
		}
		
		runtime.setReturnValue(calculatePH());
	}
};

globalThis.C3.JavaScriptInEvents = scriptsInEvents;
