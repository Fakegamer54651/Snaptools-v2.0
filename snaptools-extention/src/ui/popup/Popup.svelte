<script lang="ts">
  import { onMount } from 'svelte';
  import StatusBadge from '@/ui/components/StatusBadge.svelte';
  import ListItem from '@/ui/components/ListItem.svelte';
  import { fakeLogin, fakeLogout, getMockAuth } from '@/modules/auth/mockAuth';

  // Auth state
  let isLoggedIn = false;
  let userEmail = '';
  let expiresAt: number | undefined;
  
  // TODO: Load from actual data sources
  let shortcuts: any[] = [];
  let templates: any[] = [];

  onMount(() => {
    console.log('SnapTools popup mounted');
    refreshState();
  });

  async function refreshState() {
    const data = await getMockAuth();
    isLoggedIn = !!data;
    userEmail = data?.user.email || '';
    expiresAt = data?.expiresAt;
  }

  async function handleLogin() {
    await fakeLogin();
    await refreshState();
  }

  async function handleLogout() {
    await fakeLogout();
    await refreshState();
  }

  function openSettings() {
    // TODO: Open settings/options page
    console.log('TODO: Open settings');
  }

  // Format expiry time for display
  function formatExpiryTime(timestamp: number | undefined): string {
    if (!timestamp) return '';
    const timeRemaining = timestamp - Date.now();
    const minutesRemaining = Math.floor(timeRemaining / 60_000);
    if (minutesRemaining < 1) return 'Expiring soon';
    if (minutesRemaining < 60) return `${minutesRemaining}m`;
    const hoursRemaining = Math.floor(minutesRemaining / 60);
    return `${hoursRemaining}h`;
  }
</script>

<div class="popup-container">
  <header class="popup-header">
    <h1>SnapTools</h1>
    <StatusBadge status={isLoggedIn ? 'active' : 'inactive'} />
  </header>

  <main class="popup-content">
    {#if !isLoggedIn}
      <section class="login-section">
        <p>❌ Not logged in</p>
        <button on:click={handleLogin} class="btn-primary">
          Fake Login
        </button>
      </section>
    {:else}
      <section class="user-section">
        <div class="user-info">
          <p class="user-name">✅ Logged in as {userEmail}</p>
          {#if expiresAt}
            <p class="token-expiry">Token expires: {formatExpiryTime(expiresAt)}</p>
          {/if}
        </div>
        <button on:click={handleLogout} class="btn-secondary">
          Logout
        </button>
      </section>

      <section class="section">
        <h2>Shortcuts</h2>
        {#if shortcuts.length === 0}
          <p class="empty-state">No shortcuts configured</p>
        {:else}
          <ul class="list">
            {#each shortcuts as shortcut}
              <ListItem 
                title={shortcut.trigger} 
                description={shortcut.replacement} 
              />
            {/each}
          </ul>
        {/if}
      </section>

      <section class="section">
        <h2>Templates</h2>
        {#if templates.length === 0}
          <p class="empty-state">No templates available</p>
        {:else}
          <ul class="list">
            {#each templates as template}
              <ListItem 
                title={template.name} 
                description={template.subject || 'Email template'} 
              />
            {/each}
          </ul>
        {/if}
      </section>
    {/if}
  </main>

  <footer class="popup-footer">
    <button on:click={openSettings} class="btn-link">
      Settings
    </button>
  </footer>
</div>

<style>
  .popup-container {
    width: 360px;
    min-height: 400px;
    display: flex;
    flex-direction: column;
  }

  .popup-header {
    padding: 16px;
    border-bottom: 1px solid #e5e7eb;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .popup-header h1 {
    font-size: 18px;
    font-weight: 600;
    margin: 0;
  }

  .popup-content {
    flex: 1;
    padding: 16px;
    overflow-y: auto;
  }

  .login-section {
    text-align: center;
    padding: 32px 16px;
  }

  .login-section p {
    margin-bottom: 16px;
    color: #6b7280;
  }

  .user-section {
    padding: 12px;
    background: #f9fafb;
    border-radius: 8px;
    margin-bottom: 16px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .user-info {
    flex: 1;
  }

  .user-name {
    font-weight: 500;
    margin: 0;
    font-size: 14px;
  }

  .user-email {
    margin: 2px 0 0 0;
    font-size: 12px;
    color: #6b7280;
  }

  .token-expiry {
    margin: 4px 0 0 0;
    font-size: 11px;
    color: #9ca3af;
  }

  .section {
    margin-bottom: 24px;
  }

  .section h2 {
    font-size: 14px;
    font-weight: 600;
    margin: 0 0 12px 0;
    color: #374151;
  }

  .list {
    list-style: none;
    padding: 0;
    margin: 0;
  }

  .empty-state {
    color: #9ca3af;
    font-size: 14px;
    text-align: center;
    padding: 24px 0;
  }

  .popup-footer {
    padding: 12px 16px;
    border-top: 1px solid #e5e7eb;
    text-align: center;
  }

  .btn-primary {
    background: #2563eb;
    color: white;
    border: none;
    padding: 8px 24px;
    border-radius: 6px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
  }

  .btn-primary:hover {
    background: #1d4ed8;
  }

  .btn-secondary {
    background: white;
    color: #374151;
    border: 1px solid #d1d5db;
    padding: 6px 12px;
    border-radius: 6px;
    font-size: 13px;
    cursor: pointer;
  }

  .btn-secondary:hover {
    background: #f9fafb;
  }

  .btn-link {
    background: none;
    border: none;
    color: #2563eb;
    font-size: 14px;
    cursor: pointer;
    padding: 4px 8px;
  }

  .btn-link:hover {
    text-decoration: underline;
  }
</style>

