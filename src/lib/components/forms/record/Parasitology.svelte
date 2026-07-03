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
        pusCell,
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
            class="field-label"
            for="inline-color"
        >
            Color
        </label>
    </div>
    <div class="md:w-5/12">
        <input
            class="field"
            id="inline-color"
            type="text"
            placeholder="Color"
            name="color"
            bind:value={color}
        />
    </div>
</div>
<div class="md:flex md:items-center mb-6">
    <div class="md:w-3/12">
        <label
            class="field-label"
            for="inline-consistency"
        >
            Consistency
        </label>
    </div>
    <div class="md:w-5/12">
        <input
            class="field"
            id="inline-consistency"
            type="text"
            placeholder="Consistency"
            name="consistency"
            bind:value={consistency}
        />
    </div>
</div>
<div class="md:flex md:items-center mb-6">
    <div class="md:w-3/12">
        <label
            class="field-label"
            for="inline-ascaris-lumb"
        >
            Ascaris Lumbricoides
        </label>
    </div>
    <div class="md:w-5/12">
        <input
            class="field"
            id="inline-ascaris-lumb"
            type="text"
            placeholder="Ascaris Lumbricoides"
            name="ascarisLumb"
            bind:value={ascarisLumb}
        />
    </div>
    <div class="md:w-3/12">
        <h4 class="field-hint">lpf</h4>
    </div>
</div>
<div class="md:flex md:items-center mb-6">
    <div class="md:w-3/12">
        <label
            class="field-label"
            for="inline-hookworm"
        >
            Hookworm
        </label>
    </div>
    <div class="md:w-5/12">
        <input
            class="field"
            id="inline-hookworm"
            type="text"
            placeholder="Hookworm"
            name="hookworm"
            bind:value={hookworm}
        />
    </div>
    <div class="md:w-3/12">
        <h4 class="field-hint">lpf</h4>
    </div>
</div>
<div class="md:flex md:items-center mb-6">
    <div class="md:w-3/12">
        <label
            class="field-label"
            for="inline-trichuris-trichiura"
        >
            Trichuris Trichiura
        </label>
    </div>
    <div class="md:w-5/12">
        <input
            class="field"
            id="inline-trichuris-trichiura"
            type="text"
            placeholder="Trichuris Trichiura"
            name="trichuris"
            bind:value={trichuris}
        />
    </div>
    <div class="md:w-3/12">
        <h4 class="field-hint">lpf</h4>
    </div>
</div>
<div class="md:flex md:items-center mb-6">
    <div class="md:w-3/12">
        <label
            class="field-label"
            for="inline-strongyloides-stercoralis"
        >
            Strongyloides Stercoralis
        </label>
    </div>
    <div class="md:w-5/12">
        <input
            class="field"
            id="inline-strongyloides-stercoralis"
            type="text"
            placeholder="Strongyloides Stercoralis"
            name="strongyloides"
            bind:value={strongyloides}
        />
    </div>
    <div class="md:w-3/12">
        <h4 class="field-hint">lpf</h4>
    </div>
</div>
<div class="md:flex md:items-center mb-6">
    <div class="md:w-3/12">
        <label
            class="field-label"
            for="inline-entamoeba-coli-cyst"
        >
            Entamoeba Coli Cyst
        </label>
    </div>
    <div class="md:w-5/12">
        <input
            class="field"
            id="inline-entamoeba-coli-cyst"
            type="text"
            placeholder="Entamoeba Coli Cyst"
            name="entamoebaColiCyst"
            bind:value={entamoebaColiCyst}
        />
    </div>
    <div class="md:w-3/12">
        <h4 class="field-hint">lpf</h4>
    </div>
</div>
<div class="md:flex md:items-center mb-6">
    <div class="md:w-3/12">
        <label
            class="field-label"
            for="inline-entamoeba-coli-trophozoite"
        >
            Entamoeba Coli Trophozoite
        </label>
    </div>
    <div class="md:w-5/12">
        <input
            class="field"
            id="inline-entamoeba-coli-trophozoite"
            type="text"
            placeholder="Entamoeba Coli Trophozoite"
            name="entamoebaColiTroph"
            bind:value={entamoebaColiTroph}
        />
    </div>
    <div class="md:w-3/12">
        <h4 class="field-hint">lpf</h4>
    </div>
