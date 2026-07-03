<script>
    // @ts-nocheck
    export let exam = 'ROUTINE';
    export let color,
        transparency,
        reaction,
        specificGravity,
        protein,
        sugar,
        fineGran,
        coarseGran,
        pusCellCast,
        hyaline,
        rbc,
        pusCell,
        uricAcid,
        calciumOxolate,
        amorphous,
        tripPhosphates,
        squamous,
        bacteria,
        mucous,
        roundEpithelial,
        yeastCell,
        vaginalis,
        hominis;
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
            for="inline-transparency"
        >
            Transparency
        </label>
    </div>
    <div class="md:w-5/12">
        <input
            class="field"
            id="inline-transparency"
            type="text"
            placeholder="Transparency"
            name="transparency"
            bind:value={transparency}
        />
    </div>
</div>
<div class="md:flex md:items-center mb-6">
    <div class="md:w-3/12">
        <label
            class="field-label"
            for="inline-reaction"
        >
            Reaction
        </label>
    </div>
    <div class="md:w-5/12">
        <input
            class="field"
            id="inline-reaction"
            type="text"
            placeholder="Reaction"
            name="reaction"
            bind:value={reaction}
        />
    </div>
</div>
<div class="md:flex md:items-center mb-6">
    <div class="md:w-3/12">
        <label
            class="field-label"
            for="inline-specific-gravity"
        >
            Specific Gravity
        </label>
    </div>
    <div class="md:w-5/12">
        <input
            class="field"
            id="inline-specific-gravity"
            type="text"
            placeholder="Specific Gravity"
            name="specificGravity"
            bind:value={specificGravity}
        />
    </div>
</div>
<div class="md:flex md:items-center mb-6">
    <div class="md:w-3/12">
        <label
            class="field-label"
            for="inline-protein"
        >
            Protein
        </label>
    </div>
    <div class="md:w-5/12">
        <input
            class="field"
            id="inline-protein"
            type="text"
            placeholder="Protein"
            name="protein"
            bind:value={protein}
        />
    </div>
</div>
<div class="md:flex md:items-center mb-6">
    <div class="md:w-3/12">
        <label
            class="field-label"
            for="inline-sugar"
        >
            Sugar
        </label>
    </div>
    <div class="md:w-5/12">
        <input
            class="field"
            id="inline-sugar"
            type="text"
            placeholder="Sugar"
            name="sugar"
            bind:value={sugar}
        />
    </div>
</div>
<div class="md:flex md:items-center mb-6">
    <div class="md:w-3/12">
        <label
            class="field-label"
            for="inline-fine-granular-cast"
        >
            Fine Granular Cast
        </label>
    </div>
    <div class="md:w-5/12">
        <input
            class="field"
            id="inline-fine-granular-cast"
            type="text"
            placeholder="Fine Granular Cast"
            name="fineGran"
            bind:value={fineGran}
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
            for="inline-coarse-granular-cast"
        >
            Coarse Granular Cast
        </label>
    </div>
    <div class="md:w-5/12">
        <input
            class="field"
            id="inline-coarse-granular-cast"
            type="text"
            placeholder="Coarse Granular Cast"
            name="coarseGran"
            bind:value={coarseGran}
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
            for="inline-pus-cell-cast"
        >
            Pus Cell Cast
        </label>
    </div>
    <div class="md:w-5/12">
        <input
            class="field"
            id="inline-pus-cell-cast"
            type="text"
            placeholder="Pus Cell Cast"
            name="pusCellCast"
            bind:value={pusCellCast}
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
            for="inline-hyaline-cast"
        >
            Hyaline Cast
        </label>
    </div>
    <div class="md:w-5/12">
        <input
            class="field"
            id="inline-hyaline-cast"
            type="text"
            placeholder="Hyaline Cast"
            name="hyaline"
            bind:value={hyaline}
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
            for="inline-uri-acid"
        >
            Uric Acid
        </label>
    </div>
    <div class="md:w-5/12">
        <input
            class="field"
            id="inline-uri-acid"
            type="text"
            placeholder="Uric Acid"
            name="uricAcid"
            bind:value={uricAcid}
        />
    </div>
</div>
<div class="md:flex md:items-center mb-6">
    <div class="md:w-3/12">
        <label
            class="field-label"
            for="inline-calcium-oxolate"
        >
            Calcium Oxolate
        </label>
    </div>
    <div class="md:w-5/12">
        <input
            class="field"
            id="inline-calcium-oxolate"
            type="text"
            placeholder="Calcium Oxolate"
            name="calciumOxolate"
            bind:value={calciumOxolate}
        />
    </div>
</div>
<div class="md:flex md:items-center mb-6">
    <div class="md:w-3/12">
        <label
            class="field-label"
            for="inline-amorphous-urates"
        >
            Amorphous Urates
        </label>
    </div>
    <div class="md:w-5/12">
        <input
            class="field"
            id="inline-amorphous-urates"
            type="text"
            placeholder="Amorphous Urates"
            name="amorphous"
            bind:value={amorphous}
        />
    </div>
</div>
<div class="md:flex md:items-center mb-6">
    <div class="md:w-3/12">
        <label
            class="field-label"
            for="inline-triple-phosphates"
        >
            Triple Phosphates
        </label>
    </div>
    <div class="md:w-5/12">
        <input
            class="field"
            id="inline-triple-phosphates"
            type="text"
            placeholder="Triple Phosphates"
            name="tripPhosphates"
            bind:value={tripPhosphates}
        />
    </div>
</div>
<div class="md:flex md:items-center mb-6">
    <div class="md:w-3/12">
        <label
            class="field-label"
            for="inline-squamous-epithelial-cells"
        >
            Squamous Epithelial Cells
        </label>
    </div>
    <div class="md:w-5/12">
        <input
            class="field"
            id="inline-squamous-epithelial-cells"
            type="text"
            placeholder="Squamous Epithelial Cells"
            name="squamous"
            bind:value={squamous}
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
            for="inline-mucous-threads"
        >
            Mucous Threads
        </label>
    </div>
    <div class="md:w-5/12">
        <input
            class="field"
            id="inline-mucous-threads"
            type="text"
            placeholder="Mucous Threads"
            name="mucous"
            bind:value={mucous}
        />
    </div>
</div>
<div class="md:flex md:items-center mb-6">
    <div class="md:w-3/12">
        <label
            class="field-label"
            for="inline-round-epithelial-cells"
        >
            Round Epithelial Cells
        </label>
    </div>
    <div class="md:w-5/12">
        <input
            class="field"
            id="inline-round-epithelial-cells"
            type="text"
            placeholder="Round Epithelial Cells"
            name="roundEpithelial"
            bind:value={roundEpithelial}
        />
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
            for="inline-trichomonas-vaginalis"
        >
            Trichomonas Vaginalis
        </label>
    </div>
    <div class="md:w-5/12">
        <input
            class="field"
            id="inline-trichomonas-vaginalis"
            type="text"
            placeholder="Trichomonas Vaginalis"
            name="vaginalis"
            bind:value={vaginalis}
        />
    </div>
</div>
<div class="md:flex md:items-center mb-6">
    <div class="md:w-3/12">
        <label
            class="field-label"
            for="inline-trichomonas-hominis"
        >
            Trichomonas Hominis
        </label>
    </div>
    <div class="md:w-5/12">
        <input
            class="field"
            id="inline-trichomonas-hominis"
            type="text"
            placeholder="Trichomonas Hominis"
            name="hominis"
            bind:value={hominis}
        />
    </div>
</div>