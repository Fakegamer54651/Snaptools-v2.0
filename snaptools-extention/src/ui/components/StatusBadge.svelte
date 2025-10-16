<script lang="ts">
  export let status: 'active' | 'inactive' | 'syncing' = 'inactive';

  const statusConfig = {
    active: { label: 'Active', color: '#10b981' },
    inactive: { label: 'Inactive', color: '#6b7280' },
    syncing: { label: 'Syncing', color: '#f59e0b' }
  };

  $: config = statusConfig[status];
</script>

<div class="status-badge" style="--status-color: {config.color}">
  <span class="status-dot"></span>
  <span class="status-label">{config.label}</span>
</div>

<style>
  .status-badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 4px 10px;
    background: #f9fafb;
    border-radius: 12px;
    font-size: 12px;
  }

  .status-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: var(--status-color);
  }

  .status-label {
    color: #374151;
    font-weight: 500;
  }
</style>