</div>
<div class="md:flex md:items-center mb-6">
    <div class="md:w-3/12">
        <label
            class="field-label"
            for="inline-entamoeba-histolytica-cyst"
        >
            Entamoeba Histolytica Cyst
        </label>
    </div>
    <div class="md:w-5/12">
        <input
            class="field"
            id="inline-entamoeba-histolytica-cyst"
            type="text"
            placeholder="Entamoeba Histolytica Cyst"
            name="entamoebaHistCyst"
            bind:value={entamoebaHistCyst}
        />
    </div>
    <div class="md:w-3/12">
        <h4 class="field-hint">lpf</h4>
    </div>
</div>
<div class="md:flex md:items-center mb-6">
    <div class="md:w-3/12">
        <label
            class="field-label"
            for="inline-entamoeba-histolytica-trophozoite"
        >
            Entamoeba Histolytica Trophozoite
        </label>
    </div>
    <div class="md:w-5/12">
        <input
            class="field"
            id="inline-entamoeba-histolytica-trophozoite"
            type="text"
            placeholder="Entamoeba Histolytica Trophozoite"
            name="entamoebaHistTroph"
            bind:value={entamoebaHistTroph}
        />
    </div>
    <div class="md:w-3/12">
        <h4 class="field-hint">lpf</h4>
    </div>
</div>
<div class="md:flex md:items-center mb-6">
    <div class="md:w-3/12">
        <label
            class="field-label"
            for="inline-pus-cells"
        >
            Pus Cells
        </label>
    </div>
    <div class="md:w-5/12">
        <input
            class="field"
            id="inline-pus-cells"
            type="text"
            placeholder="Pus Cells"
            name="pusCell"
            bind:value={pusCell}
        />
    </div>
    <div class="md:w-3/12">
        <h4 class="field-hint">lpf</h4>
    </div>
</div>
<div class="md:flex md:items-center mb-6">
    <div class="md:w-3/12">
        <label
            class="field-label"
            for="inline-rbc"
        >
            RBC
        </label>
    </div>
    <div class="md:w-5/12">
        <input
            class="field"
            id="inline-rbc"
            type="text"
            placeholder="RBC"
            name="rbc"
            bind:value={rbc}
        />
    </div>
    <div class="md:w-3/12">
        <h4 class="field-hint">lpf</h4>
    </div>
</div>
<div class="md:flex md:items-center mb-6">
    <div class="md:w-3/12">
        <label
            class="field-label"
            for="inline-yeast-cells"
        >
            Yeast Cells
        </label>
    </div>
    <div class="md:w-5/12">
        <input
            class="field"
            id="inline-yeast-cells"
            type="text"
            placeholder="Yeast Cells"
            name="yeastCell"
            bind:value={yeastCell}
        />
    </div>
</div>
<div class="md:flex md:items-center mb-6">
    <div class="md:w-3/12">
        <label
            class="field-label"
            for="inline-fat-globules"
        >
            Fat Globules
        </label>
    </div>
    <div class="md:w-5/12">
        <input
            class="field"
            id="inline-fat-globules"
            type="text"
            placeholder="Fat Globules"
            name="fatGlobules"
            bind:value={fatGlobules}
        />
    </div>
</div>
<div class="md:flex md:items-center mb-6">
    <div class="md:w-3/12">
        <label
            class="field-label"
            for="inline-bacteria"
        >
            Bacteria
        </label>
    </div>
    <div class="md:w-5/12">
        <input
            class="field"
            id="inline-bacteria"
            type="text"
            placeholder="Bacteria"
            name="bacteria"
            bind:value={bacteria}
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
        <textarea
            class="field"
            id="inline-remarks"
            rows="3"
            cols="50"
            type="text"
            placeholder="Remarks"
            name="remarks"
            bind:value={remarks}
        />
    </div>
</div>