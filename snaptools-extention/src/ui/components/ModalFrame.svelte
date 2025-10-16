<script lang="ts">
  export let title: string = '';
  export let onClose: (() => void) | undefined = undefined;
  export let width: string = '600px';

  function handleBackdropClick(event: MouseEvent) {
    if (event.target === event.currentTarget && onClose) {
      onClose();
    }
  }

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape' && onClose) {
      onClose();
    }
  }
</script>

<svelte:window on:keydown={handleKeydown} />

<div class="modal-backdrop" on:click={handleBackdropClick}>
  <div class="modal-frame" style="--modal-width: {width}">
    <div class="modal-header">
      <h2 class="modal-title">{title}</h2>
      {#if onClose}
        <button class="modal-close" on:click={onClose} aria-label="Close modal">
          ×
        </button>
      {/if}
    </div>
    <div class="modal-body">
      <slot />
    </div>
    <div class="modal-footer">
      <slot name="footer" />
    </div>
  </div>
</div>

<style>
  .modal-backdrop {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10000;
  }

  .modal-frame {
    background: white;
    border-radius: 12px;
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1),
                0 10px 10px -5px rgba(0, 0, 0, 0.04);
    width: var(--modal-width);
    max-width: 90vw;
    max-height: 90vh;
    display: flex;
    flex-direction: column;
  }

  .modal-header {
    padding: 20px 24px;
    border-bottom: 1px solid #e5e7eb;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .modal-title {
    font-size: 18px;
    font-weight: 600;
    margin: 0;
    color: #111827;
  }

  .modal-close {
    background: none;
    border: none;
    font-size: 28px;
    line-height: 1;
    color: #6b7280;
    cursor: pointer;
    padding: 0;
    width: 28px;
    height: 28px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 4px;
  }

  .modal-close:hover {
    background: #f3f4f6;
    color: #111827;
  }

  .modal-body {
    padding: 24px;
    overflow-y: auto;
    flex: 1;
  }

  .modal-footer {
    padding: 16px 24px;
    border-top: 1px solid #e5e7eb;
    display: flex;
    justify-content: flex-end;
    gap: 12px;
  }

  .modal-footer:empty {
    display: none;
  }
</style>

