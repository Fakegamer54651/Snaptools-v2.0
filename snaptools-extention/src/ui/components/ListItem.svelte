<script lang="ts">
  export let title: string;
  export let description: string = '';
  export let onClick: (() => void) | undefined = undefined;

  const isClickable = !!onClick;
</script>

<li 
  class="list-item" 
  class:clickable={isClickable}
  on:click={onClick}
  on:keypress={(e) => e.key === 'Enter' && onClick?.()}
  role={isClickable ? 'button' : 'listitem'}
  tabindex={isClickable ? 0 : -1}
>
  <div class="list-item-content">
    <div class="list-item-title">{title}</div>
    {#if description}
      <div class="list-item-description">{description}</div>
    {/if}
  </div>
</li>

<style>
  .list-item {
    padding: 12px;
    border-radius: 6px;
    margin-bottom: 8px;
    background: #f9fafb;
    transition: background 0.15s ease;
  }

  .list-item.clickable {
    cursor: pointer;
  }

  .list-item.clickable:hover {
    background: #f3f4f6;
  }

  .list-item-content {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .list-item-title {
    font-size: 14px;
    font-weight: 500;
    color: #111827;
  }

  .list-item-description {
    font-size: 12px;
    color: #6b7280;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
</style>

