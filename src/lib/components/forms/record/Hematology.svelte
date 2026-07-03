<script>
    // @ts-nocheck
    export let stat = 'ROUTINE';
    export let exam,
		hemoglobin,
		erythrocyteVolume,
		erythrocyteNumber,
		leukocyteNumber,
		neutrophilNumber,
		segmenters,
		stab,
		eosinophil,
		basophil,
		lympocyte,
		monocyte,
        total,
		erythrocyteSedimentation,
		thrombocyteNumber,
		bleedingTime,
		clottingTime,
		bloodType,
		rh,
		others;
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
            for="inline-exam"
        >
            Exam Desired
        </label>
    </div>
    <div class="md:w-5/12">
        <input
            class="field"
            id="inline-exam"
            type="text"
            placeholder="Exam Desired"
            name="exam"
            bind:value={exam}
        />
    </div>
</div>
<div class="md:flex md:items-center mb-6">
    <div class="md:w-3/12">
        <label
            class="field-label"
            for="inline-hemoglobin-concentration-mass"
        >
            Hemoglobin Concentration Mass
        </label>
    </div>
    <div class="md:w-5/12">
        <input
            class="field"
            id="inline-hemoglobin-concentration-mass"
            type="text"
            placeholder="Hemoglobin Concentration Mass"
            name="hemoglobin"
            bind:value={hemoglobin}
        />
    </div>
    <div class="md:w-3/12">
        <h4 class="field-hint">F: 120-150 gms/L | M: 130-170 gms/L</h4>
    </div>
</div>
<div class="md:flex md:items-center mb-6">
    <div class="md:w-3/12">
        <label
            class="field-label"
            for="inline-erythrocyte-volume-fraction"
        >
            Erythrocyte Volume Fraction
        </label>
    </div>
    <div class="md:w-5/12">
        <input
            class="field"
            id="inline-erythrocyte-volume-fraction"
            type="text"
            placeholder="Erythrocyte Volume Fraction"
            name="erythrocyteVolume"
            bind:value={erythrocyteVolume}
        />
    </div>
    <div class="md:w-3/12">
        <h4 class="field-hint">F: 0.37-0.45 gms/L | M: 0.40-0.50 gms/L</h4>
    </div>
</div>
<div class="md:flex md:items-center mb-6">
    <div class="md:w-3/12">
        <label
            class="field-label"
            for="inline-erythrocyte-number-concentration"
        >
            Erythrocyte Number Concentration
        </label>
    </div>
    <div class="md:w-5/12">
        <input
            class="field"
            id="inline-erythrocyte-number-concentration"
            type="text"
            placeholder="Erythrocyte Number Concentration"
            name="erythrocyteNumber"
            bind:value={erythrocyteNumber}
        />
    </div>
    <div class="md:w-3/12">
        <h4 class="field-hint">F: 4.0-5.0 xⁱ²10/L | M: 4.5-5.50 xⁱ²10/L</h4>
    </div>
</div>
<div class="md:flex md:items-center mb-6">
    <div class="md:w-3/12">
        <label
            class="field-label"
            for="inline-leukocyte-number-concentration"
        >
            Leukocyte Number Concentration
        </label>
    </div>
    <div class="md:w-5/12">
        <input
            class="field"
            id="inline-leukocyte-number-concentration"
            type="text"
            placeholder="Leukocyte Number Concentration"
            name="leukocyteNumber"
            bind:value={leukocyteNumber}
        />
    </div>
    <div class="md:w-3/12">
        <h4 class="field-hint">5.0-10 x⁹10/L</h4>
    </div>
</div>
<div class="md:flex md:items-center mb-6">
    <div class="md:w-3/12">
        <label
            class="field-label"
            for="inline-neutrophil-number-fraction"
        >
            Neutrophil Number Fraction
        </label>
    </div>
    <div class="md:w-5/12">
        <input
            class="field"
            id="inline-neutrophil-number-fraction"
            type="text"
            placeholder="Neutrophil Number Fraction"
            name="neutrophilNumber"
            bind:value={neutrophilNumber}
        />
    </div>
    <div class="md:w-3/12">
        <h4 class="field-hint">0.60-0.70</h4>
    </div>
</div>
<div class="md:flex md:items-center mb-6">
    <div class="md:w-3/12">
        <label
            class="field-label"
            for="inline-segmenters"
        >
            Segmenters
        </label>
    </div>
    <div class="md:w-5/12">
        <input
            class="field"
            id="inline-segmenters"
            type="text"
            placeholder="Segmenters"
            name="segmenters"
            bind:value={segmenters}
        />
    </div>
    <div class="md:w-3/12">
        <h4 class="field-hint">0.60-0.70</h4>
    </div>
</div>
<div class="md:flex md:items-center mb-6">
    <div class="md:w-3/12">
        <label
            class="field-label"
            for="inline-stab"
        >
            Stab
        </label>
    </div>
    <div class="md:w-5/12">
        <input
            class="field"
            id="inline-stab"
            type="text"
            placeholder="Stab"
            name="stab"
            bind:value={stab}
        />
    </div>
    <div class="md:w-3/12">
        <h4 class="field-hint">0.02-0.06</h4>
    </div>
</div>
<div class="md:flex md:items-center mb-6">
    <div class="md:w-3/12">
        <label
            class="field-label"
            for="inline-eosinophil"
        >
            Eosinophil
        </label>
    </div>
    <div class="md:w-5/12">
        <input
            class="field"
            id="inline-eosinophil"
            type="text"
            placeholder="Eosinophil"
            name="eosinophil"
            bind:value={eosinophil}
        />
    </div>
    <div class="md:w-3/12">
        <h4 class="field-hint">0.02-0.06</h4>
    </div>
