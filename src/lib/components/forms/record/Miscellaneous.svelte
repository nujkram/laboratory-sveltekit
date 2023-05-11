<script>
    // @ts-nocheck
    export let exam = 'ROUTINE';
    export let specimen,
        result,
        remarks,
        others;

    const options = [
        'Anti - HAV',
        'Anti - HBs',
        'ASOT',
        'CRP',
        'Dengue Duo',
        'Gram\'s Stain',
        'HBsAg',
        'H.Pylori',
        'KOH',
        'Pregnancy Test',
        'RPR',
    ];
</script>
<div class="md:flex md:items-center mb-6">
    <div class="md:w-3/12">
        <label
            class="block text-gray-500 font-bold md:text-right mb-1 md:mb-0 pr-4"
            for="inline-exam"
        >
            Exam Desired
        </label>
    </div>
    <div class="md:w-5/12">
        <select
            id="inline-exam"
            name="exam"
            class="bg-gray-200 appearance-none border-2 border-gray-200 rounded w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-green-500"
            placeholder="Select an option"
            bind:value={exam}
        >
            {#each options as option}
                <option value={option}>{option}</option>
            {/each}
        </select>
    </div>
</div>
<div class="md:flex md:items-center mb-6">
    <div class="md:w-3/12">
        <label
            class="block text-gray-500 font-bold md:text-right mb-1 md:mb-0 pr-4"
            for="inline-specimen"
        >
            Specimen
        </label>
    </div>
    <div class="md:w-5/12">
        <input
            class="bg-gray-200 appearance-none border-2 border-gray-200 rounded w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-green-500"
            id="inline-specimen"
            type="text"
            placeholder="Specimen"
            name="specimen"
            bind:value={specimen}
        />
    </div>
</div>
<div class="md:flex md:items-center mb-6">
    <div class="md:w-3/12">
        <label
            class="block text-gray-500 font-bold md:text-right mb-1 md:mb-0 pr-4"
            for="inline-result"
        >
            Result
        </label>
    </div>
    <div class="md:w-5/12">
        <input
            class="bg-gray-200 appearance-none border-2 border-gray-200 rounded w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-green-500"
            id="inline-result"
            type="text"
            placeholder="Result"
            name="result"
            bind:value={result}
        />
    </div>
</div>
<div class="md:flex md:items-center mb-6">
    <div class="md:w-3/12">
        <label
            class="block text-gray-500 font-bold md:text-right mb-1 md:mb-0 pr-4"
            for="inline-remarks"
        >
            Remarks
        </label>
    </div>
    <div class="md:w-5/12">
        <input
            class="bg-gray-200 appearance-none border-2 border-gray-200 rounded w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-green-500"
            id="inline-remarks"
            type="text"
            placeholder="Remarks"
            name="remarks"
            bind:value={remarks}
        />
    </div>
</div>
<div class="md:flex md:items-center mb-6">
    <div class="md:w-3/12">
        <label
            class="block text-gray-500 font-bold md:text-right mb-1 md:mb-0 pr-4"
            for="inline-notes"
        >
            Notes
        </label>
    </div>
    <div class="md:w-5/12">
        <input
            class="bg-gray-200 appearance-none border-2 border-gray-200 rounded w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-green-500"
            id="inline-notes"
            type="text"
            placeholder="Notes"
            name="others"
            bind:value={others}
        />
    </div>
</div>