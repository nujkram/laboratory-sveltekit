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
            class="field-label"
            for="inline-exam"
        >
            Exam Desired
        </label>
    </div>
    <div class="md:w-5/12">
        <select
            id="inline-exam"
            name="exam"
            class="field"
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
            class="field-label"
            for="inline-specimen"
        >
            Specimen
        </label>
    </div>
    <div class="md:w-5/12">
        <input
            class="field"
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
            class="field-label"
            for="inline-result"
        >
            Result
        </label>
    </div>
    <div class="md:w-5/12">
        <input
            class="field"
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
            class="field-label"
            for="inline-remarks"
        >
            Remarks
        </label>
    </div>
    <div class="md:w-5/12">
        <input
            class="field"
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
            class="field-label"
            for="inline-notes"
        >
            Notes
        </label>
    </div>
    <div class="md:w-5/12">
        <input
            class="field"
            id="inline-notes"
            type="text"
            placeholder="Notes"
            name="others"
            bind:value={others}
        />
    </div>
</div>