<script>
    // @ts-nocheck
    export let stat = 'ROUTINE';
    export let fastingBloodSugar,
		randomBloodSugar,
		postPrandial,
		hba1c,
		urea,
		creatinine,
		uricAcid,
		cholesterol,
		triglycerides,
		hdlCholesterol,
		ldlCholesterol,
		sgotAst,
		sgptAlt,
		sodium,
		potassium,
		calcium;
</script>
<div class="md:flex md:items-center mb-6">
    <div class="md:w-3/12">
        <label
            class="block text-gray-500 font-bold md:text-right mb-1 md:mb-0 pr-4"
            for="inline-stat"
        >
            Stat
        </label>
    </div>
    <div class="md:w-5/12">
        <input
            class="bg-gray-200 appearance-none border-2 border-gray-200 rounded w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-green-500"
            id="inline-stat"
            type="text"
            placeholder="Stat"
            name="stat"
            bind:value={stat}
        />
    </div>
</div>
<div class="md:flex md:items-center mb-6">
    <div class="md:w-3/12">
        <label
            class="block text-gray-500 font-bold md:text-right mb-1 md:mb-0 pr-4"
            for="inline-fasting-blood-sugar"
        >
            Fasting Blood Sugar
        </label>
    </div>
    <div class="md:w-5/12">
        <input
            class="bg-gray-200 appearance-none border-2 border-gray-200 rounded w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-green-500"
            id="inline-fasting-blood-sugar"
            placeholder="Fasting Blood Sugar"
            type="text"
            name="fastingBloodSugar"
            bind:value={fastingBloodSugar}
        />
    </div>
    <div class="md:w-3/12">
        <h4 class="mx-4 text-gray-500 italic text-sm">3.89-5.83 mmol/L</h4>
    </div>
</div>
<div class="md:flex md:items-center mb-6">
    <div class="md:w-3/12">
        <label
            class="block text-gray-500 font-bold md:text-right mb-1 md:mb-0 pr-4"
            for="inline-random-blood-sugar"
        >
            Random Blood Sugar
        </label>
    </div>
    <div class="md:w-5/12">
        <input
            class="bg-gray-200 appearance-none border-2 border-gray-200 rounded w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-green-500"
            id="inline-random-blood-sugar"
            placeholder="Random Blood Sugar"
            type="text"
            name="randomBloodSugar"
            bind:value={randomBloodSugar}
        />
    </div>
    <div class="md:w-3/12">
        <h4 class="mx-4 text-gray-500 italic text-sm">2.47-7.17 mmol/L</h4>
    </div>
</div>
<div class="md:flex md:items-center mb-6">
    <div class="md:w-3/12">
        <label
            class="block text-gray-500 font-bold md:text-right mb-1 md:mb-0 pr-4"
            for="inline-post-prandial-blood-sugar"
        >
            Post Prandial Blood Sugar
        </label>
    </div>
    <div class="md:w-5/12">
        <input
            class="bg-gray-200 appearance-none border-2 border-gray-200 rounded w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-green-500"
            id="inline-post-prandial-blood-sugar"
            placeholder="Post Prandial Blood Sugar"
            type="text"
            name="postPrandial"
            bind:value={postPrandial}
        />
    </div>
    <div class="md:w-3/12">
        <h4 class="mx-4 text-gray-500 italic text-sm">Less than 7.8 mmol/L</h4>
    </div>
</div>
<div class="md:flex md:items-center mb-6">
    <div class="md:w-3/12">
        <label
            class="block text-gray-500 font-bold md:text-right mb-1 md:mb-0 pr-4"
            for="inline-hba1c"
        >
            HBa1c
        </label>
    </div>
    <div class="md:w-5/12">
        <input
            class="bg-gray-200 appearance-none border-2 border-gray-200 rounded w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-green-500"
            id="inline-hba1c"
            placeholder="HBa1c"
            type="text"
            name="hba1c"
            bind:value={hba1c}
        />
    </div>
    <div class="md:w-3/12">
        <h4 class="mx-4 text-gray-500 italic text-sm">4.5-6.3 percent</h4>
    </div>
