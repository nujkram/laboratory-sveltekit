<script>
    // @ts-nocheck
    export let stat, 
        exam,
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
            class="block text-gray-500 font-bold md:text-right mb-1 md:mb-0 pr-4"
            for="inline-firstName"
        >
            Stat
        </label>
    </div>
    <div class="md:w-5/12">
        <input
            class="bg-gray-200 appearance-none border-2 border-gray-200 rounded w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-green-500"
            id="inline-firstName"
            type="text"
            placeholder="Stat"
            bind:value={stat}
        />
    </div>
</div>
<div class="md:flex md:items-center mb-6">
    <div class="md:w-3/12">
        <label
            class="block text-gray-500 font-bold md:text-right mb-1 md:mb-0 pr-4"
            for="inline-firstName"
        >
            Exam Desired
        </label>
    </div>
    <div class="md:w-5/12">
        <input
            class="bg-gray-200 appearance-none border-2 border-gray-200 rounded w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-green-500"
            id="inline-firstName"
            type="text"
            placeholder="Exam Desired"
            bind:value={exam}
        />
    </div>
</div>
<div class="md:flex md:items-center mb-6">
    <div class="md:w-3/12">
        <label
            class="block text-gray-500 font-bold md:text-right mb-1 md:mb-0 pr-4"
            for="inline-firstName"
        >
            Hemoglobin Concentration Mass
        </label>
    </div>
    <div class="md:w-5/12">
        <input
            class="bg-gray-200 appearance-none border-2 border-gray-200 rounded w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-green-500"
            id="inline-firstName"
            type="text"
            placeholder="Hemoglobin Concentration Mass"
            bind:value={hemoglobin}
        />
    </div>
    <div class="md:w-3/12">
        <h4 class="mx-4 text-gray-500 italic text-sm">F: 120-150 gms/L | M: 130-170 gms/L</h4>
    </div>
</div>
<div class="md:flex md:items-center mb-6">
    <div class="md:w-3/12">
        <label
            class="block text-gray-500 font-bold md:text-right mb-1 md:mb-0 pr-4"
            for="inline-firstName"
        >
            Erythrocyte Volume Fraction
        </label>
    </div>
    <div class="md:w-5/12">
        <input
            class="bg-gray-200 appearance-none border-2 border-gray-200 rounded w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-green-500"
            id="inline-firstName"
            type="text"
            placeholder="Erythrocyte Volume Fraction"
            bind:value={erythrocyteVolume}
        />
    </div>
    <div class="md:w-3/12">
        <h4 class="mx-4 text-gray-500 italic text-sm">F: 0.37-0.45 gms/L | M: 0.40-0.50 gms/L</h4>
    </div>
</div>
<div class="md:flex md:items-center mb-6">
    <div class="md:w-3/12">
        <label
            class="block text-gray-500 font-bold md:text-right mb-1 md:mb-0 pr-4"
            for="inline-firstName"
        >
            Erythrocyte Number Concentration
        </label>
    </div>
    <div class="md:w-5/12">
        <input
            class="bg-gray-200 appearance-none border-2 border-gray-200 rounded w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-green-500"
            id="inline-firstName"
            type="text"
            placeholder="Erythrocyte Number Concentration"
            bind:value={erythrocyteNumber}
        />
    </div>
    <div class="md:w-3/12">
        <h4 class="mx-4 text-gray-500 italic text-sm">F: 4.0-5.0 xⁱ²10/L | M: 4.5-5.50 xⁱ²10/L</h4>
    </div>
</div>
<div class="md:flex md:items-center mb-6">
    <div class="md:w-3/12">
        <label
            class="block text-gray-500 font-bold md:text-right mb-1 md:mb-0 pr-4"
            for="inline-firstName"
        >
            Leukocyte Number Concentration
        </label>
    </div>
    <div class="md:w-5/12">
        <input
            class="bg-gray-200 appearance-none border-2 border-gray-200 rounded w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-green-500"
            id="inline-firstName"
            type="text"
            placeholder="Leukocyte Number Concentration"
            bind:value={leukocyteNumber}
        />
    </div>
    <div class="md:w-3/12">
        <h4 class="mx-4 text-gray-500 italic text-sm">5.0-10 x⁹10/L</h4>
    </div>
