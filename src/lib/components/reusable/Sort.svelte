<script>
    // @ts-nocheck
    import { createEventDispatcher } from "svelte";
    const dispatch = createEventDispatcher();
    function handleClick(event) {
        dispatch('click', event);
    }
</script>
<button
    type="button"
    aria-label="Sort column"
    class="inline-flex items-center rounded p-0.5 align-middle text-muted/60 transition-colors hover:bg-paper hover:text-pine-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-leaf"
    on:click={handleClick}
>
    <svg
        fill="currentColor"
        class="h-4 w-4"
        viewBox="0 0 24 24"
        aria-hidden="true"
    >
        <path
            clip-rule="evenodd"
            fill-rule="evenodd"
            d="M6.97 2.47a.75.75 0 011.06 0l4.5 4.5a.75.75 0 01-1.06 1.06L8.25 4.81V16.5a.75.75 0 01-1.5 0V4.81L3.53 8.03a.75.75 0 01-1.06-1.06l4.5-4.5zm9.53 4.28a.75.75 0 01.75.75v11.69l3.22-3.22a.75.75 0 111.06 1.06l-4.5 4.5a.75.75 0 01-1.06 0l-4.5-4.5a.75.75 0 111.06-1.06l3.22 3.22V7.5a.75.75 0 01.75-.75z"
        />
    </svg>
</button>