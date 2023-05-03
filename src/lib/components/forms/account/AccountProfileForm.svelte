<script>
    import {page} from '$app/stores';

    export let isAccountProfileOpen = false;
    
    function toggleProfileForm(){
        isAccountProfileOpen = !isAccountProfileOpen;
    };
    let profile = $page.data.user.profile;

  </script>

<div class="fixed inset-0 z-1 overflow-y-auto">
    <div class="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
        <div class="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-2 sm:w-full sm:max-w-lg">
            <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <form class="w-full max-w-lg">
                    <div class="flex w-full justify-center items-center px-3">
                        <img class="md:w-1/3 rounded-full outline outline-1 w-96 h-96" src="{profile.photo.url}" alt="">
                    </div>
                    <div class="flex flex-wrap my-4 -mx-3 mb-6">
                        <div class="w-full md:w-1/2 px-3 mb-6 md:mb-0">
                            <label class="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2" for="grid-first-name">
                            First Name
                            </label>
                            <input 
                                class="appearance-none block w-full bg-gray-200 text-gray-700 border border-red-500 rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white" 
                                id="grid-first-name" 
                                type="text" 
                                placeholder="{profile.firstName}"
                                bind:value="{profile.firstName}"
                            >
                        </div>
                        <div class="w-full md:w-1/2 px-3">
                            <label 
                            class="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2" for="grid-last-name">
                            Last Name
                            </label>
                            <input 
                                class="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500" 
                                id="grid-last-name" 
                                type="text" 
                                placeholder="{profile.lastName}"
                                bind:value="{profile.lastName}"
                            >
                            </div>
                        </div>
                        <div class="flex flex-wrap -mx-3 mb-6">
                        <div class="w-full px-3">
                            <label class="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2" for="grid-password">
                            Email
                            </label>
                            <input 
                                class="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white focus:border-gray-500" 
                                id="grid-email" 
                                type="text" 
                                placeholder="{profile.email}"
                                bind:value="{profile.email}"
                            >
                        </div>
                        <div class="w-full px-3">
                            <label class="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2" for="grid-password">
                            Phone
                            </label>
                            <input 
                                class="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white focus:border-gray-500" 
                                id="grid-email" 
                                type="text" 
                                placeholder="{profile.phone}"
                                bind:value="{profile.phone}"
                            >
                        </div>
                    </div>
                    <div class="flex flex-wrap -mx-3 mb-2">
                        <div class="w-full md:w-1/2 px-3 mb-6 md:mb-0">
                            <label class="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2" for="grid-city">
                            Province
                            </label>
                            <input 
                            class="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500" 
                            id="grid-city" 
                            type="text" 
                            placeholder="{profile.province}"
                            bind:value="{profile.province}"
                        >
                        </div>
                        <div class="w-full md:w-1/2 px-3 mb-6 md:mb-0">
                            <label class="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2" for="grid-city">
                            Country
                            </label>
                            <input 
                            class="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500" 
                            id="grid-city" 
                            type="text" 
                            placeholder="{profile.country}"
                            bind:value="{profile.country}"
                        >
                        </div>
                    </div>
                </form>
            </div>
            <div class="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                <button 
                    type="button" 
                    class="inline-flex w-full justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-500 sm:ml-3 sm:w-auto"
                    >Update
                </button>
                <button 
                    type="button" 
                    class="inline-flex w-full justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-500 sm:ml-3 sm:w-auto"
                    on:click={toggleProfileForm}
                    >Cancel
                </button>
            </div>
        </div>
    </div>
</div>