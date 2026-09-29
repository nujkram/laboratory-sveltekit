<script>
    // @ts-nocheck
    import {page} from '$app/stores';
    import { fade } from 'svelte/transition';
    import { SHA256 } from 'crypto-js';

    export let isAccountProfileOpen = false;

    function toggleProfileForm(){
        isAccountProfileOpen = !isAccountProfileOpen;
    };

    function handleKeydown(event) {
        if (event.key === 'Escape') {
            isAccountProfileOpen = false;
        }
    }

    // A copy: the fields below are read-only, and binding straight into
    // $page.data.user would edit the live session user.
    const profile = { ...($page.data.user?.profile ?? {}) };
    const photoUrl = profile?.photo?.url ?? '';

    let showPasswordForm = false;
    let currentPassword = '';
    let newPassword = '';
    let confirmPassword = '';
    let saving = false;
    let message = null;
    let alertColor = 'green';
    // Written out in full: Tailwind only keeps classes it can see in the source,
    // so an interpolated `bg-{color}-500` is purged and the alert renders unstyled.
    $: alertClass = alertColor === 'red'
    	? 'border border-danger/30 bg-danger/10 text-danger'
    	: 'border border-leaf/30 bg-leaf-soft text-pine-700';

    function flash(text, color) {
        message = text;
        alertColor = color;
        setTimeout(() => { message = null; }, 4000);
    }

    function resetPasswordForm() {
        currentPassword = '';
        newPassword = '';
        confirmPassword = '';
    }

    async function handleChangePassword(event) {
        event?.preventDefault();

        if (!currentPassword || !newPassword || !confirmPassword) {
            flash('Please fill in all password fields.', 'red');
            return;
        }
        if (newPassword.length < 6) {
            flash('New password must be at least 6 characters.', 'red');
            return;
        }
        if (newPassword !== confirmPassword) {
            flash('New passwords do not match.', 'red');
            return;
        }

        saving = true;
        try {
            const response = await fetch('/api/admin/user/password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    currentPassword: SHA256(currentPassword).toString(),
                    newPassword: SHA256(newPassword).toString()
                })
            });
            const result = await response.json();

            if (result.error) {
                flash(result.message, 'red');
            } else {
                flash(result.message, 'green');
                resetPasswordForm();
                showPasswordForm = false;
            }
        } catch (error) {
            flash('Something went wrong. Please try again.', 'red');
        } finally {
            saving = false;
        }
    }
  </script>

<svelte:window on:keydown={handleKeydown} />