</div>
<div class="md:flex md:items-center mb-6">
    <div class="md:w-3/12">
        <label
            class="block text-gray-500 font-bold md:text-right mb-1 md:mb-0 pr-4"
            for="inline-firstName"
        >
            Neutrophil Number Fraction
        </label>
    </div>
    <div class="md:w-5/12">
        <input
            class="bg-gray-200 appearance-none border-2 border-gray-200 rounded w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-green-500"
            id="inline-firstName"
            type="text"
            placeholder="Neutrophil Number Fraction"
            bind:value={neutrophilNumber}
        />
    </div>
    <div class="md:w-3/12">
        <h4 class="mx-4 text-gray-500 italic text-sm">0.60-0.70</h4>
    </div>
</div>
<div class="md:flex md:items-center mb-6">
    <div class="md:w-3/12">
        <label
            class="block text-gray-500 font-bold md:text-right mb-1 md:mb-0 pr-4"
            for="inline-firstName"
        >
            Segmenters
        </label>
    </div>
    <div class="md:w-5/12">
        <input
            class="bg-gray-200 appearance-none border-2 border-gray-200 rounded w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-green-500"
            id="inline-firstName"
            type="text"
            placeholder="Segmenters"
            bind:value={segmenters}
        />
    </div>
    <div class="md:w-3/12">
        <h4 class="mx-4 text-gray-500 italic text-sm">0.60-0.70</h4>
    </div>
</div>
<div class="md:flex md:items-center mb-6">
    <div class="md:w-3/12">
        <label
            class="block text-gray-500 font-bold md:text-right mb-1 md:mb-0 pr-4"
            for="inline-firstName"
        >
            Stab
        </label>
    </div>
    <div class="md:w-5/12">
        <input
            class="bg-gray-200 appearance-none border-2 border-gray-200 rounded w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-green-500"
            id="inline-firstName"
            type="text"
            placeholder="Stab"
            bind:value={stab}
        />
    </div>
    <div class="md:w-3/12">
        <h4 class="mx-4 text-gray-500 italic text-sm">0.02-0.06</h4>
    </div>
</div>
<div class="md:flex md:items-center mb-6">
    <div class="md:w-3/12">
        <label
            class="block text-gray-500 font-bold md:text-right mb-1 md:mb-0 pr-4"
            for="inline-firstName"
        >
            Eosinophil
        </label>
    </div>
    <div class="md:w-5/12">
        <input
            class="bg-gray-200 appearance-none border-2 border-gray-200 rounded w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-green-500"
            id="inline-firstName"
            type="text"
            placeholder="Eosinophil"
            bind:value={eosinophil}
        />
    </div>
    <div class="md:w-3/12">
        <h4 class="mx-4 text-gray-500 italic text-sm">0.02-0.06</h4>
    </div>
</div>
<div class="md:flex md:items-center mb-6">
    <div class="md:w-3/12">
        <label
            class="block text-gray-500 font-bold md:text-right mb-1 md:mb-0 pr-4"
            for="inline-firstName"
        >
            Basophil
        </label>
    </div>
    <div class="md:w-5/12">
        <input
            class="bg-gray-200 appearance-none border-2 border-gray-200 rounded w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-green-500"
            id="inline-firstName"
            type="text"
            placeholder="Basophil"
            bind:value={basophil}
        />
    </div>
    <div class="md:w-3/12">
        <h4 class="mx-4 text-gray-500 italic text-sm">0.00-0.01</h4>
    </div>
</div>
<div class="md:flex md:items-center mb-6">
    <div class="md:w-3/12">
        <label
            class="block text-gray-500 font-bold md:text-right mb-1 md:mb-0 pr-4"
            for="inline-firstName"
        >
            Lymphocyte
        </label>
    </div>
    <div class="md:w-5/12">
        <input
            class="bg-gray-200 appearance-none border-2 border-gray-200 rounded w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-green-500"
            id="inline-firstName"
            type="text"
            placeholder="Lymphocyte"
            bind:value={lympocyte}
        />
    </div>
    <div class="md:w-3/12">
        <h4 class="mx-4 text-gray-500 italic text-sm">Adult: 0.18-0.30 | Infant: 0.22-0.44</h4>
    </div>
</div>
<div class="md:flex md:items-center mb-6">
    <div class="md:w-3/12">
        <label
            class="block text-gray-500 font-bold md:text-right mb-1 md:mb-0 pr-4"
            for="inline-firstName"
        >
            Monocyte
        </label>
    </div>
    <div class="md:w-5/12">
        <input
            class="bg-gray-200 appearance-none border-2 border-gray-200 rounded w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-green-500"
            id="inline-firstName"
            type="text"
            placeholder="Monocyte"
            bind:value={monocyte}
        />
    </div>
    <div class="md:w-3/12">
        <h4 class="mx-4 text-gray-500 italic text-sm">0.04-0.08</h4>
    </div>
