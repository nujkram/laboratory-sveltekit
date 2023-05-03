<script>
  import AccountProfileForm from '$lib/components/forms/account/AccountProfileForm.svelte';
	import {page} from '$app/stores';
	import {goto} from '$app/navigation';
  
  const profile = $page.data.user.profile;  
  const fullName = profile.displayName;
  const imgsrc = profile.photo.url;
  
  let isAccountProfileOpen = false;
  let isDropdownOpen = false;
  let isLogout = false; 

  function handleToggleDropDown()
  {
    isDropdownOpen = !isDropdownOpen;
  }

  function handleOpenUserProfile()
  {
    isAccountProfileOpen = !isAccountProfileOpen;
    handleToggleDropDown();
  }

  function handleLogout()
  {
    goto('auth/logout/');
  }
</script>

<nav class="fixed top-0 z-50 w-full bg-white border-b border-gray-200 dark:bg-gray-800 dark:border-gray-700">
  <div class="px-3 py-2 lg:px-5 lg:pl-3">
    <div class="flex items-center justify-between">
        <a href="/" class="flex ml-2 md:mr-24" style="text-decoration-line: none;">
          <img src="https://flowbite.com/docs/images/logo.svg" class="h-6 mr-3 sm:h-9" alt="Flowbite Logo" />
          <span class="text-xl font-semibold dark:text-white text-gray-900" >CMMS</span>
        </a>
        <div class="flex items-center">
          <div class="flex items-center ml-3">  
            <div class="relative inline-block text-left">
              <div>
                <button 
                  type="button" 
                  class="inline-flex w-full justify-center gap-x-1.5 rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 ring-inset ring-gray-300 hover:bg-gray-50" 
                  id="menu-button" 
                  aria-expanded="true" 
                  aria-haspopup="true"
                  on:click={handleToggleDropDown}
                  >
                  <img class="w-6 h-6 rounded-full" src="{imgsrc}" alt="">
                  {fullName}
                  <svg class="-mr-1 h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fill-rule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clip-rule="evenodd" />
                  </svg>
                </button>
              </div>
              <div class="absolute right-0 z-50 {isDropdownOpen? 'block': 'hidden'} my-2 text-base list-none bg-white divide-y divide-gray-100 rounded shadow dark:bg-gray-700 dark:divide-gray-600 " role="menu" aria-orientation="vertical" aria-labelledby="menu-button" tabindex="-1">
                <ul class="px-2 py-1">
                  <li class="">
                    <button 
                    class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-600 dark:hover:text-white" 
                    on:click={handleOpenUserProfile}>
                    Profile
                  </button>
                  </li>
                  <li>
                    <button 
                    class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-600 dark:hover:text-white" 
                    on:click={handleLogout}>
                    Logout
                  </button>
                  </li>
                </ul>
              </div>
            </div>
          </div>
      </div>
  </div>
</nav>
{#if isAccountProfileOpen}
  <AccountProfileForm bind:isAccountProfileOpen/>
{/if}