<script>
    // @ts-nocheck
    export let color,
        consistency,
        ascarisLumb,
        hookworm,
        trichuris,
        strongyloides,
        entamoebaColiCyst,
        entamoebaColiTroph,
        entamoebaHistCyst,
        entamoebaHistTroph,
        plusCell,
        rbc,
        yeastCell,
        fatGlobules,
        bacteria,
        others,
        remarks;
</script>
<div class="md:flex md:items-center mb-6">
    <div class="md:w-3/12">
        <label
            class="block text-gray-500 font-bold md:text-right mb-1 md:mb-0 pr-4"
            for="inline-firstName"
        >
            Color
        </label>
    </div>
    <div class="md:w-5/12">
        <input
            class="bg-gray-200 appearance-none border-2 border-gray-200 rounded w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-green-500"
            id="inline-firstName"
            type="text"
            placeholder="Color"
            bind:value={color}
        />
    </div>
</div>
<div class="md:flex md:items-center mb-6">
    <div class="md:w-3/12">
        <label
            class="block text-gray-500 font-bold md:text-right mb-1 md:mb-0 pr-4"
            for="inline-firstName"
        >
            Consistency
        </label>
    </div>
    <div class="md:w-5/12">
        <input
            class="bg-gray-200 appearance-none border-2 border-gray-200 rounded w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-green-500"
            id="inline-firstName"
            type="text"
            placeholder="Consistency"
            bind:value={consistency}
        />
    </div>
</div>
<div class="md:flex md:items-center mb-6">
    <div class="md:w-3/12">
        <label
            class="block text-gray-500 font-bold md:text-right mb-1 md:mb-0 pr-4"
            for="inline-firstName"
        >
            Ascaris Lumbricoides
        </label>
    </div>
    <div class="md:w-5/12">
        <input
            class="bg-gray-200 appearance-none border-2 border-gray-200 rounded w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-green-500"
            id="inline-firstName"
            type="text"
            placeholder="Ascaris Lumbricoides"
            bind:value={ascarisLumb}
        />
    </div>
    <div class="md:w-3/12">
        <h4 class="mx-4 text-gray-500 italic text-sm">lpf</h4>
    </div>
</div>
<div class="md:flex md:items-center mb-6">
    <div class="md:w-3/12">
        <label
            class="block text-gray-500 font-bold md:text-right mb-1 md:mb-0 pr-4"
            for="inline-firstName"
        >
            Hookworm
        </label>
    </div>
    <div class="md:w-5/12">
        <input
            class="bg-gray-200 appearance-none border-2 border-gray-200 rounded w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-green-500"
            id="inline-firstName"
            type="text"
            placeholder="Hookworm"
            bind:value={hookworm}
        />
    </div>
    <div class="md:w-3/12">
        <h4 class="mx-4 text-gray-500 italic text-sm">lpf</h4>
    </div>
</div>
<div class="md:flex md:items-center mb-6">
    <div class="md:w-3/12">
        <label
            class="block text-gray-500 font-bold md:text-right mb-1 md:mb-0 pr-4"
            for="inline-firstName"
        >
            Trichuris Trichiura
        </label>
    </div>
    <div class="md:w-5/12">
        <input
            class="bg-gray-200 appearance-none border-2 border-gray-200 rounded w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-green-500"
            id="inline-firstName"
            type="text"
            placeholder="Trichuris Trichiura"
            bind:value={trichuris}
        />
    </div>
    <div class="md:w-3/12">
        <h4 class="mx-4 text-gray-500 italic text-sm">lpf</h4>
    </div>
</div>
<div class="md:flex md:items-center mb-6">
    <div class="md:w-3/12">
        <label
            class="block text-gray-500 font-bold md:text-right mb-1 md:mb-0 pr-4"
            for="inline-firstName"
        >
            Strongyloides Stercoralis
        </label>
    </div>
    <div class="md:w-5/12">
        <input
            class="bg-gray-200 appearance-none border-2 border-gray-200 rounded w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-green-500"
            id="inline-firstName"
            type="text"
            placeholder="Strongyloides Stercoralis"
            bind:value={strongyloides}
        />
    </div>
    <div class="md:w-3/12">
        <h4 class="mx-4 text-gray-500 italic text-sm">lpf</h4>
    </div>
</div>
<div class="md:flex md:items-center mb-6">
    <div class="md:w-3/12">
        <label
            class="block text-gray-500 font-bold md:text-right mb-1 md:mb-0 pr-4"
            for="inline-firstName"
        >
            Entamoeba Coli Cyst
        </label>
    </div>
    <div class="md:w-5/12">
        <input
            class="bg-gray-200 appearance-none border-2 border-gray-200 rounded w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-green-500"
            id="inline-firstName"
            type="text"
            placeholder="Entamoeba Coli Cyst"
            bind:value={entamoebaColiCyst}
        />
    </div>
    <div class="md:w-3/12">
        <h4 class="mx-4 text-gray-500 italic text-sm">lpf</h4>
    </div>
</div>
<div class="md:flex md:items-center mb-6">
    <div class="md:w-3/12">
        <label
            class="block text-gray-500 font-bold md:text-right mb-1 md:mb-0 pr-4"
            for="inline-firstName"
        >
            Entamoeba Coli Trophozoite
        </label>
    </div>
    <div class="md:w-5/12">
        <input
            class="bg-gray-200 appearance-none border-2 border-gray-200 rounded w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-green-500"
            id="inline-firstName"
            type="text"
            placeholder="Entamoeba Coli Trophozoite"
            bind:value={entamoebaColiTroph}
        />
    </div>
    <div class="md:w-3/12">
        <h4 class="mx-4 text-gray-500 italic text-sm">lpf</h4>
    </div>