</div>
<div class="md:flex md:items-center mb-6">
    <div class="md:w-3/12">
        <label
            class="block text-gray-500 font-bold md:text-right mb-1 md:mb-0 pr-4"
            for="inline-urea"
        >
            Urea
        </label>
    </div>
    <div class="md:w-5/12">
        <input
            class="bg-gray-200 appearance-none border-2 border-gray-200 rounded w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-green-500"
            id="inline-urea"
            placeholder="Urea"
            type="text"
            name="urea"
            bind:value={urea}
        />
    </div>
    <div class="md:w-3/12">
        <h4 class="mx-4 text-gray-500 italic text-sm">2.8-7.2 mmol/L</h4>
    </div>
</div>
<div class="md:flex md:items-center mb-6">
    <div class="md:w-3/12">
        <label
            class="block text-gray-500 font-bold md:text-right mb-1 md:mb-0 pr-4"
            for="inline-creatinine"
        >
            Creatinine
        </label>
    </div>
    <div class="md:w-5/12">
        <input
            class="bg-gray-200 appearance-none border-2 border-gray-200 rounded w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-green-500"
            id="inline-creatinine"
            placeholder="Creatinine"
            type="text"
            name="creatinine"
            bind:value={creatinine}
        />
    </div>
    <div class="md:w-3/12">
        <h4 class="mx-4 text-gray-500 italic text-sm">F: 53-97 mmol/L | M:80-115 mmol/L</h4>
    </div>
</div>
<div class="md:flex md:items-center mb-6">
    <div class="md:w-3/12">
        <label
            class="block text-gray-500 font-bold md:text-right mb-1 md:mb-0 pr-4"
            for="inline-uric-acid"
        >
            Uric Acid
        </label>
    </div>
    <div class="md:w-5/12">
        <input
            class="bg-gray-200 appearance-none border-2 border-gray-200 rounded w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-green-500"
            id="inline-uric-acid"
            placeholder="Uric Acid"
            type="text"
            name="uricAcid"
            bind:value={uricAcid}
        />
    </div>
    <div class="md:w-3/12">
        <h4 class="mx-4 text-gray-500 italic text-sm">F: 137-363 mmol/L | M:214-488 mmol/L</h4>
    </div>
</div>
<div class="md:flex md:items-center mb-6">
    <div class="md:w-3/12">
        <label
            class="block text-gray-500 font-bold md:text-right mb-1 md:mb-0 pr-4"
            for="inline-cholesterol"
        >
            Cholesterol
        </label>
    </div>
    <div class="md:w-5/12">
        <input
            class="bg-gray-200 appearance-none border-2 border-gray-200 rounded w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-green-500"
            id="inline-cholesterol"
            placeholder="Cholesterol"
            type="text"
            name="cholesterol"
            bind:value={cholesterol}
        />
    </div>
    <div class="md:w-3/12">
        <h4 class="mx-4 text-gray-500 italic text-sm">Up to 5.2 mmol/L</h4>
    </div>
</div>
<div class="md:flex md:items-center mb-6">
    <div class="md:w-3/12">
        <label
            class="block text-gray-500 font-bold md:text-right mb-1 md:mb-0 pr-4"
            for="inline-triglycerides"
        >
            Triglycerides
        </label>
    </div>
    <div class="md:w-5/12">
        <input
            class="bg-gray-200 appearance-none border-2 border-gray-200 rounded w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-green-500"
            id="inline-triglycerides"
            placeholder="Triglycerides"
            type="text"
            name="triglycerides"
            bind:value={triglycerides}
        />
    </div>
    <div class="md:w-3/12">
        <h4 class="mx-4 text-gray-500 italic text-sm">Up to 2.28 mmol/L</h4>
    </div>
</div>
<div class="md:flex md:items-center mb-6">
    <div class="md:w-3/12">
        <label
            class="block text-gray-500 font-bold md:text-right mb-1 md:mb-0 pr-4"
            for="inline-hdl-cholesterol"
        >
            HDL - Cholesterol
        </label>
    </div>
    <div class="md:w-5/12">
        <input
            class="bg-gray-200 appearance-none border-2 border-gray-200 rounded w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-green-500"
            id="inline-hdl-cholesterol"
            placeholder="HDL - Cholesterol"
            type="text"
            name="hdlCholesterol"
            bind:value={hdlCholesterol}
        />
    </div>
    <div class="md:w-3/12">
        <h4 class="mx-4 text-gray-500 italic text-sm">Greater than 0.90 mmol/L</h4>
    </div>
