<script lang="ts">
  import { page } from '$app/stores';

  export let title: any = 'Error';
  export let description: any = undefined;

  $: console.warn('error', title, description);
</script>

<div class="box">
  <div class="px-4 py-5 my-5 text-center">
    <h1 class="display-5 fw-bold text-danger">{title}</h1>
    <div class="col-lg-6 mx-auto">
      <div class="lead mb-4">
        <slot>
          {description || ''}
        </slot>
      </div>
      <hr />
      <div class="mb-4">
        {new Date().toLocaleString()} <span class="text-secondary">&nbsp;&nbsp;/&nbsp;&nbsp;</span>
        {$page.url.href}
      </div>
    </div>
  </div>
</div>

<style>
  .box {
    z-index: -1;
    position: absolute;
    width: 100vw;
    height: 100vh;
    left: 0;
    top: 0;
    display: flex;
  }
  .box > div {
    align-self: center;
    display: block;
    width: 100vw;
  }
</style>