</div>
<div class="md:flex md:items-center mb-6">
    <div class="md:w-3/12">
        <label
            class="block text-gray-500 font-bold md:text-right mb-1 md:mb-0 pr-4"
            for="inline-firstName"
        >
            Entamoeba Histolytica Cyst
        </label>
    </div>
    <div class="md:w-5/12">
        <input
            class="bg-gray-200 appearance-none border-2 border-gray-200 rounded w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-green-500"
            id="inline-firstName"
            type="text"
            placeholder="Entamoeba Histolytica Cyst"
            bind:value={entamoebaHistCyst}
        />
    </div>
    <div class="md:w-3/12">
        <h4 class="mx-4 text-gray-500 italic text-sm">lpf</h4>
    </div>
</div>
<div class="md:flex md:items-center mb-6">
    <div class="md:w-3/12">
        <label
            class="block text-gray-500 font-bold md:text-right mb-1 md:mb-0 pr-4"
            for="inline-firstName"
        >
            Entamoeba Histolytica Trophozoite
        </label>
    </div>
    <div class="md:w-5/12">
        <input
            class="bg-gray-200 appearance-none border-2 border-gray-200 rounded w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-green-500"
            id="inline-firstName"
            type="text"
            placeholder="Entamoeba Histolytica Trophozoite"
            bind:value={entamoebaHistTroph}
        />
    </div>
    <div class="md:w-3/12">
        <h4 class="mx-4 text-gray-500 italic text-sm">lpf</h4>
    </div>
</div>
<div class="md:flex md:items-center mb-6">
    <div class="md:w-3/12">
        <label
            class="block text-gray-500 font-bold md:text-right mb-1 md:mb-0 pr-4"
            for="inline-firstName"
        >
            Plus Cells
        </label>
    </div>
    <div class="md:w-5/12">
        <input
            class="bg-gray-200 appearance-none border-2 border-gray-200 rounded w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-green-500"
            id="inline-firstName"
            type="text"
            placeholder="Plus Cells"
            bind:value={plusCell}
        />
    </div>
    <div class="md:w-3/12">
        <h4 class="mx-4 text-gray-500 italic text-sm">lpf</h4>
    </div>
</div>
<div class="md:flex md:items-center mb-6">
    <div class="md:w-3/12">
        <label
            class="block text-gray-500 font-bold md:text-right mb-1 md:mb-0 pr-4"
            for="inline-firstName"
        >
            RBC
        </label>
    </div>
    <div class="md:w-5/12">
        <input
            class="bg-gray-200 appearance-none border-2 border-gray-200 rounded w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-green-500"
            id="inline-firstName"
            type="text"
            placeholder="RBC"
            bind:value={rbc}
        />
    </div>
    <div class="md:w-3/12">
        <h4 class="mx-4 text-gray-500 italic text-sm">lpf</h4>
    </div>
</div>
<div class="md:flex md:items-center mb-6">
    <div class="md:w-3/12">
        <label
            class="block text-gray-500 font-bold md:text-right mb-1 md:mb-0 pr-4"
            for="inline-firstName"
        >
            Yeast Cells
        </label>
    </div>
    <div class="md:w-5/12">
        <input
            class="bg-gray-200 appearance-none border-2 border-gray-200 rounded w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-green-500"
            id="inline-firstName"
            type="text"
            placeholder="Yeast Cells"
            bind:value={yeastCell}
        />
    </div>
</div>
<div class="md:flex md:items-center mb-6">
    <div class="md:w-3/12">
        <label
            class="block text-gray-500 font-bold md:text-right mb-1 md:mb-0 pr-4"
            for="inline-firstName"
        >
            Fat Globules
        </label>
    </div>
    <div class="md:w-5/12">
        <input
            class="bg-gray-200 appearance-none border-2 border-gray-200 rounded w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-green-500"
            id="inline-firstName"
            type="text"
            placeholder="Fat Globules"
            bind:value={fatGlobules}
        />
    </div>
</div>
<div class="md:flex md:items-center mb-6">
    <div class="md:w-3/12">
        <label
            class="block text-gray-500 font-bold md:text-right mb-1 md:mb-0 pr-4"
            for="inline-firstName"
        >
            Bacteria
        </label>
    </div>
    <div class="md:w-5/12">
        <input
            class="bg-gray-200 appearance-none border-2 border-gray-200 rounded w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-green-500"
            id="inline-firstName"
            type="text"
            placeholder="Bacteria"
            bind:value={bacteria}
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
<div class="md:flex md:items-center mb-6">
    <div class="md:w-3/12">
        <label
            class="block text-gray-500 font-bold md:text-right mb-1 md:mb-0 pr-4"
            for="inline-firstName"
        >
            Remarks
        </label>
    </div>
    <div class="md:w-5/12">
        <textarea
            class="bg-gray-200 appearance-none border-2 border-gray-200 rounded w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-green-500"
            id="inline-firstName"
            rows="3"
            cols="50"
            type="text"
            placeholder="Remarks"
            bind:value={remarks}
        />
    </div>
</div>