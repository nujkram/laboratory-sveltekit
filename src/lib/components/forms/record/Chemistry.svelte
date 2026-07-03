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
            class="field-label"
            for="inline-stat"
        >
            Stat
        </label>
    </div>
    <div class="md:w-5/12">
        <input
            class="field"
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
            class="field-label"
            for="inline-fasting-blood-sugar"
        >
            Fasting Blood Sugar
        </label>
    </div>
    <div class="md:w-5/12">
        <input
            class="field"
            id="inline-fasting-blood-sugar"
            placeholder="Fasting Blood Sugar"
            type="text"
            name="fastingBloodSugar"
            bind:value={fastingBloodSugar}
        />
    </div>
    <div class="md:w-3/12">
        <h4 class="field-hint">3.89-5.83 mmol/L</h4>
    </div>
</div>
<div class="md:flex md:items-center mb-6">
    <div class="md:w-3/12">
        <label
            class="field-label"
            for="inline-random-blood-sugar"
        >
            Random Blood Sugar
        </label>
    </div>
    <div class="md:w-5/12">
        <input
            class="field"
            id="inline-random-blood-sugar"
            placeholder="Random Blood Sugar"
            type="text"
            name="randomBloodSugar"
            bind:value={randomBloodSugar}
        />
    </div>
    <div class="md:w-3/12">
        <h4 class="field-hint">2.47-7.17 mmol/L</h4>
    </div>
</div>
<div class="md:flex md:items-center mb-6">
    <div class="md:w-3/12">
        <label
            class="field-label"
            for="inline-post-prandial-blood-sugar"
        >
            Post Prandial Blood Sugar
        </label>
    </div>
    <div class="md:w-5/12">
        <input
            class="field"
            id="inline-post-prandial-blood-sugar"
            placeholder="Post Prandial Blood Sugar"
            type="text"
            name="postPrandial"
            bind:value={postPrandial}
        />
    </div>
    <div class="md:w-3/12">
        <h4 class="field-hint">Less than 7.8 mmol/L</h4>
    </div>
</div>
<div class="md:flex md:items-center mb-6">
    <div class="md:w-3/12">
        <label
            class="field-label"
            for="inline-hba1c"
        >
            HBa1c
        </label>
    </div>
    <div class="md:w-5/12">
        <input
            class="field"
            id="inline-hba1c"
            placeholder="HBa1c"
            type="text"
            name="hba1c"
            bind:value={hba1c}
        />
    </div>
    <div class="md:w-3/12">
        <h4 class="field-hint">4.5-6.3 percent</h4>
    </div>
</div>
<div class="md:flex md:items-center mb-6">
    <div class="md:w-3/12">
        <label
            class="field-label"
            for="inline-urea"
        >
            Urea
        </label>
    </div>
    <div class="md:w-5/12">
        <input
            class="field"
            id="inline-urea"
            placeholder="Urea"
            type="text"
            name="urea"
            bind:value={urea}
        />
    </div>
    <div class="md:w-3/12">
        <h4 class="field-hint">2.8-7.2 mmol/L</h4>
    </div>
</div>
<div class="md:flex md:items-center mb-6">
    <div class="md:w-3/12">
        <label
            class="field-label"
            for="inline-creatinine"
        >
            Creatinine
        </label>
    </div>
    <div class="md:w-5/12">
        <input
            class="field"
            id="inline-creatinine"
            placeholder="Creatinine"
            type="text"
            name="creatinine"
            bind:value={creatinine}
        />
    </div>
    <div class="md:w-3/12">
        <h4 class="field-hint">F: 53-97 mmol/L | M:80-115 mmol/L</h4>
    </div>
</div>
<div class="md:flex md:items-center mb-6">
    <div class="md:w-3/12">
        <label
            class="field-label"
            for="inline-uric-acid"
        >
            Uric Acid
        </label>
    </div>
    <div class="md:w-5/12">
        <input
            class="field"
            id="inline-uric-acid"
            placeholder="Uric Acid"
            type="text"
            name="uricAcid"
            bind:value={uricAcid}
        />
    </div>
    <div class="md:w-3/12">
        <h4 class="field-hint">F: 137-363 mmol/L | M:214-488 mmol/L</h4>
    </div>
</div>
<div class="md:flex md:items-center mb-6">
    <div class="md:w-3/12">
        <label
            class="field-label"
            for="inline-cholesterol"
        >
            Cholesterol
        </label>
    </div>
    <div class="md:w-5/12">
        <input
            class="field"
            id="inline-cholesterol"
            placeholder="Cholesterol"
            type="text"
            name="cholesterol"
            bind:value={cholesterol}
        />
    </div>
    <div class="md:w-3/12">
        <h4 class="field-hint">Up to 5.2 mmol/L</h4>
    </div>