</div>
<div class="md:flex md:items-center mb-6">
    <div class="md:w-3/12">
        <label
            class="block text-gray-500 font-bold md:text-right mb-1 md:mb-0 pr-4"
            for="inline-firstName"
        >
            Total
        </label>
    </div>
    <div class="md:w-5/12">
        <input
            class="bg-gray-200 appearance-none border-2 border-gray-200 rounded w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-green-500"
            id="inline-firstName"
            type="text"
            placeholder="Total"
            bind:value={total}
        />
    </div>
</div>
<div class="md:flex md:items-center mb-6">
    <div class="md:w-3/12">
        <label
            class="block text-gray-500 font-bold md:text-right mb-1 md:mb-0 pr-4"
            for="inline-firstName"
        >
            Erythrocyte Sedimentation Rate
        </label>
    </div>
    <div class="md:w-5/12">
        <input
            class="bg-gray-200 appearance-none border-2 border-gray-200 rounded w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-green-500"
            id="inline-firstName"
            type="text"
            placeholder="Erythrocyte Sedimentation Rate"
            bind:value={erythrocyteSedimentation}
        />
    </div>
    <div class="md:w-3/12">
        <h4 class="mx-4 text-gray-500 italic text-sm">F: 0-20 mm/hr | M: 0-9 mm/hr</h4>
    </div>
</div>
<div class="md:flex md:items-center mb-6">
    <div class="md:w-3/12">
        <label
            class="block text-gray-500 font-bold md:text-right mb-1 md:mb-0 pr-4"
            for="inline-firstName"
        >
            Thrombocyte Number Fraction
        </label>
    </div>
    <div class="md:w-5/12">
        <input
            class="bg-gray-200 appearance-none border-2 border-gray-200 rounded w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-green-500"
            id="inline-firstName"
            type="text"
            placeholder="Thrombocyte Number Fraction"
            bind:value={thrombocyteNumber}
        />
    </div>
    <div class="md:w-3/12">
        <h4 class="mx-4 text-gray-500 italic text-sm">150-350 x⁹10/L</h4>
    </div>
</div>
<div class="md:flex md:items-center mb-6">
    <div class="md:w-3/12">
        <label
            class="block text-gray-500 font-bold md:text-right mb-1 md:mb-0 pr-4"
            for="inline-firstName"
        >
            Bleeding Time
        </label>
    </div>
    <div class="md:w-5/12">
        <input
            class="bg-gray-200 appearance-none border-2 border-gray-200 rounded w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-green-500"
            id="inline-firstName"
            type="text"
            placeholder="Bleeding Time"
            bind:value={bleedingTime}
        />
    </div>
    <div class="md:w-3/12">
        <h4 class="mx-4 text-gray-500 italic text-sm">1-5 minutes</h4>
    </div>
</div>
<div class="md:flex md:items-center mb-6">
    <div class="md:w-3/12">
        <label
            class="block text-gray-500 font-bold md:text-right mb-1 md:mb-0 pr-4"
            for="inline-firstName"
        >
            Clotting Time
        </label>
    </div>
    <div class="md:w-5/12">
        <input
            class="bg-gray-200 appearance-none border-2 border-gray-200 rounded w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-green-500"
            id="inline-firstName"
            type="text"
            placeholder="Clotting Time"
            bind:value={clottingTime}
        />
    </div>
    <div class="md:w-3/12">
        <h4 class="mx-4 text-gray-500 italic text-sm">2-6 minutes</h4>
    </div>
</div>
<div class="md:flex md:items-center mb-6">
    <div class="md:w-3/12">
        <label
            class="block text-gray-500 font-bold md:text-right mb-1 md:mb-0 pr-4"
            for="inline-firstName"
        >
            RH
        </label>
    </div>
    <div class="md:w-5/12">
        <input
            class="bg-gray-200 appearance-none border-2 border-gray-200 rounded w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-green-500"
            id="inline-firstName"
            type="text"
            placeholder="RH"
            bind:value={rh}
        />
    </div>
</div>
<div class="md:flex md:items-center mb-6">
    <div class="md:w-3/12">
        <label
            class="block text-gray-500 font-bold md:text-right mb-1 md:mb-0 pr-4"
            for="inline-firstName"
        >
            Others
        </label>
    </div>
    <div class="md:w-5/12">
        <textarea
            class="bg-gray-200 appearance-none border-2 border-gray-200 rounded w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-green-500"
            id="inline-firstName"
            rows="3"
            cols="50"
            type="text"
            placeholder="Others"
            bind:value={others}
        />
    </div>
</div>