<div class="fixed inset-0 z-50 overflow-y-auto">
    <div class="fixed inset-0 bg-ink/40 backdrop-blur-sm" />
    <div class="relative flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0" on:click|self={toggleProfileForm}>
        <div class="relative w-full transform overflow-hidden rounded-xl border border-line bg-surface text-left shadow-card-lg transition-all sm:my-2 sm:max-w-lg">
            <div class="px-6 pt-6 pb-4">
                <h3 class="mb-5 font-display text-lg font-bold text-ink">Your profile</h3>
                {#if photoUrl}
                    <div class="mb-5 flex w-full items-center justify-center">
                        <img class="h-24 w-24 rounded-full object-cover ring-2 ring-leaf-soft" src={photoUrl} alt="">
                    </div>
                {/if}
                <!-- Names and contact details are maintained by an administrator on the
                     Users page; this modal is for reading them and changing a password. -->
                <dl class="grid grid-cols-1 gap-x-6 gap-y-3 text-sm sm:grid-cols-2">
                    <div>
                        <dt class="text-xs font-semibold uppercase tracking-wide text-muted">Name</dt>
                        <dd class="mt-0.5 font-medium text-ink">{profile.displayName || `${profile.firstName ?? ''} ${profile.lastName ?? ''}`.trim() || '—'}</dd>
                    </div>
                    <div>
                        <dt class="text-xs font-semibold uppercase tracking-wide text-muted">Role</dt>
                        <dd class="mt-0.5 font-medium text-ink">{$page.data.user?.role || '—'}</dd>
                    </div>
                    <div>
                        <dt class="text-xs font-semibold uppercase tracking-wide text-muted">Email</dt>
                        <dd class="mt-0.5 font-mono text-xs text-ink">{profile.email || '—'}</dd>
                    </div>
                    <div>
                        <dt class="text-xs font-semibold uppercase tracking-wide text-muted">Phone</dt>
                        <dd class="mt-0.5 text-ink">{profile.phone || '—'}</dd>
                    </div>
                    <div>
                        <dt class="text-xs font-semibold uppercase tracking-wide text-muted">Province</dt>
                        <dd class="mt-0.5 text-ink">{profile.province || '—'}</dd>
                    </div>
                    <div>
                        <dt class="text-xs font-semibold uppercase tracking-wide text-muted">Country</dt>
                        <dd class="mt-0.5 text-ink">{profile.country || '—'}</dd>
                    </div>
                </dl>
                <p class="mt-3 text-xs text-muted">Ask an administrator to change your name or contact details.</p>

                <div class="mt-2 border-t border-line pt-4">
                    <button
                        type="button"
                        class="flex w-full items-center justify-between text-left"
                        on:click={() => (showPasswordForm = !showPasswordForm)}
                    >
                        <span class="text-sm font-semibold text-ink">Change password</span>
                        <svg
                            class="h-4 w-4 text-ink transition-transform {showPasswordForm ? 'rotate-180' : ''}"
                            xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"
                        >
                            <path fill-rule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clip-rule="evenodd" />
                        </svg>
                    </button>

                    {#if showPasswordForm}
                        <form class="mt-4 space-y-4" on:submit={handleChangePassword} transition:fade>
                            <div>
                                <label class="mb-1.5 block text-sm font-medium text-ink" for="current-password">Current password</label>
                                <input class="field" id="current-password" type="password" autocomplete="current-password" bind:value={currentPassword} />
                            </div>
                            <div>
                                <label class="mb-1.5 block text-sm font-medium text-ink" for="new-password">New password</label>
                                <input class="field" id="new-password" type="password" autocomplete="new-password" bind:value={newPassword} />
                            </div>
                            <div>
                                <label class="mb-1.5 block text-sm font-medium text-ink" for="confirm-password">Confirm new password</label>
                                <input class="field" id="confirm-password" type="password" autocomplete="new-password" bind:value={confirmPassword} />
                            </div>
                            <div class="flex justify-end">
                                <button
                                    type="submit"
                                    disabled={saving}
                                    class="inline-flex justify-center rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white shadow-card transition-colors hover:bg-primaryHover disabled:opacity-60"
                                >{saving ? 'Updating…' : 'Update password'}
                                </button>
                            </div>
                        </form>
                    {/if}

                    {#if message}
                        <div transition:fade class="mt-4 flex items-center {alertClass} text-sm font-bold px-4 py-3 rounded" role="alert">
                            <svg class="fill-current w-4 h-4 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M12.432 0c1.34 0 2.01.912 2.01 1.957 0 1.305-1.164 2.512-2.679 2.512-1.269 0-2.009-.75-1.974-1.99C9.789 1.436 10.67 0 12.432 0zM8.309 20c-1.058 0-1.833-.652-1.093-3.524l1.214-5.092c.211-.814.246-1.141 0-1.141-.317 0-1.689.562-2.502 1.117l-.528-.88c2.572-2.186 5.531-3.467 6.801-3.467 1.057 0 1.233 1.273.705 3.23l-1.391 5.352c-.246.945-.141 1.271.106 1.271.317 0 1.357-.392 2.379-1.207l.6.814C12.098 19.02 9.365 20 8.309 20z"/></svg>
                            <p>{message}</p>
                        </div>
                    {/if}
                </div>
            </div>
            <div class="flex justify-end gap-2 border-t border-line bg-paper px-6 py-3">
                <button
                    type="button"
                    class="inline-flex justify-center rounded-lg border border-line bg-surface px-4 py-2 text-sm font-semibold text-ink shadow-card transition-colors hover:bg-paper"
                    on:click={toggleProfileForm}
                    >Close
                </button>
            </div>
        </div>
    </div>
</div>