</div>
<div class="md:flex md:items-center mb-6">
    <div class="md:w-3/12">
        <label
            class="field-label"
            for="inline-basophil"
        >
            Basophil
        </label>
    </div>
    <div class="md:w-5/12">
        <input
            class="field"
            id="inline-basophil"
            type="text"
            placeholder="Basophil"
            name="basophil"
            bind:value={basophil}
        />
    </div>
    <div class="md:w-3/12">
        <h4 class="field-hint">0.00-0.01</h4>
    </div>
</div>
<div class="md:flex md:items-center mb-6">
    <div class="md:w-3/12">
        <label
            class="field-label"
            for="inline-lymphocyte"
        >
            Lymphocyte
        </label>
    </div>
    <div class="md:w-5/12">
        <input
            class="field"
            id="inline-lymphocyte"
            type="text"
            placeholder="Lymphocyte"
            name="lympocyte"
            bind:value={lympocyte}
        />
    </div>
    <div class="md:w-3/12">
        <h4 class="field-hint">Adult: 0.18-0.30 | Infant: 0.22-0.44</h4>
    </div>
</div>
<div class="md:flex md:items-center mb-6">
    <div class="md:w-3/12">
        <label
            class="field-label"
            for="inline-monocyte"
        >
            Monocyte
        </label>
    </div>
    <div class="md:w-5/12">
        <input
            class="field"
            id="inline-monocyte"
            type="text"
            placeholder="Monocyte"
            name="monocyte"
            bind:value={monocyte}
        />
    </div>
    <div class="md:w-3/12">
        <h4 class="field-hint">0.04-0.08</h4>
    </div>
</div>
<div class="md:flex md:items-center mb-6">
    <div class="md:w-3/12">
        <label
            class="field-label"
            for="inline-total"
        >
            Total
        </label>
    </div>
    <div class="md:w-5/12">
        <input
            class="field"
            id="inline-total"
            type="text"
            placeholder="Total"
            name="total"
            bind:value={total}
        />
    </div>
</div>
<div class="md:flex md:items-center mb-6">
    <div class="md:w-3/12">
        <label
            class="field-label"
            for="inline-erythrocyte-sedimentation"
        >
            Erythrocyte Sedimentation Rate
        </label>
    </div>
    <div class="md:w-5/12">
        <input
            class="field"
            id="inline-erythrocyte-sedimentation"
            type="text"
            placeholder="Erythrocyte Sedimentation Rate"
            name="erythrocyteSedimentation"
            bind:value={erythrocyteSedimentation}
        />
    </div>
    <div class="md:w-3/12">
        <h4 class="field-hint">F: 0-20 mm/hr | M: 0-9 mm/hr</h4>
    </div>
</div>
<div class="md:flex md:items-center mb-6">
    <div class="md:w-3/12">
        <label
            class="field-label"
            for="inline-thrombocyte-number"
        >
            Thrombocyte Number Fraction
        </label>
    </div>
    <div class="md:w-5/12">
        <input
            class="field"
            id="inline-thrombocyte-number"
            type="text"
            placeholder="Thrombocyte Number Fraction"
            name="thrombocyteNumber"
            bind:value={thrombocyteNumber}
        />
    </div>
    <div class="md:w-3/12">
        <h4 class="field-hint">150-350 x⁹10/L</h4>
    </div>
</div>
<div class="md:flex md:items-center mb-6">
    <div class="md:w-3/12">
        <label
            class="field-label"
            for="inline-bleeding-time"
        >
            Bleeding Time
        </label>
    </div>
    <div class="md:w-5/12">
        <input
            class="field"
            id="inline-bleeding-time"
            type="text"
            placeholder="Bleeding Time"
            name="bleedingTime"
            bind:value={bleedingTime}
        />
    </div>
    <div class="md:w-3/12">
        <h4 class="field-hint">1-5 minutes</h4>
    </div>
</div>
<div class="md:flex md:items-center mb-6">
    <div class="md:w-3/12">
        <label
            class="field-label"
            for="inline-clotting-time"
        >
            Clotting Time
        </label>
    </div>
    <div class="md:w-5/12">
        <input
            class="field"
            id="inline-clotting-time"
            type="text"
            placeholder="Clotting Time"
            name="clottingTime"
            bind:value={clottingTime}
        />
    </div>
    <div class="md:w-3/12">
        <h4 class="field-hint">2-6 minutes</h4>
    </div>
</div>
<div class="md:flex md:items-center mb-6">
    <div class="md:w-3/12">
        <label
            class="field-label"
            for="inline-blood-type"
        >
            Blood Type
        </label>
    </div>
    <div class="md:w-5/12">
        <input
            class="field"
            id="inline-blood-type"
            type="text"
            placeholder="Blood Type"
            name="bloodType"
            bind:value={bloodType}
        />
    </div>
</div>
<div class="md:flex md:items-center mb-6">
    <div class="md:w-3/12">
        <label
            class="field-label"
            for="inline-rh"
        >
            RH
        </label>
    </div>
    <div class="md:w-5/12">
        <input
            class="field"
            id="inline-rh"
            type="text"
            placeholder="RH"
            name="rh"
            bind:value={rh}
        />
    </div>
</div>
<div class="md:flex md:items-center mb-6">
    <div class="md:w-3/12">
        <label
            class="field-label"
            for="inline-others"
        >
            Others
        </label>
    </div>
    <div class="md:w-5/12">
        <textarea
            class="field"
            id="inline-others"
            rows="3"
            cols="50"
            type="text"
            placeholder="Others"
            name="others"
            bind:value={others}
        />
    </div>
</div>