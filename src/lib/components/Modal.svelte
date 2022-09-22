<script lang="ts">
  import { onMount } from 'svelte';
  import type { Modal } from 'bootstrap';

  export /**Modal的ID*/ let id = `modal_${Math.random().toString(36).substring(2)}`;
  export /**标题, 通过slot=header可以覆盖*/ let title: string | undefined = undefined;

  export /**Modal大小*/ let size: string | undefined = undefined;
  export /**不添加动画*/ let noFade = false;
  export /**禁外部点击*/ let staticBackdrop = false;
  export /**禁ESC关闭*/ let banKeyboard = false;
  export /**显示滚动条*/ let scrollable = false;
  export /**垂直居中*/ let centered = false;

  export /**确定按钮*/ let confirm: (() => void) | undefined = undefined;

  let modal: Modal;
  export /**展示*/ const show = (relatedTarget?: HTMLElement) => modal && modal.show(relatedTarget);
  export /**切换*/ const toggle = (relatedTarget?: HTMLElement) =>
    modal && modal.toggle(relatedTarget);
  export /**隐藏*/ const hide = () => modal && modal.hide();
  export /**更新*/ const handleUpdate = () => modal && modal.handleUpdate();

  let element: HTMLElement;
  export /**判断是否正在显示*/ const isShowing = () =>
    element?.classList?.contains && element.classList.contains('show');
  export /**等待面板关闭*/ const waitClose = (ms = 50) =>
    new Promise<void>((r) => {
      const id = setInterval(() => {
        if (isShowing()) return;
        clearInterval(id);
        r();
      }, ms);
    });

  onMount(() => {
    import('bootstrap').then((bootstrap) => {
      modal = bootstrap.Modal.getOrCreateInstance(`#${id}`);
    });
    return () => modal && modal.dispose();
  });
</script>

<div
  {id}
  bind:this={element}
  class="modal"
  class:fade={!noFade}
  data-bs-backdrop:static={staticBackdrop}
  data-bs-keyboard:false={banKeyboard}
  tabindex="-1"
  aria-hidden="true"
>
  <div
    class="modal-dialog {size ? `modal-${size}` : ''}"
    class:modal-dialog-scrollable={scrollable}
    class:modal-dialog-centered={centered}
  >
    <div class="modal-content">
      <div name="header" class="modal-header">
        <h5 class="modal-title" id="exampleModalLabel">{title}</h5>
        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close" />
      </div>
      <div class="modal-body"><slot /></div>
      <div class="modal-footer">
        <slot name="footer">
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
            {confirm ? '取消' : '关闭'}
          </button>
          {#if confirm}
            <button
              type="button"
              class="btn btn-primary"
              data-bs-dismiss="modal"
              on:click={confirm}
            >
              确定
            </button>
          {/if}
        </slot>
      </div>
    </div>
  </div>
</div>

<style>
  .modal-body {
    overflow-x: auto;
  }
</style>
