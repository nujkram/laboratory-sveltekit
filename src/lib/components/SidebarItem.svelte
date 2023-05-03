<script>
   // @ts-nocheck
    export let title, link;
</script>

<div class="h-10 bg-white dark:bg-gray-800">
    <ul class="space-y-2">
       <li>
          <a href={link} class="flex items-center p-2 text-base font-semibold text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700" style="text-decoration-line: none;">
             <slot/>
             <span class="ml-3">{title}</span>
          </a>
       </li>
    </ul>
</div>