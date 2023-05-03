<script>
    // @ts-nocheck
    import { createEventDispatcher } from "svelte";
    const dispatch = createEventDispatcher();
    function handleClick(event) {
        console.log('clicked')
        dispatch('click', event);
    }
</script>
<button
    type="button"
    class="text-gray-400 justify-end bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm ml-auto inline-flex items-center dark:hover:bg-gray-800 dark:hover:text-white"
    on:click={handleClick}
>
    <svg
        fill="currentColor"
        class="w-5 h-5 dark:text-gray-400"
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