</div>
<div class="md:flex md:items-center mb-6">
    <div class="md:w-3/12">
        <label
            class="block text-gray-500 font-bold md:text-right mb-1 md:mb-0 pr-4"
            for="inline-ldl-cholesterol"
        >
            LDL - Cholesterol
        </label>
    </div>
    <div class="md:w-5/12">
        <input
            class="bg-gray-200 appearance-none border-2 border-gray-200 rounded w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-green-500"
            id="inline-ldl-cholesterol"
            placeholder="LDL - Cholesterol"
            type="text"
            name="ldlCholesterol"
            bind:value={ldlCholesterol}
        />
    </div>
    <div class="md:w-3/12">
        <h4 class="mx-4 text-gray-500 italic text-sm">Less than 3.40 mmol/L</h4>
    </div>
</div>
<div class="md:flex md:items-center mb-6">
    <div class="md:w-3/12">
        <label
            class="block text-gray-500 font-bold md:text-right mb-1 md:mb-0 pr-4"
            for="inline-sgot-ast"
        >
            SGOT/AST
        </label>
    </div>
    <div class="md:w-5/12">
        <input
            class="bg-gray-200 appearance-none border-2 border-gray-200 rounded w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-green-500"
            id="inline-sgot-ast"
            placeholder="SGOT/AST"
            type="text"
            name="sgotAst"
            bind:value={sgotAst}
        />
    </div>
    <div class="md:w-3/12">
        <h4 class="mx-4 text-gray-500 italic text-sm">F: up to 31 U/L | M: up to 37 U/L</h4>
    </div>
</div>
<div class="md:flex md:items-center mb-6">
    <div class="md:w-3/12">
        <label
            class="block text-gray-500 font-bold md:text-right mb-1 md:mb-0 pr-4"
            for="inline-sgpt-alt"
        >
            SGPT/ALT
        </label>
    </div>
    <div class="md:w-5/12">
        <input
            class="bg-gray-200 appearance-none border-2 border-gray-200 rounded w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-green-500"
            id="inline-sgpt-alt"
            placeholder="SGPT/ALT"
            type="text"
            name="sgptAlt"
            bind:value={sgptAlt}
        />
    </div>
    <div class="md:w-3/12">
        <h4 class="mx-4 text-gray-500 italic text-sm">F: up to 32 U/L | M: up to 42 U/L</h4>
    </div>
</div>
<div class="md:flex md:items-center mb-6">
    <div class="md:w-3/12">
        <label
            class="block text-gray-500 font-bold md:text-right mb-1 md:mb-0 pr-4"
            for="inline-sodium"
        >
            Soduim
        </label>
    </div>
    <div class="md:w-5/12">
        <input
            class="bg-gray-200 appearance-none border-2 border-gray-200 rounded w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-green-500"
            id="inline-sodium"
            placeholder="Soduim"
            type="text"
            name="sodium"
            bind:value={sodium}
        />
    </div>
    <div class="md:w-3/12">
        <h4 class="mx-4 text-gray-500 italic text-sm">135-148 mmol/L</h4>
    </div>
</div>
<div class="md:flex md:items-center mb-6">
    <div class="md:w-3/12">
        <label
            class="block text-gray-500 font-bold md:text-right mb-1 md:mb-0 pr-4"
            for="inline-potassium"
        >
            Potassium
        </label>
    </div>
    <div class="md:w-5/12">
        <input
            class="bg-gray-200 appearance-none border-2 border-gray-200 rounded w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-green-500"
            id="inline-potassium"
            placeholder="Potassium"
            type="text"
            name="potassium"
            bind:value={potassium}
        />
    </div>
    <div class="md:w-3/12">
        <h4 class="mx-4 text-gray-500 italic text-sm">3.5-5.3 mmol/L</h4>
    </div>
</div>
<div class="md:flex md:items-center mb-6">
    <div class="md:w-3/12">
        <label
            class="block text-gray-500 font-bold md:text-right mb-1 md:mb-0 pr-4"
            for="inline-calcium"
        >
            Calcium
        </label>
    </div>
    <div class="md:w-5/12">
        <input
            class="bg-gray-200 appearance-none border-2 border-gray-200 rounded w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-green-500"
            id="inline-calcium"
            placeholder="Calcium"
            type="text"
            name="calcium"
            bind:value={calcium}
        />
    </div>
    <div class="md:w-3/12">
        <h4 class="mx-4 text-gray-500 italic text-sm">2.15-2.57 mmol/L</h4>
    </div>
</div>