</div>
<div class="md:flex md:items-center mb-6">
    <div class="md:w-3/12">
        <label
            class="field-label"
            for="inline-triglycerides"
        >
            Triglycerides
        </label>
    </div>
    <div class="md:w-5/12">
        <input
            class="field"
            id="inline-triglycerides"
            placeholder="Triglycerides"
            type="text"
            name="triglycerides"
            bind:value={triglycerides}
        />
    </div>
    <div class="md:w-3/12">
        <h4 class="field-hint">Up to 2.28 mmol/L</h4>
    </div>
</div>
<div class="md:flex md:items-center mb-6">
    <div class="md:w-3/12">
        <label
            class="field-label"
            for="inline-hdl-cholesterol"
        >
            HDL - Cholesterol
        </label>
    </div>
    <div class="md:w-5/12">
        <input
            class="field"
            id="inline-hdl-cholesterol"
            placeholder="HDL - Cholesterol"
            type="text"
            name="hdlCholesterol"
            bind:value={hdlCholesterol}
        />
    </div>
    <div class="md:w-3/12">
        <h4 class="field-hint">Greater than 0.90 mmol/L</h4>
    </div>
</div>
<div class="md:flex md:items-center mb-6">
    <div class="md:w-3/12">
        <label
            class="field-label"
            for="inline-ldl-cholesterol"
        >
            LDL - Cholesterol
        </label>
    </div>
    <div class="md:w-5/12">
        <input
            class="field"
            id="inline-ldl-cholesterol"
            placeholder="LDL - Cholesterol"
            type="text"
            name="ldlCholesterol"
            bind:value={ldlCholesterol}
        />
    </div>
    <div class="md:w-3/12">
        <h4 class="field-hint">Less than 3.40 mmol/L</h4>
    </div>
</div>
<div class="md:flex md:items-center mb-6">
    <div class="md:w-3/12">
        <label
            class="field-label"
            for="inline-sgot-ast"
        >
            SGOT/AST
        </label>
    </div>
    <div class="md:w-5/12">
        <input
            class="field"
            id="inline-sgot-ast"
            placeholder="SGOT/AST"
            type="text"
            name="sgotAst"
            bind:value={sgotAst}
        />
    </div>
    <div class="md:w-3/12">
        <h4 class="field-hint">F: up to 31 U/L | M: up to 37 U/L</h4>
    </div>
</div>
<div class="md:flex md:items-center mb-6">
    <div class="md:w-3/12">
        <label
            class="field-label"
            for="inline-sgpt-alt"
        >
            SGPT/ALT
        </label>
    </div>
    <div class="md:w-5/12">
        <input
            class="field"
            id="inline-sgpt-alt"
            placeholder="SGPT/ALT"
            type="text"
            name="sgptAlt"
            bind:value={sgptAlt}
        />
    </div>
    <div class="md:w-3/12">
        <h4 class="field-hint">F: up to 32 U/L | M: up to 42 U/L</h4>
    </div>
</div>
<div class="md:flex md:items-center mb-6">
    <div class="md:w-3/12">
        <label
            class="field-label"
            for="inline-sodium"
        >
            Soduim
        </label>
    </div>
    <div class="md:w-5/12">
        <input
            class="field"
            id="inline-sodium"
            placeholder="Soduim"
            type="text"
            name="sodium"
            bind:value={sodium}
        />
    </div>
    <div class="md:w-3/12">
        <h4 class="field-hint">135-148 mmol/L</h4>
    </div>
</div>
<div class="md:flex md:items-center mb-6">
    <div class="md:w-3/12">
        <label
            class="field-label"
            for="inline-potassium"
        >
            Potassium
        </label>
    </div>
    <div class="md:w-5/12">
        <input
            class="field"
            id="inline-potassium"
            placeholder="Potassium"
            type="text"
            name="potassium"
            bind:value={potassium}
        />
    </div>
    <div class="md:w-3/12">
        <h4 class="field-hint">3.5-5.3 mmol/L</h4>
    </div>
</div>
<div class="md:flex md:items-center mb-6">
    <div class="md:w-3/12">
        <label
            class="field-label"
            for="inline-calcium"
        >
            Calcium
        </label>
    </div>
    <div class="md:w-5/12">
        <input
            class="field"
            id="inline-calcium"
            placeholder="Calcium"
            type="text"
            name="calcium"
            bind:value={calcium}
        />
    </div>
    <div class="md:w-3/12">
        <h4 class="field-hint">2.15-2.57 mmol/L</h4>
    </div>
</div>
